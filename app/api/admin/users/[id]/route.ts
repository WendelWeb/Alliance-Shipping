import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, packages, trackingHistory, notifications, packageRequests, loyaltyCredits } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, count, sum, sql } from 'drizzle-orm';

// GET - Get a specific user's full profile + packages + loyalty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clerkId } = await params;

    // Get user from Clerk
    const client = await clerkClient();
    let clerkUser;
    try {
      clerkUser = await client.users.getUser(clerkId);
    } catch {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    // Find user in local DB with warehouse info
    const { warehouses } = await import('@/lib/db/schema');
    const dbUserResults = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        phone: users.phone,
        whatsappPhone: users.whatsappPhone,
        city: users.city,
        warehouseId: users.warehouseId,
        warehouseName: warehouses.name,
        preferredLanguage: users.preferredLanguage,
      })
      .from(users)
      .leftJoin(warehouses, eq(users.warehouseId, warehouses.id))
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    const dbUser = dbUserResults[0] || null;

    // Build user info
    const userInfo = {
      id: clerkUser.id,
      dbId: dbUser?.id || null,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'N/A',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || dbUser?.phone || '',
      whatsappPhone: dbUser?.whatsappPhone || null,
      city: dbUser?.city || null,
      warehouseId: dbUser?.warehouseId || null,
      warehouseName: dbUser?.warehouseName || null,
      imageUrl: clerkUser.imageUrl || null,
      status: clerkUser.banned ? 'banned' : 'active',
      createdAt: clerkUser.createdAt,
      lastSignInAt: clerkUser.lastSignInAt,
      joinedAt: new Date(clerkUser.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      preferredLanguage: dbUser?.preferredLanguage || 'fr',
    };

    // Get user's packages with tracking history
    let userPackages: any[] = [];
    let userRequests: any[] = [];
    let stats = { packageCount: 0, totalSpent: 0 };
    let loyalty = {
      creditBalance: 0,
      totalCreditsEarned: 0,
      totalCreditsRedeemed: 0,
      pointsBalance: 0,
      totalPointsEarned: 0,
      totalPointsUsed: 0,
      transactionCount: 0,
      recentTransactions: [] as any[],
    };

    if (dbUser) {
      // Get packages
      userPackages = await db
        .select({
          id: packages.id,
          trackingNumber: packages.trackingNumber,
          externalTrackingNumber: packages.externalTrackingNumber,
          description: packages.description,
          weight: packages.weight,
          weightUnit: packages.weightUnit,
          category: packages.category,
          serviceFee: packages.serviceFee,
          weightCost: packages.weightCost,
          totalCost: packages.totalCost,
          currency: packages.currency,
          status: packages.status,
          currentLocation: packages.currentLocation,
          estimatedDelivery: packages.estimatedDelivery,
          actualDelivery: packages.actualDelivery,
          deliveryBundleId: packages.deliveryBundleId,
          priority: packages.priority,
          createdAt: packages.createdAt,
          updatedAt: packages.updatedAt,
        })
        .from(packages)
        .where(eq(packages.userId, dbUser.id))
        .orderBy(desc(packages.createdAt));

      // Get tracking history for each package
      for (const pkg of userPackages) {
        const history = await db
          .select()
          .from(trackingHistory)
          .where(eq(trackingHistory.packageId, pkg.id))
          .orderBy(desc(trackingHistory.timestamp));
        pkg.timeline = history;
      }

      // Get package requests
      userRequests = await db
        .select()
        .from(packageRequests)
        .where(eq(packageRequests.userId, dbUser.id))
        .orderBy(desc(packageRequests.createdAt));

      // Compute stats
      const [statsResult] = await db
        .select({
          count: count(packages.id),
          total: sum(packages.totalCost),
        })
        .from(packages)
        .where(eq(packages.userId, dbUser.id));

      stats = {
        packageCount: Number(statsResult.count) || 0,
        totalSpent: statsResult.total ? parseFloat(statsResult.total) : 0,
      };

      // Get loyalty summary
      const [loyaltySummary] = await db
        .select({
          totalCreditsEarned: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} > 0 THEN ${loyaltyCredits.amount} ELSE 0 END), 0)`,
          totalCreditsRedeemed: sql<string>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.amount} < 0 THEN ABS(${loyaltyCredits.amount}) ELSE 0 END), 0)`,
          creditBalance: sql<string>`COALESCE(SUM(${loyaltyCredits.amount}), 0)`,
          totalPointsEarned: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} > 0 THEN ${loyaltyCredits.points} ELSE 0 END), 0)`,
          totalPointsUsed: sql<number>`COALESCE(SUM(CASE WHEN ${loyaltyCredits.points} < 0 THEN ABS(${loyaltyCredits.points}) ELSE 0 END), 0)`,
          pointsBalance: sql<number>`COALESCE(SUM(${loyaltyCredits.points}), 0)`,
          transactionCount: count(loyaltyCredits.id),
        })
        .from(loyaltyCredits)
        .where(eq(loyaltyCredits.userId, dbUser.id));

      if (loyaltySummary) {
        loyalty = {
          creditBalance: parseFloat(String(loyaltySummary.creditBalance)) || 0,
          totalCreditsEarned: parseFloat(String(loyaltySummary.totalCreditsEarned)) || 0,
          totalCreditsRedeemed: parseFloat(String(loyaltySummary.totalCreditsRedeemed)) || 0,
          pointsBalance: Number(loyaltySummary.pointsBalance) || 0,
          totalPointsEarned: Number(loyaltySummary.totalPointsEarned) || 0,
          totalPointsUsed: Number(loyaltySummary.totalPointsUsed) || 0,
          transactionCount: Number(loyaltySummary.transactionCount) || 0,
          recentTransactions: [],
        };
      }

      // Get recent transactions (last 20)
      const txns = await db
        .select({
          id: loyaltyCredits.id,
          amount: loyaltyCredits.amount,
          points: loyaltyCredits.points,
          type: loyaltyCredits.type,
          description: loyaltyCredits.description,
          createdAt: loyaltyCredits.createdAt,
        })
        .from(loyaltyCredits)
        .where(eq(loyaltyCredits.userId, dbUser.id))
        .orderBy(desc(loyaltyCredits.createdAt))
        .limit(20);

      loyalty.recentTransactions = txns.map((tx) => ({
        id: tx.id,
        amount: parseFloat(String(tx.amount)),
        points: tx.points,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      }));

      // Get user notifications
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, dbUser.id))
        .orderBy(desc(notifications.createdAt))
        .limit(20);

      return NextResponse.json({
        user: userInfo,
        packages: userPackages,
        requests: userRequests,
        notifications: userNotifications,
        stats,
        loyalty,
      });
    }

    return NextResponse.json({
      user: userInfo,
      packages: [],
      requests: [],
      notifications: [],
      stats,
      loyalty,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
