import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, loyaltyCredits, loyaltyConfig } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';

// POST - Convert points to dollar credits
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { points } = body;

    // Validate input
    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'Points must be a positive number' },
        { status: 400 }
      );
    }

    // Find the user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current points balance
    const [pointsResult] = await db
      .select({
        points: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
      })
      .from(loyaltyCredits)
      .where(eq(loyaltyCredits.userId, user.id));

    const currentPoints = Number(pointsResult.points);

    if (points > currentPoints) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          currentPoints,
          requested: points,
        },
        { status: 400 }
      );
    }

    // Get conversion rate from config
    const [rateConfig] = await db
      .select()
      .from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, 'points_to_dollar_rate'));

    const pointsPerDollar = rateConfig ? parseFloat(rateConfig.value) : 1000;
    const creditAmount = points / pointsPerDollar;

    if (creditAmount < 0.01) {
      return NextResponse.json(
        { error: `Minimum conversion is ${Math.ceil(pointsPerDollar * 0.01)} points (= $0.01)` },
        { status: 400 }
      );
    }

    // Create two entries: deduct points and add credit
    const now = new Date();

    // Deduct points
    await db.insert(loyaltyCredits).values({
      userId: user.id,
      amount: '0.00',
      points: -points,
      type: 'conversion',
      description: `Converted ${points} points to $${creditAmount.toFixed(2)} credit`,
      referenceId: null,
      createdAt: now,
    });

    // Add credit
    await db.insert(loyaltyCredits).values({
      userId: user.id,
      amount: creditAmount.toFixed(2),
      points: 0,
      type: 'conversion',
      description: `Received $${creditAmount.toFixed(2)} credit from ${points} points`,
      referenceId: null,
      createdAt: now,
    });

    // Get new balances
    const [newBalances] = await db
      .select({
        balance: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
        points: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
      })
      .from(loyaltyCredits)
      .where(eq(loyaltyCredits.userId, user.id));

    return NextResponse.json({
      success: true,
      conversion: {
        pointsConverted: points,
        creditReceived: creditAmount,
        rate: pointsPerDollar,
      },
      newBalance: parseFloat(newBalances.balance),
      newPoints: Number(newBalances.points),
    });
  } catch (error) {
    console.error('Error converting points:', error);
    return NextResponse.json(
      { error: 'Failed to convert points' },
      { status: 500 }
    );
  }
}
