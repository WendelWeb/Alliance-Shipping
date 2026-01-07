import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialItemFees } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, or, like } from 'drizzle-orm';

// GET - List all special items
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(specialItemFees.brand, `%${search}%`),
          like(specialItemFees.itemName, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(specialItemFees.category, category));
    }

    const items = await db
      .select()
      .from(specialItemFees)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(specialItemFees.createdAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching special items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special items' },
      { status: 500 }
    );
  }
}

// POST - Create new special item
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      brand,
      itemName,
      minModel,
      maxModel,
      fixedFee,
    } = body;

    // Validate required fields
    if (!category || !brand || !itemName || !minModel || !maxModel || fixedFee === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create special item
    const [newItem] = await db
      .insert(specialItemFees)
      .values({
        category,
        brand,
        itemName,
        minModel,
        maxModel,
        fixedFee,
        createdBy: session.userId,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating special item:', error);
    return NextResponse.json(
      { error: 'Failed to create special item' },
      { status: 500 }
    );
  }
}

// PATCH - Update special item
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const [updatedItem] = await db
      .update(specialItemFees)
      .set({ ...updateFields, updatedAt: new Date() })
      .where(eq(specialItemFees.id, id))
      .returning();

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('Error updating special item:', error);
    return NextResponse.json(
      { error: 'Failed to update special item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete special item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await db.delete(specialItemFees).where(eq(specialItemFees.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting special item:', error);
    return NextResponse.json(
      { error: 'Failed to delete special item' },
      { status: 500 }
    );
  }
}
