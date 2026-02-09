import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cityPricing } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/pricing/all (PUBLIC - no auth required)
 * Returns all active cities with their pricing and delivery time info.
 * Used by mobile calculator and public-facing pages.
 */
export async function GET() {
  try {
    const cities = await db
      .select()
      .from(cityPricing)
      .where(eq(cityPricing.isActive, true));

    return NextResponse.json({
      cities: cities.map((c) => ({
        id: c.id,
        city: c.city,
        serviceFee: parseFloat(c.serviceFee),
        pricePerLb: parseFloat(c.pricePerLb),
        deliveryDaysMin: c.deliveryDaysMin,
        deliveryDaysMax: c.deliveryDaysMax,
        perfumeDaysMin: c.perfumeDaysMin,
        perfumeDaysMax: c.perfumeDaysMax,
      })),
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
