import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, trackingHistory, adminActivityLogs, users, loyaltyConfig, loyaltyCredits } from '@/lib/db/schema';
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

    // Location mapping based on status
    const locationMap: Record<string, string> = {
      'received': 'Miami Warehouse',
      'in-transit': 'En route to Haiti',
      'available': 'Haiti Office - Ready for Pickup',
      'delivered': 'Delivered',
    };

    // Update all packages
    const updatedPackages = await db
      .update(packages)
      .set({
        status,
        currentLocation: locationMap[status] || 'Unknown',
        updatedAt: new Date(),
        ...(status === 'delivered' ? { actualDelivery: new Date() } : {}),
      })
      .where(inArray(packages.id, realPackageIds))
      .returning();

    // Create tracking history for each package
    for (const pkg of updatedPackages) {
      let packagePointsEarned = 0;
      let packageCreditsEarned = 0;
      let emailSent = false;

      await db.insert(trackingHistory).values({
        packageId: pkg.id,
        status: status,
        location: locationMap[status] || 'Unknown',
        description: `Status updated to ${status} by admin`,
        timestamp: new Date(),
      });

      // Log admin activity
      await db.insert(adminActivityLogs).values({
        adminId: adminId,
        action: 'updated_status',
        targetType: 'package',
        targetId: pkg.id,
        details: {
          trackingNumber: pkg.trackingNumber,
          oldStatus: pkg.status,
          newStatus: status,
          updatedFields: ['status', 'currentLocation'],
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      // Send email notification to user
      const [userInfo] = await db
        .select()
        .from(users)
        .where(eq(users.id, pkg.userId));

      if (userInfo?.email) {
        emailSent = true;
        const userName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.email;
        const userLocale = userInfo.preferredLanguage || 'fr';

        // Send appropriate email based on status
        if (status === 'available') {
          await sendPackageAvailableEmail(
            userInfo.email,
            userName,
            pkg.trackingNumber,
            pkg.recipientCity || 'Haiti Office',
            userLocale
          ).catch(error => {
            console.error('Failed to send available email:', error);
          });
        } else if (status === 'delivered') {
          await sendPackageDeliveredEmail(
            userInfo.email,
            userName,
            pkg.trackingNumber,
            pkg.recipientName || userName,
            userLocale
          ).catch(error => {
            console.error('Failed to send delivered email:', error);
          });
        } else {
          // For other status changes (received, in-transit)
          const statusMessages: Record<string, string> = {
            'received': 'Your package has been received at our warehouse and is being processed.',
            'in-transit': 'Your package is on its way to Haiti and will arrive soon.',
          };

          await sendPackageStatusChangeEmail(
            userInfo.email,
            userName,
            pkg.trackingNumber,
            status,
            statusMessages[status] || 'Your package status has been updated.',
            userLocale
          ).catch(error => {
            console.error('Failed to send status change email:', error);
          });
        }

        // Send push notification
        const pushTemplateMap: Record<string, string> = {
          'received': 'package_received',
          'in-transit': 'package_in_transit',
          'available': 'package_available',
          'delivered': 'package_delivered',
        };
        const pushTemplate = pushTemplateMap[status];
        if (pushTemplate) {
          sendPushNotification({
            userId: pkg.userId,
            templateKey: pushTemplate,
            variables: { tracking: pkg.trackingNumber },
            packageId: pkg.id,
          }).catch(() => {});
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

          const packageWeight = parseFloat(String(pkg.weight)) || 0;
          const totalCost = parseFloat(String(pkg.totalCost)) || 0;
          const pointsEarned = Math.floor(totalCost * pointsPerDollar);

          // Insert shipment credit
          await db.insert(loyaltyCredits).values({
            userId: pkg.userId,
            amount: creditPerShipment.toFixed(2),
            points: 0,
            type: 'shipment',
            description: `Shipment credit for package ${pkg.trackingNumber}`,
            referenceId: pkg.id,
          });
          packageCreditsEarned += creditPerShipment;

          // Insert weight credit
          if (packageWeight > 0) {
            const weightCredit = creditPerLb * packageWeight;
            await db.insert(loyaltyCredits).values({
              userId: pkg.userId,
              amount: weightCredit.toFixed(2),
              points: 0,
              type: 'weight',
              description: `Weight credit (${packageWeight} lbs) for package ${pkg.trackingNumber}`,
              referenceId: pkg.id,
            });
            packageCreditsEarned += weightCredit;
          }

          // Award points for spending
          if (pointsEarned > 0) {
            await db.insert(loyaltyCredits).values({
              userId: pkg.userId,
              amount: '0.00',
              points: pointsEarned,
              type: 'spending',
              description: `Earned ${pointsEarned} points for $${totalCost.toFixed(2)} spent on package ${pkg.trackingNumber}`,
              referenceId: pkg.id,
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
        trackingNumber: pkg.trackingNumber,
        email: userInfo?.email || null,
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
