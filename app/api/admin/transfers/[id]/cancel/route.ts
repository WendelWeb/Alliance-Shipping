import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageTransfers, packages, packageRequests, trackingHistory, adminActivityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth/admin';
import { getAllianceShippingUserId, calculateFeesForCity } from '@/lib/utils/package-transfer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transferId = parseInt(id);

    // Get the transfer details
    const [transfer] = await db
      .select()
      .from(packageTransfers)
      .where(eq(packageTransfers.id, transferId))
      .limit(1);

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Get Alliance Shipping user ID
    const allianceUserId = await getAllianceShippingUserId();
    if (!allianceUserId) {
      return NextResponse.json({
        error: 'Alliance Shipping account not found',
      }, { status: 500 });
    }

    // Get the package
    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, transfer.packageId))
      .limit(1);

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Recalculate fees for Alliance Shipping account (null city = default fees)
    const weight = parseFloat(String(pkg.weight)) || 0;
    const fees = await calculateFeesForCity(null, weight);

    // Transfer package back to Alliance Shipping
    await db
      .update(packages)
      .set({
        userId: allianceUserId,
        serviceFee: fees.serviceFee.toFixed(2),
        weightCost: fees.weightCost.toFixed(2),
        totalCost: fees.totalCost.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(packages.id, transfer.packageId));

    // Add tracking history
    await db.insert(trackingHistory).values({
      packageId: transfer.packageId,
      status: 'packages.messages.transferCancelled',
      location: 'Alliance Shipping',
      description: 'packages.messages.transferCancelledDesc',
    });

    // Log the reverse transfer
    await db.insert(packageTransfers).values({
      packageId: transfer.packageId,
      fromUserId: transfer.toUserId,
      toUserId: allianceUserId,
      requestId: null,
      oldServiceFee: transfer.newServiceFee,
      oldWeightCost: transfer.newWeightCost,
      oldTotalCost: transfer.newTotalCost,
      newServiceFee: fees.serviceFee.toFixed(2),
      newWeightCost: fees.weightCost.toFixed(2),
      newTotalCost: fees.totalCost.toFixed(2),
      oldCity: transfer.newCity,
      newCity: 'Alliance Shipping',
      transferType: 'admin_assigned',
      transferredBy: session.adminId,
      notes: `Cancellation of transfer #${transferId}`,
    });

    // If there was a linked request, set it back to pending
    if (transfer.requestId) {
      await db
        .update(packageRequests)
        .set({
          status: 'pending',
          packageId: null,
          updatedAt: new Date(),
        })
        .where(eq(packageRequests.id, transfer.requestId));
    }

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'cancelled_transfer',
      targetType: 'package_transfer',
      targetId: transferId,
      details: {
        packageId: transfer.packageId,
        trackingNumber: pkg.trackingNumber,
        fromUserId: transfer.toUserId,
        toUserId: allianceUserId,
        requestId: transfer.requestId,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer cancelled successfully. Package returned to Alliance Shipping.',
    });
  } catch (error: any) {
    console.error('[POST /api/admin/transfers/[id]/cancel] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
