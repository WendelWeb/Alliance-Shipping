import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getAllianceShippingUserId, ALLIANCE_SHIPPING_EMAIL } from '@/lib/utils/package-transfer';

export async function GET() {
  try {
    // Method 1: Using the utility function
    const utilityResult = await getAllianceShippingUserId();

    // Method 2: Direct query
    const [directResult] = await db
      .select({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.email, ALLIANCE_SHIPPING_EMAIL))
      .limit(1);

    // Method 3: Query all users with "alliance" in email
    const similarUsers = await db
      .select({ id: users.id, email: users.email, firstName: users.firstName })
      .from(users)
      .where(sql`LOWER(${users.email}) LIKE '%alliance%'`)
      .limit(10);

    return NextResponse.json({
      success: true,
      searchEmail: ALLIANCE_SHIPPING_EMAIL,
      utilityFunctionResult: utilityResult,
      directQueryResult: directResult || null,
      similarUsers,
      totalUsersWithAlliance: similarUsers.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
