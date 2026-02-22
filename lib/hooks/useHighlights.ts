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

export function useHighlights() {
	const [highlights, setHighlights] = useState<Highlight[]>([]);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const response = await fetch('/api/highlights', { cache: 'no-store' });
				const data = await response.json();
				if (!response.ok || !mounted) return;

				const rows = Array.isArray(data?.highlights) ? data.highlights : [];
				setHighlights(
					rows.map((row: Record<string, unknown>) => ({
						id: String(row.id),
						bookId: String(row.book_id),
						bookTitle: String(row.book_title),
						bookAuthor: row.book_author ?? undefined,
						bookCover: row.book_cover ?? undefined,
						content: String(row.content),
						savedAt: String(row.created_at),
					})),
				);
			} catch {
				// ignore fetch errors; highlights panel stays empty
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const save = useCallback(
		async (item: Omit<Highlight, 'id' | 'savedAt'>) => {
			const existing = highlights.find(
				h => h.content === item.content && h.bookId === item.bookId,
			);
			if (existing) return existing;

			const optimistic: Highlight = {
				...item,
				id: `temp-${Date.now()}`,
				savedAt: new Date().toISOString(),
			};

			setHighlights(prev => [optimistic, ...prev]);

			try {
				const response = await fetch('/api/highlights', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bookId: item.bookId,
						bookTitle: item.bookTitle,
						bookAuthor: item.bookAuthor,
						bookCover: item.bookCover,
						content: item.content,
					}),
				});
				const data = await response.json();

				if (!response.ok || !data?.highlight) {
					throw new Error(data?.error ?? 'Failed to save highlight');
				}

				const saved: Highlight = {
					id: String(data.highlight.id),
					bookId: String(data.highlight.book_id),
					bookTitle: String(data.highlight.book_title),
					bookAuthor: data.highlight.book_author ?? undefined,
					bookCover: data.highlight.book_cover ?? undefined,
					content: String(data.highlight.content),
					savedAt: String(data.highlight.created_at),
				};

				setHighlights(prev => {
					const withoutTemp = prev.filter(h => h.id !== optimistic.id);
					if (withoutTemp.some(h => h.id === saved.id)) return withoutTemp;
					return [saved, ...withoutTemp];
				});

				return saved;
			} catch {
				setHighlights(prev => prev.filter(h => h.id !== optimistic.id));
				return null;
			}
		},
		[highlights],
	);

	const remove = useCallback(
		async (id: string) => {
			const previous = highlights;
			setHighlights(prev => prev.filter(h => h.id !== id));

			if (id.startsWith('temp-')) return;

			try {
				const response = await fetch(`/api/highlights/${id}`, {
					method: 'DELETE',
				});
				if (!response.ok) {
					throw new Error('Failed to delete highlight');
				}
			} catch {
				setHighlights(previous);
			}
		},
		[highlights],
	);

	const isHighlighted = useCallback(
		(content: string, bookId: string) =>
			highlights.some(h => h.content === content && h.bookId === bookId),
		[highlights],
	);

	const forBook = useCallback(
		(bookId: string) => highlights.filter(h => h.bookId === bookId),
		[highlights],
	);

	return { highlights, save, remove, isHighlighted, forBook };
}

/** Deterministic star rating (3.5–4.9) from a book ID */
export function getBookRating(bookId: string): number {
	const hash = bookId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return (35 + (hash % 15)) / 10;
}
