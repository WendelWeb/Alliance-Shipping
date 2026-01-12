import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packages, users, packageRequests } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

// Debug endpoint to check user and packages
export async function GET(request: NextRequest) {
  try {
    // Get current user from Clerk
    const { userId: clerkUserId } = await auth();

    const debugInfo: any = {
      clerkUserId,
      userInDb: null,
      allUsers: [],
      userPackages: [],
      allPackages: [],
      packageRequests: [],
    };

    // Get all users
    const allUsers = await db.select().from(users);
    debugInfo.allUsers = allUsers;

    // Find user in DB by clerkId
    if (clerkUserId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1);

      debugInfo.userInDb = user;

      if (user) {
        // Get user's packages
        const userPackages = await db
          .select()
          .from(packages)
          .where(eq(packages.userId, user.id));

        debugInfo.userPackages = userPackages;
      }
    }

    // Get all packages
    const allPackages = await db.select().from(packages);
    debugInfo.allPackages = allPackages;

    // Get all package requests
    const allRequests = await db.select().from(packageRequests);
    debugInfo.packageRequests = allRequests;

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
