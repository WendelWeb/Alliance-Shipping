import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

// POST - Register or update Expo push token
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Valid token is required' }, { status: 400 });
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

    await db
      .update(users)
      .set({ expoPushToken: token, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json({ error: 'Failed to save push token' }, { status: 500 });
  }
}

// DELETE - Remove push token (logout/disable notifications)
export async function DELETE() {
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

    await db
      .update(users)
      .set({ expoPushToken: null, updatedAt: new Date() })
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push token:', error);
    return NextResponse.json({ error: 'Failed to remove push token' }, { status: 500 });
  }
}
