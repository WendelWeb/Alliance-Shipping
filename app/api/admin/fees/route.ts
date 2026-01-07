import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceFees } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc } from 'drizzle-orm';

// GET - Get current and historical fees
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeHistory = searchParams.get('history') === 'true';

    if (includeHistory) {
      // Get all fees including history
      const allFees = await db
        .select()
        .from(serviceFees)
        .orderBy(desc(serviceFees.effectiveFrom));

      return NextResponse.json({ fees: allFees });
    } else {
      // Get only current active fee
      const [currentFee] = await db
        .select()
        .from(serviceFees)
        .where(eq(serviceFees.isActive, true))
        .orderBy(desc(serviceFees.effectiveFrom))
        .limit(1);

      return NextResponse.json({ fee: currentFee || null });
    }
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 });
  }
}

// POST - Create new fee configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceFee, shippingFeePerLb, effectiveDate } = body;

    // Validate input
    if (serviceFee === undefined || shippingFeePerLb === undefined) {
      return NextResponse.json(
        { error: 'Service fee and shipping fee per lb are required' },
        { status: 400 }
      );
    }

    // Parse effective date or use current date
    const effective = effectiveDate ? new Date(effectiveDate) : new Date();

    // Check if there's a future fee that would conflict
    const [existingFutureFee] = await db
      .select()
      .from(serviceFees)
      .where(eq(serviceFees.effectiveFrom, effective));

    if (existingFutureFee) {
      return NextResponse.json(
        { error: 'A fee configuration already exists for this date' },
        { status: 400 }
      );
    }

    // If effective date is now or in the past, deactivate current active fee
    if (effective <= new Date()) {
      await db
        .update(serviceFees)
        .set({ isActive: false })
        .where(eq(serviceFees.isActive, true));
    }

    // Create new fee configuration
    const [newFee] = await db
      .insert(serviceFees)
      .values({
        feeType: 'service_fee',
        amount: serviceFee,
        effectiveFrom: effective,
        createdBy: session.userId,
        isActive: effective <= new Date(),
      })
      .returning();

    return NextResponse.json({ fee: newFee }, { status: 201 });
  } catch (error) {
    console.error('Error creating fee:', error);
    return NextResponse.json(
      { error: 'Failed to create fee configuration' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing fee
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, serviceFee, shippingFeePerLb, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Fee ID required' }, { status: 400 });
    }

    const updateData: any = {};

    if (serviceFee !== undefined) {
      updateData.serviceFee = serviceFee;
    }

    if (shippingFeePerLb !== undefined) {
      updateData.shippingFeePerLb = shippingFeePerLb;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;

      // If activating this fee, deactivate all others
      if (isActive) {
        await db
          .update(serviceFees)
          .set({ isActive: false })
          .where(eq(serviceFees.isActive, true));
      }
    }

    const [updatedFee] = await db
      .update(serviceFees)
      .set(updateData)
      .where(eq(serviceFees.id, id))
      .returning();

    return NextResponse.json({ fee: updatedFee });
  } catch (error) {
    console.error('Error updating fee:', error);
    return NextResponse.json(
      { error: 'Failed to update fee configuration' },
      { status: 500 }
    );
  }
}
