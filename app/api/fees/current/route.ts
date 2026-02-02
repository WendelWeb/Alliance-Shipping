import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceFees } from '@/lib/db/schema';
import { and, eq, lte, desc } from 'drizzle-orm';
import { PRICING } from '@/constants';

// Cache for 60 seconds (ISR)
export const revalidate = 60;

/**
 * GET /api/fees/current
 *
 * Returns current active service fees
 * Fallback to PRICING constants if DB is empty or on error
 *
 * Response: { serviceFee: number, pricePerLb: number }
 */
export async function GET() {
  try {
    const now = new Date();

    // Query service fee (feeType='service_fee')
    const [serviceFeeRecord] = await db
      .select()
      .from(serviceFees)
      .where(
        and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'service_fee'),
          lte(serviceFees.effectiveFrom, now)
        )
      )
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    // Query per pound fee (feeType='per_pound')
    const [perPoundRecord] = await db
      .select()
      .from(serviceFees)
      .where(
        and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'per_pound'),
          lte(serviceFees.effectiveFrom, now)
        )
      )
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    // Extract amounts or use fallback constants
    const serviceFee = serviceFeeRecord
      ? parseFloat(serviceFeeRecord.amount)
      : PRICING.serviceFee;

    const pricePerLb = perPoundRecord
      ? parseFloat(perPoundRecord.amount)
      : PRICING.pricePerLb;

    return NextResponse.json({
      serviceFee,
      pricePerLb,
      source: serviceFeeRecord && perPoundRecord ? 'database' : 'constants',
    });
  } catch (error) {
    console.error('Error fetching current fees:', error);

    // Fallback to constants on error
    return NextResponse.json({
      serviceFee: PRICING.serviceFee,
      pricePerLb: PRICING.pricePerLb,
      source: 'constants',
      error: 'Database error, using fallback values',
    });
  }
}
