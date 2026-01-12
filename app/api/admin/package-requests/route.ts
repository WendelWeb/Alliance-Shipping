import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests, users, packages, trackingHistory, adminActivityLogs } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { auth } from '@clerk/nextjs/server';
import { eq, desc, sql } from 'drizzle-orm';

// GET - List all package requests
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    const { userId: clerkUserId } = await auth();

    if (!session && !clerkUserId) {
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
    const { userId: clerkUserId } = await auth();

    if (!session && !clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For actions that need adminId, use 1 as default if no session
    const adminId = session?.adminId || 1;

    const body = await request.json();
    const { id, action, weight, category, initialStatus } = body; // action: 'approve' or 'reject'

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
      // Validate required fields
      if (!weight || !category || !initialStatus) {
        return NextResponse.json(
          { error: 'Weight, category, and initial status are required for approval' },
          { status: 400 }
        );
      }

      // Calculate fees
      const serviceFee = 5.0;
      const packageWeight = parseFloat(weight);
      const shippingFee = packageWeight * 4.0;
      const totalFee = serviceFee + shippingFee;

      // Generate Alliance Shipping tracking number
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const asTrackingNumber = `AS-${year}-${timestamp}${random}`.substring(0, 20);

      // Get sender and recipient info from packageRequest
      const senderInfo = packageRequest.senderInfo as any;
      const recipientInfo = packageRequest.recipientInfo as any;

      // Determine current location based on status
      const locationMap: Record<string, string> = {
        'received': packageRequest.receiptLocation || 'Miami Warehouse',
        'in-transit': 'En route vers Haïti',
        'available': recipientInfo?.city ? `${recipientInfo.city} Office` : 'Haiti Office',
        'delivered': recipientInfo?.city || 'Haiti',
      };

      // Create actual package
      const [newPackage] = await db
        .insert(packages)
        .values({
          trackingNumber: asTrackingNumber,
          externalTrackingNumber: packageRequest.externalTrackingNumber,
          userId: packageRequest.userId,
          description: packageRequest.description,
          weight: packageWeight.toString(),
          weightUnit: 'lbs',
          category: category,
          serviceFee: serviceFee.toString(),
          weightCost: shippingFee.toString(),
          totalCost: totalFee.toString(),
          currency: 'USD',
          senderName: senderInfo?.name || 'Unknown',
          senderAddress: senderInfo?.address || '',
          senderCity: senderInfo?.city || 'Miami',
          senderCountry: senderInfo?.country || 'USA',
          senderPhone: senderInfo?.phone || null,
          recipientName: recipientInfo?.name || 'Unknown',
          recipientAddress: recipientInfo?.address || '',
          recipientCity: recipientInfo?.city || 'Port-au-Prince',
          recipientCountry: recipientInfo?.country || 'Haiti',
          recipientPhone: recipientInfo?.phone || null,
          status: initialStatus,
          currentLocation: locationMap[initialStatus],
          assignedToAdmin: adminId,
          actualDelivery: initialStatus === 'delivered' ? new Date() : null,
        })
        .returning();

      // Update request status
      await db
        .update(packageRequests)
        .set({
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          packageId: newPackage.id,
        })
        .where(eq(packageRequests.id, id));

      // Create tracking history with translation keys
      const statusDescriptions: Record<string, string> = {
        'received': 'packages.timeline.received',
        'in-transit': 'packages.timeline.inTransit',
        'available': 'packages.timeline.available',
        'delivered': 'packages.timeline.delivered',
      };

      // First entry: Initial request by user
      await db.insert(trackingHistory).values({
        packageId: newPackage.id,
        status: 'packages.timeline.requestSubmitted',
        location: 'packages.timeline.online',
        description: 'packages.messages.requestCreated',
        timestamp: packageRequest.createdAt,
      });

      // Second entry: Current status after approval
      await db.insert(trackingHistory).values({
        packageId: newPackage.id,
        status: statusDescriptions[initialStatus] || 'packages.timeline.requestApproved',
        location: locationMap[initialStatus],
        description: statusDescriptions[initialStatus] || 'packages.messages.requestApproved',
      });

      // Log admin activity - Request approved and package created
      await db.insert(adminActivityLogs).values({
        adminId: adminId,
        action: 'approved_request',
        targetType: 'package_request',
        targetId: id,
        details: {
          requestId: id,
          externalTrackingNumber: packageRequest.externalTrackingNumber,
          createdPackageId: newPackage.id,
          newTrackingNumber: asTrackingNumber,
          initialStatus: initialStatus,
          weight: packageWeight,
          totalCost: totalFee,
          recipientCity: recipientInfo?.city || 'Unknown',
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
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
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(packageRequests.id, id));

      // Log admin activity - Request rejected
      await db.insert(adminActivityLogs).values({
        adminId: adminId,
        action: 'rejected_request',
        targetType: 'package_request',
        targetId: id,
        details: {
          requestId: id,
          externalTrackingNumber: packageRequest.externalTrackingNumber,
          rejectedAt: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

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
