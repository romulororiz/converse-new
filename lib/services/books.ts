import type { Book } from '@/lib/core';

async function parseBooksResponse(response: Response): Promise<Book[]> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load books');
  }

  return data as Book[];
}

export async function fetchBooks() {
  const response = await fetch('/api/books', { cache: 'no-store' });
  return parseBooksResponse(response);
}

export type BooksQueryParams = {
  q?: string;
  topic?: string;
  sort?: 'title-asc' | 'title-desc' | 'newest';
};

export async function fetchBooksByQuery(params: BooksQueryParams) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  const response = await fetch(`/api/books${query ? `?${query}` : ''}`, { cache: 'no-store' });
  return parseBooksResponse(response);
}

export async function fetchBooksBySearch(query: string) {
  const response = await fetch(`/api/books?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
  return parseBooksResponse(response);
}

export async function fetchBookById(bookId: string) {
  const response = await fetch(`/api/books/${encodeURIComponent(bookId)}`, { cache: 'no-store' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load book detail');
  }

  return data as Book;
}
