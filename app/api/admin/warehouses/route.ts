import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';

/**
 * GET /api/admin/warehouses
 * Returns all warehouses (active and inactive)
 * Used by announcements page to list warehouses for modify/close actions
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allWarehouses = await db
      .select()
      .from(warehouses)
      .orderBy(warehouses.city, warehouses.name);

    return NextResponse.json({
      warehouses: allWarehouses.map((w) => ({
        id: w.id,
        name: w.name,
        city: w.city,
        address: w.address,
        phone: w.phone,
        openingHours: w.openingHours,
        latitude: w.latitude,
        longitude: w.longitude,
        isActive: w.isActive,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}
