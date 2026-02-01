import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins, users } from '@/lib/db/schema';
import { getAdminSession, hashPassword, hasPermission } from '@/lib/auth/admin';
import { eq } from 'drizzle-orm';

const DEFAULT_PERMISSIONS: Record<string, any> = {
  super_admin: {
    users: { read: true, create: true, update: true, delete: true, block: true },
    packages: { read: true, create: true, update: true, delete: true, assign: true },
    fees: { read: true, update: true },
    specialItems: { read: true, create: true, update: true, delete: true },
    announcements: { read: true, create: true, update: true, delete: true, publish: true },
    analytics: { read: true, export: true },
  },
  admin: {
    users: { read: true, create: false, update: true, delete: false, block: false },
    packages: { read: true, create: true, update: true, delete: true, assign: true },
    fees: { read: true, update: false },
    specialItems: { read: true, create: true, update: true, delete: false },
    announcements: { read: true, create: true, update: true, delete: false, publish: false },
    analytics: { read: true, export: false },
  },
  moderator: {
    users: { read: true, create: false, update: false, delete: false, block: false },
    packages: { read: true, create: true, update: true, delete: false, assign: false },
    fees: { read: true, update: false },
    specialItems: { read: true, create: false, update: false, delete: false },
    announcements: { read: true, create: false, update: false, delete: false, publish: false },
    analytics: { read: true, export: false },
  },
};

// GET - List all admins (super_admin only)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 });
    }

    const adminList = await db
      .select({
        id: admins.id,
        userId: admins.userId,
        role: admins.role,
        permissions: admins.permissions,
        isActive: admins.isActive,
        lastLoginAt: admins.lastLoginAt,
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
        },
      })
      .from(admins)
      .leftJoin(users, eq(admins.userId, users.id))
      .orderBy(admins.createdAt);

    return NextResponse.json({ admins: adminList });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Create a new admin
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, phone, role, permissions } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const validRoles = ['super_admin', 'admin', 'moderator'];
    const adminRole = validRoles.includes(role) ? role : 'admin';

    // Check if user with this email already exists
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Create user if doesn't exist
    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: `admin_${Date.now()}`,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
        })
        .returning();
      user = newUser;
    }

    // Check if already an admin
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, user.id),
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'This user is already an admin' },
        { status: 409 }
      );
    }

    // Hash password and create admin
    const hashed = await hashPassword(password);
    const adminPermissions = permissions || DEFAULT_PERMISSIONS[adminRole] || DEFAULT_PERMISSIONS.admin;

    const [newAdmin] = await db
      .insert(admins)
      .values({
        userId: user.id,
        role: adminRole,
        password: hashed,
        permissions: adminPermissions,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      admin: {
        ...newAdmin,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

// PATCH - Update admin role/permissions/active/password
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, role, permissions, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
    }

    // Prevent self-deactivation
    if (id === session.adminId && isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };

    if (role !== undefined) {
      const validRoles = ['super_admin', 'admin', 'moderator'];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }

    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }
      updateData.password = await hashPassword(password);
    }

    const [updatedAdmin] = await db
      .update(admins)
      .set(updateData)
      .where(eq(admins.id, id))
      .returning();

    if (!updatedAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE - Soft delete (deactivate) an admin
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: super_admin only' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
    }

    const adminId = parseInt(id);

    // Prevent self-deletion
    if (adminId === session.adminId) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const [deactivated] = await db
      .update(admins)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(admins.id, adminId))
      .returning();

    if (!deactivated) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, admin: deactivated });
  } catch (error) {
    console.error('Error deactivating admin:', error);
    return NextResponse.json({ error: 'Failed to deactivate admin' }, { status: 500 });
  }
}
