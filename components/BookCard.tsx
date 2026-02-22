'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Star } from 'lucide-react';
import { BookCoverImage } from '@/components/BookCoverImage';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import { getBookRating } from '@/lib/hooks/useHighlights';
import type { Book } from '@/lib/core';
import Link from 'next/link';

type BookMetadata = { topics?: string[] };

interface BookCardProps {
  book: Book;
  variant?: 'poster' | 'compact' | 'featured';
  className?: string;
  onChat?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={cn(
            i < full ? 'fill-(--neo-accent) text-(--neo-accent)' :
            i === full && hasHalf ? 'fill-(--neo-accent)/40 text-(--neo-accent)' :
            'fill-transparent text-(--neo-accent)/25'
          )}
        />
      ))}
      <span className="mono text-[10px] text-(--text-muted) ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function BookCard({ book, variant = 'poster', className, onChat }: BookCardProps) {
  const topics = ((book.metadata as BookMetadata)?.topics || []).slice(0, 2);
  const rating = getBookRating(book.id);

  if (variant === 'compact') {
    return (
      <Link href={`/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
        <div className="book-spine ink-card p-3 flex items-center gap-3 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 group">
          <div className="w-10 h-14 rounded-[6px] overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-(--text-primary)">{book.title}</h3>
            <p className="mono text-xs text-(--text-muted) truncate mt-0.5">{book.author ?? 'Unknown'}</p>
            <div className="mt-1"><StarRating rating={rating} /></div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onChat?.(); }}
            data-testid={`chat-btn-${book.id}`}
            className="gold-button h-8 px-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0 inline-flex items-center gap-1"
          >
            <MessageCircle size={12} /> Chat
          </button>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
        <div className="ink-card overflow-hidden group cursor-pointer hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
          <div className="grid md:grid-cols-[220px_1fr] gap-0">
            {/* Full-bleed cover with dark overlay */}
            <div className="relative h-52 md:h-full overflow-hidden">
              <BookCoverImage src={book.cover_url} alt={book.title} variant="fill" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-(--bg-surface)/80 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-(--bg-surface)/60 to-transparent md:hidden" />
            </div>
            {/* Content */}
            <div className="p-5 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topics.map((t) => (<Chip key={t} variant="muted" size="sm">{t}</Chip>))}
              </div>
              <h3 className="font-serif text-xl font-bold mb-1 text-(--text-primary) leading-tight">{book.title}</h3>
              <p className="mono text-xs text-(--text-muted) mb-2 uppercase tracking-widest">by {book.author ?? 'Unknown'}</p>
              <StarRating rating={rating} />
              <p className="text-sm text-(--text-secondary) line-clamp-2 mt-2 mb-4 leading-relaxed">{book.description ?? 'No description available.'}</p>
              <button
                onClick={(e) => { e.preventDefault(); onChat?.(); }}
                className="gold-button h-9 px-5 inline-flex items-center gap-2 text-sm font-semibold mt-auto self-start"
              >
                <MessageCircle size={14} /> Start conversation
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // poster (default)
  return (
    <Link href={`/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="group cursor-pointer h-full flex flex-col"
      >
        {/* Cover */}
        <div className="relative overflow-hidden rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(201,168,76,0.25)] transition-shadow duration-300">
          <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          {/* Hover overlay with chat button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-end justify-center p-3">
            <button
              onClick={(e) => { e.preventDefault(); onChat?.(); }}
              data-testid={`chat-btn-${book.id}`}
              className="gold-button h-8 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MessageCircle size={13} /> Chat
            </button>
          </div>
        </div>
        {/* Metadata */}
        <div className="pt-2.5 flex flex-col flex-1">
          <h3 className="font-semibold text-sm line-clamp-2 mb-0.5 leading-snug text-(--text-primary)">{book.title}</h3>
          <p className="mono text-xs text-(--text-muted) mb-1.5">{book.author ?? 'Unknown'}</p>
          <StarRating rating={rating} />
        </div>
      </motion.div>
    </Link>
  );
}
