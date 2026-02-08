import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, or } from 'drizzle-orm';

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
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
          phone: null, // Force user to enter phone through PhoneNumberModal
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        countryCode: user.countryCode,
        city: user.city,
        warehouseId: user.warehouseId,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, countryCode, city, warehouseId } = body;

    // Find user in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Clerk user for email and name
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
    const userName = clerkUser?.firstName || user.firstName || 'User';

    // Track warehouse change for email notification
    let warehouseChanged = false;
    let previousWarehouse: any = null;
    let newWarehouse: any = null;

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (phone !== undefined) {
      // Validate phone number (must start with + and have digits)
      if (phone && !/^\+\d{6,15}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Must start with + and country code (e.g., +50912345678)' },
          { status: 400 }
        );
      }
      updateData.phone = phone;
    }

    if (countryCode !== undefined) {
      updateData.countryCode = countryCode;
    }

    if (city !== undefined) {
      updateData.city = city;
    }

    if (warehouseId !== undefined) {
      const { warehouses } = await import('@/lib/db/schema');

      // Check if warehouse actually changed
      if (warehouseId !== user.warehouseId) {
        warehouseChanged = true;

        // Get previous warehouse details if exists
        if (user.warehouseId) {
          [previousWarehouse] = await db
            .select()
            .from(warehouses)
            .where(eq(warehouses.id, user.warehouseId))
            .limit(1);
        }

        // Validate and get new warehouse details if provided
        if (warehouseId !== null) {
          [newWarehouse] = await db
            .select()
            .from(warehouses)
            .where(eq(warehouses.id, parseInt(warehouseId)))
            .limit(1);

          if (!newWarehouse) {
            return NextResponse.json(
              { error: 'Invalid warehouse ID' },
              { status: 400 }
            );
          }
        }
      }

      updateData.warehouseId = warehouseId;
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    // Send warehouse change email notification
    if (warehouseChanged && previousWarehouse && newWarehouse && userEmail) {
      try {
        const { sendWarehouseChangeEmail } = await import('@/lib/email/service');
        await sendWarehouseChangeEmail(
          userEmail,
          userName,
          {
            name: previousWarehouse.name,
            city: previousWarehouse.city,
          },
          {
            name: newWarehouse.name,
            city: newWarehouse.city,
            address: newWarehouse.address,
            phone: newWarehouse.phone || undefined,
            openingHours: newWarehouse.openingHours || undefined,
            latitude: newWarehouse.latitude,
            longitude: newWarehouse.longitude,
          },
          user.preferredLanguage || 'fr'
        );
        console.log('✅ Warehouse change email sent to:', userEmail);
      } catch (emailError) {
        console.error('❌ Failed to send warehouse change email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        countryCode: updatedUser.countryCode,
        city: updatedUser.city,
        warehouseId: updatedUser.warehouseId,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
