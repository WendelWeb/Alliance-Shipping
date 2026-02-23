import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, warehouses, cityPricing } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendBundleReminderEmail } from '@/lib/email/email-templates';
import { sendPushNotification } from '@/lib/notifications/push';

// GET - Daily cron: remind users with 2+ available packages
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find users with 2+ packages in "available" status
    const usersWithBundles = await db
      .select({
        userId: packages.userId,
        packageCount: sql<number>`count(*)::int`,
        trackingNumbers: sql<string>`string_agg(${packages.trackingNumber}, ', ')`,
      })
      .from(packages)
      .where(eq(packages.status, 'available'))
      .groupBy(packages.userId)
      .having(sql`count(*) >= 2`);

    let remindersSent = 0;

    for (const row of usersWithBundles) {
      // Get user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, row.userId))
        .limit(1);

      if (!user) continue;

      const trackingList = row.trackingNumbers.split(', ');

      // Calculate potential savings
      let cityServiceFee = 5.00;
      if (user.city) {
        const [cp] = await db
          .select({ serviceFee: cityPricing.serviceFee })
          .from(cityPricing)
          .where(eq(cityPricing.city, user.city))
          .limit(1);
        if (cp) cityServiceFee = parseFloat(cp.serviceFee);
      }
      const potentialSavings = cityServiceFee * (row.packageCount - 1);

      // Get depot name
      let depotName = 'Alliance Shipping';
      if (user.warehouseId) {
        const [wh] = await db
          .select({ name: warehouses.name })
          .from(warehouses)
          .where(eq(warehouses.id, user.warehouseId))
          .limit(1);
        if (wh) depotName = wh.name;
      }

      // Send push notification
      sendPushNotification({
        userId: row.userId,
        templateKey: 'bundle_reminder',
        variables: {
          count: String(row.packageCount),
          trackingList: row.trackingNumbers,
        },
      }).catch(() => {});

      // Send reminder email
      if (user.email) {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client';
        sendBundleReminderEmail(
          user.email,
          userName,
          trackingList,
          potentialSavings,
          3, // daysSinceAvailable
          depotName,
          user.preferredLanguage || 'fr',
        ).catch(() => {});
      }

      remindersSent++;
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      usersNotified: usersWithBundles.length,
    });
  } catch (error) {
    console.error('Error in bundle reminder cron:', error);
    return NextResponse.json(
      { error: 'Failed to process bundle reminders' },
      { status: 500 }
    );
  }
}
