import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  packages, deliveryBundles, deliveryProof, trackingHistory,
  adminActivityLogs, users, loyaltyConfig, loyaltyCredits,
  warehouses, cityPricing, specialItemFees,
} from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, and, inArray } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/notifications/push';
import { sendBundleDeliveredEmail, sendBundleCancelledEmail } from '@/lib/email/email-templates';

// POST - Bundle deliver: deliver multiple packages for same user with 1 service fee
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageIds, proofData } = body as {
      packageIds: number[];
      proofData?: {
        recipientName?: string;
        photoUrl?: string;
        signatureUrl?: string;
        notes?: string;
      };
    };

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 package IDs required for bundle delivery' },
        { status: 400 }
      );
    }

    // Fetch all packages with user info
    const pkgsWithUsers = await db
      .select({ pkg: packages, user: users })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(inArray(packages.id, packageIds));

    if (pkgsWithUsers.length !== packageIds.length) {
      return NextResponse.json(
        { error: 'Some packages not found' },
        { status: 404 }
      );
    }

    // Validate all packages are "available"
    const nonAvailable = pkgsWithUsers.filter(p => p.pkg.status !== 'available');
    if (nonAvailable.length > 0) {
      return NextResponse.json(
        { error: `Packages must all be "available". Non-available: ${nonAvailable.map(p => p.pkg.trackingNumber).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate all packages belong to the same user
    const userIds = new Set(pkgsWithUsers.map(p => p.pkg.userId));
    if (userIds.size !== 1) {
      return NextResponse.json(
        { error: 'All packages must belong to the same user for bundle delivery' },
        { status: 400 }
      );
    }

    const userId = pkgsWithUsers[0].pkg.userId;
    const user = pkgsWithUsers[0].user;

    // Get city pricing for the user's city (to know the original service fee)
    let cityServiceFee = 5.00; // default
    if (user?.city) {
      const [cp] = await db
        .select({ serviceFee: cityPricing.serviceFee })
        .from(cityPricing)
        .where(eq(cityPricing.city, user.city))
        .limit(1);
      if (cp) cityServiceFee = parseFloat(cp.serviceFee);
    }

    // Calculate financials
    const originalServiceFees = pkgsWithUsers.reduce(
      (sum, p) => sum + parseFloat(String(p.pkg.serviceFee)),
      0
    );
    const bundleServiceFee = cityServiceFee; // Only 1 service fee
    const totalSavings = originalServiceFees - bundleServiceFee;

    // Create the delivery bundle
    const [bundle] = await db.insert(deliveryBundles).values({
      userId,
      packageCount: packageIds.length,
      originalTotalServiceFees: originalServiceFees.toFixed(2),
      bundleServiceFee: bundleServiceFee.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
      bundleTotalCost: '0.00', // Will be calculated below
      deliveredBy: session.adminId,
      deliveredAt: new Date(),
    }).returning();

    // Update each package
    let bundleTotalCost = 0;
    const updatedPackages: (typeof packages.$inferSelect)[] = [];

    // Get user's warehouse info
    let depotName: string | null = null;
    let depotAddress: string | null = null;
    if (user?.warehouseId) {
      const [warehouse] = await db
        .select({ name: warehouses.name, address: warehouses.address })
        .from(warehouses)
        .where(eq(warehouses.id, user.warehouseId))
        .limit(1);
      if (warehouse) {
        depotName = warehouse.name;
        depotAddress = warehouse.address;
      }
    }

    for (let i = 0; i < pkgsWithUsers.length; i++) {
      const { pkg } = pkgsWithUsers[i];
      const isFirst = i === 0;

      // First package keeps its service fee, extras get $0
      const newServiceFee = isFirst ? parseFloat(String(pkg.serviceFee)) : 0;
      const weightCost = parseFloat(String(pkg.weightCost)) || 0;
      const customsFees = parseFloat(String(pkg.customsFees)) || 0;
      const newTotalCost = newServiceFee + weightCost + customsFees;

      bundleTotalCost += newTotalCost;

      const [updated] = await db
        .update(packages)
        .set({
          status: 'delivered',
          serviceFee: newServiceFee.toFixed(2),
          totalCost: newTotalCost.toFixed(2),
          actualDelivery: new Date(),
          deliveryBundleId: bundle.id,
          currentLocation: user?.city || 'Haiti',
          updatedAt: new Date(),
        })
        .where(eq(packages.id, pkg.id))
        .returning();

      updatedPackages.push(updated);

      // Tracking history
      await db.insert(trackingHistory).values({
        packageId: pkg.id,
        status: 'packages.timeline.delivered',
        location: 'packages.locations.delivered',
        description: 'packages.messages.deliveredSuccessfully',
        timestamp: new Date(),
      });

      // Create delivery proof for first package (linked to bundle conceptually)
      if (isFirst && proofData?.recipientName) {
        await db.insert(deliveryProof).values({
          packageId: pkg.id,
          recipientName: proofData.recipientName,
          photoUrl: proofData.photoUrl || null,
          signatureImageUrl: proofData.signatureUrl || null,
          notes: proofData.notes ? `[Bundle #${bundle.id}] ${proofData.notes}` : `[Bundle #${bundle.id}]`,
          deliveredBy: session.adminId,
          deliveredAt: new Date(),
        }).catch(() => {
          // deliveryProof has unique constraint on packageId, ignore if already exists
        });
      }
    }

    // Update bundle total cost
    await db
      .update(deliveryBundles)
      .set({ bundleTotalCost: bundleTotalCost.toFixed(2) })
      .where(eq(deliveryBundles.id, bundle.id));

    // Award loyalty per package
    let totalPointsAwarded = 0;
    let totalCreditsAwarded = 0;

    const [shipmentCreditConfig] = await db
      .select().from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, 'credit_per_shipment'));
    const [weightCreditConfig] = await db
      .select().from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, 'credit_per_lb'));
    const [pointsConfig] = await db
      .select().from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, 'points_per_dollar_spent'));

    const creditPerShipment = shipmentCreditConfig ? parseFloat(String(shipmentCreditConfig.value)) : 1.00;
    const creditPerLb = weightCreditConfig ? parseFloat(String(weightCreditConfig.value)) : 0.10;
    const pointsPerDollar = pointsConfig ? parseFloat(String(pointsConfig.value)) : 50;

    for (const updated of updatedPackages) {
      const packageWeight = parseFloat(String(updated.weight)) || 0;
      const totalCost = parseFloat(String(updated.totalCost)) || 0;
      const pointsEarned = Math.floor(totalCost * pointsPerDollar);

      // Shipment credit
      await db.insert(loyaltyCredits).values({
        userId,
        amount: creditPerShipment.toFixed(2),
        points: 0,
        type: 'shipment',
        description: `Bundle #${bundle.id} - Shipment credit for ${updated.trackingNumber}`,
        referenceId: updated.id,
      });
      totalCreditsAwarded += creditPerShipment;

      // Weight credit
      if (packageWeight > 0) {
        const weightCredit = creditPerLb * packageWeight;
        await db.insert(loyaltyCredits).values({
          userId,
          amount: weightCredit.toFixed(2),
          points: 0,
          type: 'weight',
          description: `Bundle #${bundle.id} - Weight credit (${packageWeight} lbs) for ${updated.trackingNumber}`,
          referenceId: updated.id,
        });
        totalCreditsAwarded += weightCredit;
      }

      // Points for spending
      if (pointsEarned > 0) {
        await db.insert(loyaltyCredits).values({
          userId,
          amount: '0.00',
          points: pointsEarned,
          type: 'spending',
          description: `Bundle #${bundle.id} - ${pointsEarned} points for $${totalCost.toFixed(2)} on ${updated.trackingNumber}`,
          referenceId: updated.id,
        });
        totalPointsAwarded += pointsEarned;
      }
    }

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'bundle_delivery',
      targetType: 'delivery_bundle',
      targetId: bundle.id,
      details: {
        bundleId: bundle.id,
        packageIds,
        packageCount: packageIds.length,
        totalSavings: totalSavings.toFixed(2),
        bundleTotalCost: bundleTotalCost.toFixed(2),
        trackingNumbers: updatedPackages.map(p => p.trackingNumber),
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send 1 recap push notification
    const trackingList = updatedPackages.map(p => p.trackingNumber).join(', ');
    sendPushNotification({
      userId,
      templateKey: 'bundle_delivered',
      variables: {
        count: String(packageIds.length),
        savings: totalSavings.toFixed(2),
        trackingList,
        total: bundleTotalCost.toFixed(2),
        originalTotal: (bundleTotalCost + totalSavings).toFixed(2),
        totalPoints: String(totalPointsAwarded),
        depot: depotName || 'Alliance Shipping',
        city: user?.city || 'Haiti',
      },
    }).catch(() => {});

    // Send bundle delivered email
    if (user?.email) {
      const emailPackages = updatedPackages.map((p, i) => ({
        trackingNumber: p.trackingNumber,
        weight: parseFloat(String(p.weight)) || 0,
        serviceFee: i === 0 ? parseFloat(String(p.serviceFee)) : 0,
        weightCost: parseFloat(String(p.weightCost)) || 0,
        customsFees: parseFloat(String(p.customsFees)) || 0,
        totalCost: parseFloat(String(pkgsWithUsers[i].pkg.serviceFee)) + (parseFloat(String(p.weightCost)) || 0) + (parseFloat(String(p.customsFees)) || 0),
        bundleTotalCost: parseFloat(String(p.totalCost)) || 0,
      }));
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client';
      sendBundleDeliveredEmail(
        user.email,
        userName,
        emailPackages,
        totalSavings,
        totalPointsAwarded,
        user.preferredLanguage || 'fr',
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      bundle: {
        ...bundle,
        bundleTotalCost: bundleTotalCost.toFixed(2),
      },
      packages: updatedPackages,
      savings: totalSavings.toFixed(2),
      loyaltySummary: {
        totalPointsAwarded,
        totalCreditsAwarded: totalCreditsAwarded.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error in bundle delivery:', error);
    return NextResponse.json(
      { error: 'Failed to process bundle delivery' },
      { status: 500 }
    );
  }
}

// PATCH - Cancel a bundle delivery
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bundleId, reason } = body as { bundleId: number; reason?: string };

    if (!bundleId) {
      return NextResponse.json({ error: 'bundleId is required' }, { status: 400 });
    }

    // Get the bundle
    const [bundle] = await db
      .select()
      .from(deliveryBundles)
      .where(eq(deliveryBundles.id, bundleId))
      .limit(1);

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }

    if (bundle.status === 'cancelled') {
      return NextResponse.json({ error: 'Bundle already cancelled' }, { status: 400 });
    }

    // Get all packages in this bundle
    const bundlePackages = await db
      .select({ pkg: packages, user: users })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(eq(packages.deliveryBundleId, bundleId));

    // Get city pricing to restore service fees
    const user = bundlePackages[0]?.user;
    let cityServiceFee = 5.00;
    if (user?.city) {
      const [cp] = await db
        .select({ serviceFee: cityPricing.serviceFee })
        .from(cityPricing)
        .where(eq(cityPricing.city, user.city))
        .limit(1);
      if (cp) cityServiceFee = parseFloat(cp.serviceFee);
    }

    // Restore each package
    for (const { pkg } of bundlePackages) {
      const weightCost = parseFloat(String(pkg.weightCost)) || 0;
      const customsFees = parseFloat(String(pkg.customsFees)) || 0;
      const restoredTotal = cityServiceFee + weightCost + customsFees;

      await db
        .update(packages)
        .set({
          status: 'available',
          serviceFee: cityServiceFee.toFixed(2),
          totalCost: restoredTotal.toFixed(2),
          actualDelivery: null,
          deliveryBundleId: null,
          updatedAt: new Date(),
        })
        .where(eq(packages.id, pkg.id));

      // Add tracking entry for cancellation
      await db.insert(trackingHistory).values({
        packageId: pkg.id,
        status: 'packages.timeline.available',
        location: 'packages.locations.office',
        description: 'packages.messages.bundleCancelled',
        timestamp: new Date(),
      });
    }

    // Delete loyalty credits awarded for this bundle
    for (const { pkg } of bundlePackages) {
      await db
        .delete(loyaltyCredits)
        .where(
          and(
            eq(loyaltyCredits.userId, bundle.userId),
            eq(loyaltyCredits.referenceId, pkg.id),
          )
        );
    }

    // Mark bundle as cancelled
    await db
      .update(deliveryBundles)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: session.adminId,
        cancelReason: reason || null,
      })
      .where(eq(deliveryBundles.id, bundleId));

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'bundle_cancelled',
      targetType: 'delivery_bundle',
      targetId: bundleId,
      details: {
        bundleId,
        reason,
        packageCount: bundlePackages.length,
        trackingNumbers: bundlePackages.map(p => p.pkg.trackingNumber),
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send push notification about cancellation
    sendPushNotification({
      userId: bundle.userId,
      templateKey: 'bundle_cancelled',
      variables: {
        count: String(bundlePackages.length),
        trackingList: bundlePackages.map(p => p.pkg.trackingNumber).join(', '),
      },
    }).catch(() => {});

    // Send cancellation email
    if (user?.email) {
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client';
      sendBundleCancelledEmail(
        user.email,
        userName,
        bundlePackages.map(p => p.pkg.trackingNumber),
        user.preferredLanguage || 'fr',
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Bundle #${bundleId} cancelled, ${bundlePackages.length} packages restored to available`,
    });
  } catch (error) {
    console.error('Error cancelling bundle:', error);
    return NextResponse.json(
      { error: 'Failed to cancel bundle' },
      { status: 500 }
    );
  }
}
