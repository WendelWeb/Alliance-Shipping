import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, trackingHistory, packageRequests } from '@/lib/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, desc, or } from 'drizzle-orm';

// GET - Get packages for current user
export async function GET(request: NextRequest) {
  try {
    // Get current user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get full user info from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    // Find user in DB by clerkId OR email (fallback)
    let [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.clerkId, clerkUserId),
          userEmail ? eq(users.email, userEmail) : undefined
        )
      )
      .limit(1);

    // If user doesn't exist, create them
    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: clerkUserId,
          email: userEmail || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
        })
        .returning();

      user = newUser;
    } else if (user.clerkId !== clerkUserId) {
      // Update the clerkId if user was found by email but has wrong clerkId
      [user] = await db
        .update(users)
        .set({
          clerkId: clerkUserId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
    }

    // Get user's packages with tracking history
    const userPackages = await db
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
        createdAt: packages.createdAt,
        updatedAt: packages.updatedAt,
      })
      .from(packages)
      .where(eq(packages.userId, user.id))
      .orderBy(desc(packages.createdAt));

    // Get tracking history for each package
    const packagesWithHistory = await Promise.all(
      userPackages.map(async (pkg) => {
        const history = await db
          .select()
          .from(trackingHistory)
          .where(eq(trackingHistory.packageId, pkg.id))
          .orderBy(trackingHistory.timestamp);

        return {
          ...pkg,
          timeline: history.map(h => ({
            status: h.status,
            location: h.location,
            description: h.description,
            date: h.timestamp.toISOString(),
          })),
        };
      })
    );

    // Get user's package requests (even if not yet approved)
    const userRequests = await db
      .select({
        id: packageRequests.id,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        description: packageRequests.description,
        estimatedWeight: packageRequests.estimatedWeight,
        category: packageRequests.category,
        status: packageRequests.status,
        createdAt: packageRequests.createdAt,
        updatedAt: packageRequests.updatedAt,
      })
      .from(packageRequests)
      .where(eq(packageRequests.userId, user.id))
      .orderBy(desc(packageRequests.createdAt));

    // Only show pending and rejected requests (approved ones already exist in packages table)
    const filteredRequests = userRequests.filter(req => req.status !== 'approved');

    // Transform package requests to match package format
    const transformedRequests = filteredRequests.map(req => {
      // Build timeline based on status
      const timeline: any[] = [
        {
          status: 'packages.timeline.requestSubmitted',
          location: 'packages.timeline.online',
          description: 'packages.messages.requestCreated',
          descriptionData: { tracking: req.externalTrackingNumber || 'N/A' },
          date: req.createdAt.toISOString(),
        },
      ];

      // Add current status to timeline
      if (req.status === 'pending') {
        timeline.push({
          status: 'packages.timeline.pendingReview',
          location: 'packages.timeline.allianceShipping',
          description: 'packages.messages.requestPending',
          date: req.updatedAt.toISOString(),
          pending: true,
        });
      } else if (req.status === 'rejected') {
        timeline.push({
          status: 'packages.timeline.requestRejected',
          location: 'packages.timeline.allianceShipping',
          description: 'packages.messages.requestRejected',
          date: req.updatedAt.toISOString(),
        });
      }

      return {
        id: -req.id, // Negative ID to distinguish from real packages
        trackingNumber: req.externalTrackingNumber || `REQ-${req.id}`,
        externalTrackingNumber: req.externalTrackingNumber,
        description: req.description,
        weight: req.estimatedWeight || '0',
        weightUnit: 'lbs',
        category: req.category,
        serviceFee: '0.00',
        weightCost: '0.00',
        totalCost: '0.00',
        currency: 'USD',
        status: req.status === 'pending' ? 'pending' : 'rejected',
        currentLocation: req.status === 'pending'
          ? 'packages.messages.pendingApproval'
          : 'packages.status.rejected',
        estimatedDelivery: null,
        actualDelivery: null,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        timeline,
      };
    });

    // Combine packages and requests
    const allItems = [...packagesWithHistory, ...transformedRequests];

    return NextResponse.json({
      success: true,
      packages: allItems,
    });
  } catch (error) {
    console.error('Error fetching user packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
