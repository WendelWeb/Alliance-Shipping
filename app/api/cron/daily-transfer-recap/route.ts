import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageTransfers, packages, users, admins } from '@/lib/db/schema';
import { eq, gte, lt, sql } from 'drizzle-orm';
import { generateDailyTransferRecapEmail } from '@/lib/email/templates/daily-transfer-recap';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range for yesterday (since this runs daily)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all transfers from yesterday
    const yesterdayTransfers = await db
      .select({
        id: packageTransfers.id,
        packageId: packageTransfers.packageId,
        oldTotalCost: packageTransfers.oldTotalCost,
        newTotalCost: packageTransfers.newTotalCost,
        newCity: packageTransfers.newCity,
        transferType: packageTransfers.transferType,
        transferredAt: packageTransfers.transferredAt,
        trackingNumber: packages.trackingNumber,
        externalTrackingNumber: packages.externalTrackingNumber,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        userEmail: users.email,
      })
      .from(packageTransfers)
      .leftJoin(packages, eq(packageTransfers.packageId, packages.id))
      .leftJoin(users, eq(packageTransfers.toUserId, users.id))
      .where(
        sql`${packageTransfers.transferredAt} >= ${yesterday} AND ${packageTransfers.transferredAt} < ${today}`
      );

    // Get stats
    const userClaimed = yesterdayTransfers.filter(t => t.transferType === 'user_claimed').length;
    const adminAssigned = yesterdayTransfers.filter(t => t.transferType === 'admin_assigned').length;

    // Group by city
    const byCity: Record<string, number> = {};
    yesterdayTransfers.forEach(t => {
      if (t.newCity) {
        byCity[t.newCity] = (byCity[t.newCity] || 0) + 1;
      }
    });

    // Calculate average delta
    const totalDelta = yesterdayTransfers.reduce((sum, t) => {
      const delta = parseFloat(t.newTotalCost) - parseFloat(t.oldTotalCost);
      return sum + delta;
    }, 0);
    const averageDelta = yesterdayTransfers.length > 0 ? totalDelta / yesterdayTransfers.length : 0;

    // Get day before yesterday count for trend
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const [{ count: dayBeforeYesterdayCount }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packageTransfers)
      .where(
        sql`${packageTransfers.transferredAt} >= ${dayBeforeYesterday} AND ${packageTransfers.transferredAt} < ${yesterday}`
      );

    const percentChange =
      Number(dayBeforeYesterdayCount) > 0
        ? ((yesterdayTransfers.length - Number(dayBeforeYesterdayCount)) / Number(dayBeforeYesterdayCount)) * 100
        : yesterdayTransfers.length > 0
        ? 100
        : 0;

    // Get unclaimed packages alerts (packages on Alliance Shipping account)
    const allianceEmail = 'allianceshipping26@gmail.com';
    const [allianceUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, allianceEmail))
      .limit(1);

    let unclaimedPackages = 0;
    let oldestUnclaimedDays = 0;

    if (allianceUser) {
      const unclaimed = await db
        .select({ createdAt: packages.createdAt })
        .from(packages)
        .where(eq(packages.userId, allianceUser.id));

      unclaimedPackages = unclaimed.length;

      if (unclaimed.length > 0) {
        const oldest = unclaimed.reduce((min, pkg) => {
          return new Date(pkg.createdAt) < new Date(min.createdAt) ? pkg : min;
        });
        const daysDiff = Math.floor((Date.now() - new Date(oldest.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        oldestUnclaimedDays = daysDiff;
      }
    }

    // Format transfer data
    const transferSummaries = yesterdayTransfers.map(t => ({
      trackingNumber: t.trackingNumber || '',
      externalTrackingNumber: t.externalTrackingNumber,
      userName: t.userName || '',
      userEmail: t.userEmail || '',
      userCity: t.newCity,
      transferType: t.transferType as 'user_claimed' | 'admin_assigned',
      oldTotalCost: t.oldTotalCost,
      newTotalCost: t.newTotalCost,
      delta: parseFloat(t.newTotalCost) - parseFloat(t.oldTotalCost),
      transferredAt: t.transferredAt.toISOString(),
    }));

    // Generate email HTML
    const emailHtml = generateDailyTransferRecapEmail({
      date: yesterday.toLocaleDateString('fr-HT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      transfers: transferSummaries,
      stats: {
        total: yesterdayTransfers.length,
        userClaimed,
        adminAssigned,
        byCity,
        averageDelta,
        totalRevenue: totalDelta,
      },
      alerts: {
        unclaimedPackages,
        oldestUnclaimedDays,
      },
      trend: {
        yesterday: Number(dayBeforeYesterdayCount),
        today: yesterdayTransfers.length,
        percentChange,
      },
    });

    // Get all active admins
    const activeAdmins = await db
      .select({
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(admins)
      .leftJoin(users, eq(admins.userId, users.id))
      .where(eq(admins.isActive, true));

    if (activeAdmins.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active admins to send email to',
        stats: {
          transfers: yesterdayTransfers.length,
          userClaimed,
          adminAssigned,
        },
      });
    }

    // Send email to all active admins
    const emailPromises = activeAdmins.map(async (admin) => {
      if (!admin.email) return null;

      try {
        const result = await resend.emails.send({
          from: 'Alliance Shipping <noreply@allianceshipping.com>',
          to: admin.email,
          subject: `📊 Récap Transferts - ${yesterdayTransfers.length} transfert${yesterdayTransfers.length > 1 ? 's' : ''} hier`,
          html: emailHtml,
        });

        return {
          email: admin.email,
          success: true,
          messageId: result.data?.id,
        };
      } catch (error: any) {
        console.error(`Error sending email to ${admin.email}:`, error);
        return {
          email: admin.email,
          success: false,
          error: error.message,
        };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(r => r?.success).length;

    return NextResponse.json({
      success: true,
      message: `Daily transfer recap sent to ${successfulEmails}/${activeAdmins.length} admins`,
      stats: {
        transfers: yesterdayTransfers.length,
        userClaimed,
        adminAssigned,
        averageDelta,
        unclaimedPackages,
      },
      emailResults: emailResults.filter(r => r !== null),
    });
  } catch (error: any) {
    console.error('[GET /api/cron/daily-transfer-recap] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
