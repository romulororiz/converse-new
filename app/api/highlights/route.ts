import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { listHighlights, saveHighlight } from '@/lib/server/highlights';

const createHighlightSchema = z.object({
  bookId: z.string().min(1),
  bookTitle: z.string().min(1),
  bookAuthor: z.string().optional(),
  bookCover: z.string().optional(),
  content: z.string().min(1).max(8000),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const highlights = await listHighlights(user.id);
    return NextResponse.json({ highlights });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createHighlightSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const highlight = await saveHighlight({
      userId: user.id,
      bookId: parsed.data.bookId,
      bookTitle: parsed.data.bookTitle,
      bookAuthor: parsed.data.bookAuthor,
      bookCover: parsed.data.bookCover,
      content: parsed.data.content.trim(),
    });

    return NextResponse.json({ highlight });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save highlight' },
      { status: 500 }
    );
  }
}
