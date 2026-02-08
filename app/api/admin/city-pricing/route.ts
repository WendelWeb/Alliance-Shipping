import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cityPricing } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq } from 'drizzle-orm';

// GET - Get all city pricing
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cities = await db
      .select()
      .from(cityPricing)
      .where(eq(cityPricing.isActive, true))
      .orderBy(cityPricing.city);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching city pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch city pricing' }, { status: 500 });
  }
}

// PATCH - Update city pricing
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { city, serviceFee, pricePerLb } = body;

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    if (serviceFee === undefined || pricePerLb === undefined) {
      return NextResponse.json(
        { error: 'Service fee and price per lb are required' },
        { status: 400 }
      );
    }

    // Validate positive values
    if (serviceFee < 0 || pricePerLb < 0) {
      return NextResponse.json(
        { error: 'Fees must be positive numbers' },
        { status: 400 }
      );
    }

    // Update or insert city pricing
    const [existingCity] = await db
      .select()
      .from(cityPricing)
      .where(eq(cityPricing.city, city))
      .limit(1);

    let updatedCity;

    if (existingCity) {
      // Update existing
      [updatedCity] = await db
        .update(cityPricing)
        .set({
          serviceFee: serviceFee.toString(),
          pricePerLb: pricePerLb.toString(),
          updatedAt: new Date(),
        })
        .where(eq(cityPricing.city, city))
        .returning();
    } else {
      // Insert new
      [updatedCity] = await db
        .insert(cityPricing)
        .values({
          city,
          serviceFee: serviceFee.toString(),
          pricePerLb: pricePerLb.toString(),
          isActive: true,
        })
        .returning();
    }

    return NextResponse.json({ city: updatedCity });
  } catch (error) {
    console.error('Error updating city pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update city pricing' },
      { status: 500 }
    );
  }
}
