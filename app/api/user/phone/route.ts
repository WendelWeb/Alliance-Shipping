import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

// PATCH - Update user's phone number
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, countryCode, city } = body;

    if (!phone || !countryCode) {
      return NextResponse.json(
        { error: 'Phone and country code are required' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\d{6,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Find user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update phone number (and optionally city)
    const updateData: any = {
      phone,
      countryCode,
      updatedAt: new Date(),
    };

    if (city) {
      updateData.city = city;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      phone: updatedUser.phone,
      countryCode: updatedUser.countryCode,
      city: updatedUser.city,
    });
  } catch (error) {
    console.error('Error updating phone:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}
