import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, packageRequests, packageTransfers, revenueRecords } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, gte, sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total revenue
    const revenueData = await db
      .select({ total: sql<number>`SUM(CAST(${revenueRecords.amount} AS DECIMAL))` })
      .from(revenueRecords);
    const totalRevenue = parseFloat(String(revenueData[0]?.total || 0));

    // Get active packages count
    const [{ count: activePackages }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packages)
      .where(sql`${packages.status} IN ('pending', 'received', 'in-transit', 'available')`);

    // Get total users
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    // Get pending requests count
    const [{ count: pendingRequests }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packageRequests)
      .where(eq(packageRequests.status, 'pending'));

    // Get in-transit count
    const [{ count: inTransitCount }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packages)
      .where(eq(packages.status, 'in-transit'));

    // Get available count
    const [{ count: availableCount }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packages)
      .where(eq(packages.status, 'available'));

    // Get transfer stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [{ count: totalTransfers }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packageTransfers);

    const [{ count: transfersToday }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packageTransfers)
      .where(gte(packageTransfers.transferredAt, today));

    // Get yesterday's count for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const [{ count: transfersYesterday }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(packageTransfers)
      .where(
        sql`${packageTransfers.transferredAt} >= ${yesterday} AND ${packageTransfers.transferredAt} < ${today}`
      );

    // Calculate percentage change
    const transferChange =
      transfersYesterday > 0
        ? ((transfersToday - transfersYesterday) / transfersYesterday) * 100
        : transfersToday > 0
        ? 100
        : 0;

    // Get recent packages for the activity feed
    const recentPackages = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        status: packages.status,
        totalCost: packages.totalCost,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userCity: users.city,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .orderBy(desc(packages.createdAt))
      .limit(5);

    return NextResponse.json({
      totalRevenue,
      activePackages: Number(activePackages),
      totalUsers: Number(totalUsers),
      pendingRequests: Number(pendingRequests),
      inTransitCount: Number(inTransitCount),
      availableCount: Number(availableCount),
      transfersToday: Number(transfersToday),
      totalTransfers: Number(totalTransfers),
      transferChange: Number(transferChange.toFixed(1)),
      recentPackages: recentPackages.map(pkg => ({
        id: pkg.trackingNumber,
        customer: `${pkg.userFirstName || ''} ${pkg.userLastName || ''}`.trim() || pkg.userEmail,
        destination: pkg.userCity || 'Unknown',
        status: pkg.status,
        amount: `$${parseFloat(String(pkg.totalCost)).toFixed(2)}`,
      })),
    });
  } catch (error: any) {
    console.error('[GET /api/admin/dashboard] Error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
