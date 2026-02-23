import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deliveryBundles, packages, users, specialItemFees } from '@/lib/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, and, or } from 'drizzle-orm';

// GET - Get bundle details for current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    // Find user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const bundleId = parseInt(id);
    if (isNaN(bundleId)) {
      return NextResponse.json({ error: 'Invalid bundle ID' }, { status: 400 });
    }

    // Get bundle (verify ownership)
    const [bundle] = await db
      .select()
      .from(deliveryBundles)
      .where(
        and(
          eq(deliveryBundles.id, bundleId),
          eq(deliveryBundles.userId, user.id)
        )
      )
      .limit(1);

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    // Get all packages in this bundle
    const bundlePackages = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        description: packages.description,
        weight: packages.weight,
        serviceFee: packages.serviceFee,
        weightCost: packages.weightCost,
        customsFees: packages.customsFees,
        totalCost: packages.totalCost,
        status: packages.status,
        specialItemName: specialItemFees.itemName,
        specialItemBrand: specialItemFees.brand,
      })
      .from(packages)
      .leftJoin(specialItemFees, eq(packages.specialItemId, specialItemFees.id))
      .where(eq(packages.deliveryBundleId, bundleId));

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        packageCount: bundle.packageCount,
        originalTotalServiceFees: bundle.originalTotalServiceFees,
        bundleServiceFee: bundle.bundleServiceFee,
        totalSavings: bundle.totalSavings,
        bundleTotalCost: bundle.bundleTotalCost,
        status: bundle.status,
        deliveredAt: bundle.deliveredAt,
      },
      packages: bundlePackages,
    });
  } catch (error) {
    console.error('Error fetching bundle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle details' },
      { status: 500 }
    );
  }
}
