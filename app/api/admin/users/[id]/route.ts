import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, packages, trackingHistory, notifications, packageRequests } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, and, count, sum } from 'drizzle-orm';

// GET - Get a specific user's full profile + packages
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

    // Find user in local DB
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    // Build user info
    const userInfo = {
      id: clerkUser.id,
      dbId: dbUser?.id || null,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'N/A',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || dbUser?.phone || '',
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
      });
    }

    return NextResponse.json({
      user: userInfo,
      packages: [],
      requests: [],
      notifications: [],
      stats,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
