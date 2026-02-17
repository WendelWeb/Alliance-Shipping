import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, notifications, adminActivityLogs } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/notifications/push';

// POST - Send notification to a specific user (DB + Email)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clerkId } = await params;
    const body = await request.json();
    const { title, message, type = 'general' } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get user email from Clerk
    const client = await clerkClient();
    let clerkUser;
    try {
      clerkUser = await client.users.getUser(clerkId);
    } catch {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    if (!userEmail) {
      return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
    }

    // Find or create user in DB
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!dbUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId,
          email: userEmail,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
        })
        .returning();
      dbUser = newUser;
    }

    // Create notification in DB
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: dbUser.id,
        type,
        title,
        message,
        isRead: false,
      })
      .returning();

    // Send email via Resend
    const typeLabels: Record<string, string> = {
      general: 'Notification',
      package_update: 'Package Update',
      delivery: 'Delivery Notice',
      payment: 'Payment',
    };

    const typeEmoji: Record<string, string> = {
      general: '🔔',
      package_update: '📦',
      delivery: '🚚',
      payment: '💳',
    };

    const emoji = typeEmoji[type] || '🔔';
    const typeLabel = typeLabels[type] || 'Notification';

    const emailResult = await sendEmail({
      to: userEmail,
      subject: `${emoji} ${title} - Alliance Shipping`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
        <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
            <tr><td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">

                <!-- Header -->
                <tr><td style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:40px 30px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:15px;">
                    <span style="font-size:28px;">${emoji}</span>
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${title}</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${typeLabel}</p>
                </td></tr>

                <!-- Body -->
                <tr><td style="padding:30px;">
                  <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
                    Hello <strong>${userName}</strong>,
                  </p>

                  <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:8px;padding:20px;margin:0 0 25px;">
                    <p style="margin:0;color:#1e40af;font-size:15px;line-height:1.7;white-space:pre-line;">${message}</p>
                  </div>

                  <p style="margin:0 0 25px;color:#6b7280;font-size:14px;line-height:1.6;">
                    If you have any questions, feel free to contact our support team.
                  </p>

                  ${process.env.NEXT_PUBLIC_APP_URL ? `
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/packages"
                       style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 35px;border-radius:10px;font-weight:600;font-size:15px;">
                      View My Dashboard
                    </a>
                  </div>
                  ` : ''}
                </td></tr>

                <!-- Footer -->
                <tr><td style="background:#f9fafb;padding:25px 30px;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    Alliance Shipping &mdash; Fast &amp; reliable shipping from USA to Haiti
                  </p>
                  ${process.env.NEXT_PUBLIC_PHONE ? `<p style="margin:5px 0 0;color:#9ca3af;font-size:12px;">📞 ${process.env.NEXT_PUBLIC_PHONE}</p>` : ''}
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    // Send push notification to user's device
    sendPushNotification({
      userId: dbUser.id,
      templateKey: 'admin_message',
      variables: {
        message: message,
        tracking: '',
      },
    }).catch(() => {});

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'notified',
      targetType: 'user',
      targetId: dbUser.id,
      details: {
        clerkId,
        notificationType: type,
        notificationTitle: title,
        emailSent: emailResult.success,
        emailError: emailResult.error || null,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      notification,
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error,
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
