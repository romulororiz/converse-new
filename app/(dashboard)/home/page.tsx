'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { DiscoveryShelf } from '@/components/DiscoveryShelf';
import { BookCoverImage } from '@/components/BookCoverImage';
import { LampGlow } from '@/components/LampGlow';
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
    <div className="space-y-2 pb-24 md:pb-8">

      {/* Welcome header */}
      <div className="relative mb-8 pt-2">
        <LampGlow className="-top-8 -right-8" size={320} opacity={0.5} />
        <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-2">Good reading</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-(--text-primary)">
          Welcome back, {firstName}.
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">Your personalized reading feed</p>
      </div>

      {/* Book of the Day */}
      {bookOfDay && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em] mb-3">Book of the Day</p>
          <div
            className="ink-card p-0 overflow-hidden group cursor-pointer hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
            onClick={() => router.push(`/chat/${bookOfDay.id}`)}
          >
            <div className="flex items-stretch">
              {/* Cover */}
              <div className="relative w-24 sm:w-32 shrink-0">
                <BookCoverImage src={bookOfDay.cover_url} alt={bookOfDay.title} variant="fill" />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-(--bg-surface)/60" />
              </div>
              {/* Content */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-(--text-primary) leading-tight mb-0.5">
                    {bookOfDay.title}
                  </h3>
                  <p className="mono text-[10px] text-(--text-muted) uppercase tracking-widest">
                    by {bookOfDay.author}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/chat/${bookOfDay.id}`); }}
                  data-testid="book-of-day-chat-btn"
                  className="gold-button h-9 px-4 inline-flex items-center gap-2 text-sm font-semibold mt-3 self-start"
                >
                  <MessageCircle size={14} /> Start conversation
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue reading */}
      {recentChatBooks.length > 0 && (
        <DiscoveryShelf
          label="Continue"
          title="Continue Reading"
          seeAllHref="/chats"
          books={recentChatBooks}
          loading={loading}
          onChatBook={(id) => router.push(`/chat/${id}`)}
        />
      )}

      {/* New in library */}
      <DiscoveryShelf
        label="Fresh Arrivals"
        title="New in Library"
        seeAllHref="/books?sort=newest"
        books={newBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/chat/${id}`)}
      />

      {/* Popular / Trending */}
      <DiscoveryShelf
        label="This Week"
        title="Trending Now"
        seeAllHref="/books"
        books={popularBooks}
        loading={loading}
        onChatBook={(id) => router.push(`/chat/${id}`)}
      />

      {/* Quick access cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link href="/highlights" data-testid="highlights-quick-link">
            <div className="ink-card p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-(--border-strong) transition-all duration-200 cursor-pointer group h-full">
              <div className="w-9 h-9 rounded-lg bg-(--neo-accent-light) flex items-center justify-center mb-3 group-hover:bg-(--neo-accent)/20 transition-colors">
                <Sparkles size={16} className="text-(--neo-accent)" />
              </div>
              <p className="font-semibold text-sm text-(--text-primary)">My Highlights</p>
              <p className="mono text-[10px] text-(--text-muted) mt-1">Saved quotes & insights</p>
            </div>
          </Link>
          <Link href="/goals" data-testid="goals-quick-link">
            <div className="ink-card p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-(--border-strong) transition-all duration-200 cursor-pointer group h-full">
              <div className="w-9 h-9 rounded-lg bg-(--neo-accent-light) flex items-center justify-center mb-3 group-hover:bg-(--neo-accent)/20 transition-colors">
                <BookOpen size={16} className="text-(--neo-accent)" />
              </div>
              <p className="font-semibold text-sm text-(--text-primary)">Reading Goals</p>
              <p className="mono text-[10px] text-(--text-muted) mt-1">Track your progress</p>
            </div>
          </Link>
        </div>
      )}

      {/* Explore CTA */}
      <Link href="/discover" className="block mt-3">
        <div className="ink-card p-4 flex items-center justify-between group hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-(--neo-accent)/30 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-button flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-semibold text-sm text-(--text-primary)">Explore books for your goals</p>
              <p className="mono text-[10px] text-(--text-muted) mt-0.5">Handpicked books based on your interests</p>
            </div>
          </div>
          <ArrowRight size={15} className="text-(--text-muted) group-hover:text-(--neo-accent) transition-colors shrink-0 ml-2" />
        </div>
      </Link>
    </div>
  );
}
