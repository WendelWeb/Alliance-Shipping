import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialItemFees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Public endpoint to fetch active special items
export async function GET() {
  try {
    const items = await db
      .select()
      .from(specialItemFees)
      .where(eq(specialItemFees.isActive, true));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('[GET /api/special-items/public] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch special items',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
