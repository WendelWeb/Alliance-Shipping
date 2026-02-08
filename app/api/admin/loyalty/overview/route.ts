import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, loyaltyCredits, referrals } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';

// GET - Admin loyalty overview: totals, active users, top referrers
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total credits issued (sum of all positive credit entries)
    const [issuedResult] = await db
      .select({
        totalIssued: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} > 0 THEN ${loyaltyCredits.amount} ELSE 0 END), 0)`,
      })
      .from(loyaltyCredits);

    // Total credits redeemed (sum of all negative credit entries, returned as positive)
    const [redeemedResult] = await db
      .select({
        totalRedeemed: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} < 0 THEN ABS(${loyaltyCredits.amount}) ELSE 0 END), 0)`,
      })
      .from(loyaltyCredits);

    // Active users with credits (users who have a positive balance)
    const activeUsersResult = await db
      .select({
        userId: loyaltyCredits.userId,
        balance: sql<string>`SUM(${loyaltyCredits.amount})`,
      })
      .from(loyaltyCredits)
      .groupBy(loyaltyCredits.userId)
      .having(sql`SUM(${loyaltyCredits.amount}) > 0`);

    const activeUsersWithCredits = activeUsersResult.length;

    // Top referrers (users with the most successful referrals)
    const topReferrers = await db
      .select({
        referrerId: referrals.referrerId,
        totalReferrals: sql<number>`COUNT(*)`,
        totalCreditsEarned: sql<string>`COALESCE(SUM(${referrals.creditAmount}), 0)`,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .groupBy(referrals.referrerId, users.firstName, users.lastName, users.email)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

    // Credit breakdown by type
    const creditsByType = await db
      .select({
        type: loyaltyCredits.type,
        totalAmount: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(loyaltyCredits)
      .groupBy(loyaltyCredits.type);

    // Total referrals count
    const [totalReferralsResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(referrals);

    return NextResponse.json({
      success: true,
      overview: {
        totalCreditsIssued: parseFloat(issuedResult.totalIssued),
        totalCreditsRedeemed: parseFloat(redeemedResult.totalRedeemed),
        netCreditsOutstanding: parseFloat(issuedResult.totalIssued) - parseFloat(redeemedResult.totalRedeemed),
        activeUsersWithCredits,
        totalReferrals: Number(totalReferralsResult.count),
      },
      topReferrers: topReferrers.map((r) => ({
        userId: r.referrerId,
        name: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
        email: r.email,
        totalReferrals: Number(r.totalReferrals),
        totalCreditsEarned: parseFloat(r.totalCreditsEarned),
      })),
      creditsByType: creditsByType.map((c) => ({
        type: c.type,
        totalAmount: parseFloat(c.totalAmount),
        transactionCount: Number(c.transactionCount),
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty overview' },
      { status: 500 }
    );
  }
}
