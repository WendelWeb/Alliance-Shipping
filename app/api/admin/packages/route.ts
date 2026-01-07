import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, trackingHistory } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, and, like, or, desc, sql } from 'drizzle-orm';

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
        userId: packages.userId,
        destination: packages.destination,
        description: packages.description,
        weight: packages.weight,
        declaredValue: packages.declaredValue,
        serviceFee: packages.serviceFee,
        shippingFee: packages.shippingFee,
        totalFee: packages.totalFee,
        status: packages.status,
        currentLocation: packages.currentLocation,
        createdAt: packages.createdAt,
        updatedAt: packages.updatedAt,
        deliveredAt: packages.deliveredAt,
        assignedToAdmin: packages.assignedToAdmin,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(packages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(packages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      packages: packagesData,
      total: count,
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

    // Calculate fees (simplified - should use actual fee configuration)
    const serviceFee = 5.0;
    const shippingFee = specialItemId ? 20.0 : weight * 4.0;
    const totalFee = serviceFee + shippingFee;

    // Generate tracking number
    const year = new Date().getFullYear();
    const count = await db.select({ count: sql<number>`count(*)` }).from(packages);
    const trackingNumber = `AS-${year}-${String(count[0].count + 1).padStart(5, '0')}`;

    // Create package
    const [newPackage] = await db
      .insert(packages)
      .values({
        userId,
        trackingNumber,
        destination,
        description,
        weight,
        declaredValue,
        serviceFee,
        shippingFee,
        totalFee,
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

    // Delete package (cascade will handle related records)
    await db.delete(packages).where(eq(packages.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
