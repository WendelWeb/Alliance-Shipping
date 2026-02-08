import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { and, eq, or, isNull, gte, desc } from 'drizzle-orm';

// ISR - Revalidate every 5 minutes
export const revalidate = 300;

/**
 * GET /api/announcements/public
 * Fetch published announcements for homepage and news page
 *
 * Query params:
 * - lang: User's preferred language (en, fr, ht, es) - used to return translated content
 * - limit: Maximum number of announcements to return (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'fr';
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();

    // Query published announcements
    const publishedAnnouncements = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isPublished, true),
          eq(announcements.showOnHomepage, true),
          or(
            isNull(announcements.expiryDate),
            gte(announcements.expiryDate, now)
          )
        )
      )
      .orderBy(
        desc(announcements.isPinned),
        desc(announcements.publishDate)
      )
      .limit(limit);

    // Map announcements with translated content based on user's language
    const mapped = publishedAnnouncements.map((a) => {
      const translations = a.translations as Record<string, { title: string; content: string }> | null;
      const translated = translations?.[lang];

      return {
        id: a.id,
        title: translated?.title || a.title,
        content: translated?.content || a.content,
        type: a.type,
        category: a.type,
        priority: a.type === 'alert' ? 'urgent' : a.type === 'maintenance' ? 'important' : 'info',
        publishDate: a.publishDate,
        isPinned: a.isPinned,
        imageUrl: a.imageUrl,
        createdAt: a.createdAt,
      };
    });

    return NextResponse.json({
      announcements: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error('Error fetching public announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', announcements: [], total: 0 },
      { status: 500 }
    );
  }
}
