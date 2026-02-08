import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, packages, loyaltyCredits, referrals, referralCodes } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, sql, count, sum, gt, lt, and } from 'drizzle-orm';

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

    // Get referral counts per user (as referrer)
    const referralCounts = await db
      .select({
        referrerId: referrals.referrerId,
        totalReferrals: count(referrals.id),
      })
      .from(referrals)
      .groupBy(referrals.referrerId);

    // Get referral codes
    const codes = await db
      .select({
        userId: referralCodes.userId,
        code: referralCodes.code,
      })
      .from(referralCodes);

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
    const referralCountMap = new Map(
      referralCounts.map((r) => [r.referrerId, Number(r.totalReferrals) || 0])
    );
    const codeMap = new Map(
      codes.map((c) => [c.userId, c.code])
    );
    // Group transactions by userId (max 10 per user)
    const transactionsMap = new Map<number, typeof recentTransactions>();
    for (const tx of recentTransactions) {
      const list = transactionsMap.get(tx.userId) || [];
      if (list.length < 10) {
        list.push(tx);
        transactionsMap.set(tx.userId, list);
      }
    }

    // Build a lookup map by clerkId
    const statsMap = new Map(
      dbUsers.map((u) => {
        const loyalty = loyaltyMap.get(u.id);
        return [
          u.clerkId,
          {
            dbId: u.id,
            phone: u.phone,
            packageCount: Number(u.packageCount) || 0,
            totalSpent: u.totalSpent ? parseFloat(u.totalSpent) : 0,
            // Loyalty data
            creditBalance: loyalty ? parseFloat(String(loyalty.creditBalance)) : 0,
            totalCreditsEarned: loyalty ? parseFloat(String(loyalty.totalCreditsEarned)) : 0,
            totalCreditsRedeemed: loyalty ? parseFloat(String(loyalty.totalCreditsRedeemed)) : 0,
            pointsBalance: loyalty ? Number(loyalty.pointsBalance) : 0,
            totalPointsEarned: loyalty ? Number(loyalty.totalPointsEarned) : 0,
            totalPointsUsed: loyalty ? Number(loyalty.totalPointsUsed) : 0,
            transactionCount: loyalty ? Number(loyalty.transactionCount) : 0,
            totalReferrals: referralCountMap.get(u.id) || 0,
            referralCode: codeMap.get(u.id) || '',
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
        // Loyalty data
        creditBalance: stats?.creditBalance || 0,
        totalCreditsEarned: stats?.totalCreditsEarned || 0,
        totalCreditsRedeemed: stats?.totalCreditsRedeemed || 0,
        pointsBalance: stats?.pointsBalance || 0,
        totalPointsEarned: stats?.totalPointsEarned || 0,
        totalPointsUsed: stats?.totalPointsUsed || 0,
        transactionCount: stats?.transactionCount || 0,
        totalReferrals: stats?.totalReferrals || 0,
        referralCode: stats?.referralCode || '',
        recentTransactions: stats?.recentTransactions || [],
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
