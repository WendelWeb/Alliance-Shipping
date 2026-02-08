import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, referralCodes, referrals, loyaltyCredits } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql, desc } from 'drizzle-orm';

// Generate a random referral code like "ALLIANCE-XXXX"
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALLIANCE-${suffix}`;
}

// GET - Get user's referral code, stats, and referred users
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

    // Get or create referral code
    let [existingCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, user.id));

    if (!existingCode) {
      // Generate a unique code, retry on collision
      let code = generateReferralCode();
      let attempts = 0;
      while (attempts < 10) {
        const [collision] = await db
          .select()
          .from(referralCodes)
          .where(eq(referralCodes.code, code));

        if (!collision) break;
        code = generateReferralCode();
        attempts++;
      }

      [existingCode] = await db
        .insert(referralCodes)
        .values({
          userId: user.id,
          code,
        })
        .returning();
    }

    // Get referral stats: total referrals
    const [referralStats] = await db
      .select({
        totalReferrals: sql<number>`COUNT(*)`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, user.id));

    // Get total credits earned from referrals
    const [creditsEarned] = await db
      .select({
        totalCreditsEarned: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
      })
      .from(loyaltyCredits)
      .where(
        sql`${loyaltyCredits.userId} = ${user.id} AND ${loyaltyCredits.type} = 'referral'`
      );

    // Get list of referred users
    const referredUsers = await db
      .select({
        id: referrals.id,
        referredFirstName: users.firstName,
        referredLastName: users.lastName,
        referredEmail: users.email,
        creditAwarded: referrals.creditAwarded,
        creditAmount: referrals.creditAmount,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, user.id))
      .orderBy(desc(referrals.createdAt));

    return NextResponse.json({
      success: true,
      referralCode: existingCode.code,
      stats: {
        totalReferrals: Number(referralStats.totalReferrals),
        totalCreditsEarned: parseFloat(creditsEarned.totalCreditsEarned),
      },
      referredUsers: referredUsers.map((r) => ({
        id: r.id,
        name: `${r.referredFirstName || ''} ${r.referredLastName || ''}`.trim(),
        email: r.referredEmail,
        creditAwarded: r.creditAwarded,
        creditAmount: r.creditAmount ? parseFloat(r.creditAmount) : null,
        referredAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral information' },
      { status: 500 }
    );
  }
}
