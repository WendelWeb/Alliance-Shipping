import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth/admin';

// GET - Check user phone status
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        countryCode: users.countryCode,
        city: users.city,
        warehouseId: users.warehouseId,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasPhone = !!user.phone;
    const hasValidPhone = hasPhone && user.phone!.startsWith('+');
    const hasCity = !!user.city;
    const hasWarehouse = !!user.warehouseId;
    const isBlocked = !hasValidPhone || !hasCity || !hasWarehouse;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone || 'NULL',
        countryCode: user.countryCode || 'NULL',
        city: user.city || 'NULL',
        warehouseId: user.warehouseId || 'NULL',
      },
      status: {
        isBlocked,
        hasValidPhone,
        hasCity,
        hasWarehouse,
      },
      message: isBlocked
        ? '🚫 This user is BLOCKED and will see the phone modal'
        : '✅ This user has all required info and can access the app',
    });
  } catch (error) {
    console.error('Error checking user phone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Reset user phone to force modal
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset phone and country code
    const [updated] = await db
      .update(users)
      .set({
        phone: null,
        countryCode: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        phone: users.phone,
        countryCode: users.countryCode,
        city: users.city,
        warehouseId: users.warehouseId,
      });

    return NextResponse.json({
      success: true,
      message: '✅ Phone reset successfully! User will be blocked until they complete the modal.',
      before: {
        phone: user.phone || 'NULL',
        countryCode: user.countryCode || 'NULL',
      },
      after: {
        phone: updated.phone || 'NULL',
        countryCode: updated.countryCode || 'NULL',
        city: updated.city || 'NULL',
        warehouseId: updated.warehouseId || 'NULL',
      },
    });
  } catch (error) {
    console.error('Error resetting user phone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
