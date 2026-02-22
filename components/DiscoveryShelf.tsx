'use client';

import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Book } from '@/lib/core';
import Link from 'next/link';

interface DiscoveryShelfProps {
  title: string;
  label?: string;
  seeAllHref?: string;
  books: Book[];
  loading?: boolean;
  onChatBook?: (bookId: string) => void;
}

export function DiscoveryShelf({
  title,
  label,
  seeAllHref,
  books,
  loading = false,
  onChatBook,
}: DiscoveryShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          {label && (
            <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em] mb-1">{label}</p>
          )}
          <h2 className="font-serif text-xl font-semibold text-(--text-primary) leading-tight">{title}</h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="mono text-[11px] font-medium text-(--text-muted) hover:text-(--neo-accent) inline-flex items-center gap-0.5 transition-colors shrink-0 mb-0.5"
          >
            See all <ChevronRight size={12} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-40 shrink-0">
              <Skeleton className="w-full aspect-[3/4] mb-3 rounded-lg" />
              <Skeleton className="h-3.5 w-3/4 mb-1.5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="w-40 shrink-0 snap-start">
              <BookCard
                book={book}
                variant="poster"
                onChat={() => onChatBook?.(book.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
