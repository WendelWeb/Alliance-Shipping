import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests, users, packages, trackingHistory } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, sql } from 'drizzle-orm';

// GET - List all package requests
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';

    // Get package requests with user info
    const requests = await db
      .select({
        id: packageRequests.id,
        userId: packageRequests.userId,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        receiptLocation: packageRequests.receiptLocation,
        description: packageRequests.description,
        customerNotes: packageRequests.customerNotes,
        estimatedWeight: packageRequests.estimatedWeight,
        category: packageRequests.category,
        senderInfo: packageRequests.senderInfo,
        recipientInfo: packageRequests.recipientInfo,
        status: packageRequests.status,
        adminNotes: packageRequests.adminNotes,
        reviewedBy: packageRequests.reviewedBy,
        reviewedAt: packageRequests.reviewedAt,
        packageId: packageRequests.packageId,
        createdAt: packageRequests.createdAt,
        updatedAt: packageRequests.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
        },
      })
      .from(packageRequests)
      .leftJoin(users, eq(packageRequests.userId, users.id))
      .where(eq(packageRequests.status, status))
      .orderBy(desc(packageRequests.createdAt));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching package requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package requests' },
      { status: 500 }
    );
  }
}

// PATCH - Approve or reject package request
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body; // action: 'approve' or 'reject'

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Request ID and action required' },
        { status: 400 }
      );
    }

    // Get the request
    const [packageRequest] = await db
      .select()
      .from(packageRequests)
      .where(eq(packageRequests.id, id));

    if (!packageRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Calculate fees
      const serviceFee = 5.0;
      const weight = parseFloat(packageRequest.estimatedWeight || '0');
      const shippingFee = weight * 4.0;
      const totalFee = serviceFee + shippingFee;

      // Generate Alliance Shipping tracking number
      const asTrackingNumber = `AS-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      // Get sender and recipient info from packageRequest
      const senderInfo = packageRequest.senderInfo as any;
      const recipientInfo = packageRequest.recipientInfo as any;

      // Create actual package
      const [newPackage] = await db
        .insert(packages)
        .values({
          trackingNumber: asTrackingNumber,
          externalTrackingNumber: packageRequest.externalTrackingNumber,
          userId: packageRequest.userId,
          description: packageRequest.description,
          weight: weight.toString(),
          weightUnit: 'lbs',
          category: packageRequest.category || 'general',
          serviceFee: serviceFee.toString(),
          weightCost: shippingFee.toString(),
          totalCost: totalFee.toString(),
          currency: 'USD',
          senderName: senderInfo?.name || '',
          senderAddress: senderInfo?.address || '',
          senderCity: senderInfo?.city || '',
          senderCountry: senderInfo?.country || 'USA',
          senderPhone: senderInfo?.phone || null,
          recipientName: recipientInfo?.name || '',
          recipientAddress: recipientInfo?.address || '',
          recipientCity: recipientInfo?.city || '',
          recipientCountry: recipientInfo?.country || 'Haiti',
          recipientPhone: recipientInfo?.phone || null,
          status: 'received',
          currentLocation: packageRequest.receiptLocation,
          assignedToAdmin: session.adminId,
        })
        .returning();

      // Update request status
      await db
        .update(packageRequests)
        .set({
          status: 'approved',
          reviewedBy: session.adminId,
          reviewedAt: new Date(),
          packageId: newPackage.id,
        })
        .where(eq(packageRequests.id, id));

      // Create tracking history
      await db.insert(trackingHistory).values({
        packageId: newPackage.id,
        status: 'received',
        location: 'Miami Warehouse',
        description: 'Package request approved and received',
      });

      return NextResponse.json({
        success: true,
        package: newPackage,
      });
    } else if (action === 'reject') {
      // Update request status
      await db
        .update(packageRequests)
        .set({
          status: 'rejected',
          reviewedBy: session.adminId,
          reviewedAt: new Date(),
        })
        .where(eq(packageRequests.id, id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing package request:', error);
    return NextResponse.json(
      { error: 'Failed to process package request' },
      { status: 500 }
    );
  }
}
