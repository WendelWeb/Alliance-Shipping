import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageTransfers, packages, users } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc, or, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const ville = searchParams.get('ville');
    const transferType = searchParams.get('type');
    const userSearch = searchParams.get('userSearch');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build WHERE conditions
    const conditions = [];

    if (ville) {
      conditions.push(eq(packageTransfers.newCity, ville));
    }

    if (transferType) {
      conditions.push(eq(packageTransfers.transferType, transferType as 'user_claimed' | 'admin_assigned'));
    }

    if (startDate) {
      conditions.push(gte(packageTransfers.transferredAt, new Date(startDate)));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(packageTransfers.transferredAt, end));
    }

    // Add user search filter to conditions
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      conditions.push(
        or(
          sql`LOWER(${users.email}) LIKE ${`%${searchLower}%`}`,
          sql`LOWER(${users.firstName}) LIKE ${`%${searchLower}%`}`,
          sql`LOWER(${users.lastName}) LIKE ${`%${searchLower}%`}`,
          sql`LOWER(${packages.trackingNumber}) LIKE ${`%${searchLower}%`}`,
          sql`LOWER(${packages.externalTrackingNumber}) LIKE ${`%${searchLower}%`}`
        )
      );
    }

    // Query transfers with JOINs for user and package info
    const allTransfers = await db
      .select({
        // Transfer info
        id: packageTransfers.id,
        packageId: packageTransfers.packageId,
        requestId: packageTransfers.requestId,
        oldServiceFee: packageTransfers.oldServiceFee,
        oldWeightCost: packageTransfers.oldWeightCost,
        oldTotalCost: packageTransfers.oldTotalCost,
        newServiceFee: packageTransfers.newServiceFee,
        newWeightCost: packageTransfers.newWeightCost,
        newTotalCost: packageTransfers.newTotalCost,
        oldCity: packageTransfers.oldCity,
        newCity: packageTransfers.newCity,
        transferType: packageTransfers.transferType,
        transferredBy: packageTransfers.transferredBy,
        notes: packageTransfers.notes,
        transferredAt: packageTransfers.transferredAt,

        // Package info
        trackingNumber: packages.trackingNumber,
        externalTrackingNumber: packages.externalTrackingNumber,
        description: packages.description,
        weight: packages.weight,
        status: packages.status,

        // User (recipient) info
        userId: users.id,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userPhone: users.phone,
        userWhatsappPhone: users.whatsappPhone,
      })
      .from(packageTransfers)
      .leftJoin(packages, eq(packageTransfers.packageId, packages.id))
      .leftJoin(users, eq(packageTransfers.toUserId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(packageTransfers.transferredAt));

    // Get total count
    const total = allTransfers.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const transfers = allTransfers.slice(offset, offset + limit);

    // Calculate stats
    const stats = {
      total,
      totalToday: allTransfers.filter(t => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.transferredAt && new Date(t.transferredAt) >= today;
      }).length,
      userClaimed: allTransfers.filter(t => t.transferType === 'user_claimed').length,
      adminAssigned: allTransfers.filter(t => t.transferType === 'admin_assigned').length,
      averageDelta: allTransfers.length > 0
        ? allTransfers.reduce((sum, t) => {
            const delta = parseFloat(String(t.newTotalCost)) - parseFloat(String(t.oldTotalCost));
            return sum + delta;
          }, 0) / allTransfers.length
        : 0,
    };

    // Group by city
    const byCity: Record<string, number> = {};
    allTransfers.forEach(t => {
      if (t.newCity) {
        byCity[t.newCity] = (byCity[t.newCity] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
      byCity,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/transfers] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
