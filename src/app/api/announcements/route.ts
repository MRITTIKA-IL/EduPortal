// src/app/api/announcements/route.ts
// GET /api/announcements — returns published announcements from SQL Server
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let sql = `
      SELECT TOP (@limit)
        AnnouncementID,
        Title,
        Slug,
        Summary,
        Category,
        ImageURL,
        PublishedAt,
        IsFeatured
      FROM Announcements
      WHERE IsPublished = 1
    `;

    const params: Record<string, unknown> = { limit };

    if (featured === 'true') {
      sql += ' AND IsFeatured = 1';
    }
    if (category) {
      sql += ' AND Category = @category';
      params.category = category;
    }

    sql += ' ORDER BY PublishedAt DESC';

    const announcements = await query(sql, params);

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error('Announcements API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
