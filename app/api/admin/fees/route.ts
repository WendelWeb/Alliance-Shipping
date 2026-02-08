import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceFees, announcements } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, and, lte } from 'drizzle-orm';
import {
  feeChangeTemplates,
  shouldCreateAnnouncement,
  SUPPORTED_LANGUAGES,
} from '@/lib/announcements/fee-change-templates';
import { sendPushToAllUsers } from '@/lib/notifications/push';

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

      // Group by effectiveFrom to pair service_fee + per_pound
      const grouped = allFees.reduce((acc: any[], fee) => {
        const dateKey = fee.effectiveFrom.toISOString();
        const existing = acc.find(g => g.effectiveFrom === dateKey);

        if (existing) {
          if (fee.feeType === 'service_fee') {
            existing.serviceFee = fee;
          } else if (fee.feeType === 'per_pound') {
            existing.perPound = fee;
          }
        } else {
          acc.push({
            effectiveFrom: dateKey,
            serviceFee: fee.feeType === 'service_fee' ? fee : null,
            perPound: fee.feeType === 'per_pound' ? fee : null,
          });
        }

        return acc;
      }, []);

      return NextResponse.json({ fees: grouped });
    } else {
      // Get current active fees (both service_fee and per_pound)
      const [serviceFeeRecord] = await db
        .select()
        .from(serviceFees)
        .where(and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'service_fee')
        ))
        .orderBy(desc(serviceFees.effectiveFrom))
        .limit(1);

      const [perPoundRecord] = await db
        .select()
        .from(serviceFees)
        .where(and(
          eq(serviceFees.isActive, true),
          eq(serviceFees.feeType, 'per_pound')
        ))
        .orderBy(desc(serviceFees.effectiveFrom))
        .limit(1);

      return NextResponse.json({
        serviceFee: serviceFeeRecord || null,
        perPound: perPoundRecord || null,
      });
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

    // Fetch OLD fees for comparison (to generate announcements)
    const now = new Date();
    const [oldServiceFee] = await db
      .select()
      .from(serviceFees)
      .where(and(
        eq(serviceFees.isActive, true),
        eq(serviceFees.feeType, 'service_fee'),
        lte(serviceFees.effectiveFrom, now)
      ))
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    const [oldPerPound] = await db
      .select()
      .from(serviceFees)
      .where(and(
        eq(serviceFees.isActive, true),
        eq(serviceFees.feeType, 'per_pound'),
        lte(serviceFees.effectiveFrom, now)
      ))
      .orderBy(desc(serviceFees.effectiveFrom))
      .limit(1);

    // If effective date is now or in the past, deactivate current active fees of BOTH types
    if (effective <= new Date()) {
      await db
        .update(serviceFees)
        .set({ isActive: false })
        .where(eq(serviceFees.isActive, true));
    }

    // Create TWO new fee records (service_fee + per_pound)
    const userId = session.userId;

    const [newServiceFee] = await db
      .insert(serviceFees)
      .values({
        feeType: 'service_fee',
        amount: serviceFee.toString(),
        effectiveFrom: effective,
        createdBy: userId,
        isActive: effective <= new Date(),
      })
      .returning();

    const [newPerPound] = await db
      .insert(serviceFees)
      .values({
        feeType: 'per_pound',
        amount: shippingFeePerLb.toString(),
        effectiveFrom: effective,
        createdBy: userId,
        isActive: effective <= new Date(),
      })
      .returning();

    // Create multilingual announcements if fees changed
    const feeChange = {
      oldServiceFee: oldServiceFee ? parseFloat(oldServiceFee.amount) : 5.0,
      newServiceFee: parseFloat(newServiceFee.amount),
      oldPricePerLb: oldPerPound ? parseFloat(oldPerPound.amount) : 4.0,
      newPricePerLb: parseFloat(newPerPound.amount),
      effectiveDate: effective,
    };

    let announcementsCreated = 0;

    if (shouldCreateAnnouncement(feeChange)) {
      // Create announcements in all 4 languages
      for (const lang of SUPPORTED_LANGUAGES) {
        const template = feeChangeTemplates[lang](feeChange);

        await db.insert(announcements).values({
          title: `[${lang.toUpperCase()}] ${template.title}`,
          content: template.content,
          type: 'alert', // Important change
          targetAudience: 'all',
          isPublished: effective <= new Date(), // Publish immediately if effective now, schedule if future
          publishDate: effective,
          showOnHomepage: true,
          isPinned: true, // Pin for visibility
          createdBy: userId,
        });

        announcementsCreated++;
      }
    }

    // Send push notification for price change if effective now
    if (shouldCreateAnnouncement(feeChange) && effective <= new Date()) {
      sendPushToAllUsers({
        templateKey: 'price_change',
      }).catch(() => {});
    }

    return NextResponse.json({
      serviceFee: newServiceFee,
      perPound: newPerPound,
      announcementsCreated,
    }, { status: 201 });
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
