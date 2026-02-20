import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { getOrCreateChatSession, sendMessage } from '@/lib/server/chat';

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, messages } = (await request.json()) as {
      bookId: string;
      messages: VoiceMessage[];
    };

    if (!bookId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, messages[]' },
        { status: 400 },
      );
    }

    const session = await getOrCreateChatSession(user.id, bookId);

    const saved = [];
    for (const msg of messages) {
      if (!msg.content?.trim()) continue;
      const row = await sendMessage(session.id, msg.content.trim(), msg.role);
      saved.push(row);
    }

    return NextResponse.json({ messages: saved });
  } catch (error) {
    console.error('[voice/save] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save voice messages' },
      { status: 500 },
    );
  }
}
