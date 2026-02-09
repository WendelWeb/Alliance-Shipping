import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { announcements, users } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email/service';
import { sendPushToAllUsers } from '@/lib/notifications/push';
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
async function getAllUsersForEmail(): Promise<EmailUser[]> {
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
 * POST /api/admin/announcements/broadcast
 * Send announcement email to all users in their preferred language.
 * Uses streaming to report progress in real-time.
 * Supports both action templates (with before/after tables) and communication templates.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      return new Response(JSON.stringify({ error: 'announcementId is required' }), { status: 400 });
    }

    // Fetch the announcement
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);

    if (!announcement) {
      return new Response(JSON.stringify({ error: 'Announcement not found' }), { status: 404 });
    }

    // Fetch ALL users from Clerk + local DB for language preferences
    const allUsers = await getAllUsersForEmail();

    if (allUsers.length === 0) {
      return new Response(JSON.stringify({ error: 'No users to send to' }), { status: 400 });
    }

    const translations = announcement.translations as Record<string, { title: string; content: string }> | null;
    const isActionTemplate = !!announcement.templateId && !!announcement.actionPayload;

    // Stream progress to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: 'start', total: allUsers.length });

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
            send({
              type: 'progress',
              sent,
              failed,
              total: allUsers.length,
              lastEmail: user.email,
              lastUser: user.name,
              lastLang: user.lang,
              status: 'sent',
            });
          } catch {
            failed++;
            send({
              type: 'progress',
              sent,
              failed,
              total: allUsers.length,
              lastEmail: user.email,
              lastUser: user.name,
              lastLang: user.lang,
              status: 'failed',
            });
          }

          // Small delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 200));
        }

        // Update the announcement with email sent info
        await db.update(announcements)
          .set({ emailSentAt: new Date(), emailSentCount: sent })
          .where(eq(announcements.id, announcementId));

        // Also send push notification to all users
        await sendPushToAllUsers({
          templateKey: isActionTemplate ? (announcement.templateId || 'new_announcement') : 'new_announcement',
          variables: { title: announcement.title },
          data: { announcementId: announcement.id },
        }).catch(() => {});

        send({ type: 'complete', sent, failed, total: allUsers.length });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error broadcasting announcement:', error);
    return new Response(JSON.stringify({ error: 'Failed to broadcast' }), { status: 500 });
  }
}
