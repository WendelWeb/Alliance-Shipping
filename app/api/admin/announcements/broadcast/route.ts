import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { sendPushToAllUsers } from '@/lib/notifications/push';
import { broadcastAnnouncementEmails } from '@/lib/announcements/broadcast';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/admin/announcements/broadcast
 * Send announcement email to all users in their preferred language.
 * Uses streaming to report progress in real-time.
 * Also used as manual retry/resend for the automatic email broadcast.
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

    // Fetch announcement for push notification
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);

    if (!announcement) {
      return new Response(JSON.stringify({ error: 'Announcement not found' }), { status: 404 });
    }

    // Stream progress to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: 'start', total: 0 });

          const result = await broadcastAnnouncementEmails({
            announcementId,
            onProgress: (progress) => {
              send({ type: 'progress', ...progress });
            },
          });

          // Also send push notification to all users (use specific template if available)
          const pushTemplateKey = announcement.templateId || 'new_announcement';
          await sendPushToAllUsers({
            templateKey: pushTemplateKey,
            variables: { title: announcement.title, summary: (announcement.content || '').substring(0, 120) },
            data: { announcementId: announcement.id },
          }).catch(() => {});

          send({ type: 'complete', sent: result.sent, failed: result.failed, total: result.total });
        } catch (error) {
          send({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        }

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
