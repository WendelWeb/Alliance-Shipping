import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, packages } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, sql, count, sum } from 'drizzle-orm';

// GET - List users from Clerk with DB stats
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const client = await clerkClient();

    // Fetch users from Clerk
    const clerkResponse = await client.users.getUserList({
      limit,
      offset,
      query: search || undefined,
      orderBy: '-created_at',
    });

    // Get package stats from DB for all users
    const dbUsers = await db
      .select({
        clerkId: users.clerkId,
        id: users.id,
        phone: users.phone,
        packageCount: count(packages.id),
        totalSpent: sum(packages.totalCost),
      })
      .from(users)
      .leftJoin(packages, eq(users.id, packages.userId))
      .groupBy(users.id, users.clerkId, users.phone);

    // Build a lookup map by clerkId
    const statsMap = new Map(
      dbUsers.map((u) => [
        u.clerkId,
        {
          dbId: u.id,
          phone: u.phone,
          packageCount: Number(u.packageCount) || 0,
          totalSpent: u.totalSpent ? parseFloat(u.totalSpent) : 0,
        },
      ])
    );

    // Merge Clerk data with DB stats
    const mergedUsers = clerkResponse.data.map((clerkUser) => {
      const stats = statsMap.get(clerkUser.id);
      return {
        id: clerkUser.id,
        dbId: stats?.dbId || null,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'N/A',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || stats?.phone || '',
        imageUrl: clerkUser.imageUrl || null,
        totalPackages: stats?.packageCount || 0,
        totalSpent: stats?.totalSpent ? `$${stats.totalSpent.toFixed(2)}` : '$0.00',
        status: clerkUser.banned ? 'banned' : 'active',
        createdAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        joinedAt: new Date(clerkUser.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
    });

    return NextResponse.json({
      users: mergedUsers,
      totalCount: clerkResponse.totalCount,
      page,
      limit,
      totalPages: Math.ceil(clerkResponse.totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
