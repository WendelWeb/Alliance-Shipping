import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, loyaltyCredits } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql, desc } from 'drizzle-orm';

// GET - Get user's credit balance and recent transaction history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get credit balance and points balance
    const [balanceResult] = await db
      .select({
        balance: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
        points: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
      })
      .from(loyaltyCredits)
      .where(eq(loyaltyCredits.userId, user.id));

    // Get recent credit history (last 20 transactions)
    const recentHistory = await db
      .select({
        id: loyaltyCredits.id,
        amount: loyaltyCredits.amount,
        points: loyaltyCredits.points,
        type: loyaltyCredits.type,
        description: loyaltyCredits.description,
        referenceId: loyaltyCredits.referenceId,
        createdAt: loyaltyCredits.createdAt,
      })
      .from(loyaltyCredits)
      .where(eq(loyaltyCredits.userId, user.id))
      .orderBy(desc(loyaltyCredits.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      balance: parseFloat(balanceResult.balance),
      points: Number(balanceResult.points),
      history: recentHistory.map((entry) => ({
        id: entry.id,
        amount: parseFloat(entry.amount),
        points: entry.points || 0,
        type: entry.type,
        description: entry.description,
        referenceId: entry.referenceId,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching loyalty credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty credits' },
      { status: 500 }
    );
  }
}
