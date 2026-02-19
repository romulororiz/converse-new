'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { BookCoverImage } from '@/components/BookCoverImage';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/core';
import Link from 'next/link';

type BookMetadata = { topics?: string[] };

interface BookCardProps {
  book: Book;
  variant?: 'poster' | 'compact' | 'featured';
  className?: string;
  onChat?: () => void;
}

export function BookCard({ book, variant = 'poster', className, onChat }: BookCardProps) {
  const topics = ((book.metadata as BookMetadata)?.topics || []).slice(0, 3);

  if (variant === 'compact') {
    return (
      <Link href={`/app/book/${book.id}`} className={cn('block', className)}>
        <div className="surface-card p-3 flex items-center gap-4 hover:bg-surface-2 transition-colors duration-150 group">
          <div className="w-11 h-16 rounded-[6px] overflow-hidden shrink-0">
            <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{book.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{book.author ?? 'Unknown'}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onChat?.(); }}
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
      <Link href={`/app/book/${book.id}`} className={cn('block', className)}>
        <div className="surface-card overflow-hidden group cursor-pointer">
          <div className="grid md:grid-cols-[240px_1fr] gap-0">
            <div className="relative h-48 md:h-full overflow-hidden">
              <BookCoverImage src={book.cover_url} alt={book.title} variant="fill" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-1/80 to-transparent" />
            </div>
            <div className="p-5 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topics.map((t) => (<Chip key={t} variant="muted" size="sm">{t}</Chip>))}
              </div>
              <h3 className="text-xl font-bold mb-1">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">by {book.author ?? 'Unknown'}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{book.description ?? 'No description available.'}</p>
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
    <Link href={`/app/book/${book.id}`} className={cn('block', className)}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="surface-card overflow-hidden group cursor-pointer h-full flex flex-col hover:shadow-[0_8px_24px_rgba(232,168,56,0.08)] transition-shadow duration-200"
      >
        <div className="relative overflow-hidden">
          <BookCoverImage src={book.cover_url} alt={book.title} variant="card" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3">
            <button
              onClick={(e) => { e.preventDefault(); onChat?.(); }}
              className="accent-button h-8 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MessageCircle size={13} /> Chat
            </button>
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-sm line-clamp-2 mb-0.5 leading-snug">{book.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">{book.author ?? 'Unknown'}</p>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {topics.map((t) => (<Chip key={t} variant="muted" size="sm">{t}</Chip>))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
