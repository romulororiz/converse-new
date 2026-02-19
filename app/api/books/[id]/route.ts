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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await queryNeon<BookRow>(
      `
        SELECT id, title, author, description, cover_url, metadata, created_at, updated_at
        FROM books
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    const book = rows[0];
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book as Book);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load book detail' },
      { status: 500 }
    );
  }
}
