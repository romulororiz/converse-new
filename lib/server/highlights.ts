import { queryNeon } from '@/lib/db/neon';

export interface HighlightRow {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string | null;
  book_cover: string | null;
  content: string;
  created_at: string;
}

interface SaveHighlightInput {
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookCover?: string;
  content: string;
}

let schemaReady = false;

async function ensureHighlightsSchema() {
  if (schemaReady) return;

  await queryNeon(`
    DROP TABLE IF EXISTS insights;

    CREATE TABLE IF NOT EXISTS highlights (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      book_title TEXT NOT NULL,
      book_author TEXT NULL,
      book_cover TEXT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, book_id, content)
    );

    CREATE INDEX IF NOT EXISTS highlights_user_id_idx
      ON highlights (user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS highlights_book_id_idx
      ON highlights (book_id);
  `);

  schemaReady = true;
}

export async function listHighlights(userId: string): Promise<HighlightRow[]> {
  await ensureHighlightsSchema();

  return queryNeon<HighlightRow>(
    `
      SELECT
        id::text AS id,
        user_id,
        book_id,
        book_title,
        book_author,
        book_cover,
        content,
        created_at
      FROM highlights
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );
}

export async function saveHighlight(input: SaveHighlightInput): Promise<HighlightRow> {
  await ensureHighlightsSchema();

  const rows = await queryNeon<HighlightRow>(
    `
      INSERT INTO highlights (
        user_id,
        book_id,
        book_title,
        book_author,
        book_cover,
        content
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, book_id, content)
      DO UPDATE SET
        book_title = EXCLUDED.book_title,
        book_author = EXCLUDED.book_author,
        book_cover = EXCLUDED.book_cover
      RETURNING
        id::text AS id,
        user_id,
        book_id,
        book_title,
        book_author,
        book_cover,
        content,
        created_at
    `,
    [
      input.userId,
      input.bookId,
      input.bookTitle,
      input.bookAuthor ?? null,
      input.bookCover ?? null,
      input.content,
    ]
  );

  return rows[0];
}

export async function deleteHighlight(userId: string, highlightId: string): Promise<boolean> {
  await ensureHighlightsSchema();

  const rows = await queryNeon<{ id: string }>(
    `
      DELETE FROM highlights
      WHERE user_id = $1 AND id = $2::bigint
      RETURNING id::text AS id
    `,
    [userId, highlightId]
  );

  return rows.length > 0;
}
