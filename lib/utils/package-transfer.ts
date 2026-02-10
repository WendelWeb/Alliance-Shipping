import { db } from '@/lib/db';
import { packages, users, packageRequests, trackingHistory, cityPricing, warehouses, packageTransfers } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendPackageApprovedEmail } from '@/lib/email/service';
import { sendPushNotification } from '@/lib/notifications/push';

// The default Alliance Shipping system account email
export const ALLIANCE_SHIPPING_EMAIL = 'allianceshipping26@gmail.com';

/**
 * Get the Alliance Shipping system user ID (the pool account for unclaimed packages)
 */
export async function getAllianceShippingUserId(): Promise<number | null> {
  const [asUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ALLIANCE_SHIPPING_EMAIL))
    .limit(1);
  return asUser?.id ?? null;
}

/**
 * Calculate fees for a package based on a user's city
 */
export async function calculateFeesForCity(city: string | null, weight: number): Promise<{
  serviceFee: number;
  weightCost: number;
  totalCost: number;
}> {
  let serviceFee = 5.00;
  let pricePerLb = 4.00;

  if (city) {
    const [pricing] = await db
      .select({
        serviceFee: cityPricing.serviceFee,
        pricePerLb: cityPricing.pricePerLb,
      })
      .from(cityPricing)
      .where(eq(cityPricing.city, city))
      .limit(1);

    if (pricing) {
      serviceFee = parseFloat(String(pricing.serviceFee));
      pricePerLb = parseFloat(String(pricing.pricePerLb));
    }
  }

  const weightCost = weight * pricePerLb;
  const totalCost = serviceFee + weightCost;

  return { serviceFee, weightCost, totalCost };
}

/**
 * Transfer a package from the Alliance Shipping pool to a real user.
 * Optionally links and approves a package request.
 */
export async function autoTransferPackage(params: {
  packageId: number;
  newUserId: number;
  requestId?: number;
  transferType?: 'user_claimed' | 'admin_assigned';
  transferredBy?: number; // Admin ID if manually assigned
  notes?: string;
}): Promise<{
  success: boolean;
  userName?: string;
  trackingNumber?: string;
  error?: string;
}> {
  const { packageId, newUserId, requestId, transferType = 'user_claimed', transferredBy, notes } = params;

  try {
    // Get the user's info
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        city: users.city,
        warehouseId: users.warehouseId,
        preferredLanguage: users.preferredLanguage,
      })
      .from(users)
      .where(eq(users.id, newUserId))
      .limit(1);

    if (!user) return { success: false, error: 'User not found' };

    // Get the package with current owner info
    const [pkg] = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        weight: packages.weight,
        status: packages.status,
        userId: packages.userId,
        serviceFee: packages.serviceFee,
        weightCost: packages.weightCost,
        totalCost: packages.totalCost,
      })
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    if (!pkg) return { success: false, error: 'Package not found' };

    // Store old pricing
    const oldServiceFee = parseFloat(String(pkg.serviceFee)) || 0;
    const oldWeightCost = parseFloat(String(pkg.weightCost)) || 0;
    const oldTotalCost = parseFloat(String(pkg.totalCost)) || 0;
    const fromUserId = pkg.userId;

    // Get old user's city (if not Alliance Shipping)
    let oldCity: string | null = null;
    const asUserId = await getAllianceShippingUserId();
    if (fromUserId !== asUserId) {
      const [oldUser] = await db
        .select({ city: users.city })
        .from(users)
        .where(eq(users.id, fromUserId))
        .limit(1);
      oldCity = oldUser?.city || null;
    }

    // Recalculate fees based on new user's city
    const weight = parseFloat(String(pkg.weight)) || 0;
    const fees = await calculateFeesForCity(user.city, weight);

    // Transfer ownership + update fees
    await db
      .update(packages)
      .set({
        userId: newUserId,
        serviceFee: fees.serviceFee.toFixed(2),
        weightCost: fees.weightCost.toFixed(2),
        totalCost: fees.totalCost.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(packages.id, packageId));

    // Log the transfer
    await db.insert(packageTransfers).values({
      packageId,
      fromUserId,
      toUserId: newUserId,
      requestId: requestId || null,
      oldServiceFee: oldServiceFee.toFixed(2),
      oldWeightCost: oldWeightCost.toFixed(2),
      oldTotalCost: oldTotalCost.toFixed(2),
      newServiceFee: fees.serviceFee.toFixed(2),
      newWeightCost: fees.weightCost.toFixed(2),
      newTotalCost: fees.totalCost.toFixed(2),
      oldCity,
      newCity: user.city || 'Unknown',
      transferType,
      transferredBy: transferredBy || null,
      notes: notes || null,
    });

    // Add tracking history entry
    await db.insert(trackingHistory).values({
      packageId,
      status: 'claimed',
      location: 'Alliance Shipping',
      description: `Package claimed by ${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });

    // If there's a linked request, approve it
    if (requestId) {
      await db
        .update(packageRequests)
        .set({
          status: 'approved',
          packageId,
          updatedAt: new Date(),
        })
        .where(eq(packageRequests.id, requestId));
    }

    // Send approval email
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    try {
      await sendPackageApprovedEmail(
        user.email,
        userName,
        pkg.trackingNumber,
        fees.totalCost
      );
    } catch (emailErr) {
      console.error('[AUTO-TRANSFER] Email send failed:', emailErr);
    }

    // Send push notification
    try {
      await sendPushNotification({
        userId: newUserId,
        templateKey: 'request_approved',
        variables: { tracking: pkg.trackingNumber },
        packageId,
      });
    } catch (pushErr) {
      console.error('[AUTO-TRANSFER] Push notification failed:', pushErr);
    }

    return {
      success: true,
      userName,
      trackingNumber: pkg.trackingNumber,
    };
  } catch (error) {
    console.error('[AUTO-TRANSFER] Error:', error);
    return { success: false, error: 'Transfer failed' };
  }
}

/**
 * Check if a package with this external tracking exists in the Alliance Shipping pool.
 * Returns the package ID if found, null otherwise.
 */
export async function findUnclaimedPackage(externalTrackingNumber: string): Promise<{
  id: number;
  trackingNumber: string;
  status: string;
} | null> {
  const asUserId = await getAllianceShippingUserId();
  if (!asUserId) return null;

  const [pkg] = await db
    .select({
      id: packages.id,
      trackingNumber: packages.trackingNumber,
      status: packages.status,
    })
    .from(packages)
    .where(
      and(
        eq(packages.userId, asUserId),
        sql`LOWER(${packages.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`
      )
    )
    .limit(1);

  return pkg ?? null;
}

/**
 * Check if there's a pending package request matching this external tracking number.
 * Returns the request info if found.
 */
export async function findPendingRequest(externalTrackingNumber: string): Promise<{
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
} | null> {
  const [req] = await db
    .select({
      id: packageRequests.id,
      userId: packageRequests.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(packageRequests)
    .leftJoin(users, eq(packageRequests.userId, users.id))
    .where(
      and(
        eq(packageRequests.status, 'pending'),
        sql`LOWER(${packageRequests.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`
      )
    )
    .limit(1);

  if (!req) return null;

  return {
    id: req.id,
    userId: req.userId,
    userName: `${req.firstName || ''} ${req.lastName || ''}`.trim() || req.email || 'Unknown',
    userEmail: req.email || '',
  };
}
