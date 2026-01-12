import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packageRequests } from '@/lib/db/schema';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      externalTrackingNumber,
      recipientCity,
      description,
      customerNotes,
      estimatedWeight,
      category,
    } = body;

    // Validation
    if (!externalTrackingNumber || !recipientCity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: externalTrackingNumber, recipientCity, description' },
        { status: 400 }
      );
    }

    // TODO: Get userId from database based on clerkId
    // For now, using a placeholder
    const userId = 1; // Replace with actual user lookup

    // Create package request - User is the recipient
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';

    const [packageRequest] = await db.insert(packageRequests).values({
      userId,
      externalTrackingNumber: externalTrackingNumber.trim(),
      receiptLocation: 'Miami Warehouse', // All packages received at Miami Warehouse
      description: description.trim(),
      customerNotes: `Destinataire: ${userName}`,
      estimatedWeight: estimatedWeight ? parseFloat(estimatedWeight).toString() : null,
      category: category || 'general',
      senderInfo: {
        name: '', // Will be filled by admin
        address: '',
        city: '',
        country: 'USA',
      },
      recipientInfo: {
        name: userName,
        address: '',
        city: recipientCity.trim(),
        country: 'Haiti',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
      },
      status: 'pending',
    }).returning();

    // TODO: Send notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      packageRequest: {
        id: packageRequest.id,
        externalTrackingNumber: packageRequest.externalTrackingNumber,
        receiptLocation: packageRequest.receiptLocation,
        status: packageRequest.status,
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

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Get userId from database based on clerkId
    const userId = 1;

    // Get user's package requests
    const requests = await db.query.packageRequests.findMany({
      where: (packageRequests, { eq }) => eq(packageRequests.userId, userId),
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
