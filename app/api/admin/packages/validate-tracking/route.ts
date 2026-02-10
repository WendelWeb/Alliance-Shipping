import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { db } from '@/lib/db';
import { packages, packageRequests, users } from '@/lib/db/schema';
import { eq, sql, or } from 'drizzle-orm';

/**
 * GET /api/admin/packages/validate-tracking?tracking={number}
 *
 * Valide un numéro de tracking et retourne les infos de transfert potentiel
 * - Vérifie si le tracking existe déjà dans packages
 * - Vérifie si une requête pendante existe
 * - Retourne les infos du user pour transfert automatique
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const trackingNumber = searchParams.get('tracking');

    if (!trackingNumber || trackingNumber.trim().length < 3) {
      return NextResponse.json({
        error: 'Tracking number required',
        exists: false,
      }, { status: 400 });
    }

    const normalizedTracking = trackingNumber.trim().toLowerCase();

    // Check if package already exists
    const [existingPackage] = await db
      .select({
        id: packages.id,
        trackingNumber: packages.trackingNumber,
        externalTrackingNumber: packages.externalTrackingNumber,
        status: packages.status,
        userId: packages.userId,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        userEmail: users.email,
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

    if (existingPackage) {
      return NextResponse.json({
        exists: true,
        type: 'package',
        package: existingPackage,
        message: 'Ce tracking number existe déjà dans le système',
        canTransfer: false,
      });
    }

    // Check if there's a pending package request
    const [pendingRequest] = await db
      .select({
        id: packageRequests.id,
        externalTrackingNumber: packageRequests.externalTrackingNumber,
        status: packageRequests.status,
        userId: packageRequests.userId,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        userEmail: users.email,
        userPhone: users.phone,
        userCity: users.city,
        description: packageRequests.description,
        category: packageRequests.category,
        createdAt: packageRequests.createdAt,
      })
      .from(packageRequests)
      .leftJoin(users, eq(packageRequests.userId, users.id))
      .where(
        sql`LOWER(${packageRequests.externalTrackingNumber}) = ${normalizedTracking}`
      )
      .limit(1);

    if (pendingRequest) {
      return NextResponse.json({
        exists: true,
        type: 'request',
        request: pendingRequest,
        message: pendingRequest.status === 'pending'
          ? 'Un utilisateur a déjà fait une requête pour ce tracking (non confirmée)'
          : 'Une requête existe pour ce tracking',
        canTransfer: pendingRequest.status === 'pending', // Can transfer if still pending
        transferInfo: pendingRequest.status === 'pending' ? {
          userId: pendingRequest.userId,
          userName: pendingRequest.userName,
          userEmail: pendingRequest.userEmail,
          userPhone: pendingRequest.userPhone,
          userCity: pendingRequest.userCity,
          description: pendingRequest.description,
          category: pendingRequest.category,
        } : null,
      });
    }

    // Tracking doesn't exist - all good
    return NextResponse.json({
      exists: false,
      message: 'Ce tracking number est disponible',
      canCreate: true,
    });

  } catch (error) {
    console.error('Error validating tracking:', error);
    return NextResponse.json(
      { error: 'Failed to validate tracking number' },
      { status: 500 }
    );
  }
}
