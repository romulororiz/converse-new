'use client';

import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Book } from '@/lib/core';
import Link from 'next/link';

interface DiscoveryShelfProps {
  title: string;
  seeAllHref?: string;
  books: Book[];
  loading?: boolean;
  onChatBook?: (bookId: string) => void;
}

export function DiscoveryShelf({
  title,
  seeAllHref,
  books,
  loading = false,
  onChatBook,
}: DiscoveryShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
          >
            See all <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[180px] shrink-0">
              <Skeleton className="w-full aspect-[3/4] mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="w-[180px] shrink-0 snap-start">
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
