import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements, users } from '@/lib/db/schema';
import { and, eq, lte, isNull } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';
import { executeAction } from '@/lib/announcements/action-executors';
import { sendEmail } from '@/lib/email/service';
import { sendPushToAllUsers } from '@/lib/notifications/push';
import {
  buildActionEmailHtml,
  buildCommunicationEmailHtml,
  getEmailSubject,
} from '@/lib/announcements/email-builders';
import type { Locale } from '@/lib/announcements/templates-v2';

const CRON_SECRET = process.env.CRON_SECRET;

interface EmailUser {
  email: string;
  name: string;
  lang: Locale;
}

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
 * GET /api/cron/execute-scheduled
 * Cron job: Execute pending scheduled announcements whose scheduledFor <= NOW.
 * Secured by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all pending scheduled announcements that are due
    const pendingAnnouncements = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.scheduledStatus, 'pending'),
          lte(announcements.scheduledFor, new Date())
        )
      );

    if (pendingAnnouncements.length === 0) {
      return NextResponse.json({ message: 'No pending scheduled announcements', executed: 0 });
    }

    const results: { id: number; status: string; error?: string }[] = [];

    for (const announcement of pendingAnnouncements) {
      try {
        // Execute action if it's an action template
        if (announcement.templateId && announcement.actionPayload) {
          const actionResult = await executeAction(
            announcement.templateId,
            announcement.actionPayload as Record<string, any>,
            announcement.createdBy
          );

          if (!actionResult.success) {
            await db.update(announcements)
              .set({ scheduledStatus: 'failed', updatedAt: new Date() })
              .where(eq(announcements.id, announcement.id));

            results.push({ id: announcement.id, status: 'failed', error: actionResult.error });
            continue;
          }
        }

        // Publish the announcement
        await db.update(announcements)
          .set({
            isPublished: true,
            publishDate: new Date(),
            actionExecutedAt: announcement.templateId ? new Date() : null,
            scheduledStatus: 'executed',
            updatedAt: new Date(),
          })
          .where(eq(announcements.id, announcement.id));

        // Send emails
        const allUsers = await getAllUsersForEmail();
        const translations = announcement.translations as Record<string, { title: string; content: string }> | null;
        const isActionTemplate = !!announcement.templateId && !!announcement.actionPayload;
        let emailsSent = 0;

        for (const user of allUsers) {
          const translated = translations?.[user.lang];
          const title = translated?.title || announcement.title;
          const content = translated?.content || announcement.content;

          const subject = getEmailSubject(announcement.templateId || '', announcement.type, user.lang);
          let html: string;
          if (isActionTemplate) {
            html = buildActionEmailHtml(
              announcement.templateId!,
              announcement.actionPayload as Record<string, any>,
              title, user.name, user.lang
            );
          } else {
            html = buildCommunicationEmailHtml(title, content, announcement.type, user.name, user.lang);
          }

          try {
            await sendEmail({ to: user.email, subject, html });
            emailsSent++;
          } catch { /* skip failed emails */ }

          await new Promise((r) => setTimeout(r, 200));
        }

        // Update email count
        await db.update(announcements)
          .set({ emailSentAt: new Date(), emailSentCount: emailsSent })
          .where(eq(announcements.id, announcement.id));

        // Send push
        await sendPushToAllUsers({
          templateKey: announcement.templateId || 'new_announcement',
          variables: { title: announcement.title },
          data: { announcementId: announcement.id },
        }).catch(() => {});

        results.push({ id: announcement.id, status: 'executed' });
      } catch (error) {
        console.error(`Error executing scheduled announcement #${announcement.id}:`, error);
        await db.update(announcements)
          .set({ scheduledStatus: 'failed', updatedAt: new Date() })
          .where(eq(announcements.id, announcement.id));

        results.push({ id: announcement.id, status: 'failed', error: String(error) });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} scheduled announcements`,
      executed: results.filter((r) => r.status === 'executed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    console.error('Error in cron execute-scheduled:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
