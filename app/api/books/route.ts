import { queryNeon } from '@/lib/db/neon';
import type { Book } from '@/lib/core';
import { NextResponse } from 'next/server';

interface BookRow {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  metadata: Book['metadata'];
  created_at: string;
  updated_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const topic = searchParams.get('topic')?.trim();
    const sort = searchParams.get('sort')?.trim();

    const whereConditions: string[] = [];
    const params: unknown[] = [];

    if (query) {
      params.push(`%${query}%`);
      whereConditions.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (topic) {
      params.push(topic);
      whereConditions.push(`COALESCE(metadata->'topics', '[]'::jsonb) ? $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const orderClause =
      sort === 'title-desc'
        ? 'ORDER BY title DESC'
        : sort === 'newest'
          ? 'ORDER BY created_at DESC'
          : 'ORDER BY title ASC';

    const rows = await queryNeon<BookRow>(
      `
        SELECT id, title, author, description, cover_url, metadata, created_at, updated_at
        FROM books
        ${whereClause}
        ${orderClause}
      `,
      params
    );

    return NextResponse.json(rows as Book[]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load books' },
      { status: 500 }
    );
  }
}
