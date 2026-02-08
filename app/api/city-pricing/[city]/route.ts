import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cityPricing } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get pricing for a specific city
export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = params.city;

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
    }

    const [pricing] = await db
      .select()
      .from(cityPricing)
      .where(eq(cityPricing.city, city))
      .limit(1);

    if (!pricing) {
      // Return default pricing if city not found
      return NextResponse.json({
        city,
        serviceFee: 5.0,
        pricePerLb: 4.0,
        isDefault: true,
      });
    }

    return NextResponse.json({
      city: pricing.city,
      serviceFee: parseFloat(pricing.serviceFee),
      pricePerLb: parseFloat(pricing.pricePerLb),
      isDefault: false,
    });
  } catch (error) {
    console.error('Error fetching city pricing:', error);
    return NextResponse.json({ error: 'Failed to fetch city pricing' }, { status: 500 });
  }
}
