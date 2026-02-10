import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, trackingHistory, adminActivityLogs, packageRequests } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, inArray } from 'drizzle-orm';

// POST - Bulk delete packages
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = session.adminId;

    const body = await request.json();
    const { packageIds } = body;

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return NextResponse.json(
        { error: 'Package IDs array is required' },
        { status: 400 }
      );
    }

    // Separate real packages from requests (negative IDs)
    const realPackageIds = packageIds.filter(id => id > 0);
    const requestIds = packageIds.filter(id => id < 0).map(id => Math.abs(id));

    let deletedCount = 0;

    // Delete real packages
    if (realPackageIds.length > 0) {
      // Get packages info before deletion for logging
      const packagesToDelete = await db
        .select()
        .from(packages)
        .where(inArray(packages.id, realPackageIds));

      // Delete tracking history first (foreign key constraint)
      await db
        .delete(trackingHistory)
        .where(inArray(trackingHistory.packageId, realPackageIds));

      // Delete packages
      await db.delete(packages).where(inArray(packages.id, realPackageIds));

      deletedCount += packagesToDelete.length;

      // Log admin activity for each deleted package
      for (const pkg of packagesToDelete) {
        await db.insert(adminActivityLogs).values({
          adminId: adminId,
          action: 'deleted',
          targetType: 'package',
          targetId: pkg.id,
          details: {
            trackingNumber: pkg.trackingNumber,
            status: pkg.status,
            totalCost: pkg.totalCost,
            deletedAt: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });
      }
    }

    // Delete package requests
    if (requestIds.length > 0) {
      // Get requests info before deletion for logging
      const requestsToDelete = await db
        .select()
        .from(packageRequests)
        .where(inArray(packageRequests.id, requestIds));

      // Delete package requests
      await db.delete(packageRequests).where(inArray(packageRequests.id, requestIds));

      deletedCount += requestsToDelete.length;

      // Log admin activity for each deleted request
      for (const req of requestsToDelete) {
        await db.insert(adminActivityLogs).values({
          adminId: adminId,
          action: 'deleted',
          targetType: 'package_request',
          targetId: req.id,
          details: {
            externalTrackingNumber: req.externalTrackingNumber,
            status: req.status,
            description: req.description,
            deletedAt: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting packages:', error);
    return NextResponse.json(
      { error: 'Failed to delete packages' },
      { status: 500 }
    );
  }
}
