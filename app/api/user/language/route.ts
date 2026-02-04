import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

// GET - Return current user's preferred language
export async function GET() {
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
      .select({ preferredLanguage: users.preferredLanguage })
      .from(users)
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      )
      .limit(1);

    return NextResponse.json({ locale: user?.preferredLanguage || 'fr' });
  } catch (error) {
    console.error('Error fetching user language:', error);
    return NextResponse.json({ error: 'Failed to fetch language' }, { status: 500 });
  }
}

// PATCH - Update current user's preferred language
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { locale } = body;

    if (!locale || !['ht', 'fr', 'en', 'es'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
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
      .set({ preferredLanguage: locale, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, locale });
  } catch (error) {
    console.error('Error updating user language:', error);
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
  }
}
