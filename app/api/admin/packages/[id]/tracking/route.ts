import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trackingHistory } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc } from 'drizzle-orm';

// GET - Get tracking history for a package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const packageId = parseInt(id);

    if (isNaN(packageId)) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    // Get tracking history
    const history = await db
      .select()
      .from(trackingHistory)
      .where(eq(trackingHistory.packageId, packageId))
      .orderBy(desc(trackingHistory.timestamp));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching tracking history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking history' },
      { status: 500 }
    );
  }
}
