import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, revenueRecords } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { sql, eq, gte, and, desc } from 'drizzle-orm';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || 'month'; // week, month, year

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // 1. Total Revenue
    const [revenueData] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${packages.totalFee}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(packages)
      .where(
        and(
          gte(packages.createdAt, startDate),
          eq(packages.status, 'delivered')
        )
      );

    // 2. Total Packages by Status
    const packagesByStatus = await db
      .select({
        status: packages.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(packages)
      .where(gte(packages.createdAt, startDate))
      .groupBy(packages.status);

    // 3. Total Users
    const [usersData] = await db
      .select({
        totalUsers: sql<number>`COUNT(*)`,
      })
      .from(users);

    // 4. Average Order Value
    const averageOrderValue =
      revenueData.count > 0 ? revenueData.totalRevenue / revenueData.count : 0;

    // 5. Monthly Revenue (last 4 months)
    const monthlyRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${packages.createdAt}, 'Mon')`,
        revenue: sql<number>`COALESCE(SUM(${packages.totalFee}), 0)`,
        packages: sql<number>`COUNT(*)`,
      })
      .from(packages)
      .where(
        and(
          gte(packages.createdAt, new Date(now.getFullYear(), now.getMonth() - 3, 1)),
          eq(packages.status, 'delivered')
        )
      )
      .groupBy(sql`TO_CHAR(${packages.createdAt}, 'Mon')`)
      .orderBy(sql`MIN(${packages.createdAt})`);

    // 6. Revenue by Destination
    const revenueByDestination = await db
      .select({
        destination: packages.destination,
        packages: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${packages.totalFee}), 0)`,
      })
      .from(packages)
      .where(
        and(
          gte(packages.createdAt, startDate),
          eq(packages.status, 'delivered')
        )
      )
      .groupBy(packages.destination);

    // Calculate percentages for destinations
    const totalDestinationRevenue = revenueByDestination.reduce(
      (sum, dest) => sum + Number(dest.revenue),
      0
    );
    const destinationsWithPercentage = revenueByDestination.map((dest) => ({
      ...dest,
      percentage: totalDestinationRevenue > 0
        ? Math.round((Number(dest.revenue) / totalDestinationRevenue) * 100)
        : 0,
    }));

    // 7. Top 5 Customers
    const topCustomers = await db
      .select({
        userId: packages.userId,
        packages: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${packages.totalFee}), 0)`,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(
        and(
          gte(packages.createdAt, startDate),
          eq(packages.status, 'delivered')
        )
      )
      .groupBy(packages.userId, users.id, users.firstName, users.lastName, users.email)
      .orderBy(desc(sql<number>`COALESCE(SUM(${packages.totalFee}), 0)`))
      .limit(5);

    // Format top customers
    const formattedTopCustomers = topCustomers.map((customer) => ({
      id: customer.userId,
      name: `${customer.user?.firstName || ''} ${customer.user?.lastName || ''}`.trim(),
      packages: Number(customer.packages),
      revenue: Number(customer.revenue),
    }));

    // 8. Payment Methods (from revenue_records)
    const paymentMethods = await db
      .select({
        method: revenueRecords.paymentMethod,
        count: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${revenueRecords.amount}), 0)`,
      })
      .from(revenueRecords)
      .groupBy(revenueRecords.paymentMethod);

    // Calculate percentages for payment methods
    const totalPaymentRevenue = paymentMethods.reduce(
      (sum, method) => sum + Number(method.revenue),
      0
    );
    const paymentMethodsWithPercentage = paymentMethods.map((method) => ({
      method: method.method || 'Unknown',
      count: Number(method.count),
      revenue: Number(method.revenue),
      percentage: totalPaymentRevenue > 0
        ? Math.round((Number(method.revenue) / totalPaymentRevenue) * 100)
        : 0,
    }));

    // Calculate growth percentages (simplified - comparing to previous period)
    const analytics = {
      totalRevenue: Number(revenueData.totalRevenue),
      totalPackages: Number(revenueData.count),
      totalCustomers: Number(usersData.totalUsers),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      revenueGrowth: 12.5, // Mock - would calculate from previous period
      packageGrowth: 8.2, // Mock
      customerGrowth: 15.3, // Mock
      monthlyRevenue: monthlyRevenue.map((m) => ({
        month: m.month,
        revenue: Number(m.revenue),
        packages: Number(m.packages),
      })),
      revenueByDestination: destinationsWithPercentage,
      topCustomers: formattedTopCustomers,
      paymentMethods: paymentMethodsWithPercentage,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
