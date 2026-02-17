import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, adminActivityLogs, specialItemFees } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq } from 'drizzle-orm';
import { sendCustomsFeesEmail } from '@/lib/email/service';
import { sendPushNotification } from '@/lib/notifications/push';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const packageId = parseInt(id);
    const body = await request.json();
    const { customsFees } = body;

    // Validation
    if (!customsFees || parseFloat(customsFees) < 0) {
      return NextResponse.json(
        { error: 'Invalid customs fees amount' },
        { status: 400 }
      );
    }

    // Get package actuel
    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // ⭐ RECALCUL COMPLET (pas accumulation)
    // TOTAL = serviceFee + weightCost + customsFees + specialItemFixedFee
    const customsFeesAmount = parseFloat(customsFees);
    const serviceFee = parseFloat(pkg.serviceFee);
    const weightCost = parseFloat(pkg.weightCost);
    const oldTotal = parseFloat(pkg.totalCost);

    // Include special item fixed fee if package has one
    let specialItemFixedFee = 0;
    let specialItemName = '';
    if (pkg.specialItemId) {
      const [specialItem] = await db
        .select({ fixedFee: specialItemFees.fixedFee, itemName: specialItemFees.itemName, brand: specialItemFees.brand })
        .from(specialItemFees)
        .where(eq(specialItemFees.id, pkg.specialItemId))
        .limit(1);
      if (specialItem) {
        specialItemFixedFee = parseFloat(specialItem.fixedFee);
        specialItemName = `${specialItem.brand} ${specialItem.itemName}`;
      }
    }

    const newTotal = serviceFee + weightCost + customsFeesAmount + specialItemFixedFee;

    // Update package
    await db
      .update(packages)
      .set({
        customsFees: customsFeesAmount.toFixed(2),
        totalCost: newTotal.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(packages.id, packageId));

    // Log activité admin
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'added_customs_fees',
      targetType: 'package',
      targetId: packageId,
      details: {
        trackingNumber: pkg.trackingNumber,
        customsFees: customsFeesAmount,
        oldTotal: oldTotal,
        newTotal: newTotal,
        timestamp: new Date().toISOString(),
      },
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Envoyer email au user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, pkg.userId))
      .limit(1);

    let emailSent = false;
    let emailError = null;

    if (user?.email) {
      const userName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      const userLocale = user.preferredLanguage || 'fr';

      try {
        await sendCustomsFeesEmail(
          user.email,
          userName,
          pkg.trackingNumber,
          oldTotal,
          newTotal,
          customsFeesAmount,
          userLocale
        );
        emailSent = true;
        console.log(
          `[CUSTOMS-FEES] Email sent to ${user.email} for package ${pkg.trackingNumber}`
        );
      } catch (error: any) {
        console.error('[CUSTOMS-FEES] Failed to send email:', error);
        emailError = error.message;
      }
    }

    // Send push notification
    sendPushNotification({
      userId: pkg.userId,
      templateKey: 'customs_fees_added',
      variables: {
        tracking: pkg.trackingNumber,
        externalTracking: pkg.externalTrackingNumber || 'N/A',
        customs: customsFeesAmount.toFixed(2),
        total: newTotal.toFixed(2),
        category: pkg.category || 'general',
        ...(specialItemName ? { specialItem: specialItemName } : {}),
      },
      packageId,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      packageId,
      trackingNumber: pkg.trackingNumber,
      oldTotal,
      newTotal,
      customsFees: customsFeesAmount,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error('[POST /api/admin/packages/[id]/customs-fees] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add customs fees',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
