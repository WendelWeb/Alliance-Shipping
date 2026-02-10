import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, trackingHistory, packageRequests, adminActivityLogs, serviceFees, specialItemFees, loyaltyConfig, loyaltyCredits, warehouses, cityPricing, packageTransfers } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, and, like, or, desc, sql, lte } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/notifications/push';
import { generateASTrackingNumber } from '@/lib/utils/tracking';
import { getAllianceShippingUserId, findPendingRequest, autoTransferPackage, calculateFeesForCity, ALLIANCE_SHIPPING_EMAIL } from '@/lib/utils/package-transfer';

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
          like(packages.description, `%${search}%`),
          like(packages.externalTrackingNumber, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(packages.status, status));
    }

    // Get packages with user info + warehouse name
    const packagesData = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        externalTrackingNumber: packages.externalTrackingNumber,
        userId: packages.userId,
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
          phone: users.phone,
          whatsappPhone: users.whatsappPhone,
          city: users.city,
          warehouseId: users.warehouseId,
        },
        warehouseName: warehouses.name,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .leftJoin(warehouses, eq(users.warehouseId, warehouses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(packages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get package requests (pending/rejected but not yet converted)
    const requestsData = await db
      .select({
        id: packageRequests.id,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        userId: packageRequests.userId,
        description: packageRequests.description,
        estimatedWeight: packageRequests.estimatedWeight,
        category: packageRequests.category,
        status: packageRequests.status,
        createdAt: packageRequests.createdAt,
        updatedAt: packageRequests.updatedAt,
        packageId: packageRequests.packageId,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          preferredLanguage: users.preferredLanguage,
          phone: users.phone,
          whatsappPhone: users.whatsappPhone,
          city: users.city,
          warehouseId: users.warehouseId,
        },
        warehouseName: warehouses.name,
      })
      .from(packageRequests)
      .leftJoin(users, eq(packageRequests.userId, users.id))
      .leftJoin(warehouses, eq(users.warehouseId, warehouses.id))
      .where(eq(packageRequests.status, 'pending'))
      .orderBy(desc(packageRequests.createdAt));

    // Transform requests to match package format
    const transformedRequests = requestsData.map(req => ({
      id: -req.id,
      trackingNumber: req.externalTrackingNumber || `REQ-${req.id}`,
      externalTrackingNumber: req.externalTrackingNumber,
      userId: req.userId,
      description: req.description,
      weight: req.estimatedWeight || '0',
      weightUnit: 'lbs',
      category: req.category,
      serviceFee: '0.00',
      weightCost: '0.00',
      totalCost: '0.00',
      currency: 'USD',
      status: 'requested',
      currentLocation: 'En attente d\'approbation',
      estimatedDelivery: null,
      actualDelivery: null,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      assignedToAdmin: null,
      user: req.user,
      warehouseName: req.warehouseName,
      isRequest: true,
    }));

    // Combine packages and requests
    const allItems = [...packagesData, ...transformedRequests];

    // Apply filters to combined list
    let filteredItems = allItems;
    if (search) {
      filteredItems = allItems.filter(item =>
        item.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.externalTrackingNumber?.toLowerCase().includes(search.toLowerCase())
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
      userId: targetUserId,
      externalTrackingNumber,
      description,
      weight,
      category,
      status: initialStatus,
      specialInstructions,
    } = body;

    // Get Alliance Shipping user ID for reference
    const asUserId = await getAllianceShippingUserId();
    if (!asUserId) {
      console.error('[CREATE PACKAGE] Alliance Shipping account not found. Email searched:', ALLIANCE_SHIPPING_EMAIL);
      return NextResponse.json({
        error: 'Alliance Shipping system account not found. Please create the account with email: allianceshipping26@gmail.com',
        searchedEmail: ALLIANCE_SHIPPING_EMAIL,
      }, { status: 500 });
    }

    // Determine the owner
    let ownerId = targetUserId;
    if (!ownerId) {
      // Default to Alliance Shipping account
      ownerId = asUserId;
      console.log('[CREATE PACKAGE] Using Alliance Shipping account, ID:', ownerId);
    } else {
      console.log('[CREATE PACKAGE] Using target user ID:', ownerId);
    }

    // Get owner's city for fee calculation
    const [owner] = await db
      .select({ city: users.city })
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    const fees = await calculateFeesForCity(owner?.city || null, parseFloat(weight) || 0);

    // Check for duplicate external tracking number
    if (externalTrackingNumber && externalTrackingNumber.trim()) {
      const [existingPackage] = await db
        .select({
          id: packages.id,
          trackingNumber: packages.trackingNumber,
          status: packages.status,
          userId: packages.userId,
          userEmail: users.email,
          userFirstName: users.firstName,
          userLastName: users.lastName,
        })
        .from(packages)
        .leftJoin(users, eq(packages.userId, users.id))
        .where(sql`LOWER(${packages.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`)
        .limit(1);

      if (existingPackage) {
        const userName = `${existingPackage.userFirstName || ''} ${existingPackage.userLastName || ''}`.trim() || existingPackage.userEmail || 'Unknown';
        return NextResponse.json(
          {
            error: 'Ce numéro de suivi externe existe déjà dans le système.',
            duplicate: true,
            existingPackage: {
              id: existingPackage.id,
              trackingNumber: existingPackage.trackingNumber,
              status: existingPackage.status,
              owner: userName,
              ownerEmail: existingPackage.userEmail,
            },
          },
          { status: 409 }
        );
      }
    }

    // Generate tracking number
    const trackingNumber = generateASTrackingNumber();

    // Determine status and location
    const pkgStatus = initialStatus || 'received';
    const locationMap: Record<string, string> = {
      'received': 'Miami Warehouse',
      'in-transit': 'En route vers Haiti',
      'available': (owner?.city || 'Port-au-Prince') + ' Office',
      'delivered': owner?.city || 'Port-au-Prince',
    };

    // Create package
    const [newPackage] = await db
      .insert(packages)
      .values({
        trackingNumber,
        externalTrackingNumber: externalTrackingNumber?.trim() || null,
        userId: ownerId,
        description: description?.trim() || null,
        weight: weight ? weight.toString() : null,
        weightUnit: 'lbs',
        category: category || 'general',
        serviceFee: fees.serviceFee.toFixed(2),
        weightCost: fees.weightCost.toFixed(2),
        totalCost: fees.totalCost.toFixed(2),
        currency: 'USD',
        status: pkgStatus,
        currentLocation: locationMap[pkgStatus] || 'Miami Warehouse',
        assignedToAdmin: session.adminId,
        specialInstructions: specialInstructions?.trim() || null,
      })
      .returning();

    // Create tracking history entry
    await db.insert(trackingHistory).values({
      packageId: newPackage.id,
      status: pkgStatus,
      location: locationMap[pkgStatus] || 'Miami Warehouse',
      description: `Package created with status: ${pkgStatus}`,
    });

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'created',
      targetType: 'package',
      targetId: newPackage.id,
      details: {
        trackingNumber: newPackage.trackingNumber,
        externalTrackingNumber: externalTrackingNumber || null,
        userId: ownerId,
        weight,
        totalFee: fees.totalCost,
        category,
        initialStatus: pkgStatus,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // If assigned to a specific user (not Alliance Shipping), log as direct assignment transfer
    if (targetUserId && targetUserId !== asUserId) {
      await db.insert(packageTransfers).values({
        packageId: newPackage.id,
        fromUserId: asUserId || targetUserId, // Alliance Shipping or fallback to target user
        toUserId: targetUserId,
        requestId: null,
        oldServiceFee: '5.00', // Default fees before assignment
        oldWeightCost: (parseFloat(weight) * 4.0).toFixed(2),
        oldTotalCost: (5.0 + parseFloat(weight) * 4.0).toFixed(2),
        newServiceFee: fees.serviceFee.toFixed(2),
        newWeightCost: fees.weightCost.toFixed(2),
        newTotalCost: fees.totalCost.toFixed(2),
        oldCity: null,
        newCity: owner?.city || 'Unknown',
        transferType: 'admin_assigned',
        transferredBy: session.adminId,
        notes: 'Direct assignment on package creation',
      });
    }

    // Check if a user has a pending request for this tracking number (auto-transfer)
    let transferMessage: string | null = null;
    if (externalTrackingNumber && !targetUserId) {
      const pendingReq = await findPendingRequest(externalTrackingNumber.trim());
      if (pendingReq) {
        const transferResult = await autoTransferPackage({
          packageId: newPackage.id,
          newUserId: pendingReq.userId,
          requestId: pendingReq.id,
        });
        if (transferResult.success) {
          transferMessage = `Un utilisateur (${pendingReq.userName} - ${pendingReq.userEmail}) avait deja fait une requete pour ce colis. Le colis a ete automatiquement transfere.`;
        }
      }
    }

    // If package was created for a specific user (from user card), send notification
    if (targetUserId) {
      sendPushNotification({
        userId: targetUserId,
        templateKey: 'package_received',
        variables: { tracking: trackingNumber },
        packageId: newPackage.id,
      }).catch(() => {});
    }

    return NextResponse.json({
      package: newPackage,
      transferMessage,
    }, { status: 201 });
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

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
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

        await db.insert(loyaltyCredits).values({
          userId: updatedPackage.userId,
          amount: creditPerShipment.toFixed(2),
          points: 0,
          type: 'shipment',
          description: `Shipment credit for package ${updatedPackage.trackingNumber}`,
          referenceId: updatedPackage.id,
        });

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

    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId));

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    await db.delete(packages).where(eq(packages.id, packageId));

    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'deleted',
      targetType: 'package',
      targetId: packageId,
      details: {
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
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
