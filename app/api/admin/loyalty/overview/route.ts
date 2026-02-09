import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loyaltyCredits } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth/admin';

// GET - Admin loyalty overview: totals, active users, credit breakdown
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
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

    // Credit breakdown by type
    const creditsByType = await db
      .select({
        type: loyaltyCredits.type,
        totalAmount: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(loyaltyCredits)
      .groupBy(loyaltyCredits.type);

    return NextResponse.json({
      success: true,
      overview: {
        totalCreditsIssued: parseFloat(issuedResult.totalIssued),
        totalCreditsRedeemed: parseFloat(redeemedResult.totalRedeemed),
        netCreditsOutstanding: parseFloat(issuedResult.totalIssued) - parseFloat(redeemedResult.totalRedeemed),
        activeUsersWithCredits,
        totalReferrals: 0,
      },
      topReferrers: [],
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
