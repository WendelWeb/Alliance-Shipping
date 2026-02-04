import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, trackingHistory, adminActivityLogs, users } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, inArray } from 'drizzle-orm';
import {
  sendPackageStatusChangeEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail
} from '@/lib/email/service';

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
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedPackages.length,
      packages: updatedPackages,
    });
  } catch (error) {
    console.error('Error bulk updating packages:', error);
    return NextResponse.json(
      { error: 'Failed to update packages' },
      { status: 500 }
    );
  }
}
