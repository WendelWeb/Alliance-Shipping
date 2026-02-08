import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { warehouses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get warehouses by city (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // Get active warehouses for the specified city
    const cityWarehouses = await db
      .select({
        id: warehouses.id,
        name: warehouses.name,
        city: warehouses.city,
        address: warehouses.address,
        latitude: warehouses.latitude,
        longitude: warehouses.longitude,
        phone: warehouses.phone,
        email: warehouses.email,
        openingHours: warehouses.openingHours,
      })
      .from(warehouses)
      .where(eq(warehouses.city, city))
      .orderBy(warehouses.name);

    // Filter only active warehouses
    const activeWarehouses = cityWarehouses.filter(
      (w) => w.latitude && w.longitude
    );

    return NextResponse.json({
      success: true,
      warehouses: activeWarehouses,
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}
