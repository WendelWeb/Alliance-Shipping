import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { and, eq, or, isNull, gte, desc } from 'drizzle-orm';

// ISR - Revalidate every 5 minutes
export const revalidate = 300;

/**
 * GET /api/announcements/public
 * Fetch published announcements for the homepage
 *
 * Query params:
 * - lang: Filter by language (en, fr, ht, es) or 'all' for all languages
 * - limit: Maximum number of announcements to return (default: 6)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'all';
    const limit = parseInt(searchParams.get('limit') || '6');

    const now = new Date();

    // Query published announcements that should be shown on homepage
    const publishedAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        publishDate: announcements.publishDate,
        isPinned: announcements.isPinned,
        createdAt: announcements.createdAt,
      })
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
      .limit(limit * 4); // Fetch more to allow for language filtering

    // Filter by language if specified (not 'all')
    let filteredAnnouncements = publishedAnnouncements;

    if (lang !== 'all') {
      const langTag = `[${lang.toUpperCase()}]`;
      filteredAnnouncements = publishedAnnouncements.filter((announcement) =>
        announcement.title.includes(langTag)
      );
    }

    // Apply limit after language filtering
    const finalAnnouncements = filteredAnnouncements.slice(0, limit);

    return NextResponse.json({
      announcements: finalAnnouncements,
      total: finalAnnouncements.length,
    });
  } catch (error) {
    console.error('Error fetching public announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', announcements: [] },
      { status: 500 }
    );
  }
}
