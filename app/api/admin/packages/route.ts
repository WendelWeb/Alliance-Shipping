import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  packages,
  users,
  trackingHistory,
  packageRequests,
  adminActivityLogs,
  serviceFees,
  specialItemFees,
  loyaltyConfig,
  loyaltyCredits,
  warehouses,
  cityPricing,
  packageTransfers,
  notifications,
  deliveryProof,
  revenueRecords
} from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, and, like, or, desc, sql, lte } from 'drizzle-orm';
import { sendPushNotification } from '@/lib/notifications/push';
import {
  sendPackageStatusChangeEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail
} from '@/lib/email/service';
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
        quantity: packages.quantity,
        weight: packages.weight,
        weightUnit: packages.weightUnit,
        category: packages.category,
        serviceFee: packages.serviceFee,
        weightCost: packages.weightCost,
        totalCost: packages.totalCost,
        customsFees: packages.customsFees, // ⭐ Customs fees
        specialItemId: packages.specialItemId, // ⭐ Special item ID
        specialItemName: specialItemFees.itemName, // ⭐ Special item name
        specialItemBrand: specialItemFees.brand, // ⭐ Special item brand
        specialItemFixedFee: specialItemFees.fixedFee, // ⭐ Actual fixed fee from DB
        chargeByWeight: packages.chargeByWeight, // ⭐ Charge by weight flag
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
      .leftJoin(specialItemFees, eq(packages.specialItemId, specialItemFees.id))
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
      quantity,
      weight,
      category,
      status: initialStatus,
      specialInstructions,
      specialItemId,
      chargeByWeight,
      customsFees, // ⭐ Accept customs fees from frontend
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

    // Get owner's city, warehouse, and contact info for fee calculation + email
    const [owner] = await db
      .select({
        city: users.city,
        warehouseId: users.warehouseId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        preferredLanguage: users.preferredLanguage,
      })
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    // If user has a warehouse, get its details
    let warehouseName: string | null = null;
    let warehouseAddress: string | null = null;
    if (owner?.warehouseId) {
      const [warehouse] = await db
        .select({ name: warehouses.name, city: warehouses.city, address: warehouses.address })
        .from(warehouses)
        .where(eq(warehouses.id, owner.warehouseId))
        .limit(1);

      if (warehouse) {
        warehouseName = warehouse.name;
        warehouseAddress = warehouse.address;
      }
    }

    // Calculate fees based on special item or normal package
    let fees: { serviceFee: number; weightCost: number; totalCost: number };
    let specialItemName = '';

    if (specialItemId) {
      // Fetch special item
      const [specialItem] = await db
        .select()
        .from(specialItemFees)
        .where(eq(specialItemFees.id, parseInt(specialItemId)))
        .limit(1);

      if (!specialItem) {
        return NextResponse.json(
          { error: 'Special item not found' },
          { status: 400 }
        );
      }

      specialItemName = `${specialItem.brand} ${specialItem.itemName}`;

      // Get city pricing for service fee
      const cityFees = await calculateFeesForCity(owner?.city || null, parseFloat(weight) || 0);
      const fixedFee = parseFloat(specialItem.fixedFee);
      const customsFeesValue = customsFees ? parseFloat(customsFees) : 0;

      // Calculate based on chargeByWeight checkbox
      if (chargeByWeight) {
        // Special item price + service fee + weight cost + customs fees
        fees = {
          serviceFee: cityFees.serviceFee,
          weightCost: cityFees.weightCost,
          totalCost: fixedFee + cityFees.serviceFee + cityFees.weightCost + customsFeesValue,
        };
      } else {
        // Special item price + service fee + customs fees only (no weight charge)
        fees = {
          serviceFee: cityFees.serviceFee,
          weightCost: 0,
          totalCost: fixedFee + cityFees.serviceFee + customsFeesValue,
        };
      }
    } else {
      // Normal package: calculate by weight
      fees = await calculateFeesForCity(owner?.city || null, parseFloat(weight) || 0);
      // Include customs fees in total if provided
      if (customsFees) {
        fees.totalCost += parseFloat(customsFees);
      }
    }

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

    // Determine status and location (use warehouse if available, otherwise fallback to city)
    const pkgStatus = initialStatus || 'received';
    const officeLocation = warehouseName || (owner?.city || 'Port-au-Prince');
    const deliveryLocation = owner?.city || 'Port-au-Prince';

    const locationMap: Record<string, string> = {
      'received': 'Miami Warehouse',
      'in-transit': 'En route vers Haiti',
      'available': officeLocation, // Utilise le warehouse ou la ville du user
      'delivered': deliveryLocation,
    };

    // Create package
    const [newPackage] = await db
      .insert(packages)
      .values({
        trackingNumber,
        externalTrackingNumber: externalTrackingNumber?.trim() || null,
        userId: ownerId,
        description: description?.trim() || null,
        quantity: quantity ? parseInt(quantity) : 1,
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
        specialItemId: specialItemId ? parseInt(specialItemId) : null,
        chargeByWeight: chargeByWeight || false,
        customsFees: customsFees ? parseFloat(customsFees).toFixed(2) : '0.00', // ⭐ Use provided value or default
      })
      .returning();

    // Create tracking history entry with i18n keys
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
      packageId: newPackage.id,
      status: statusTitleKeys[pkgStatus] || pkgStatus,
      location: locationKeys[pkgStatus] || 'packages.locations.miamiWarehouse',
      description: 'packages.messages.packageCreatedByAdmin',
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
      // ✅ FIXED: Calculate default fees from Drizzle (not hardcoded)
      const defaultFees = await calculateFeesForCity(null, parseFloat(weight));

      await db.insert(packageTransfers).values({
        packageId: newPackage.id,
        fromUserId: asUserId || targetUserId, // Alliance Shipping or fallback to target user
        toUserId: targetUserId,
        requestId: null,
        oldServiceFee: defaultFees.serviceFee.toFixed(2),
        oldWeightCost: defaultFees.weightCost.toFixed(2),
        oldTotalCost: defaultFees.totalCost.toFixed(2),
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
          locale: 'fr', // Admin context, user will get email in their preferred language via package-transfer
        });
        if (transferResult.success) {
          transferMessage = `Un utilisateur (${pendingReq.userName} - ${pendingReq.userEmail}) avait deja fait une requete pour ce colis. Le colis a ete automatiquement transfere.`;
        }
      }
    }

    // If package was created for a specific user (from user card), send notification + email
    if (targetUserId) {
      sendPushNotification({
        userId: targetUserId,
        templateKey: 'package_received',
        variables: {
          tracking: trackingNumber,
          externalTracking: externalTrackingNumber?.trim() || 'N/A',
          depot: warehouseName || (owner?.city || 'Alliance Shipping'),
          weight: weight ? String(weight) : '0',
          city: owner?.city || 'Haiti',
          total: fees.totalCost.toFixed(2),
          category: category || 'general',
          ...(specialItemName ? { specialItem: specialItemName } : {}),
        },
        packageId: newPackage.id,
      }).catch(() => {});

      // Send email notification
      if (owner?.email) {
        const userName = `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email;
        const userLocale = owner.preferredLanguage || 'fr';

        sendPackageStatusChangeEmail(
          owner.email,
          userName,
          trackingNumber,
          pkgStatus,
          'Your package has been received at our warehouse and is being processed.',
          userLocale
        ).catch(error => {
          console.error('Failed to send package creation email:', error);
        });
      }
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

      // ✅ FIXED: Fetch pricing from Drizzle based on user's city, not hardcoded
      // Get package with user info to recalculate fees
      const [pkg] = await db
        .select({
          userId: packages.userId,
          specialItemId: packages.specialItemId,
          chargeByWeight: packages.chargeByWeight,
          userCity: users.city,
        })
        .from(packages)
        .leftJoin(users, eq(packages.userId, users.id))
        .where(eq(packages.id, id))
        .limit(1);

      if (pkg) {
        if (pkg.specialItemId && !pkg.chargeByWeight) {
          // Special item WITHOUT charge by weight - don't update weightCost
          // Keep existing fees
        } else {
          // Normal package OR special item WITH charge by weight
          const fees = await calculateFeesForCity(pkg.userCity, parseFloat(weight));
          if (pkg.specialItemId && pkg.chargeByWeight) {
            // Special item with charge by weight: fixed fee already in DB, just update weight portion
            const [specialItem] = await db
              .select({ fixedFee: specialItemFees.fixedFee })
              .from(specialItemFees)
              .where(eq(specialItemFees.id, pkg.specialItemId))
              .limit(1);
            if (specialItem) {
              updateData.serviceFee = fees.serviceFee.toFixed(2);
              updateData.weightCost = fees.weightCost.toFixed(2);
              updateData.totalCost = (parseFloat(specialItem.fixedFee) + fees.serviceFee + fees.weightCost).toFixed(2);
            }
          } else {
            // Normal package
            updateData.serviceFee = fees.serviceFee.toFixed(2);
            updateData.weightCost = fees.weightCost.toFixed(2);
            updateData.totalCost = fees.totalCost.toFixed(2);
          }
        }
      }
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

    // Send weight_updated push notification if weight changed but status didn't
    if (weight !== undefined && !status) {
      // Fetch special item name for weight update notification
      let weightUpdateSpecialItem = '';
      if (updatedPackage.specialItemId) {
        const [si] = await db
          .select({ itemName: specialItemFees.itemName, brand: specialItemFees.brand })
          .from(specialItemFees)
          .where(eq(specialItemFees.id, updatedPackage.specialItemId))
          .limit(1);
        if (si) weightUpdateSpecialItem = `${si.brand} ${si.itemName}`;
      }

      sendPushNotification({
        userId: updatedPackage.userId,
        templateKey: 'weight_updated',
        variables: {
          tracking: updatedPackage.trackingNumber,
          externalTracking: updatedPackage.externalTrackingNumber || 'N/A',
          weight: String(weight),
          total: parseFloat(String(updatedPackage.totalCost || '0')).toFixed(2),
          category: updatedPackage.category || 'general',
          ...(weightUpdateSpecialItem ? { specialItem: weightUpdateSpecialItem } : {}),
        },
        packageId: updatedPackage.id,
      }).catch(() => {});
    }

    // Add tracking history if status or location changed
    if (status || currentLocation) {
      const statusTitleKeysUpdate: Record<string, string> = {
        'received': 'packages.timeline.received',
        'in-transit': 'packages.timeline.inTransit',
        'available': 'packages.timeline.available',
        'delivered': 'packages.timeline.delivered',
      };
      const locationKeysUpdate: Record<string, string> = {
        'received': 'packages.locations.miamiWarehouse',
        'in-transit': 'packages.locations.enRouteToHaiti',
        'available': 'packages.locations.office',
        'delivered': 'packages.locations.delivered',
      };
      const effectiveStatus = status || updatedPackage.status;
      await db.insert(trackingHistory).values({
        packageId: id,
        status: statusTitleKeysUpdate[effectiveStatus] || effectiveStatus,
        location: locationKeysUpdate[effectiveStatus] || currentLocation || updatedPackage.currentLocation,
        description: 'packages.messages.statusUpdated',
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

    // Send push notification + email for status changes
    if (status) {
      // Fetch user info for push + email
      const [pkgUser] = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          preferredLanguage: users.preferredLanguage,
          warehouseId: users.warehouseId,
          city: users.city,
        })
        .from(users)
        .where(eq(users.id, updatedPackage.userId))
        .limit(1);

      // Get warehouse/office location, address, and hours
      let depotName = updatedPackage.currentLocation || 'Alliance Shipping';
      let depotAddress = '';
      let officeHours = 'Lun-Sam 8h-17h';
      if (pkgUser?.warehouseId) {
        const [wh] = await db
          .select({ city: warehouses.city, name: warehouses.name, address: warehouses.address, openingHours: warehouses.openingHours })
          .from(warehouses)
          .where(eq(warehouses.id, pkgUser.warehouseId))
          .limit(1);
        if (wh) {
          depotName = wh.name;
          depotAddress = wh.address;
          if (wh.openingHours) officeHours = wh.openingHours;
        }
      }

      // Get city pricing for delivery days
      let deliveryDays = '10-15';
      if (pkgUser?.city) {
        const [cp] = await db
          .select({ deliveryDaysMin: cityPricing.deliveryDaysMin, deliveryDaysMax: cityPricing.deliveryDaysMax })
          .from(cityPricing)
          .where(eq(cityPricing.city, pkgUser.city))
          .limit(1);
        if (cp) deliveryDays = `${cp.deliveryDaysMin}-${cp.deliveryDaysMax}`;
      }

      // Calculate loyalty points for delivered notification
      let pointsEarned = '0';
      if (status === 'delivered') {
        const totalCost = parseFloat(String(updatedPackage.totalCost)) || 0;
        const [pointsConfig] = await db
          .select()
          .from(loyaltyConfig)
          .where(eq(loyaltyConfig.key, 'points_per_dollar_spent'));
        const pointsPerDollar = pointsConfig ? parseFloat(pointsConfig.value) : 50;
        pointsEarned = String(Math.floor(totalCost * pointsPerDollar));
      }

      // Fetch special item name if applicable
      let specialItemName = '';
      if (updatedPackage.specialItemId) {
        const [si] = await db
          .select({ itemName: specialItemFees.itemName, brand: specialItemFees.brand })
          .from(specialItemFees)
          .where(eq(specialItemFees.id, updatedPackage.specialItemId))
          .limit(1);
        if (si) specialItemName = `${si.brand} ${si.itemName}`;
      }

      // Build rich variables for push notification
      const pushVars: Record<string, string> = {
        tracking: updatedPackage.trackingNumber,
        externalTracking: updatedPackage.externalTrackingNumber || 'N/A',
        depot: depotName,
        weight: String(updatedPackage.weight || '0'),
        total: parseFloat(String(updatedPackage.totalCost || '0')).toFixed(2),
        city: pkgUser?.city || 'Haiti',
        location: depotAddress || depotName,
        hours: officeHours,
        days: deliveryDays,
        points: pointsEarned,
        category: updatedPackage.category || 'general',
        ...(specialItemName ? { specialItem: specialItemName } : {}),
      };

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
          variables: pushVars,
          packageId: updatedPackage.id,
        }).catch(() => {});
      }

      // Send email notification for status change
      if (pkgUser?.email) {
        const userName = `${pkgUser.firstName || ''} ${pkgUser.lastName || ''}`.trim() || pkgUser.email;
        const userLocale = pkgUser.preferredLanguage || 'fr';

        if (status === 'available') {
          sendPackageAvailableEmail(
            pkgUser.email,
            userName,
            updatedPackage.trackingNumber,
            depotAddress ? `${depotName} — ${depotAddress}` : depotName,
            userLocale
          ).catch(error => {
            console.error('Failed to send available email:', error);
          });
        } else if (status === 'delivered') {
          sendPackageDeliveredEmail(
            pkgUser.email,
            userName,
            updatedPackage.trackingNumber,
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
            pkgUser.email,
            userName,
            updatedPackage.trackingNumber,
            status,
            statusMessages[status] || 'Your package status has been updated.',
            userLocale
          ).catch(error => {
            console.error('Failed to send status change email:', error);
          });
        }
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

    // Delete ALL related records first (foreign key constraints)
    // 1. Delete notifications
    await db.delete(notifications).where(eq(notifications.packageId, packageId));

    // 2. Delete delivery proofs
    await db.delete(deliveryProof).where(eq(deliveryProof.packageId, packageId));

    // 3. Delete revenue records
    await db.delete(revenueRecords).where(eq(revenueRecords.packageId, packageId));

    // 4. Delete package transfers
    await db.delete(packageTransfers).where(eq(packageTransfers.packageId, packageId));

    // 5. Delete tracking history
    await db.delete(trackingHistory).where(eq(trackingHistory.packageId, packageId));

    // 6. Update package requests (set packageId to null)
    await db
      .update(packageRequests)
      .set({ packageId: null })
      .where(eq(packageRequests.packageId, packageId));

    // 7. Finally delete the package
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
