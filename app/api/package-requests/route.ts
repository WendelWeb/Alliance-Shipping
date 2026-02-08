import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests, users } from '@/lib/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq, inArray } from 'drizzle-orm';
import { sendPackageRequestEmail } from '@/lib/email/service';

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
      recipientCity,
      description,
      customerNotes,
      category,
      locale,
    } = body;

    if (!externalTrackingNumber || !recipientCity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: externalTrackingNumber, recipientCity, description' },
        { status: 400 }
      );
    }

    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || dbUser.email;

    const [packageRequest] = await db.insert(packageRequests).values({
      userId: dbUser.id,
      externalTrackingNumber: externalTrackingNumber.trim(),
      receiptLocation: 'Miami Warehouse',
      description: description.trim(),
      customerNotes: customerNotes?.trim() || null,
      estimatedWeight: null,
      category: category || 'general',
      senderInfo: {
        name: '',
        address: '',
        city: '',
        country: 'USA',
      },
      recipientInfo: {
        name: userName,
        address: '',
        city: recipientCity.trim(),
        country: 'Haiti',
        phone: dbUser.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
      },
      status: 'pending',
    }).returning();

    // Send confirmation email in user's language
    let emailResult: any = null;
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    // Use locale from request, fallback to user's preferred language, then default to 'fr'
    const emailLocale = locale || dbUser.preferredLanguage || 'fr';
    console.log('[PACKAGE-REQUEST] User:', userEmail, '| Name:', userName, '| Tracking:', packageRequest.externalTrackingNumber, '| Locale:', emailLocale);
    if (userEmail) {
      try {
        console.log('[PACKAGE-REQUEST] Sending email to:', userEmail);
        emailResult = await sendPackageRequestEmail(
          userEmail,
          userName,
          packageRequest.externalTrackingNumber,
          emailLocale
        );
        console.log('[PACKAGE-REQUEST] Email result:', JSON.stringify(emailResult));
      } catch (error: any) {
        console.error('[PACKAGE-REQUEST] Email exception:', error);
        emailResult = { success: false, error: error?.message || 'Unknown error' };
      }
    } else {
      console.warn('[PACKAGE-REQUEST] No email found for user');
    }

    return NextResponse.json({
      success: true,
      packageRequest: {
        id: packageRequest.id,
        externalTrackingNumber: packageRequest.externalTrackingNumber,
        receiptLocation: packageRequest.receiptLocation,
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
