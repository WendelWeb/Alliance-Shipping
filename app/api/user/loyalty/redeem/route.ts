import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, loyaltyCredits, packages } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';

// POST - Redeem loyalty credits against a package cost
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, packageId } = body;

    // Validate input
    if (!amount || !packageId) {
      return NextResponse.json(
        { error: 'Amount and packageId are required' },
        { status: 400 }
      );
    }

    const redeemAmount = parseFloat(amount);
    if (isNaN(redeemAmount) || redeemAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
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

    // Verify the package exists and belongs to the user
    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId));

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (pkg.userId !== user.id) {
      return NextResponse.json(
        { error: 'Package does not belong to this user' },
        { status: 403 }
      );
    }

    // Get current balance
    const [balanceResult] = await db
      .select({
        balance: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
      })
      .from(loyaltyCredits)
      .where(eq(loyaltyCredits.userId, user.id));

    const currentBalance = parseFloat(balanceResult.balance);

    if (redeemAmount > currentBalance) {
      return NextResponse.json(
        {
          error: 'Insufficient credit balance',
          currentBalance,
          requested: redeemAmount,
        },
        { status: 400 }
      );
    }

    // Create negative credit entry for redemption
    const [creditEntry] = await db
      .insert(loyaltyCredits)
      .values({
        userId: user.id,
        amount: (-redeemAmount).toFixed(2),
        points: 0,
        type: 'redemption',
        description: `Redeemed $${redeemAmount.toFixed(2)} against package #${pkg.trackingNumber}`,
        referenceId: packageId,
      })
      .returning();

    const newBalance = currentBalance - redeemAmount;

    return NextResponse.json({
      success: true,
      redemption: {
        id: creditEntry.id,
        amount: redeemAmount,
        packageId,
        trackingNumber: pkg.trackingNumber,
      },
      newBalance,
    });
  } catch (error) {
    console.error('Error redeeming credits:', error);
    return NextResponse.json(
      { error: 'Failed to redeem credits' },
      { status: 500 }
    );
  }
}
