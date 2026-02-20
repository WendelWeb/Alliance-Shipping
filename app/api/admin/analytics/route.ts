import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  packages, users, packageRequests,
  packageTransfers, loyaltyCredits, adminActivityLogs,
  admins, specialItemFees, trackingHistory,
} from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { sql, eq, and, gte, lte, desc, isNull, count } from 'drizzle-orm';

// ── Date Range System ────────────────────────────────────────────────
function getDateRange(range: string) {
  const now = new Date();
  const end = new Date(now);
  let start: Date;
  let prevStart: Date | null = null;
  let prevEnd: Date | null = null;

  switch (range) {
    case 'today': {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setHours(0, 0, 0, 0);
      break;
    }
    case '7d': {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 7);
      break;
    }
    case '30d': {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 30);
      break;
    }
    case '90d': {
      start = new Date(now);
      start.setDate(now.getDate() - 90);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 90);
      break;
    }
    case '1y': {
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setFullYear(prevEnd.getFullYear() - 1);
      break;
    }
    case 'all':
    default:
      start = new Date('2020-01-01');
      return { current: { start, end }, previous: null };
  }

  return {
    current: { start, end },
    previous: prevStart && prevEnd ? { start: prevStart, end: prevEnd } : null,
  };
}

function calcGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

// Determine date grouping format based on range
function getDateFormat(range: string): string {
  switch (range) {
    case 'today': return 'HH24:00';
    case '7d':
    case '30d': return 'YYYY-MM-DD';
    case '90d': return 'IYYY-"W"IW';
    case '1y':
    case 'all':
    default: return 'YYYY-MM';
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    const dates = getDateRange(range);
    const dateFormat = getDateFormat(range);
    const { start: cs, end: ce } = dates.current;

    // ── Build all queries in parallel ──────────────────────────────────
    const queries: Promise<any>[] = [];

    // A1: Current revenue (from packages.totalCost)
    queries.push(
      db.select({
        total: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
    ); // 0

    // A2: Current packages count (all statuses)
    queries.push(
      db.select({ count: sql<number>`COUNT(*)` })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
    ); // 1

    // A3: Current active clients
    queries.push(
      db.select({ count: sql<number>`COUNT(DISTINCT ${packages.userId})` })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
    ); // 2

    // A4: Current customs fees
    queries.push(
      db.select({
        total: sql<string>`COALESCE(SUM(CAST(${packages.customsFees} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
    ); // 3

    // A5: Current requests count
    queries.push(
      db.select({ count: sql<number>`COUNT(*)` })
      .from(packageRequests)
      .where(and(gte(packageRequests.createdAt, cs), lte(packageRequests.createdAt, ce)))
    ); // 4

    // A6: Current transfers count
    queries.push(
      db.select({ count: sql<number>`COUNT(*)` })
      .from(packageTransfers)
      .where(and(gte(packageTransfers.transferredAt, cs), lte(packageTransfers.transferredAt, ce)))
    ); // 5

    // A7: Revenue breakdown by source (weightCost, serviceFee, customsFees, specialItem)
    const revenueBreakdownIdx = 6;
    queries.push(
      db.select({
        totalWeightCost: sql<string>`COALESCE(SUM(CAST(${packages.weightCost} AS DECIMAL)), 0)`,
        totalServiceFee: sql<string>`COALESCE(SUM(CAST(${packages.serviceFee} AS DECIMAL)), 0)`,
        totalCustomsFees: sql<string>`COALESCE(SUM(CAST(${packages.customsFees} AS DECIMAL)), 0)`,
        totalSpecialItemRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${packages.specialItemId} IS NOT NULL THEN CAST(${packages.totalCost} AS DECIMAL) ELSE 0 END), 0)`,
        totalNormalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${packages.specialItemId} IS NULL THEN CAST(${packages.totalCost} AS DECIMAL) ELSE 0 END), 0)`,
        totalWeightLbs: sql<string>`COALESCE(SUM(CAST(${packages.weight} AS DECIMAL)), 0)`,
        totalQuantity: sql<number>`COALESCE(SUM(${packages.quantity}), 0)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
    ); // 6

    // Previous period queries (if applicable)
    if (dates.previous) {
      const { start: ps, end: pe } = dates.previous;
      queries.push(
        db.select({ total: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)` })
        .from(packages)
        .where(and(gte(packages.createdAt, ps), lte(packages.createdAt, pe)))
      ); // 7
      queries.push(
        db.select({ count: sql<number>`COUNT(*)` })
        .from(packages)
        .where(and(gte(packages.createdAt, ps), lte(packages.createdAt, pe)))
      ); // 8
      queries.push(
        db.select({ count: sql<number>`COUNT(DISTINCT ${packages.userId})` })
        .from(packages)
        .where(and(gte(packages.createdAt, ps), lte(packages.createdAt, pe)))
      ); // 9
      queries.push(
        db.select({ total: sql<string>`COALESCE(SUM(CAST(${packages.customsFees} AS DECIMAL)), 0)` })
        .from(packages)
        .where(and(gte(packages.createdAt, ps), lte(packages.createdAt, pe)))
      ); // 10
      queries.push(
        db.select({ count: sql<number>`COUNT(*)` })
        .from(packageRequests)
        .where(and(gte(packageRequests.createdAt, ps), lte(packageRequests.createdAt, pe)))
      ); // 11
      queries.push(
        db.select({ count: sql<number>`COUNT(*)` })
        .from(packageTransfers)
        .where(and(gte(packageTransfers.transferredAt, ps), lte(packageTransfers.transferredAt, pe)))
      ); // 12
    }

    // B: Revenue trend (from packages.totalCost)
    const trendIdx = queries.length;
    queries.push(
      db.select({
        date: sql<string>`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`,
        revenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(sql`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`)
      .orderBy(sql`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`)
    );

    // C: Packages trend
    const pkgTrendIdx = queries.length;
    queries.push(
      db.select({
        date: sql<string>`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(sql`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`)
      .orderBy(sql`TO_CHAR(${packages.createdAt}, ${sql.raw(`'${dateFormat}'`)})`)
    );

    // D: City distribution
    const cityIdx = queries.length;
    queries.push(
      db.select({
        city: users.city,
        count: sql<number>`COUNT(*)`,
        revenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(users.city)
    );

    // E1: Funnel counts (snapshot - current status)
    const funnelIdx = queries.length;
    queries.push(
      db.select({
        status: packages.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(packages)
      .groupBy(packages.status)
    );

    // E2: Stage timings (from trackingHistory)
    const timingsIdx = queries.length;
    queries.push(
      db.execute(sql`
        WITH ordered AS (
          SELECT
            package_id,
            status,
            "timestamp",
            LEAD(status) OVER (PARTITION BY package_id ORDER BY "timestamp") as next_status,
            LEAD("timestamp") OVER (PARTITION BY package_id ORDER BY "timestamp") as next_ts
          FROM tracking_history
        )
        SELECT
          status as from_status,
          next_status as to_status,
          ROUND(AVG(EXTRACT(EPOCH FROM (next_ts - "timestamp")) / 3600)::numeric, 1) as avg_hours,
          COUNT(*) as cnt
        FROM ordered
        WHERE next_status IS NOT NULL
        GROUP BY status, next_status
        ORDER BY
          CASE status
            WHEN 'pending' THEN 1
            WHEN 'received' THEN 2
            WHEN 'in-transit' THEN 3
            WHEN 'available' THEN 4
            ELSE 5
          END
      `)
    );

    // F: Special items
    const specialIdx = queries.length;
    queries.push(
      db.select({
        itemId: specialItemFees.id,
        brand: specialItemFees.brand,
        itemName: specialItemFees.itemName,
        category: specialItemFees.category,
        fixedFee: specialItemFees.fixedFee,
        count: sql<number>`COUNT(${packages.id})`,
        revenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .innerJoin(specialItemFees, eq(packages.specialItemId, specialItemFees.id))
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(specialItemFees.id, specialItemFees.brand, specialItemFees.itemName, specialItemFees.category, specialItemFees.fixedFee)
      .orderBy(desc(sql`COUNT(${packages.id})`))
    );

    // F2: Regular packages (no special item)
    const regularIdx = queries.length;
    queries.push(
      db.select({
        count: sql<number>`COUNT(*)`,
        revenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .where(and(
        gte(packages.createdAt, cs),
        lte(packages.createdAt, ce),
        isNull(packages.specialItemId),
      ))
    );

    // G: Admin performance
    const adminIdx = queries.length;
    queries.push(
      db.select({
        adminId: admins.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: admins.role,
        actionCount: sql<number>`COUNT(${adminActivityLogs.id})`,
        packagesProcessed: sql<number>`COUNT(DISTINCT CASE WHEN ${adminActivityLogs.targetType} = 'package' THEN ${adminActivityLogs.targetId} END)`,
      })
      .from(admins)
      .leftJoin(users, eq(admins.userId, users.id))
      .leftJoin(adminActivityLogs, and(
        eq(adminActivityLogs.adminId, admins.id),
        gte(adminActivityLogs.createdAt, cs),
        lte(adminActivityLogs.createdAt, ce),
      ))
      .where(eq(admins.isActive, true))
      .groupBy(admins.id, users.firstName, users.lastName, admins.role)
      .orderBy(desc(sql`COUNT(${adminActivityLogs.id})`))
    );

    // H1: Loyalty issued in period
    const loyaltyIssuedIdx = queries.length;
    queries.push(
      db.select({
        totalAmount: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} > 0 THEN ${loyaltyCredits.amount} ELSE 0 END), 0)`,
        totalPoints: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} > 0 THEN ${loyaltyCredits.points} ELSE 0 END), 0)`,
      })
      .from(loyaltyCredits)
      .where(and(gte(loyaltyCredits.createdAt, cs), lte(loyaltyCredits.createdAt, ce)))
    );

    // H2: Loyalty redeemed in period
    const loyaltyRedeemedIdx = queries.length;
    queries.push(
      db.select({
        totalAmount: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} < 0 THEN ABS(${loyaltyCredits.amount}) ELSE 0 END), 0)`,
        totalPoints: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} < 0 THEN ABS(${loyaltyCredits.points}) ELSE 0 END), 0)`,
      })
      .from(loyaltyCredits)
      .where(and(gte(loyaltyCredits.createdAt, cs), lte(loyaltyCredits.createdAt, ce)))
    );

    // H3: Total points in circulation (all time)
    const pointsCircIdx = queries.length;
    queries.push(
      db.select({
        totalPoints: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
      })
      .from(loyaltyCredits)
    );

    // H4: Top 5 loyalty users (all time)
    const topLoyaltyIdx = queries.length;
    queries.push(
      db.select({
        userId: loyaltyCredits.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        totalPoints: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
        totalAmount: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
      })
      .from(loyaltyCredits)
      .leftJoin(users, eq(loyaltyCredits.userId, users.id))
      .groupBy(loyaltyCredits.userId, users.firstName, users.lastName)
      .orderBy(desc(sql`SUM(${loyaltyCredits.points})`))
      .limit(5)
    );

    // I1: Transfers trend
    const transferTrendIdx = queries.length;
    queries.push(
      db.select({
        date: sql<string>`TO_CHAR(${packageTransfers.transferredAt}, ${sql.raw(`'${dateFormat}'`)})`,
        total: sql<number>`COUNT(*)`,
        userClaimed: sql<number>`SUM(CASE WHEN ${packageTransfers.transferType} = 'user_claimed' THEN 1 ELSE 0 END)`,
        adminAssigned: sql<number>`SUM(CASE WHEN ${packageTransfers.transferType} = 'admin_assigned' THEN 1 ELSE 0 END)`,
      })
      .from(packageTransfers)
      .where(and(gte(packageTransfers.transferredAt, cs), lte(packageTransfers.transferredAt, ce)))
      .groupBy(sql`TO_CHAR(${packageTransfers.transferredAt}, ${sql.raw(`'${dateFormat}'`)})`)
      .orderBy(sql`TO_CHAR(${packageTransfers.transferredAt}, ${sql.raw(`'${dateFormat}'`)})`)
    );

    // I2: Avg price delta
    const priceDeltaIdx = queries.length;
    queries.push(
      db.select({
        avgDelta: sql<string>`COALESCE(AVG(CAST(${packageTransfers.newTotalCost} AS DECIMAL) - CAST(${packageTransfers.oldTotalCost} AS DECIMAL)), 0)`,
      })
      .from(packageTransfers)
      .where(and(gte(packageTransfers.transferredAt, cs), lte(packageTransfers.transferredAt, ce)))
    );

    // I3: Request stats
    const reqStatsIdx = queries.length;
    queries.push(
      db.select({
        status: packageRequests.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(packageRequests)
      .where(and(gte(packageRequests.createdAt, cs), lte(packageRequests.createdAt, ce)))
      .groupBy(packageRequests.status)
    );

    // J: Top 10 clients
    const topClientsIdx = queries.length;
    queries.push(
      db.select({
        userId: packages.userId,
        clerkId: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        city: users.city,
        packageCount: sql<number>`COUNT(${packages.id})`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
        lastPackageDate: sql<string>`MAX(${packages.createdAt})`,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(packages.userId, users.clerkId, users.firstName, users.lastName, users.email, users.city)
      .orderBy(desc(sql`SUM(CAST(${packages.totalCost} AS DECIMAL))`))
      .limit(10)
    );

    // K: Delivery metrics
    const deliveryIdx = queries.length;
    queries.push(
      db.execute(sql`
        WITH stage_times AS (
          SELECT
            p.id as package_id,
            MIN(CASE WHEN th.status LIKE '%received%' THEN th."timestamp" END) as received_at,
            MIN(CASE WHEN th.status LIKE '%inTransit%' OR th.status LIKE '%in-transit%' THEN th."timestamp" END) as transit_at,
            MIN(CASE WHEN th.status LIKE '%available%' THEN th."timestamp" END) as available_at,
            MIN(CASE WHEN th.status LIKE '%delivered%' THEN th."timestamp" END) as delivered_at
          FROM packages p
          LEFT JOIN tracking_history th ON th.package_id = p.id
          WHERE p.status = 'delivered'
          GROUP BY p.id
        )
        SELECT
          ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (transit_at - received_at)) / 3600), 0)::numeric, 1) as avg_received_to_transit,
          ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (available_at - transit_at)) / 3600), 0)::numeric, 1) as avg_transit_to_available,
          ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (delivered_at - available_at)) / 3600), 0)::numeric, 1) as avg_available_to_delivered,
          ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (delivered_at - received_at)) / 3600), 0)::numeric, 1) as avg_total,
          COUNT(*) as delivered_count
        FROM stage_times
        WHERE delivered_at IS NOT NULL AND received_at IS NOT NULL
      `)
    );

    // L: Revenue by status (from packages)
    const paymentIdx = queries.length;
    queries.push(
      db.select({
        method: packages.status,
        count: sql<number>`COUNT(*)`,
        revenue: sql<string>`COALESCE(SUM(CAST(${packages.totalCost} AS DECIMAL)), 0)`,
      })
      .from(packages)
      .where(and(gte(packages.createdAt, cs), lte(packages.createdAt, ce)))
      .groupBy(packages.status)
    );

    // ── Execute all queries in parallel ───────────────────────────────
    const results = await Promise.all(queries);

    // ── Parse results ─────────────────────────────────────────────────
    const curRevenue = parseFloat(String(results[0][0]?.total)) || 0;
    const curPackages = Number(results[1][0]?.count) || 0;
    const curClients = Number(results[2][0]?.count) || 0;
    const curCustoms = parseFloat(String(results[3][0]?.total)) || 0;
    const curRequests = Number(results[4][0]?.count) || 0;
    const curTransfers = Number(results[5][0]?.count) || 0;
    const avgPackageValue = curPackages > 0 ? curRevenue / curPackages : 0;

    let revenueGrowth: number | null = null;
    let packagesGrowth: number | null = null;
    let clientsGrowth: number | null = null;
    let customsGrowth: number | null = null;
    let requestsGrowth: number | null = null;
    let transfersGrowth: number | null = null;
    let avgValueGrowth: number | null = null;

    // Revenue breakdown (index 6)
    const breakdownRaw = results[revenueBreakdownIdx] as any[];
    const revenueBreakdown = {
      weightCost: parseFloat(String(breakdownRaw[0]?.totalWeightCost)) || 0,
      serviceFee: parseFloat(String(breakdownRaw[0]?.totalServiceFee)) || 0,
      customsFees: parseFloat(String(breakdownRaw[0]?.totalCustomsFees)) || 0,
      specialItemRevenue: parseFloat(String(breakdownRaw[0]?.totalSpecialItemRevenue)) || 0,
      normalRevenue: parseFloat(String(breakdownRaw[0]?.totalNormalRevenue)) || 0,
      totalWeightLbs: parseFloat(String(breakdownRaw[0]?.totalWeightLbs)) || 0,
      totalQuantity: Number(breakdownRaw[0]?.totalQuantity) || 0,
    };

    if (dates.previous) {
      const prevRevenue = parseFloat(String(results[7][0]?.total)) || 0;
      const prevPackages = Number(results[8][0]?.count) || 0;
      const prevClients = Number(results[9][0]?.count) || 0;
      const prevCustoms = parseFloat(String(results[10][0]?.total)) || 0;
      const prevRequests = Number(results[11][0]?.count) || 0;
      const prevTransfers = Number(results[12][0]?.count) || 0;
      const prevAvgValue = prevPackages > 0 ? prevRevenue / prevPackages : 0;

      revenueGrowth = calcGrowth(curRevenue, prevRevenue);
      packagesGrowth = calcGrowth(curPackages, prevPackages);
      clientsGrowth = calcGrowth(curClients, prevClients);
      customsGrowth = calcGrowth(curCustoms, prevCustoms);
      requestsGrowth = calcGrowth(curRequests, prevRequests);
      transfersGrowth = calcGrowth(curTransfers, prevTransfers);
      avgValueGrowth = calcGrowth(avgPackageValue, prevAvgValue);
    }

    // Revenue trend
    const revenueTrend = (results[trendIdx] as any[]).map((r: any) => ({
      date: r.date,
      revenue: parseFloat(String(r.revenue)) || 0,
    }));

    // Packages trend
    const packagesTrend = (results[pkgTrendIdx] as any[]).map((r: any) => ({
      date: r.date,
      count: Number(r.count) || 0,
    }));

    // City distribution
    const cityRaw = results[cityIdx] as any[];
    const totalCityRevenue = cityRaw.reduce((s: number, c: any) => s + (parseFloat(String(c.revenue)) || 0), 0);
    const cityDistribution = cityRaw.map((c: any) => {
      const rev = parseFloat(String(c.revenue)) || 0;
      return {
        city: c.city || 'Non defini',
        count: Number(c.count) || 0,
        revenue: rev,
        percentage: totalCityRevenue > 0 ? Math.round((rev / totalCityRevenue) * 100) : 0,
      };
    });

    // Funnel
    const funnelRaw = results[funnelIdx] as any[];
    const statusOrder = ['pending', 'received', 'in-transit', 'available', 'delivered'];
    const funnelStages = statusOrder.map((s) => ({
      status: s,
      count: Number(funnelRaw.find((f: any) => f.status === s)?.count) || 0,
    }));

    // Stage timings
    const timingsRaw = results[timingsIdx] as any;
    const timingsRows = timingsRaw.rows || timingsRaw || [];
    const stageTimings = (timingsRows as any[]).map((t: any) => ({
      from: t.from_status,
      to: t.to_status,
      avgHours: parseFloat(String(t.avg_hours)) || 0,
      count: Number(t.cnt) || 0,
    }));

    // Special items
    const specialItems = (results[specialIdx] as any[]).map((si: any) => ({
      id: si.itemId,
      brand: si.brand,
      itemName: si.itemName,
      category: si.category,
      fixedFee: parseFloat(String(si.fixedFee)) || 0,
      count: Number(si.count) || 0,
      revenue: parseFloat(String(si.revenue)) || 0,
    }));

    const regularRaw = results[regularIdx] as any[];
    const regularPackagesData = {
      count: Number(regularRaw[0]?.count) || 0,
      revenue: parseFloat(String(regularRaw[0]?.revenue)) || 0,
    };

    // Admin performance
    const adminPerformance = (results[adminIdx] as any[]).map((a: any) => ({
      adminId: a.adminId,
      name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Admin',
      role: a.role,
      actions: Number(a.actionCount) || 0,
      packagesProcessed: Number(a.packagesProcessed) || 0,
    }));

    // Loyalty
    const loyaltyIssued = results[loyaltyIssuedIdx] as any[];
    const loyaltyRedeemed = results[loyaltyRedeemedIdx] as any[];
    const pointsCirc = results[pointsCircIdx] as any[];
    const topLoyaltyUsers = results[topLoyaltyIdx] as any[];

    const issuedAmount = parseFloat(String(loyaltyIssued[0]?.totalAmount)) || 0;
    const redeemedAmount = parseFloat(String(loyaltyRedeemed[0]?.totalAmount)) || 0;

    const loyalty = {
      issued: {
        amount: issuedAmount,
        points: Number(loyaltyIssued[0]?.totalPoints) || 0,
      },
      redeemed: {
        amount: redeemedAmount,
        points: Number(loyaltyRedeemed[0]?.totalPoints) || 0,
      },
      pointsInCirculation: Number(pointsCirc[0]?.totalPoints) || 0,
      programCost: issuedAmount - redeemedAmount,
      topUsers: topLoyaltyUsers.map((u: any) => ({
        userId: u.userId,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Utilisateur',
        points: Number(u.totalPoints) || 0,
        amount: parseFloat(String(u.totalAmount)) || 0,
      })),
    };

    // Transfers
    const transfersTrend = (results[transferTrendIdx] as any[]).map((t: any) => ({
      date: t.date,
      total: Number(t.total) || 0,
      userClaimed: Number(t.userClaimed) || 0,
      adminAssigned: Number(t.adminAssigned) || 0,
    }));

    const avgPriceDelta = parseFloat(String((results[priceDeltaIdx] as any[])[0]?.avgDelta)) || 0;

    const reqStatsRaw = results[reqStatsIdx] as any[];
    const reqTotal = reqStatsRaw.reduce((s: number, r: any) => s + (Number(r.count) || 0), 0);
    const reqApproved = Number(reqStatsRaw.find((r: any) => r.status === 'approved')?.count) || 0;
    const reqRejected = Number(reqStatsRaw.find((r: any) => r.status === 'rejected')?.count) || 0;
    const reqPending = Number(reqStatsRaw.find((r: any) => r.status === 'pending')?.count) || 0;
    const reqConverted = Number(reqStatsRaw.find((r: any) => r.status === 'converted')?.count) || 0;

    const transfersData = {
      trend: transfersTrend,
      avgPriceDelta: Number(avgPriceDelta.toFixed(2)),
      requestStats: {
        total: reqTotal,
        approved: reqApproved,
        rejected: reqRejected,
        pending: reqPending,
        converted: reqConverted,
        approvalRate: reqTotal > 0 ? Number(((reqApproved + reqConverted) / reqTotal * 100).toFixed(1)) : 0,
      },
    };

    // Top 10 clients
    const topClientsRaw = results[topClientsIdx] as any[];
    // Get loyalty points for top clients
    const clientUserIds = topClientsRaw.map((c: any) => c.userId).filter(Boolean);
    let clientLoyaltyMap = new Map<number, number>();
    if (clientUserIds.length > 0) {
      const clientLoyalty = await db
        .select({
          userId: loyaltyCredits.userId,
          totalPoints: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
        })
        .from(loyaltyCredits)
        .where(sql`${loyaltyCredits.userId} IN (${sql.join(clientUserIds.map((id: number) => sql`${id}`), sql`, `)})`)
        .groupBy(loyaltyCredits.userId);
      clientLoyaltyMap = new Map(clientLoyalty.map((cl) => [cl.userId, Number(cl.totalPoints)]));
    }

    const topClients = topClientsRaw.map((c: any) => ({
      userId: c.userId,
      clerkId: c.clerkId,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'N/A',
      email: c.email || '',
      city: c.city || 'N/A',
      packages: Number(c.packageCount) || 0,
      revenue: parseFloat(String(c.totalRevenue)) || 0,
      loyaltyPoints: clientLoyaltyMap.get(c.userId) || 0,
      lastPackage: c.lastPackageDate,
    }));

    // Delivery metrics
    const deliveryRaw = results[deliveryIdx] as any;
    const deliveryRows = deliveryRaw.rows || deliveryRaw || [];
    const dm = deliveryRows[0] || {};
    const deliveryMetrics = {
      avgReceivedToTransit: parseFloat(String(dm.avg_received_to_transit)) || 0,
      avgTransitToAvailable: parseFloat(String(dm.avg_transit_to_available)) || 0,
      avgAvailableToDelivered: parseFloat(String(dm.avg_available_to_delivered)) || 0,
      avgTotal: parseFloat(String(dm.avg_total)) || 0,
      deliveredCount: Number(dm.delivered_count) || 0,
    };

    // Payment methods
    const paymentRaw = results[paymentIdx] as any[];
    const totalPaymentRevenue = paymentRaw.reduce((s: number, p: any) => s + (parseFloat(String(p.revenue)) || 0), 0);
    const paymentMethods = paymentRaw.map((p: any) => {
      const rev = parseFloat(String(p.revenue)) || 0;
      return {
        method: p.method || 'Inconnu',
        count: Number(p.count) || 0,
        revenue: rev,
        percentage: totalPaymentRevenue > 0 ? Math.round((rev / totalPaymentRevenue) * 100) : 0,
      };
    });

    return NextResponse.json({
      range,
      period: { start: dates.current.start, end: dates.current.end },
      kpis: {
        revenue: { value: curRevenue, growth: revenueGrowth },
        packages: { value: curPackages, growth: packagesGrowth },
        clients: { value: curClients, growth: clientsGrowth },
        customsFees: { value: curCustoms, growth: customsGrowth },
        requests: { value: curRequests, growth: requestsGrowth },
        transfers: { value: curTransfers, growth: transfersGrowth },
        avgPackageValue: { value: Number(avgPackageValue.toFixed(2)), growth: avgValueGrowth },
      },
      revenueTrend,
      packagesTrend,
      cityDistribution,
      funnel: { stages: funnelStages, timings: stageTimings },
      specialItems,
      regularPackages: regularPackagesData,
      revenueBreakdown,
      adminPerformance,
      loyalty,
      transfersData,
      topClients,
      deliveryMetrics,
      paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
