import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, cityPricing } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, sql } from 'drizzle-orm';

// GET - List potential bundles (users with 2+ available packages)
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all available packages grouped by user
    const availablePackages = await db
      .select({
        pkg: packages,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          city: users.city,
          warehouseId: users.warehouseId,
        },
      })
      .from(packages)
      .leftJoin(users, eq(packages.userId, users.id))
      .where(eq(packages.status, 'available'));

    // Group by userId
    const groupedByUser: Record<number, {
      userId: number;
      userName: string;
      userEmail: string;
      userPhone: string;
      city: string;
      packages: typeof availablePackages;
      potentialSavings: number;
    }> = {};

    for (const item of availablePackages) {
      const uid = item.pkg.userId;
      if (!groupedByUser[uid]) {
        const userName = item.user
          ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim()
          : 'Unknown';
        groupedByUser[uid] = {
          userId: uid,
          userName: userName || 'Unknown',
          userEmail: item.user?.email || '',
          userPhone: item.user?.phone || '',
          city: item.user?.city || '',
          packages: [],
          potentialSavings: 0,
        };
      }
      groupedByUser[uid].packages.push(item);
    }

    // Filter to users with 2+ packages and calculate savings
    const bundles = [];
    for (const group of Object.values(groupedByUser)) {
      if (group.packages.length < 2) continue;

      // Calculate potential savings: (N-1) * serviceFee
      const serviceFees = group.packages.map(p => parseFloat(String(p.pkg.serviceFee)) || 0);
      // Sort descending so the biggest fee is kept
      serviceFees.sort((a, b) => b - a);
      // Savings = sum of all fees except the first (biggest)
      const savings = serviceFees.slice(1).reduce((sum, fee) => sum + fee, 0);

      bundles.push({
        userId: group.userId,
        userName: group.userName,
        userEmail: group.userEmail,
        userPhone: group.userPhone,
        city: group.city,
        packageCount: group.packages.length,
        packages: group.packages.map(p => ({
          id: p.pkg.id,
          trackingNumber: p.pkg.trackingNumber,
          weight: p.pkg.weight,
          serviceFee: p.pkg.serviceFee,
          weightCost: p.pkg.weightCost,
          customsFees: p.pkg.customsFees,
          totalCost: p.pkg.totalCost,
          quantity: p.pkg.quantity,
          description: p.pkg.description,
          createdAt: p.pkg.createdAt,
        })),
        potentialSavings: savings,
        totalCost: group.packages.reduce((sum, p) => sum + (parseFloat(String(p.pkg.totalCost)) || 0), 0),
        bundleCost: group.packages.reduce((sum, p) => sum + (parseFloat(String(p.pkg.totalCost)) || 0), 0) - savings,
      });
    }

    // Sort by most packages first
    bundles.sort((a, b) => b.packageCount - a.packageCount);

    return NextResponse.json({
      success: true,
      bundles,
      totalPotentialBundles: bundles.length,
      totalPotentialSavings: bundles.reduce((sum, b) => sum + b.potentialSavings, 0),
    });
  } catch (error) {
    console.error('Error fetching potential bundles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch potential bundles' },
      { status: 500 }
    );
  }
}
