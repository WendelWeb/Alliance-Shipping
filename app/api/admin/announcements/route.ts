import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { getAdminSession } from '@/lib/auth/admin';
import { eq, desc, or, like, and, isNull } from 'drizzle-orm';
import { executeAction } from '@/lib/announcements/action-executors';
import {
  getTemplateById,
  generateActionTranslations,
  generateCommunicationTranslations,
  COMMUNICATION_TEMPLATES,
} from '@/lib/announcements/templates-v2';

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

    // Map DB field names to what the frontend expects
    const mapped = allAnnouncements.map(a => ({
      ...a,
      category: a.type,
      publishedAt: a.publishDate,
    }));

    return NextResponse.json({ announcements: mapped });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement (supports action templates + scheduling)
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
      // V2 fields
      templateId,
      actionPayload,
      variables,
      scheduledFor,
    } = body;

    const template = templateId ? getTemplateById(templateId) : null;

    // Generate translations based on template type
    let translations: Record<string, { title: string; content: string }> | null = null;
    let announcementTitle = title;
    let announcementContent = content;
    let announcementType = category || 'news';

    if (template) {
      announcementType = template.type;

      if (template.isAction && actionPayload) {
        // Action template: generate translations from payload
        translations = generateActionTranslations(templateId!, actionPayload);
      } else if (!template.isAction && variables) {
        // Communication template: fill {{variables}}
        translations = generateCommunicationTranslations(templateId!, variables);
      }

      if (translations) {
        // Use English as default title/content
        announcementTitle = translations.en?.title || title;
        announcementContent = translations.en?.content || content;
      }
    }

    // Handle scheduling
    const isScheduled = scheduledFor && new Date(scheduledFor) > new Date();

    // If action template + immediate (not scheduled): execute DB changes now
    if (template?.isAction && actionPayload && !isScheduled) {
      const result = await executeAction(templateId!, actionPayload, session.adminId);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Action failed' }, { status: 400 });
      }
    }

    // Create the announcement
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: announcementTitle,
        type: announcementType,
        content: announcementContent,
        isPublished: isScheduled ? false : (isPublished !== false),
        publishDate: isScheduled ? null : new Date(),
        showOnHomepage: true,
        imageUrl: imageUrl || null,
        translations,
        templateId: templateId || null,
        actionPayload: actionPayload || null,
        actionExecutedAt: (template?.isAction && !isScheduled) ? new Date() : null,
        scheduledFor: isScheduled ? new Date(scheduledFor) : null,
        scheduledStatus: isScheduled ? 'pending' : null,
        createdBy: session.adminId,
      })
      .returning();

    return NextResponse.json({
      announcement: newAnnouncement,
      actionExecuted: template?.isAction && !isScheduled,
      scheduled: isScheduled,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to create announcement',
        details: error instanceof Error ? error.message : String(error)
      },
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
    if (action === 'cancel_scheduled') {
      const [cancelled] = await db
        .update(announcements)
        .set({
          scheduledStatus: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id))
        .returning();

      return NextResponse.json({ announcement: cancelled });
    }

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
