import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { queryNeon } from '@/lib/db/neon';
import OpenAI from 'openai';

interface BookRow {
  title: string;
  author: string | null;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 },
      );
    }

    const { bookId, message, conversationHistory } = (await request.json()) as {
      bookId: string;
      message: string;
      conversationHistory?: ConversationMessage[];
    };

    if (!bookId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, message' },
        { status: 400 },
      );
    }

    const bookRows = await queryNeon<BookRow>(
      'SELECT title, author FROM books WHERE id = $1 LIMIT 1',
      [bookId],
    );
    const book = bookRows[0];
    const bookTitle = book?.title ?? 'this literary work';
    const bookAuthor = book?.author ?? 'unknown author';

    const systemPrompt = `You are "${bookTitle}" by ${bookAuthor}, having a natural conversation with a reader.

IMPORTANT CONVERSATION GUIDELINES:
- Speak as the book itself, sharing your story, themes, and insights
- Keep responses conversational and natural (2-3 sentences max)
- Show curiosity about the reader's thoughts and questions
- Ask follow-up questions to keep the conversation flowing
- Be warm, engaging, and insightful
- Never break character or discuss non-literary topics
- Reference your specific content, characters, and themes when relevant
- ALWAYS respond in the user's language. The default language is English, this is very important! If the user's language is not English, respond in the user's language.
for example, if the user's language is Spanish, respond in Spanish. 
If the user's language is French, respond in French.


Current conversation context: This is an ongoing voice conversation, so respond naturally as if speaking aloud.`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory ?? []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 100,
      temperature: 0.8,
    });

    const content =
      completion.choices[0]?.message?.content?.trim() ??
      'I apologize, but I seem to have lost my voice for a moment. Could you try again?';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Voice chat failed',
      },
      { status: 500 },
    );
  }
}
