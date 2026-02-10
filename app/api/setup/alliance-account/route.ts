import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Create Alliance Shipping system account
export async function POST() {
  try {
    const asEmail = 'allianceshipping26@gmail.com';

    // Check if account already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, asEmail),
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        message: `Alliance Shipping account already exists (ID: ${existing.id})`,
        userId: existing.id,
      });
    }

    // Create the account
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: `system_alliance_${Date.now()}`,
        email: asEmail,
        firstName: 'Alliance',
        lastName: 'Shipping',
        phone: '+509-0000-0000',
      })
      .returning();

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      message: `Alliance Shipping system account created successfully (ID: ${newUser.id})`,
      userId: newUser.id,
    });
  } catch (error: any) {
    console.error('Error creating Alliance Shipping account:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
