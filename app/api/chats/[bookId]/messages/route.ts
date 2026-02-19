import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/user';
import {
  getOrCreateChatSession,
  sendMessageAndGetAIResponse,
} from '@/lib/server/chat';
import { ensureUserProfileExists } from '@/lib/server/profile';

const paramsSchema = z.object({
  bookId: z.string().uuid(),
});

const bodySchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
});

export async function POST(
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
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: 'Invalid bookId' }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getOrCreateChatSession(user.id, parsedParams.data.bookId);
    const result = await sendMessageAndGetAIResponse(
      user.id,
      session.id,
      parsedBody.data.content.trim()
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
      userMessage: result.userMessage,
      aiMessage: result.aiMessage,
      remainingMessages: result.remainingMessages,
      plan: result.plan,
      sessionId: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
