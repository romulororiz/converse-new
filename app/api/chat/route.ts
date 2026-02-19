import { chatMessageSchema } from '@/lib/core';
import { getAuthenticatedUser } from '@/lib/auth/user';
import {
  getOrCreateChatSession,
  sendMessageAndGetAIResponse,
} from '@/lib/server/chat';
import { ensureUserProfileExists } from '@/lib/server/profile';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureUserProfileExists(user.id, user.email, user.fullName);

    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getOrCreateChatSession(user.id, parsed.data.bookId);
    const result = await sendMessageAndGetAIResponse(
      user.id,
      session.id,
      parsed.data.content.trim()
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          isRateLimit: result.isRateLimit,
          isApiRateLimit: result.isApiRateLimit,
          waitTime: result.waitTime,
          plan: result.plan,
          remainingMessages: result.remainingMessages,
          limit: result.limit,
        },
        {
          status: result.isRateLimit || result.isApiRateLimit ? 429 : 500,
        }
      );
    }

    return NextResponse.json({
      message: result.aiMessage.content,
      userMessage: result.userMessage,
      aiMessage: result.aiMessage,
      remainingMessages: result.remainingMessages,
      plan: result.plan,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
