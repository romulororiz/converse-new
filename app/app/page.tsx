'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { DiscoveryShelf } from '@/components/DiscoveryShelf';
import { fetchBooks } from '@/lib/services/books';
import { fetchChats, type ChatListItem } from '@/lib/services/chats';
import type { Book } from '@/lib/core';

export default function AppHomePage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [recentChats, setRecentChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBooks().catch(() => []),
      fetchChats().catch(() => []),
    ]).then(([booksData, chatsData]) => {
      setBooks(booksData || []);
      setRecentChats(chatsData || []);
    }).finally(() => setLoading(false));
  }, []);

  const recentChatBooks = books.filter((b) =>
    recentChats.some((c) => c.book_id === b.id)
  );
  const newBooks = [...books].sort((a, b) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? '')
  ).slice(0, 12);
  const allBooks = books.slice(0, 12);

  const handleRandomBook = () => {
    if (books.length === 0) return;
    const random = books[Math.floor(Math.random() * books.length)];
    router.push(`/app/book/${random.id}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your personalized reading feed</p>
        </div>
        <button
          onClick={handleRandomBook}
          className="outline-button h-9 px-4 inline-flex items-center gap-2 text-sm font-medium"
        >
          <Shuffle size={14} /> Random book
        </button>
      </div>

      {recentChatBooks.length > 0 && (
        <DiscoveryShelf
          title="Continue reading"
          seeAllHref="/app/chats"
          books={recentChatBooks}
          loading={loading}
          onChatBook={(id) => router.push(`/app/chat/${id}`)}
        />
      )}

      <DiscoveryShelf
        title="New in library"
        seeAllHref="/app/books?sort=newest"
        books={newBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/app/chat/${id}`)}
      />

      <DiscoveryShelf
        title="Explore the collection"
        seeAllHref="/app/books"
        books={allBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/app/chat/${id}`)}
      />
    </div>
  );
}
