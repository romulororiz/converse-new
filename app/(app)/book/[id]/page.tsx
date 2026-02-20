'use client';

import type { Book } from '@/lib/core';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Sparkles, BookOpenText, Users, Clock } from 'lucide-react';
import { fetchBookById, fetchBooks } from '@/lib/services/books';
import { fetchChats } from '@/lib/services/chats';
import { BookCoverImage } from '@/components/BookCoverImage';
import { BookCard } from '@/components/BookCard';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';

type BookMetadata = { topics?: string[] };

const promptSuggestions = [
  'Summarize the key ideas',
  'Give me action steps',
  'Explain the main argument',
  'What can I learn from this?',
  'Recommend similar themes',
];

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [hasExistingChat, setHasExistingChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id) { setLoading(false); return; }

    setLoading(true);
    Promise.all([
      fetchBookById(id),
      fetchBooks(),
      fetchChats().catch(() => []),
    ]).then(([bookData, allBooks, chats]) => {
      setBook(bookData);
      if (bookData) {
        setHasExistingChat(chats.some((c) => c.book_id === bookData.id));
      } else {
        setHasExistingChat(false);
      }
      if (bookData && allBooks) {
        const bookTopics = ((bookData.metadata as BookMetadata)?.topics) || [];
        const related = allBooks
          .filter((b) => b.id !== bookData.id)
          .filter((b) => {
            const bTopics = ((b.metadata as BookMetadata)?.topics) || [];
            return bTopics.some((t) => bookTopics.includes(t));
          })
          .slice(0, 6);
        setRelatedBooks(related);
      }
    }).catch(() => {
      setBook(null);
      setHasExistingChat(false);
    }).finally(() => setLoading(false));
  }, [params?.id]);

  const topics = useMemo(() => {
    const meta = book?.metadata as BookMetadata | undefined;
    return Array.isArray(meta?.topics) ? meta.topics : [];
  }, [book]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-9 w-20 mb-6" />
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <Skeleton className="aspect-[3/4] rounded-[16px]" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="surface-card p-10 text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-2">Book not found</h1>
        <p className="text-sm text-muted-foreground mb-4">This title is not available right now.</p>
        <button
          className="accent-button h-10 px-5 text-sm font-semibold"
          onClick={() => router.push('/books')}
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="ghost-button h-9 px-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8 mb-10">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="surface-card p-5 self-start"
        >
          <BookCoverImage src={book.cover_url} alt={book.title} variant="card" className="rounded-[12px] overflow-hidden" />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {topics.map((t) => (
                <Chip key={t} variant="muted" size="sm">{t}</Chip>
              ))}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-1">{book.title}</h1>
            <p className="text-lg text-muted-foreground">by {book.author ?? 'Unknown author'}</p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Users size={14} /> Popular</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> ~15 min chat</span>
          </div>

          {/* Synopsis */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <BookOpenText size={15} /> Synopsis
            </div>
            <p className="leading-7 text-foreground/90">
              {book.description ?? 'No description available for this title yet.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="accent-button h-11 px-5 inline-flex items-center gap-2 font-semibold text-sm"
              onClick={() => router.push(`/chat/${book.id}`)}
            >
              <MessageCircle size={16} /> {hasExistingChat ? 'Continue chatting' : 'Start conversation'}
            </button>
            <button
              className="outline-button h-11 px-5 inline-flex items-center gap-2 font-semibold text-sm"
              onClick={() => router.push('/discover')}
            >
              <Sparkles size={16} /> Discover more
            </button>
          </div>

          {/* Best questions to ask */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles size={13} /> Best questions to ask
            </h3>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => router.push(`/chat/${book.id}`)}
                  className="h-10 px-4 rounded-[12px] bg-primary/8 border border-primary/15 text-sm font-medium text-foreground hover:bg-primary/15 hover:border-primary/25 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Related books</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedBooks.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                variant="poster"
                onChat={() => router.push(`/chat/${b.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
