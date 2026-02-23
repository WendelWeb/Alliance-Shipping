import { db } from '@/lib/db';
import { announcements, users } from '@/lib/db/schema';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/service';
import {
  buildActionEmailHtml,
  buildCommunicationEmailHtml,
  getEmailSubject,
} from '@/lib/announcements/email-builders';
import type { Locale } from '@/lib/announcements/templates-v2';

interface EmailUser {
  email: string;
  name: string;
  lang: Locale;
}

/**
 * Fetch ALL users from Clerk (paginated) and merge with local DB for language preference.
 */
export async function getAllUsersForEmail(): Promise<EmailUser[]> {
  const client = await clerkClient();
  const dbUsers = await db.select().from(users);
  const langMap = new Map<string, string>();
  for (const u of dbUsers) {
    langMap.set(u.clerkId, u.preferredLanguage || 'fr');
  }

  const allClerkUsers: EmailUser[] = [];
  let offset = 0;
  const limit = 500;

  while (true) {
    const response = await client.users.getUserList({ limit, offset });
    const clerkUsers = response.data;
    if (clerkUsers.length === 0) break;

    for (const cu of clerkUsers) {
      const email = cu.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;
      const name = [cu.firstName, cu.lastName].filter(Boolean).join(' ') || 'Customer';
      const dbLang = langMap.get(cu.id) || 'fr';
      const lang = (['ht', 'fr', 'en', 'es'].includes(dbLang) ? dbLang : 'fr') as Locale;
      allClerkUsers.push({ email, name, lang });
    }

    if (clerkUsers.length < limit) break;
    offset += limit;
  }

  return allClerkUsers;
}

/**
 * Broadcast announcement emails to all users.
 * Can be called fire-and-forget (from announcement creation) or with progress callback (from manual broadcast).
 */
export async function broadcastAnnouncementEmails(params: {
  announcementId: number;
  onProgress?: (data: { sent: number; failed: number; total: number; lastEmail?: string; lastUser?: string; lastLang?: string; status?: string }) => void;
}): Promise<{ sent: number; failed: number; total: number }> {
  const { announcementId, onProgress } = params;

  // Fetch the announcement
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, announcementId))
    .limit(1);

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  // Fetch all users
  const allUsers = await getAllUsersForEmail();
  if (allUsers.length === 0) {
    return { sent: 0, failed: 0, total: 0 };
  }

  const translations = announcement.translations as Record<string, { title: string; content: string }> | null;
  const isActionTemplate = !!announcement.templateId && !!announcement.actionPayload;

  let sent = 0;
  let failed = 0;

  for (const user of allUsers) {
    // Get translated content for this user's language
    const translated = translations?.[user.lang];
    const title = translated?.title || announcement.title;
    const content = translated?.content || announcement.content;

    // Build email subject
    const subject = getEmailSubject(
      announcement.templateId || '',
      announcement.type,
      user.lang
    );

    // Build email HTML based on template type
    let html: string;
    if (isActionTemplate) {
      html = buildActionEmailHtml(
        announcement.templateId!,
        announcement.actionPayload as Record<string, any>,
        title,
        user.name,
        user.lang
      );
    } else {
      html = buildCommunicationEmailHtml(
        title,
        content,
        announcement.type,
        user.name,
        user.lang
      );
    }

    try {
      await sendEmail({ to: user.email, subject, html });
      sent++;
      onProgress?.({ sent, failed, total: allUsers.length, lastEmail: user.email, lastUser: user.name, lastLang: user.lang, status: 'sent' });
    } catch {
      failed++;
      onProgress?.({ sent, failed, total: allUsers.length, lastEmail: user.email, lastUser: user.name, lastLang: user.lang, status: 'failed' });
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  // Update the announcement with email sent info
  await db.update(announcements)
    .set({ emailSentAt: new Date(), emailSentCount: sent })
    .where(eq(announcements.id, announcementId));

  return { sent, failed, total: allUsers.length };
}
