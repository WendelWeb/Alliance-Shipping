import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialItemFees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/special-items/public (PUBLIC - no auth required)
 * Returns all active special items with their pricing.
 * Used by mobile calculator and profile special items page.
 */
export async function GET() {
  try {
    const items = await db
      .select()
      .from(specialItemFees)
      .where(eq(specialItemFees.isActive, true));

    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        category: item.category,
        brand: item.brand,
        itemName: item.itemName,
        minModel: item.minModel,
        maxModel: item.maxModel,
        fixedFee: parseFloat(item.fixedFee),
        description: item.description,
        imageUrl: item.imageUrl,
      })),
    });
  } catch (error) {
    console.error('Error fetching special items:', error);
    return NextResponse.json({ error: 'Failed to fetch special items' }, { status: 500 });
  }
}
