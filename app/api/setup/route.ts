import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET - Check admin status
export async function GET() {
  try {
    const adminList = await db
      .select({
        id: admins.id,
        role: admins.role,
        isActive: admins.isActive,
        email: users.email,
      })
      .from(admins)
      .leftJoin(users, eq(admins.userId, users.id));

    return NextResponse.json({
      adminCount: adminList.length,
      admins: adminList.map(a => ({ id: a.id, email: a.email, role: a.role, isActive: a.isActive })),
      jwtSecretSet: !!process.env.ADMIN_JWT_SECRET,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Seed or reset admin password
export async function POST() {
  try {
    const email = 'stanleywendeljoseph@gmail.com';
    const password = process.env.ADMIN_SEED_PASSWORD || 'Alliance$hip2026!';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find user
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: `admin_${Date.now()}`,
          email,
          firstName: 'Stanley',
          lastName: 'Joseph',
          phone: '+1 305-555-0000',
        })
        .returning();
      user = newUser;
    }

    // Check if admin exists
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, user.id),
    });

    if (existingAdmin) {
      // Reset password
      await db
        .update(admins)
        .set({
          password: hashedPassword,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(admins.id, existingAdmin.id));

      return NextResponse.json({
        success: true,
        action: 'password_reset',
        message: `Password reset for ${email}. New password: ${password}`,
      });
    }

    // Create new admin
    const [adminRecord] = await db
      .insert(admins)
      .values({
        userId: user.id,
        role: 'super_admin',
        password: hashedPassword,
        permissions: {
          users: { read: true, create: true, update: true, delete: true },
          packages: { read: true, create: true, update: true, delete: true },
          fees: { read: true, update: true },
          specialItems: { read: true, create: true, update: true, delete: true },
          announcements: { read: true, create: true, update: true, delete: true },
          analytics: { read: true },
        },
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      action: 'created',
      message: `Super admin created. Login: ${email} / ${password}`,
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
