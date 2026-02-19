'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Highlight {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookCover?: string;
  content: string;
  savedAt: string;
}

const STORAGE_KEY = 'conversai_highlights';

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHighlights(JSON.parse(stored) as Highlight[]);
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((item: Omit<Highlight, 'id' | 'savedAt'>) => {
    setHighlights((prev) => {
      if (prev.some((h) => h.content === item.content && h.bookId === item.bookId)) return prev;
      const newH: Highlight = { ...item, id: String(Date.now()), savedAt: new Date().toISOString() };
      const updated = [newH, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHighlights((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const isHighlighted = useCallback(
    (content: string, bookId: string) => highlights.some((h) => h.content === content && h.bookId === bookId),
    [highlights],
  );

  const forBook = useCallback(
    (bookId: string) => highlights.filter((h) => h.bookId === bookId),
    [highlights],
  );

  return { highlights, save, remove, isHighlighted, forBook };
}

/** Deterministic star rating (3.5–4.9) from a book ID */
export function getBookRating(bookId: string): number {
  const hash = bookId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (35 + (hash % 15)) / 10;
}
