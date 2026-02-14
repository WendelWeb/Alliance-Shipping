import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests, users, packages, trackingHistory, adminActivityLogs, specialItemFees } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc } from 'drizzle-orm';
import { sendPackageApprovedEmail, sendPackageRejectedEmail } from '@/lib/email/service';
import { sendPushNotification } from '@/lib/notifications/push';
import { generateASTrackingNumber } from '@/lib/utils/tracking';
import { calculateFeesForCity } from '@/lib/utils/package-transfer';

// GET - List all package requests
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';

    // Get package requests with user info + special item info
    const requests = await db
      .select({
        id: packageRequests.id,
        userId: packageRequests.userId,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        description: packageRequests.description,
        customerNotes: packageRequests.customerNotes,
        estimatedWeight: packageRequests.estimatedWeight,
        category: packageRequests.category,
        status: packageRequests.status,
        adminNotes: packageRequests.adminNotes,
        reviewedBy: packageRequests.reviewedBy,
        reviewedAt: packageRequests.reviewedAt,
        packageId: packageRequests.packageId,
        specialItemId: packageRequests.specialItemId,
        createdAt: packageRequests.createdAt,
        updatedAt: packageRequests.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          city: users.city,
          warehouseId: users.warehouseId,
          preferredLanguage: users.preferredLanguage,
        },
        specialItem: {
          id: specialItemFees.id,
          itemName: specialItemFees.itemName,
          itemName_fr: specialItemFees.itemName_fr,
          itemName_ht: specialItemFees.itemName_ht,
          itemName_es: specialItemFees.itemName_es,
          brand: specialItemFees.brand,
          fixedFee: specialItemFees.fixedFee,
          category: specialItemFees.category,
        },
      })
      .from(packageRequests)
      .leftJoin(users, eq(packageRequests.userId, users.id))
      .leftJoin(specialItemFees, eq(packageRequests.specialItemId, specialItemFees.id))
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

    const adminId = session.adminId;

    const body = await request.json();
    const { id, action, weight, category, initialStatus, specialItemId, chargeByWeight, customsFees } = body;

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
      if (!weight || !category || !initialStatus) {
        return NextResponse.json(
          { error: 'Weight, category, and initial status are required for approval' },
          { status: 400 }
        );
      }

      // Get user info for fee calculation
      const [userInfo] = await db
        .select()
        .from(users)
        .where(eq(users.id, packageRequest.userId));

      // Calculate fees based on user's city
      const packageWeight = parseFloat(weight);
      const cityFees = await calculateFeesForCity(userInfo?.city || null, packageWeight);
      const parsedCustomsFees = customsFees ? parseFloat(customsFees) : 0;

      // Calculate total with special item if applicable
      let fees: { serviceFee: number; weightCost: number; totalCost: number };
      let specialItemFixedFee = 0;

      if (specialItemId) {
        // Fetch special item fixed fee
        const [specialItem] = await db
          .select({ fixedFee: specialItemFees.fixedFee })
          .from(specialItemFees)
          .where(eq(specialItemFees.id, specialItemId))
          .limit(1);

        specialItemFixedFee = specialItem ? parseFloat(specialItem.fixedFee) : 0;

        if (chargeByWeight) {
          // Special item + weight: fixedFee + serviceFee + weightCost + customsFees
          fees = {
            serviceFee: cityFees.serviceFee,
            weightCost: cityFees.weightCost,
            totalCost: specialItemFixedFee + cityFees.serviceFee + cityFees.weightCost + parsedCustomsFees,
          };
        } else {
          // Special item only: fixedFee + serviceFee + customsFees (no weight cost)
          fees = {
            serviceFee: cityFees.serviceFee,
            weightCost: 0,
            totalCost: specialItemFixedFee + cityFees.serviceFee + parsedCustomsFees,
          };
        }
      } else {
        // Normal package: serviceFee + weightCost + customsFees
        fees = {
          serviceFee: cityFees.serviceFee,
          weightCost: cityFees.weightCost,
          totalCost: cityFees.totalCost + parsedCustomsFees,
        };
      }

      // Generate Alliance Shipping tracking number
      const asTrackingNumber = generateASTrackingNumber();

      // Get user's warehouse if available
      let warehouseName: string | null = null;
      if (userInfo?.warehouseId) {
        const { warehouses } = await import('@/lib/db/schema');
        const [warehouse] = await db
          .select({ name: warehouses.name, city: warehouses.city })
          .from(warehouses)
          .where(eq(warehouses.id, userInfo.warehouseId))
          .limit(1);

        if (warehouse) {
          warehouseName = `${warehouse.city} Office`;
        }
      }

      // Determine current location based on status (use warehouse if available)
      const userCity = userInfo?.city || 'Port-au-Prince';
      const officeLocation = warehouseName || `${userCity} Office`;

      const locationMap: Record<string, string> = {
        'received': 'Miami Warehouse',
        'in-transit': 'En route vers Haiti',
        'available': officeLocation, // ⭐ Utilise le warehouse ou la ville du user
        'delivered': userCity,
      };

      // Create actual package with special item + customs data
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
          serviceFee: fees.serviceFee.toFixed(2),
          weightCost: fees.weightCost.toFixed(2),
          totalCost: fees.totalCost.toFixed(2),
          currency: 'USD',
          status: initialStatus,
          currentLocation: locationMap[initialStatus],
          assignedToAdmin: adminId,
          specialItemId: specialItemId || null,
          chargeByWeight: chargeByWeight || false,
          customsFees: parsedCustomsFees.toFixed(2),
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

      // Create tracking history
      const statusDescriptions: Record<string, string> = {
        'received': 'packages.timeline.received',
        'in-transit': 'packages.timeline.inTransit',
        'available': 'packages.timeline.available',
        'delivered': 'packages.timeline.delivered',
      };

      await db.insert(trackingHistory).values({
        packageId: newPackage.id,
        status: 'packages.timeline.requestSubmitted',
        location: 'packages.timeline.online',
        description: 'packages.messages.requestCreated',
        timestamp: packageRequest.createdAt,
      });

      await db.insert(trackingHistory).values({
        packageId: newPackage.id,
        status: statusDescriptions[initialStatus] || 'packages.timeline.requestApproved',
        location: locationMap[initialStatus],
        description: statusDescriptions[initialStatus] || 'packages.messages.requestApproved',
      });

      // Log admin activity
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
          totalCost: fees.totalCost,
          userCity: userCity,
          specialItemId: specialItemId || null,
          chargeByWeight: chargeByWeight || false,
          customsFees: parsedCustomsFees,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      // Send approval email with locale + fee breakdown
      if (userInfo?.email) {
        const userName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.email;
        const userLocale = userInfo.preferredLanguage || 'fr';
        await sendPackageApprovedEmail(
          userInfo.email,
          userName,
          asTrackingNumber,
          fees.totalCost,
          userLocale,
          {
            serviceFee: fees.serviceFee,
            weightCost: fees.weightCost,
            specialItemFee: specialItemFixedFee,
            customsFees: parsedCustomsFees,
            weight: packageWeight,
            city: userCity,
          }
        ).catch(error => {
          console.error('Failed to send approval email:', error);
        });
      }

      // Send push notification with total
      sendPushNotification({
        userId: packageRequest.userId,
        templateKey: 'request_approved',
        variables: { tracking: asTrackingNumber, total: fees.totalCost.toFixed(2) },
        packageId: newPackage.id,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        package: newPackage,
      });
    } else if (action === 'reject') {
      await db
        .update(packageRequests)
        .set({
          status: 'rejected',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(packageRequests.id, id));

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

      const [userInfo] = await db
        .select()
        .from(users)
        .where(eq(users.id, packageRequest.userId));

      if (userInfo?.email) {
        const userName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.email;
        const userLocale = userInfo.preferredLanguage || 'fr';
        await sendPackageRejectedEmail(
          userInfo.email,
          userName,
          packageRequest.externalTrackingNumber,
          packageRequest.adminNotes || undefined,
          userLocale
        ).catch(error => {
          console.error('Failed to send rejection email:', error);
        });
      }

      sendPushNotification({
        userId: packageRequest.userId,
        templateKey: 'request_rejected',
        variables: { tracking: packageRequest.externalTrackingNumber },
      }).catch(() => {});

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
