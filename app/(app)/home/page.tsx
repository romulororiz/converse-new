'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, BookOpen, ArrowRight, Star } from 'lucide-react';
import { DiscoveryShelf } from '@/components/DiscoveryShelf';
import { BookCoverImage } from '@/components/BookCoverImage';
import { fetchBooks } from '@/lib/services/books';
import { fetchChats, type ChatListItem } from '@/lib/services/chats';
import { fetchCurrentProfile } from '@/lib/services/profile';
import type { Book } from '@/lib/core';
import type { UserProfile } from '@/lib/core';
import Link from 'next/link';

function getBookOfDay(books: Book[]): Book | null {
  if (!books.length) return null;
  const today = new Date().toISOString().slice(0, 10);
  const hash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return books[hash % books.length];
}

export default function AppHomePage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [recentChats, setRecentChats] = useState<ChatListItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBooks().catch(() => []),
      fetchChats().catch(() => []),
      fetchCurrentProfile().catch(() => null),
    ]).then(([booksData, chatsData, profileData]) => {
      setBooks(booksData || []);
      setRecentChats(chatsData || []);
      setProfile(profileData);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Reader';
  const recentChatBooks = books.filter((b) => recentChats.some((c) => c.book_id === b.id));
  const newBooks = [...books].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')).slice(0, 12);
  const bookOfDay = getBookOfDay(books);
  const popularBooks = books.slice(0, 12);

  return (
    <div className="space-y-2">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your personalized reading feed</p>
        </div>
      </div>

      {/* Book of the Day */}
      {bookOfDay && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-0 overflow-hidden mb-6"
        >
          <div className="flex flex-col sm:flex-row items-stretch">
            {/* Cover */}
            <div className="relative sm:w-[140px] h-[120px] sm:h-auto shrink-0">
              <BookCoverImage src={bookOfDay.cover_url} alt={bookOfDay.title} variant="fill" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
            </div>
            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#C4822A] text-xs font-semibold mb-2">
                  <Star size={12} className="fill-[#C4822A]" /> Book of the Day
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight">{bookOfDay.title}</h3>
                <p className="text-sm text-muted-foreground">by {bookOfDay.author}</p>
              </div>
              <button
                onClick={() => router.push(`/chat/${bookOfDay.id}`)}
                data-testid="book-of-day-chat-btn"
                className="accent-button h-9 px-4 inline-flex items-center gap-2 text-sm font-medium mt-3 self-start"
              >
                <MessageCircle size={14} /> Start conversation
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue reading */}
      {recentChatBooks.length > 0 && (
        <DiscoveryShelf
          title="Continue reading"
          seeAllHref="/chats"
          books={recentChatBooks}
          loading={loading}
          onChatBook={(id) => router.push(`/chat/${id}`)}
        />
      )}

      {/* New in library */}
      <DiscoveryShelf
        title="New in Library"
        seeAllHref="/books?sort=newest"
        books={newBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/chat/${id}`)}
      />

      {/* Popular / Trending */}
      <DiscoveryShelf
        title="Trending This Week"
        seeAllHref="/books"
        books={popularBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/chat/${id}`)}
      />

      {/* Quick access cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link href="/highlights" data-testid="highlights-quick-link">
            <div className="surface-card p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-9 h-9 rounded-[10px] bg-[#C4822A]/10 flex items-center justify-center mb-2.5 group-hover:bg-[#C4822A]/15 transition-colors">
                <Sparkles size={16} className="text-[#C4822A]" />
              </div>
              <p className="font-semibold text-sm text-foreground">My Highlights</p>
              <p className="text-xs text-muted-foreground mt-0.5">Saved quotes & insights</p>
            </div>
          </Link>
          <Link href="/goals" data-testid="goals-quick-link">
            <div className="surface-card p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-9 h-9 rounded-[10px] bg-[#C4822A]/10 flex items-center justify-center mb-2.5 group-hover:bg-[#C4822A]/15 transition-colors">
                <BookOpen size={16} className="text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground">Reading Goals</p>
              <p className="text-xs text-muted-foreground mt-0.5">Track your progress</p>
            </div>
          </Link>
        </div>
      )}

      {/* Explore CTA */}
      <div className="mt-4">
        <Link
          href="/discover"
          className="surface-card p-4 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Explore books for your goals</p>
              <p className="text-xs text-muted-foreground">Handpicked books based on your interests</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
