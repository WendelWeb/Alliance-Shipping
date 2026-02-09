import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/locations
 * Returns all active warehouses with their GPS coordinates
 * Used by mobile app to display locations on map
 * Public endpoint (no auth required)
 */
export async function GET() {
  try {
    // Get all active warehouses with coordinates
    const allWarehouses = await db
      .select({
        id: warehouses.id,
        name: warehouses.name,
        address: warehouses.address,
        city: warehouses.city,
        phone: warehouses.phone,
        latitude: warehouses.latitude,
        longitude: warehouses.longitude,
        openingHours: warehouses.openingHours,
        isActive: warehouses.isActive,
      })
      .from(warehouses)
      .where(eq(warehouses.isActive, true))
      .orderBy(warehouses.city, warehouses.name);

    // Filter out warehouses without coordinates and map to mobile format
    const locations = allWarehouses
      .filter((w) => w.latitude && w.longitude)
      .map((w) => ({
        id: String(w.id),
        name: w.name,
        address: w.address,
        city: w.city,
        phone: w.phone || '',
        lat: parseFloat(String(w.latitude)),
        lng: parseFloat(String(w.longitude)),
        hours: w.openingHours || 'Hours not available',
        isOpen: true, // Will be calculated based on opening hours later
      }));

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
