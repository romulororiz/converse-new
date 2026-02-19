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
            i < full ? 'fill-[#C4822A] text-[#C4822A]' :
            i === full && hasHalf ? 'fill-[#C4822A]/40 text-[#C4822A]' :
            'fill-transparent text-[#C4822A]/25'
          )}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

export function BookCard({ book, variant = 'poster', className, onChat }: BookCardProps) {
  const topics = ((book.metadata as BookMetadata)?.topics || []).slice(0, 2);
  const rating = getBookRating(book.id);

  if (variant === 'compact') {
    return (
      <Link href={`/app/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
        <div className="surface-card p-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200 group">
          <div className="w-10 h-14 rounded-[6px] overflow-hidden shrink-0 shadow-sm">
            <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-foreground">{book.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{book.author ?? 'Unknown'}</p>
            <StarRating rating={rating} />
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onChat?.(); }}
            data-testid={`chat-btn-${book.id}`}
            className="accent-button h-8 px-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0 inline-flex items-center gap-1"
          >
            <MessageCircle size={12} /> Chat
          </button>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/app/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
        <div className="surface-card overflow-hidden group cursor-pointer hover:shadow-md transition-shadow duration-200">
          <div className="grid md:grid-cols-[220px_1fr] gap-0">
            <div className="relative h-48 md:h-full overflow-hidden">
              <BookCoverImage src={book.cover_url} alt={book.title} variant="fill" />
            </div>
            <div className="p-5 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topics.map((t) => (<Chip key={t} variant="muted" size="sm">{t}</Chip>))}
              </div>
              <h3 className="text-xl font-bold mb-1 text-foreground">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">by {book.author ?? 'Unknown'}</p>
              <StarRating rating={rating} />
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4">{book.description ?? 'No description available.'}</p>
              <button
                onClick={(e) => { e.preventDefault(); onChat?.(); }}
                className="accent-button h-9 px-4 inline-flex items-center gap-2 text-sm font-medium mt-auto self-start"
              >
                <MessageCircle size={14} /> Start conversation
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/app/book/${book.id}`} className={cn('block', className)} data-testid={`book-card-${book.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="surface-card overflow-hidden group cursor-pointer h-full flex flex-col hover:shadow-md transition-shadow duration-200"
      >
        <div className="relative overflow-hidden">
          <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3">
            <button
              onClick={(e) => { e.preventDefault(); onChat?.(); }}
              data-testid={`chat-btn-${book.id}`}
              className="accent-button h-8 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MessageCircle size={13} /> Chat
            </button>
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-sm line-clamp-2 mb-0.5 leading-snug text-foreground">{book.title}</h3>
          <p className="text-xs text-muted-foreground mb-1.5">{book.author ?? 'Unknown'}</p>
          <StarRating rating={rating} />
        </div>
      </motion.div>
    </Link>
  );
}
