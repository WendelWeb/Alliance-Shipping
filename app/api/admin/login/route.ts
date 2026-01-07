import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { setAdminSession } from '@/lib/auth/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const admin = await db.query.admins.findFirst({
      where: eq(admins.userId, user.id),
    });

    if (!admin || !admin.isActive || !admin.password) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const session = {
      adminId: admin.id,
      userId: user.id,
      role: admin.role as 'super_admin' | 'admin' | 'moderator',
      email: user.email,
      permissions: admin.permissions || {},
    };

    await setAdminSession(session);

    return NextResponse.json({
      success: true,
      admin: {
        email: user.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
