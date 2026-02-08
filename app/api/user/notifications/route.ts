import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, notifications } from '@/lib/db/schema';
import { eq, or, desc } from 'drizzle-orm';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
      total: userNotifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    if (markAll) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.id));
    } else if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
