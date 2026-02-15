import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, trackingHistory, users } from '@/lib/db/schema';
import { eq, or, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking = searchParams.get('tracking')?.trim();

    if (!tracking || tracking.length < 3) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const normalizedTracking = tracking.toLowerCase();

    // Find package by tracking number (internal or external)
    const [pkg] = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        status: packages.status,
        weight: packages.weight,
        currentLocation: packages.currentLocation,
        estimatedDelivery: packages.estimatedDelivery,
        createdAt: packages.createdAt,
        city: users.city,
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(
        or(
          sql`LOWER(${packages.trackingNumber}) = ${normalizedTracking}`,
          sql`LOWER(${packages.externalTrackingNumber}) = ${normalizedTracking}`
        )
      )
      .limit(1);

    if (!pkg) {
      return NextResponse.json(
        { found: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get tracking history
    const history = await db
      .select({
        status: trackingHistory.status,
        location: trackingHistory.location,
        description: trackingHistory.description,
        timestamp: trackingHistory.timestamp,
      })
      .from(trackingHistory)
      .where(eq(trackingHistory.packageId, pkg.id))
      .orderBy(desc(trackingHistory.timestamp));

    return NextResponse.json({
      found: true,
      package: {
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        weight: pkg.weight ? parseFloat(pkg.weight) : null,
        currentLocation: pkg.currentLocation,
        estimatedDelivery: pkg.estimatedDelivery?.toISOString() || null,
        city: pkg.city || null,
        createdAt: pkg.createdAt.toISOString(),
      },
      history: history.map(h => ({
        status: h.status,
        location: h.location,
        description: h.description,
        timestamp: h.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error tracking package:', error);
    return NextResponse.json(
      { error: 'Failed to track package' },
      { status: 500 }
    );
  }
}
