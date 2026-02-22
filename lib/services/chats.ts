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

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export async function fetchChats() {
  const response = await fetch('/api/chats', { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load chats');
  }
  return data as ChatListItem[];
}

export async function fetchBookChat(bookId: string) {
  const response = await fetch(`/api/chats/${bookId}`, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load chat');
  }
  return data as {
    session: { id: string; book_id: string };
    messages: ChatMessage[];
  };
}

/** Success response from POST /api/chats/[bookId]/messages. remainingMessages is a number; coerce with Number() if parsing from JSON. */
export interface SendBookMessageResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  remainingMessages: number;
  plan: 'free' | 'premium' | 'trial';
  sessionId: string;
}

export async function resetBookChat(bookId: string): Promise<void> {
  const response = await fetch(`/api/chats/${bookId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? 'Failed to reset chat');
  }
}

export async function sendBookMessage(bookId: string, content: string): Promise<SendBookMessageResponse> {
  const response = await fetch(`/api/chats/${bookId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data?.error ?? 'Failed to send message') as Error & {
      details?: Record<string, unknown>;
    };
    err.details = data;
    throw err;
  }

  return data as SendBookMessageResponse;
}
