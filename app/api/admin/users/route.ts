import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, packages, loyaltyCredits } from '@/lib/db/schema';
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
    const city = searchParams.get('city') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    const client = await clerkClient();

    // Get package stats from DB for all users with warehouse info
    const { warehouses } = await import('@/lib/db/schema');

    const dbUsers = await db
      .select({
        clerkId: users.clerkId,
        id: users.id,
        phone: users.phone,
        whatsappPhone: users.whatsappPhone,
        city: users.city,
        warehouseId: users.warehouseId,
        warehouseName: warehouses.name,
        packageCount: count(packages.id),
        totalSpent: sum(packages.totalCost),
      })
      .from(users)
      .leftJoin(packages, eq(users.id, packages.userId))
      .leftJoin(warehouses, eq(users.warehouseId, warehouses.id))
      .groupBy(users.id, users.clerkId, users.phone, users.whatsappPhone, users.city, users.warehouseId, warehouses.name);

    // Get unique cities for filter dropdown
    const uniqueCities = [...new Set(dbUsers.map((u) => u.city).filter(Boolean))].sort() as string[];

    // Get loyalty credits summary per user
    const loyaltySummary = await db
      .select({
        userId: loyaltyCredits.userId,
        totalCreditsEarned: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} > 0 THEN ${loyaltyCredits.amount} ELSE 0 END), 0)`,
        totalCreditsRedeemed: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} < 0 THEN ABS(${loyaltyCredits.amount}) ELSE 0 END), 0)`,
        creditBalance: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
        totalPointsEarned: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} > 0 THEN ${loyaltyCredits.points} ELSE 0 END), 0)`,
        totalPointsUsed: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} < 0 THEN ABS(${loyaltyCredits.points}) ELSE 0 END), 0)`,
        pointsBalance: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
        transactionCount: count(loyaltyCredits.id),
      })
      .from(loyaltyCredits)
      .groupBy(loyaltyCredits.userId);

    // Get recent transactions per user (last 10 each)
    const recentTransactions = await db
      .select({
        id: loyaltyCredits.id,
        userId: loyaltyCredits.userId,
        amount: loyaltyCredits.amount,
        points: loyaltyCredits.points,
        type: loyaltyCredits.type,
        description: loyaltyCredits.description,
        createdAt: loyaltyCredits.createdAt,
      })
      .from(loyaltyCredits)
      .orderBy(sql`${loyaltyCredits.createdAt} DESC`);

    // Build lookup maps
    const loyaltyMap = new Map(
      loyaltySummary.map((l) => [l.userId, l])
    );
    const transactionsMap = new Map<number, typeof recentTransactions>();
    for (const tx of recentTransactions) {
      const list = transactionsMap.get(tx.userId) || [];
      if (list.length < 10) {
        list.push(tx);
        transactionsMap.set(tx.userId, list);
      }
    }

    // Build stats lookup map by clerkId
    const statsMap = new Map(
      dbUsers.map((u) => {
        const loyalty = loyaltyMap.get(u.id);
        return [
          u.clerkId,
          {
            dbId: u.id,
            phone: u.phone,
            whatsappPhone: u.whatsappPhone,
            city: u.city,
            warehouseId: u.warehouseId,
            warehouseName: u.warehouseName,
            packageCount: Number(u.packageCount) || 0,
            totalSpent: u.totalSpent ? parseFloat(u.totalSpent) : 0,
            creditBalance: loyalty ? parseFloat(String(loyalty.creditBalance)) : 0,
            totalCreditsEarned: loyalty ? parseFloat(String(loyalty.totalCreditsEarned)) : 0,
            totalCreditsRedeemed: loyalty ? parseFloat(String(loyalty.totalCreditsRedeemed)) : 0,
            pointsBalance: loyalty ? Number(loyalty.pointsBalance) : 0,
            totalPointsEarned: loyalty ? Number(loyalty.totalPointsEarned) : 0,
            totalPointsUsed: loyalty ? Number(loyalty.totalPointsUsed) : 0,
            transactionCount: loyalty ? Number(loyalty.transactionCount) : 0,
            recentTransactions: (transactionsMap.get(u.id) || []).map((tx) => ({
              id: tx.id,
              amount: parseFloat(String(tx.amount)),
              points: tx.points,
              type: tx.type,
              description: tx.description,
              createdAt: tx.createdAt,
            })),
          },
        ];
      })
    );

    // Helper to merge a Clerk user with DB stats
    const mergeUser = (clerkUser: any) => {
      const stats = statsMap.get(clerkUser.id);
      return {
        id: clerkUser.id,
        dbId: stats?.dbId || null,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'N/A',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || stats?.phone || '',
        whatsappPhone: stats?.whatsappPhone || null,
        city: stats?.city || null,
        warehouseId: stats?.warehouseId || null,
        warehouseName: stats?.warehouseName || null,
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
        creditBalance: stats?.creditBalance || 0,
        totalCreditsEarned: stats?.totalCreditsEarned || 0,
        totalCreditsRedeemed: stats?.totalCreditsRedeemed || 0,
        pointsBalance: stats?.pointsBalance || 0,
        totalPointsEarned: stats?.totalPointsEarned || 0,
        totalPointsUsed: stats?.totalPointsUsed || 0,
        transactionCount: stats?.transactionCount || 0,
        recentTransactions: stats?.recentTransactions || [],
      };
    };

    // Determine if we need ALL users (filters require full dataset)
    const hasFilters = !!city || !!status;
    const needAllUsers = hasFilters || (limit >= 100 && !search);

    if (needAllUsers) {
      // Fetch ALL users from Clerk in batches
      let allClerkUsers: any[] = [];
      let hasMore = true;
      let currentOffset = 0;
      const batchSize = 100;

      while (hasMore) {
        const batch = await client.users.getUserList({
          limit: batchSize,
          offset: currentOffset,
          orderBy: '-created_at',
        });
        allClerkUsers.push(...batch.data);
        hasMore = batch.data.length === batchSize;
        currentOffset += batchSize;
      }

      // Merge ALL users
      let merged = allClerkUsers.map(mergeUser);

      // Apply search filter (manual since we're not using Clerk's query)
      if (search) {
        const q = search.toLowerCase();
        merged = merged.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q))
        );
      }

      // Apply city filter
      if (city) {
        merged = merged.filter((u) => u.city === city);
      }

      // Apply status filter
      if (status === 'active') {
        merged = merged.filter((u) => u.status === 'active');
      } else if (status === 'banned') {
        merged = merged.filter((u) => u.status === 'banned');
      }

      // Sort
      merged.sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'packages':
            cmp = a.totalPackages - b.totalPackages;
            break;
          case 'spent':
            cmp = parseFloat(a.totalSpent.replace('$', '').replace(',', '')) - parseFloat(b.totalSpent.replace('$', '').replace(',', ''));
            break;
          case 'date':
          default:
            cmp = a.createdAt - b.createdAt;
            break;
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });

      // Paginate
      const totalFiltered = merged.length;
      const paginatedUsers = merged.slice(offset, offset + limit);

      return NextResponse.json({
        users: paginatedUsers,
        totalCount: totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
        cities: uniqueCities,
      });
    } else {
      // Normal pagination via Clerk (no filters active)
      const response = await client.users.getUserList({
        limit,
        offset,
        query: search || undefined,
        orderBy: sortBy === 'name' ? (sortOrder === 'asc' ? '+first_name' : '-first_name') : '-created_at',
      });

      const mergedUsers = response.data.map(mergeUser);

      return NextResponse.json({
        users: mergedUsers,
        totalCount: response.totalCount,
        page,
        limit,
        totalPages: Math.ceil(response.totalCount / limit),
        cities: uniqueCities,
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
