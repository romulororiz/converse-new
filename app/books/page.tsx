'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';
import { BookCard } from '@/components/BookCard';
import { AuthGate } from '@/components/AuthGate';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { SortDropdown } from '@/components/SortDropdown';
import type { Book } from '@/lib/core';

type BookMetadata = { topics?: string[] };

export default function PublicBooksWrapper() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12"><Skeleton className="h-10 w-48 mx-auto mb-6" /></div>}>
        <PublicBooksContent />
      </Suspense>
    </PublicShell>
  );
}

async function fetchPublicBooks(params?: { q?: string; topic?: string; sort?: string }): Promise<Book[]> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.topic) sp.set('topic', params.topic);
  if (params?.sort) sp.set('sort', params.sort);
  const res = await fetch(`/api/books?${sp.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

function PublicBooksContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('title-asc');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [authGateOpen, setAuthGateOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { fetchPublicBooks().then((b) => setAllBooks(b)); }, []);

  useEffect(() => {
    setLoading(true);
    fetchPublicBooks({ q: debouncedSearch || undefined, topic: selectedTopic || undefined, sort: sortBy })
      .then((b) => setVisibleBooks(b))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedTopic, sortBy]);

  const topics = useMemo(() => {
    const s = new Set<string>();
    allBooks.forEach((b) => {
      const meta = b.metadata as BookMetadata;
      if (Array.isArray(meta?.topics)) meta.topics.forEach((t) => { if (t.trim()) s.add(t.trim()); });
    });
    return Array.from(s).sort();
  }, [allBooks]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Book Library</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">Browse our curated collection. Sign in to start chatting with any book.</p>
      </div>
      <div className="surface-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search books..." className="pl-9" />
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Chip variant={!selectedTopic ? 'active' : 'default'} size="sm" onClick={() => setSelectedTopic('')}>All</Chip>
            {topics.slice(0, 12).map((t) => (
              <Chip key={t} variant={selectedTopic === t ? 'active' : 'default'} size="sm" onClick={() => setSelectedTopic(t === selectedTopic ? '' : t)}>{t}</Chip>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-4">
        <Sparkles size={13} /><span>{loading ? 'Finding books...' : `${visibleBooks.length} books`}</span>
      </div>
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="surface-card p-3"><Skeleton className="w-full aspect-[3/4] mb-2" /><Skeleton className="h-4 w-3/4 mb-1" /><Skeleton className="h-3 w-1/2" /></div>))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleBooks.map((book) => (<BookCard key={book.id} book={book} variant="poster" onChat={() => setAuthGateOpen(true)} />))}
        </div>
      )}
      <AuthGate open={authGateOpen} onClose={() => setAuthGateOpen(false)} message="Create a free account to start chatting with this book." />
    </div>
  );
}
