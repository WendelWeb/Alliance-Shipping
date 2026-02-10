import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests, users, packages } from '@/lib/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq, inArray, and, sql, ne } from 'drizzle-orm';
import { sendPackageRequestEmail } from '@/lib/email/service';
import { findUnclaimedPackage, autoTransferPackage, getAllianceShippingUserId } from '@/lib/utils/package-transfer';

// Resolve Clerk user → DB user (by clerkId first, then by email fallback + auto-sync)
async function resolveDbUser(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  // 1. Try by clerkId
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });
  if (dbUser) return dbUser;

  // 2. Fallback: try by any of the Clerk emails
  const emails = clerkUser.emailAddresses.map(e => e.emailAddress);
  if (emails.length > 0) {
    dbUser = await db.query.users.findFirst({
      where: inArray(users.email, emails),
    });
    if (dbUser) {
      // Auto-sync the clerkId so future lookups are fast
      await db.update(users)
        .set({ clerkId: clerkUser.id, updatedAt: new Date() })
        .where(eq(users.id, dbUser.id));
      return dbUser;
    }
  }

  // 3. User doesn't exist at all → create
  const primaryEmail = emails[0];
  if (!primaryEmail) return null;
  const [newUser] = await db.insert(users).values({
    clerkId: clerkUser.id,
    email: primaryEmail,
    firstName: clerkUser.firstName || null,
    lastName: clerkUser.lastName || null,
    phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
  }).returning();
  return newUser;
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await resolveDbUser(clerkUser);

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Could not resolve user account.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      externalTrackingNumber,
      description,
      customerNotes,
      category,
      specialItemId,
      locale,
    } = body;

    if (!externalTrackingNumber || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: externalTrackingNumber, description' },
        { status: 400 }
      );
    }

    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || dbUser.email;

    // Check for duplicate request from same user
    const [existingRequest] = await db
      .select()
      .from(packageRequests)
      .where(
        and(
          eq(packageRequests.userId, dbUser.id),
          sql`LOWER(${packageRequests.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`
        )
      )
      .limit(1);

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'Vous avez déjà fait une demande pour ce numéro de suivi.',
          conflictType: 'same_user',
          duplicate: true,
          existingRequest: {
            id: existingRequest.id,
            externalTrackingNumber: existingRequest.externalTrackingNumber,
            status: existingRequest.status,
            createdAt: existingRequest.createdAt,
          },
        },
        { status: 409 }
      );
    }

    // Check if ANOTHER user has already made a request for this tracking number
    const [otherUserRequest] = await db
      .select()
      .from(packageRequests)
      .where(
        and(
          ne(packageRequests.userId, dbUser.id),
          sql`LOWER(${packageRequests.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`
        )
      )
      .limit(1);

    if (otherUserRequest) {
      return NextResponse.json(
        {
          error: 'Un autre utilisateur a déjà fait une demande pour ce numéro de suivi.',
          conflictType: 'other_user_request',
          duplicate: true,
        },
        { status: 409 }
      );
    }

    // Check if package already belongs to another user (not Alliance Shipping)
    const asUserId = await getAllianceShippingUserId();
    if (asUserId) {
      const [existingPackage] = await db
        .select()
        .from(packages)
        .where(
          and(
            ne(packages.userId, asUserId),
            sql`LOWER(${packages.externalTrackingNumber}) = LOWER(${externalTrackingNumber.trim()})`
          )
        )
        .limit(1);

      if (existingPackage) {
        return NextResponse.json(
          {
            error: 'Ce colis appartient déjà à un autre utilisateur.',
            conflictType: 'package_claimed',
            duplicate: true,
          },
          { status: 409 }
        );
      }
    }

    // Create the package request
    const [packageRequest] = await db.insert(packageRequests).values({
      userId: dbUser.id,
      externalTrackingNumber: externalTrackingNumber.trim(),
      description: description.trim(),
      customerNotes: customerNotes?.trim() || null,
      estimatedWeight: null,
      category: category || 'general',
      specialItemId: specialItemId || null,
      status: 'pending',
    }).returning();

    // Check if there's an unclaimed package matching this tracking number
    const unclaimedPackage = await findUnclaimedPackage(externalTrackingNumber.trim());

    if (unclaimedPackage) {
      // Auto-transfer the package to this user
      const transferResult = await autoTransferPackage({
        packageId: unclaimedPackage.id,
        newUserId: dbUser.id,
        requestId: packageRequest.id,
      });

      if (transferResult.success) {
        console.log('[PACKAGE-REQUEST] Auto-transfer successful:', transferResult.trackingNumber, '→', userName);
        return NextResponse.json({
          success: true,
          autoTransferred: true,
          packageRequest: {
            id: packageRequest.id,
            externalTrackingNumber: packageRequest.externalTrackingNumber,
            status: 'approved',
          },
          package: {
            trackingNumber: transferResult.trackingNumber,
            status: unclaimedPackage.status,
          },
        });
      }
    }

    // No match found - send confirmation email for pending request
    let emailResult: any = null;
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    const emailLocale = locale || dbUser.preferredLanguage || 'fr';
    console.log('[PACKAGE-REQUEST] User:', userEmail, '| Name:', userName, '| Tracking:', packageRequest.externalTrackingNumber, '| Locale:', emailLocale);
    if (userEmail) {
      try {
        emailResult = await sendPackageRequestEmail(
          userEmail,
          userName,
          packageRequest.externalTrackingNumber,
          emailLocale
        );
      } catch (error: any) {
        console.error('[PACKAGE-REQUEST] Email exception:', error);
        emailResult = { success: false, error: error?.message || 'Unknown error' };
      }
    }

    return NextResponse.json({
      success: true,
      autoTransferred: false,
      packageRequest: {
        id: packageRequest.id,
        externalTrackingNumber: packageRequest.externalTrackingNumber,
        status: packageRequest.status,
      },
      email: {
        sent: emailResult?.success || false,
        to: userEmail || null,
        error: emailResult?.error || null,
        id: emailResult?.data?.id || null,
      },
    });

  } catch (error) {
    console.error('Error creating package request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await resolveDbUser(clerkUser);

    if (!dbUser) {
      return NextResponse.json({ success: true, requests: [] });
    }

    const requests = await db.query.packageRequests.findMany({
      where: (packageRequests, { eq }) => eq(packageRequests.userId, dbUser.id),
      orderBy: (packageRequests, { desc }) => [desc(packageRequests.createdAt)],
    });

    return NextResponse.json({
      success: true,
      requests,
    });

  } catch (error) {
    console.error('Error fetching package requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
