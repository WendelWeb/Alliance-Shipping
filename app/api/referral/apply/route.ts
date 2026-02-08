import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, referralCodes, referrals, loyaltyCredits, loyaltyConfig } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

// POST - Apply a referral code (called during/after signup)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // Find the referred user (the one applying the code)
    const [referredUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!referredUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this user has already been referred
    const [existingReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredUser.id));

    if (existingReferral) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Validate the referral code exists
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, normalizedCode));

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Prevent self-referral
    if (referralCode.userId === referredUser.id) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Get credit amount from loyalty config, default to $5
    const [configEntry] = await db
      .select()
      .from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, 'credit_per_referral'));

    const creditAmount = configEntry ? parseFloat(configEntry.value) : 5.00;

    // Create the referral record
    const [newReferral] = await db
      .insert(referrals)
      .values({
        referrerId: referralCode.userId,
        referredId: referredUser.id,
        referralCode: normalizedCode,
        creditAwarded: true,
        creditAmount: creditAmount.toFixed(2),
      })
      .returning();

    // Award credit to the referrer
    await db
      .insert(loyaltyCredits)
      .values({
        userId: referralCode.userId,
        amount: creditAmount.toFixed(2),
        points: 0,
        type: 'referral',
        description: `Referral credit: ${referredUser.firstName || ''} ${referredUser.lastName || ''} signed up with your code`.trim(),
        referenceId: newReferral.id,
      });

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      referral: {
        id: newReferral.id,
        referrerCreditAwarded: creditAmount,
      },
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}
