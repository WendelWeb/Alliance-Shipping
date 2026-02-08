import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc } from 'drizzle-orm';

// GET - Get all warehouses
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allWarehouses = await db
      .select()
      .from(warehouses)
      .orderBy(warehouses.city, warehouses.name);

    return NextResponse.json({ warehouses: allWarehouses });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}

// POST - Create new warehouse
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, city, address, latitude, longitude, phone, email, openingHours } = body;

    // Validation
    if (!name || !city || !address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Name, city, address, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid GPS coordinates' },
        { status: 400 }
      );
    }

    const [newWarehouse] = await db
      .insert(warehouses)
      .values({
        name,
        city,
        address,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        phone: phone || null,
        email: email || null,
        openingHours: openingHours || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ warehouse: newWarehouse });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}

// PATCH - Update warehouse
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, city, address, latitude, longitude, phone, email, openingHours, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 });
      }
      updateData.latitude = latitude.toString();
    }
    if (longitude !== undefined) {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 });
      }
      updateData.longitude = longitude.toString();
    }
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (openingHours !== undefined) updateData.openingHours = openingHours || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedWarehouse] = await db
      .update(warehouses)
      .set(updateData)
      .where(eq(warehouses.id, parseInt(id)))
      .returning();

    if (!updatedWarehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ warehouse: updatedWarehouse });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    );
  }
}

// DELETE - Delete warehouse
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 });
    }

    const [deletedWarehouse] = await db
      .delete(warehouses)
      .where(eq(warehouses.id, parseInt(id)))
      .returning();

    if (!deletedWarehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, warehouse: deletedWarehouse });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to delete warehouse' },
      { status: 500 }
    );
  }
}
