import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, or, like, and } from 'drizzle-orm';

// GET - List all announcements
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'published', 'draft', 'all'

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(announcements.title, `%${search}%`),
          like(announcements.content, `%${search}%`)
        )
      );
    }

    if (category && category !== 'all') {
      conditions.push(eq(announcements.type, category));
    }

    if (status && status !== 'all') {
      if (status === 'published') {
        conditions.push(eq(announcements.isPublished, true));
      } else if (status === 'draft') {
        conditions.push(eq(announcements.isPublished, false));
      }
    }

    const allAnnouncements = await db
      .select()
      .from(announcements)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(announcements.createdAt));

    return NextResponse.json({ announcements: allAnnouncements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category,
      content,
      isPublished,
      imageUrl,
    } = body;

    // Validate required fields
    if (!title || !category || !content) {
      return NextResponse.json(
        { error: 'Title, category, and content are required' },
        { status: 400 }
      );
    }

    // Create announcement
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title,
        type: category,
        content,
        isPublished: isPublished || false,
        publishDate: isPublished ? new Date() : null,
        imageUrl: imageUrl || null,
        createdBy: session.userId,
      })
      .returning();

    return NextResponse.json({ announcement: newAnnouncement }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

// PATCH - Update announcement
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID required' },
        { status: 400 }
      );
    }

    // Handle special actions
    if (action === 'publish') {
      const [published] = await db
        .update(announcements)
        .set({
          isPublished: true,
          publishDate: new Date(),
        })
        .where(eq(announcements.id, id))
        .returning();

      return NextResponse.json({ announcement: published });
    }

    if (action === 'unpublish') {
      const [unpublished] = await db
        .update(announcements)
        .set({
          isPublished: false,
          publishDate: null,
        })
        .where(eq(announcements.id, id))
        .returning();

      return NextResponse.json({ announcement: unpublished });
    }

    // Regular update
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...updateFields, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ announcement: updatedAnnouncement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID required' },
        { status: 400 }
      );
    }

    await db.delete(announcements).where(eq(announcements.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
