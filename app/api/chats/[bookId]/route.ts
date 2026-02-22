import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getChatMessages, getOrCreateChatSession, deleteChatSession } from '@/lib/server/chat';
import { ensureUserProfileExists } from '@/lib/server/profile';

const paramsSchema = z.object({
  bookId: z.string().uuid(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const params = await context.params;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
    }

    const session = await getOrCreateChatSession(user.id, parsed.data.bookId);
    const messages = await getChatMessages(session.id);

    return NextResponse.json({ session, messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load chat session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
    }

    await deleteChatSession(parsed.data.bookId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset chat' },
      { status: 500 }
    );
  }
}
