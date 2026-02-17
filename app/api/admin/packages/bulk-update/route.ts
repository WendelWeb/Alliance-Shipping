import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, trackingHistory, adminActivityLogs, users, loyaltyConfig, loyaltyCredits, warehouses, cityPricing } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, inArray } from 'drizzle-orm';
import {
  sendPackageStatusChangeEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail
} from '@/lib/email/service';
import { sendPushNotification } from '@/lib/notifications/push';

// POST - Bulk update package statuses
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = session.adminId;

    const body = await request.json();
    const { packageIds, status } = body;

    // Track actions for response
    const actionsSummary: {
      emailsSent: number;
      pointsAwarded: number;
      creditsAwarded: number;
      packagesUpdated: number;
      details: Array<{
        trackingNumber: string;
        email: string | null;
        pointsEarned: number;
        creditsEarned: number;
      }>;
    } = {
      emailsSent: 0,
      pointsAwarded: 0,
      creditsAwarded: 0,
      packagesUpdated: 0,
      details: [],
    };

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json(
        { error: 'Package IDs array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Filter out negative IDs (those are requests, not packages)
    const realPackageIds = packageIds.filter(id => id > 0);

    if (realPackageIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid package IDs provided' },
        { status: 400 }
      );
    }

    // First, get all packages to update with their user info
    const packagesToUpdate = await db
      .select({
        pkg: packages,
        user: users,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(inArray(packages.id, realPackageIds));

    // Update all packages and create tracking history for each
    const updatedPackages: typeof packages.$inferSelect[] = [];

    for (const { pkg, user } of packagesToUpdate) {
      // Get user's warehouse if available
      let warehouseName: string | null = null;
      if (user?.warehouseId) {
        const { warehouses } = await import('@/lib/db/schema');
        const [warehouse] = await db
          .select({ name: warehouses.name, city: warehouses.city })
          .from(warehouses)
          .where(eq(warehouses.id, user.warehouseId))
          .limit(1);

        if (warehouse) {
          warehouseName = `${warehouse.city} Office`;
        }
      }

      // Dynamic location based on user's city/warehouse
      const officeLocation = warehouseName || (user?.city ? `${user.city} Office` : 'Port-au-Prince Office');
      const deliveryLocation = user?.city || 'Port-au-Prince';

      const locationMap: Record<string, string> = {
        'received': 'Miami Warehouse',
        'in-transit': 'En route to Haiti',
        'available': officeLocation, // ⭐ Utilise le warehouse ou la ville du user
        'delivered': deliveryLocation,
      };

      // Update individual package
      const [updated] = await db
        .update(packages)
        .set({
          status,
          currentLocation: locationMap[status] || 'Unknown',
          updatedAt: new Date(),
          ...(status === 'delivered' ? { actualDelivery: new Date() } : {}),
        })
        .where(eq(packages.id, pkg.id))
        .returning();

      updatedPackages.push(updated);

      let packagePointsEarned = 0;
      let packageCreditsEarned = 0;
      let emailSent = false;

      // Use i18n keys so mobile/web can translate them
      const statusDescriptionKeys: Record<string, string> = {
        'received': 'packages.messages.receivedAtWarehouse',
        'in-transit': 'packages.messages.inTransitToHaiti',
        'available': 'packages.messages.availableForPickup',
        'delivered': 'packages.messages.deliveredSuccessfully',
      };

      const statusTitleKeys: Record<string, string> = {
        'received': 'packages.timeline.received',
        'in-transit': 'packages.timeline.inTransit',
        'available': 'packages.timeline.available',
        'delivered': 'packages.timeline.delivered',
      };

      const locationKeys: Record<string, string> = {
        'received': 'packages.locations.miamiWarehouse',
        'in-transit': 'packages.locations.enRouteToHaiti',
        'available': 'packages.locations.office',
        'delivered': 'packages.locations.delivered',
      };

      await db.insert(trackingHistory).values({
        packageId: pkg.id,
        status: statusTitleKeys[status] || status,
        location: locationKeys[status] || locationMap[status] || 'Unknown',
        description: statusDescriptionKeys[status] || 'packages.messages.statusUpdated',
        timestamp: new Date(),
      });

      // Log admin activity
      await db.insert(adminActivityLogs).values({
        adminId: adminId,
        action: 'updated_status',
        targetType: 'package',
        targetId: updated.id,
        details: {
          trackingNumber: updated.trackingNumber,
          oldStatus: pkg.status, // Old status from before update
          newStatus: status,
          updatedFields: ['status', 'currentLocation'],
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      // Get warehouse hours for push notification
      let officeHours = 'Lun-Sam 8h-17h';
      if (user?.warehouseId) {
        const [wh] = await db
          .select({ openingHours: warehouses.openingHours })
          .from(warehouses)
          .where(eq(warehouses.id, user.warehouseId))
          .limit(1);
        if (wh?.openingHours) officeHours = wh.openingHours;
      }

      // Get delivery days from city pricing
      let deliveryDays = '10-15';
      if (user?.city) {
        const [cp] = await db
          .select({ deliveryDaysMin: cityPricing.deliveryDaysMin, deliveryDaysMax: cityPricing.deliveryDaysMax })
          .from(cityPricing)
          .where(eq(cityPricing.city, user.city))
          .limit(1);
        if (cp) deliveryDays = `${cp.deliveryDaysMin}-${cp.deliveryDaysMax}`;
      }

      // Calculate loyalty points for delivered notification
      let pointsEarned = '0';
      if (status === 'delivered') {
        const totalCost = parseFloat(String(updated.totalCost)) || 0;
        const [pointsConfig] = await db
          .select()
          .from(loyaltyConfig)
          .where(eq(loyaltyConfig.key, 'points_per_dollar_spent'));
        const pointsPerDollar = pointsConfig ? parseFloat(pointsConfig.value) : 50;
        pointsEarned = String(Math.floor(totalCost * pointsPerDollar));
      }

      // Send push notification (independent of email)
      const pushTemplateMap: Record<string, string> = {
        'received': 'package_received',
        'in-transit': 'package_in_transit',
        'available': 'package_available',
        'delivered': 'package_delivered',
      };
      const pushTemplate = pushTemplateMap[status];
      if (pushTemplate) {
        sendPushNotification({
          userId: updated.userId,
          templateKey: pushTemplate,
          variables: {
            tracking: updated.trackingNumber,
            externalTracking: updated.externalTrackingNumber || 'N/A',
            depot: officeLocation,
            weight: String(updated.weight || '0'),
            total: parseFloat(String(updated.totalCost || '0')).toFixed(2),
            city: user?.city || 'Haiti',
            location: officeLocation,
            hours: officeHours,
            days: deliveryDays,
            points: pointsEarned,
          },
          packageId: updated.id,
        }).catch(() => {});
      }

      // Send email notification to user
      if (user?.email) {
        emailSent = true;
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        const userLocale = user.preferredLanguage || 'fr';

        if (status === 'available') {
          sendPackageAvailableEmail(
            user.email,
            userName,
            updated.trackingNumber,
            officeLocation,
            userLocale
          ).catch(error => {
            console.error('Failed to send available email:', error);
          });
        } else if (status === 'delivered') {
          sendPackageDeliveredEmail(
            user.email,
            userName,
            updated.trackingNumber,
            userName,
            userLocale
          ).catch(error => {
            console.error('Failed to send delivered email:', error);
          });
        } else {
          const statusMessages: Record<string, string> = {
            'received': 'Your package has been received at our warehouse and is being processed.',
            'in-transit': 'Your package is on its way to Haiti and will arrive soon.',
          };

          sendPackageStatusChangeEmail(
            user.email,
            userName,
            updated.trackingNumber,
            status,
            statusMessages[status] || 'Your package status has been updated.',
            userLocale
          ).catch(error => {
            console.error('Failed to send status change email:', error);
          });
        }
      }

      // Award loyalty credits and points when package is delivered
      if (status === 'delivered') {
        try {
          // Look up loyalty config values
          const [shipmentCreditConfig] = await db
            .select()
            .from(loyaltyConfig)
            .where(eq(loyaltyConfig.key, 'credit_per_shipment'));
          const [weightCreditConfig] = await db
            .select()
            .from(loyaltyConfig)
            .where(eq(loyaltyConfig.key, 'credit_per_lb'));
          const [pointsConfig] = await db
            .select()
            .from(loyaltyConfig)
            .where(eq(loyaltyConfig.key, 'points_per_dollar_spent'));

          const creditPerShipment = shipmentCreditConfig ? parseFloat(String(shipmentCreditConfig.value)) : 1.00;
          const creditPerLb = weightCreditConfig ? parseFloat(String(weightCreditConfig.value)) : 0.10;
          const pointsPerDollar = pointsConfig ? parseFloat(pointsConfig.value) : 50;

          const packageWeight = parseFloat(String(updated.weight)) || 0;
          const totalCost = parseFloat(String(updated.totalCost)) || 0;
          const pointsEarned = Math.floor(totalCost * pointsPerDollar);

          // Insert shipment credit
          await db.insert(loyaltyCredits).values({
            userId: updated.userId,
            amount: creditPerShipment.toFixed(2),
            points: 0,
            type: 'shipment',
            description: `Shipment credit for package ${updated.trackingNumber}`,
            referenceId: updated.id,
          });
          packageCreditsEarned += creditPerShipment;

          // Insert weight credit
          if (packageWeight > 0) {
            const weightCredit = creditPerLb * packageWeight;
            await db.insert(loyaltyCredits).values({
              userId: updated.userId,
              amount: weightCredit.toFixed(2),
              points: 0,
              type: 'weight',
              description: `Weight credit (${packageWeight} lbs) for package ${updated.trackingNumber}`,
              referenceId: updated.id,
            });
            packageCreditsEarned += weightCredit;
          }

          // Award points for spending
          if (pointsEarned > 0) {
            await db.insert(loyaltyCredits).values({
              userId: updated.userId,
              amount: '0.00',
              points: pointsEarned,
              type: 'spending',
              description: `Earned ${pointsEarned} points for $${totalCost.toFixed(2)} spent on package ${updated.trackingNumber}`,
              referenceId: updated.id,
            });
            packagePointsEarned = pointsEarned;
          }
        } catch (loyaltyError) {
          console.error('Error awarding loyalty credits:', loyaltyError);
          // Don't fail the main request if loyalty credits fail
        }
      }

      // Add to summary
      actionsSummary.packagesUpdated++;
      if (emailSent) actionsSummary.emailsSent++;
      actionsSummary.pointsAwarded += packagePointsEarned;
      actionsSummary.creditsAwarded += packageCreditsEarned;
      actionsSummary.details.push({
        trackingNumber: updated.trackingNumber,
        email: user?.email || null,
        pointsEarned: packagePointsEarned,
        creditsEarned: packageCreditsEarned,
      });
    }

    return NextResponse.json({
      success: true,
      updated: updatedPackages.length,
      packages: updatedPackages,
      actionsSummary: {
        ...actionsSummary,
        status: status,
      },
    });
  } catch (error) {
    console.error('Error bulk updating packages:', error);
    return NextResponse.json(
      { error: 'Failed to update packages' },
      { status: 500 }
    );
  }
}
