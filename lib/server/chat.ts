import OpenAI from 'openai';
import { queryNeon } from '@/lib/db/neon';
import { canSendMessage, incrementMessageCount } from '@/lib/server/subscription';

interface ChatSessionRow {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessageRow {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ProfilePromptContextRow {
  full_name: string | null;
  reading_preferences: string | null;
  favorite_genres: string | null;
  reading_goals: string | null;
}

interface BookPromptRow {
  title: string;
  author: string | null;
  description: string | null;
}

export interface ChatListItem {
  id: string;
  book_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  updated_at: string;
  last_message: string | null;
  last_message_role: string | null;
}

interface ChatListRow {
  id: string;
  book_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  updated_at: string;
  last_message: string | null;
  last_message_role: string | null;
}

type SendResult =
  | {
      ok: true;
      userMessage: ChatMessageRow;
      aiMessage: ChatMessageRow;
      remainingMessages: number;
      plan: string;
    }
  | {
      ok: false;
      error: string;
      isRateLimit: boolean;
      isApiRateLimit: boolean;
      waitTime?: number;
      plan?: string;
      remainingMessages?: number;
      limit?: number;
    };

export async function getOrCreateChatSession(userId: string, bookId: string): Promise<ChatSessionRow> {
  const rows = await queryNeon<ChatSessionRow>(
    `
      INSERT INTO chat_sessions (user_id, book_id, title, updated_at)
      SELECT $1, $2, b.title, NOW()
      FROM books b
      WHERE b.id = $2
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET
        updated_at = NOW(),
        title = COALESCE(chat_sessions.title, EXCLUDED.title)
      RETURNING id, user_id, book_id, created_at, updated_at
    `,
    [userId, bookId]
  );

  return rows[0];
}

export async function getUserChats(userId: string, limit = 50): Promise<ChatListItem[]> {
  const rows = await queryNeon<ChatListRow>(
    `
      SELECT
        cs.id,
        cs.book_id,
        COALESCE(b.title, 'Untitled Book') AS title,
        b.author,
        b.cover_url,
        cs.updated_at,
        (
          SELECT m.content
          FROM messages m
          WHERE m.session_id = cs.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT m.role::text
          FROM messages m
          WHERE m.session_id = cs.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_role
      FROM chat_sessions cs
      LEFT JOIN books b ON b.id = cs.book_id
      WHERE cs.user_id = $1
      ORDER BY cs.updated_at DESC
      LIMIT $2
    `,
    [userId, limit]
  );

  return rows;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessageRow[]> {
  return queryNeon<ChatMessageRow>(
    `
      SELECT id, session_id, content, role::text AS role, metadata, created_at
      FROM messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `,
    [sessionId]
  );
}

export async function sendMessage(
  sessionId: string,
  content: string,
  role: 'user' | 'assistant'
): Promise<ChatMessageRow> {
  const rows = await queryNeon<ChatMessageRow>(
    `
      INSERT INTO messages (session_id, content, role, metadata)
      VALUES ($1, $2, $3, '{}'::jsonb)
      RETURNING id, session_id, content, role::text AS role, metadata, created_at
    `,
    [sessionId, content, role]
  );

  await queryNeon(
    `
      UPDATE chat_sessions
      SET updated_at = NOW()
      WHERE id = $1
    `,
    [sessionId]
  );

  return rows[0];
}

function buildSystemPrompt(book: BookPromptRow | null, userContext: string | null) {
  const title = book?.title ?? 'this literary work';
  const author = book?.author ?? 'unknown author';

  return `You are \"${title}\" by ${author}, a wise and knowledgeable book.
You have intimate knowledge of your own story, themes, characters, and literary significance.
You can also discuss other books, literature, and reading in general.
Never discuss anything outside of literary topics.
Answer as if you are the book itself, sharing your perspective and guiding the user through your pages.

CRITICAL LANGUAGE INSTRUCTION:
- ALWAYS detect the language of the user's message and respond in the EXACT same language.
- Never mix languages in your response.

${userContext ? `User information: ${userContext}` : ''}`;
}

function toUserContext(profile: ProfilePromptContextRow | null) {
  if (!profile) return null;

  const segments = [
    profile.full_name ? `Name: ${profile.full_name}` : null,
    profile.reading_preferences ? `Reading preferences: ${profile.reading_preferences}` : null,
    profile.favorite_genres ? `Favorite genres: ${profile.favorite_genres}` : null,
    profile.reading_goals ? `Reading goals: ${profile.reading_goals}` : null,
  ].filter(Boolean);

  return segments.length ? segments.join('; ') : null;
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey });
}

export async function sendMessageAndGetAIResponse(
  userId: string,
  sessionId: string,
  userMessage: string
): Promise<SendResult> {
  const messageLimit = await canSendMessage(userId);
  if (!messageLimit.canSend) {
    return {
      ok: false,
      error:
        messageLimit.plan === 'free'
          ? `You've reached your daily message limit of ${messageLimit.limit} messages. Upgrade to premium for unlimited messages!`
          : 'Unable to send message. Please try again.',
      isRateLimit: true,
      isApiRateLimit: false,
      plan: messageLimit.plan,
      remainingMessages: messageLimit.remainingMessages,
      limit: messageLimit.limit,
    };
  }

  const userMsg = await sendMessage(sessionId, userMessage, 'user');
  await incrementMessageCount(userId, sessionId);

  try {
    const [history, sessionRows, profileRows] = await Promise.all([
      getChatMessages(sessionId),
      queryNeon<BookPromptRow>(
        `
          SELECT b.title, b.author, b.description
          FROM chat_sessions cs
          LEFT JOIN books b ON b.id = cs.book_id
          WHERE cs.id = $1
          LIMIT 1
        `,
        [sessionId]
      ),
      queryNeon<ProfilePromptContextRow>(
        `
          SELECT full_name, reading_preferences, favorite_genres, reading_goals
          FROM profiles
          WHERE id = $1
          LIMIT 1
        `,
        [userId]
      ),
    ]);

    const book = sessionRows[0] ?? null;
    const profile = profileRows[0] ?? null;
    const systemPrompt = buildSystemPrompt(book, toUserContext(profile));

    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const aiContent = completion.choices[0]?.message?.content?.trim();
    if (!aiContent) {
      return {
        ok: false,
        error: 'No response from AI service.',
        isRateLimit: false,
        isApiRateLimit: false,
      };
    }

    const aiMsg = await sendMessage(sessionId, aiContent, 'assistant');
    const latestLimit = await canSendMessage(userId);

    return {
      ok: true,
      userMessage: userMsg,
      aiMessage: aiMsg,
      remainingMessages: latestLimit.remainingMessages,
      plan: latestLimit.plan,
    };
  } catch (error) {
    if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('rate limit'))) {
      return {
        ok: false,
        error: 'AI response limit reached. Please wait a moment before asking another question.',
        isRateLimit: false,
        isApiRateLimit: true,
        waitTime: 60,
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to send message. Please try again.',
      isRateLimit: false,
      isApiRateLimit: false,
    };
  }
}
