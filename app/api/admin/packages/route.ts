import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, trackingHistory, packageRequests, adminActivityLogs, serviceFees, specialItemFees, loyaltyConfig, loyaltyCredits } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, and, like, or, desc, sql, lte } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/notifications/push';

// GET - List all packages with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(packages.trackingNumber, `%${search}%`),
          like(packages.description, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(packages.status, status));
    }

    // Get packages with user info
    const packagesData = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        externalTrackingNumber: packages.externalTrackingNumber,
        userId: packages.userId,
        recipientCountry: packages.recipientCountry,
        recipientCity: packages.recipientCity,
        description: packages.description,
        weight: packages.weight,
        weightUnit: packages.weightUnit,
        category: packages.category,
        serviceFee: packages.serviceFee,
        weightCost: packages.weightCost,
        totalCost: packages.totalCost,
        currency: packages.currency,
        status: packages.status,
        currentLocation: packages.currentLocation,
        estimatedDelivery: packages.estimatedDelivery,
        actualDelivery: packages.actualDelivery,
        createdAt: packages.createdAt,
        updatedAt: packages.updatedAt,
        assignedToAdmin: packages.assignedToAdmin,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          preferredLanguage: users.preferredLanguage,
        },
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(packages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get package requests (pending/rejected/approved but not yet converted)
    const requestsData = await db
      .select({
        id: packageRequests.id,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        userId: packageRequests.userId,
        description: packageRequests.description,
        estimatedWeight: packageRequests.estimatedWeight,
        category: packageRequests.category,
        status: packageRequests.status,
        recipientInfo: packageRequests.recipientInfo,
        createdAt: packageRequests.createdAt,
        updatedAt: packageRequests.updatedAt,
        packageId: packageRequests.packageId,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          preferredLanguage: users.preferredLanguage,
        },
      })
      .from(packageRequests)
      .leftJoin(users, eq(packageRequests.userId, users.id))
      .orderBy(desc(packageRequests.createdAt));

    // Transform requests to match package format
    const transformedRequests = requestsData.map(req => ({
      id: -req.id, // Negative ID to distinguish from real packages
      trackingNumber: req.externalTrackingNumber || `REQ-${req.id}`,
      externalTrackingNumber: req.externalTrackingNumber,
      userId: req.userId,
      recipientCountry: 'Haiti',
      recipientCity: (req.recipientInfo as any)?.city || '',
      description: req.description,
      weight: req.estimatedWeight || '0',
      weightUnit: 'lbs',
      category: req.category,
      serviceFee: '0.00',
      weightCost: '0.00',
      totalCost: '0.00',
      currency: 'USD',
      status: req.status, // pending, rejected, approved
      currentLocation: req.status === 'pending'
        ? 'En attente d\'approbation'
        : req.status === 'rejected'
        ? 'Demande rejetée'
        : req.packageId
        ? 'Converti en colis'
        : 'Approuvé',
      estimatedDelivery: null,
      actualDelivery: null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      assignedToAdmin: null,
      user: req.user,
      isRequest: true, // Flag to identify requests
    }));

    // Combine packages and requests
    const allItems = [...packagesData, ...transformedRequests];

    // Apply filters to combined list
    let filteredItems = allItems;
    if (search) {
      filteredItems = allItems.filter(item =>
        item.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status && status !== 'all') {
      filteredItems = allItems.filter(item => item.status === status);
    }

    // Sort by date (most recent first)
    filteredItems.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination to filtered list
    const paginatedItems = filteredItems.slice(offset, offset + limit);
    const total = filteredItems.length;

    return NextResponse.json({
      packages: paginatedItems,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      destination,
      description,
      weight,
      declaredValue,
      specialItemId,
    } = body;

    // Query current fees from database for SNAPSHOT (immutable)
    const now = new Date();

    const [serviceFeeRecord] = await db
      .select()
      .from(serviceFees)
      .where(
        and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'service_fee'),
          lte(serviceFees.effectiveFrom, now)
        )
      )
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    const [perPoundRecord] = await db
      .select()
      .from(serviceFees)
      .where(
        and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'per_pound'),
          lte(serviceFees.effectiveFrom, now)
        )
      )
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    const currentServiceFee = serviceFeeRecord
      ? parseFloat(serviceFeeRecord.amount)
      : 5.0; // Fallback
    const currentPricePerLb = perPoundRecord
      ? parseFloat(perPoundRecord.amount)
      : 4.0; // Fallback

    // Calculate shipping fee
    let shippingFee: number;

    if (specialItemId) {
      // Get special item fixed fee
      const [specialItem] = await db
        .select()
        .from(specialItemFees)
        .where(and(eq(specialItemFees.id, specialItemId), eq(specialItemFees.isActive, true)))
        .limit(1);

      shippingFee = specialItem ? parseFloat(specialItem.fixedFee) : 20.0; // Fallback
    } else {
      // Weight-based calculation
      shippingFee = weight * currentPricePerLb;
    }

    const totalFee = currentServiceFee + shippingFee;

    // IMPORTANT: These values are SNAPSHOT and will NEVER change even if fees change later

    // Generate tracking number
    const year = new Date().getFullYear();
    const count = await db.select({ count: sql<number>`count(*)` }).from(packages);
    const trackingNumber = `AS-${year}-${String(count[0].count + 1).padStart(5, '0')}`;

    // Create package
    const [newPackage] = await db
      .insert(packages)
      .values({
        trackingNumber,
        externalTrackingNumber: null,
        userId,
        description,
        weight: weight.toString(),
        weightUnit: 'lbs',
        category: 'general',
        serviceFee: currentServiceFee.toString(),
        weightCost: shippingFee.toString(),
        totalCost: totalFee.toString(),
        currency: 'USD',
        senderName: 'Unknown',
        senderAddress: '',
        senderCity: 'Miami',
        senderCountry: 'USA',
        recipientName: 'Unknown',
        recipientAddress: '',
        recipientCity: destination || 'Port-au-Prince',
        recipientCountry: 'Haiti',
        status: 'received',
        currentLocation: 'Miami Warehouse',
        assignedToAdmin: session.adminId,
        specialItemId,
      })
      .returning();

    // Create tracking history entry
    await db.insert(trackingHistory).values({
      packageId: newPackage.id,
      status: 'received',
      location: 'Miami Warehouse',
      description: 'Package received at Miami warehouse',
    });

    // Log admin activity - Package created
    const adminId = session.adminId;
    await db.insert(adminActivityLogs).values({
      adminId: adminId,
      action: 'created',
      targetType: 'package',
      targetId: newPackage.id,
      details: {
        trackingNumber: newPackage.trackingNumber,
        userId: userId,
        destination: destination,
        weight: weight,
        totalFee: totalFee,
        specialItemId: specialItemId || null,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Points are now awarded on delivery, not creation (prevents fraud)

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
}

// PATCH - Update package
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, weight, currentLocation, ...otherFields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = { ...otherFields };

    if (status) {
      updateData.status = status;
      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }
    }

    if (weight !== undefined) {
      updateData.weight = weight;
      // Recalculate fees
      updateData.shippingFee = weight * 4.0;
      updateData.totalFee = (updateData.serviceFee || 5.0) + updateData.shippingFee;
    }

    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }

    // Update package
    const [updatedPackage] = await db
      .update(packages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();

    // Add tracking history if status or location changed
    if (status || currentLocation) {
      await db.insert(trackingHistory).values({
        packageId: id,
        status: status || updatedPackage.status,
        location: currentLocation || updatedPackage.currentLocation,
        description: `Status updated to ${status || updatedPackage.status}`,
      });
    }

    // Log admin activity - Package updated
    const adminId = session.adminId;
    await db.insert(adminActivityLogs).values({
      adminId: adminId,
      action: 'updated',
      targetType: 'package',
      targetId: id,
      details: {
        trackingNumber: updatedPackage.trackingNumber,
        updatedFields: Object.keys(updateData),
        oldValues: body.oldValues || {},
        newValues: updateData,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send push notification for status changes
    if (status) {
      const pushMap: Record<string, string> = {
        'received': 'package_received',
        'in-transit': 'package_in_transit',
        'available': 'package_available',
        'delivered': 'package_delivered',
      };
      const pushTemplate = pushMap[status];
      if (pushTemplate) {
        sendPushNotification({
          userId: updatedPackage.userId,
          templateKey: pushTemplate,
          variables: { tracking: updatedPackage.trackingNumber },
          packageId: updatedPackage.id,
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

        const packageWeight = parseFloat(String(updatedPackage.weight)) || 0;
        const totalCost = parseFloat(String(updatedPackage.totalCost)) || 0;
        const pointsEarned = Math.floor(totalCost * pointsPerDollar);

        // Insert shipment credit
        await db.insert(loyaltyCredits).values({
          userId: updatedPackage.userId,
          amount: creditPerShipment.toFixed(2),
          points: 0,
          type: 'shipment',
          description: `Shipment credit for package ${updatedPackage.trackingNumber}`,
          referenceId: updatedPackage.id,
        });

        // Insert weight credit
        if (packageWeight > 0) {
          const weightCredit = creditPerLb * packageWeight;
          await db.insert(loyaltyCredits).values({
            userId: updatedPackage.userId,
            amount: weightCredit.toFixed(2),
            points: 0,
            type: 'weight',
            description: `Weight credit (${packageWeight} lbs) for package ${updatedPackage.trackingNumber}`,
            referenceId: updatedPackage.id,
          });
        }

        // Award points for spending
        if (pointsEarned > 0) {
          await db.insert(loyaltyCredits).values({
            userId: updatedPackage.userId,
            amount: '0.00',
            points: pointsEarned,
            type: 'spending',
            description: `Earned ${pointsEarned} points for $${totalCost.toFixed(2)} spent on package ${updatedPackage.trackingNumber}`,
            referenceId: updatedPackage.id,
          });
        }
      } catch (loyaltyError) {
        console.error('Error awarding loyalty credits:', loyaltyError);
        // Don't fail the main request if loyalty credits fail
      }
    }

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE - Delete package
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const packageId = parseInt(id);

    // Get package info before deletion for logging
    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId));

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Delete package (cascade will handle related records)
    await db.delete(packages).where(eq(packages.id, packageId));

    // Log admin activity - Package deleted
    const adminId = session.adminId;
    await db.insert(adminActivityLogs).values({
      adminId: adminId,
      action: 'deleted',
      targetType: 'package',
      targetId: packageId,
      details: {
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        recipientCity: pkg.recipientCity,
        totalCost: pkg.totalCost,
        deletedAt: new Date().toISOString(),
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
