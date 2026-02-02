import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, admins } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { createAdminToken } from '@/lib/auth/admin';

// Find an active admin matching any of the Clerk user's emails
async function findActiveAdmin(clerkEmails: string[]) {
  if (clerkEmails.length === 0) return null;

  const matchedUsers = await db
    .select()
    .from(users)
    .where(inArray(users.email, clerkEmails));

  for (const user of matchedUsers) {
    const admin = await db.query.admins.findFirst({
      where: eq(admins.userId, user.id),
    });
    if (admin?.isActive) {
      return { user, admin };
    }
  }

  return null;
}

// GET: Check if the current Clerk user is an active admin
export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const emails = clerkUser.emailAddresses.map((e) => e.emailAddress);
    const match = await findActiveAdmin(emails);

    return NextResponse.json({ isAdmin: !!match });
  } catch (error) {
    console.error('Admin elevate check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create admin session (JWT cookie) for the current Clerk user
export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const emails = clerkUser.emailAddresses.map((e) => e.emailAddress);
    const match = await findActiveAdmin(emails);

    if (!match) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { user, admin } = match;

    const session = {
      adminId: admin.id,
      userId: user.id,
      role: admin.role as 'super_admin' | 'admin' | 'moderator',
      email: user.email,
      permissions: admin.permissions || {},
    };

    const token = await createAdminToken(session);

    const response = NextResponse.json({
      success: true,
      admin: {
        email: user.email,
        role: admin.role,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin elevate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
