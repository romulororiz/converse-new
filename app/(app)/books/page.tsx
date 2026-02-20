'use client';

import type { Book } from '@/lib/core';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, LayoutGrid, List, Sparkles } from 'lucide-react';
import { fetchBooks, fetchBooksByQuery } from '@/lib/services/books';
import { BookCard } from '@/components/BookCard';
import { SortDropdown } from '@/components/SortDropdown';
import { FilterDrawer } from '@/components/FilterDrawer';
import { MessageCounterBadge } from '@/components/MessageCounterBadge';
import { PremiumPaywallDrawer } from '@/components/PremiumPaywallDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { fetchSubscriptionStatus, upgradeSubscription } from '@/lib/services/subscription';

type BookMetadata = { topics?: string[] };

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksLoading />}>
      <BooksContent />
    </Suspense>
  );
}

function BooksLoading() {
  return (
    <div>
      <div className="mb-6"><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="surface-card p-3"><Skeleton className="w-full aspect-[3/4] mb-2" /><Skeleton className="h-4 w-3/4 mb-1" /><Skeleton className="h-3 w-1/2" /></div>
        ))}
      </div>
    </div>
  );
}

function BooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get('q') ?? '';
  const initialSort = searchParams.get('sort') ?? 'title-asc';
  const initialTopic = searchParams.get('topic') || searchParams.get('tags')?.split(',').filter(Boolean)[0] || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopic ? [initialTopic] : []);
  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [visibleBooks, setVisibleBooks] = useState<Book[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedTopics.length === 1) params.set('topic', selectedTopics[0]);
    if (sortBy !== 'title-asc') params.set('sort', sortBy);
    const query = params.toString();
    router.replace(`/books${query ? `?${query}` : ''}`);
  }, [debouncedSearch, selectedTopics, sortBy, router]);

  useEffect(() => {
    fetchBooks()
      .then((data) => setAllBooks(data || []))
      .catch(() => setAllBooks([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const topic = selectedTopics.length === 1 ? selectedTopics[0] : undefined;
    fetchBooksByQuery({
      q: debouncedSearch || undefined,
      topic,
      sort: sortBy as 'title-asc' | 'title-desc' | 'newest',
    })
      .then((data) => setVisibleBooks(data || []))
      .catch(() => setVisibleBooks([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedTopics, sortBy]);

  const availableTopics = useMemo(() => {
    const topicSet = new Set<string>();
    allBooks.forEach((book) => {
      const meta = book.metadata as BookMetadata;
      if (Array.isArray(meta?.topics)) {
        meta.topics.forEach((t) => {
          const normalized = t.trim();
          if (normalized) topicSet.add(normalized);
        });
      }
    });
    return Array.from(topicSet).sort((a, b) => a.localeCompare(b));
  }, [allBooks]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleBadgePress = async () => {
    try {
      const subscription = await fetchSubscriptionStatus();
      if (subscription.messageInfo.plan === 'free') setShowPaywall(true);
    } catch {
      setShowPaywall(true);
    }
  };

  const handlePaywallPurchase = async (plan: 'weekly' | 'monthly' | 'yearly') => {
    await upgradeSubscription(plan);
    setBadgeRefreshKey((prev) => prev + 1);
    setShowPaywall(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Discover your next transformative read</p>
        </div>
        <MessageCounterBadge
          variant="pill"
          label="FREE MESSAGES"
          refreshKey={badgeRefreshKey}
          onPress={handleBadgePress}
        />
      </div>

      {/* Search + controls */}
      <div className="surface-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or mood..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <button
              onClick={() => setFilterOpen(true)}
              className="outline-button h-10 px-3 inline-flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filters</span>
              {selectedTopics.length > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selectedTopics.length}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center border border-border rounded-[12px] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-surface-2 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-4">
        <Sparkles size={13} />
        <span>{loading ? 'Finding books...' : `${visibleBooks.length} books available`}</span>
      </div>

      {/* Grid or list */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'space-y-3'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="surface-card p-3">
              <Skeleton className="w-full aspect-[3/4] mb-3" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : visibleBooks.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-semibold mb-2">No books matched your filters</p>
          <p className="text-sm text-muted-foreground mb-4">
            Try widening your search or picking different topics.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {availableTopics.slice(0, 5).map((t) => (
              <Chip key={t} onClick={() => { setSelectedTopics([t]); setSearchQuery(''); }}>{t}</Chip>
            ))}
          </div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTopics([]); setSortBy('title-asc'); }}
            className="outline-button h-9 px-4 text-sm font-medium"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {visibleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="poster"
              onChat={() => router.push(`/chat/${book.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="compact"
              onChat={() => router.push(`/chat/${book.id}`)}
            />
          ))}
        </div>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        genres={availableTopics}
        selectedGenres={selectedTopics}
        onToggleGenre={toggleTopic}
        onClearAll={() => setSelectedTopics([])}
      />

      <PremiumPaywallDrawer
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={(plan) => { void handlePaywallPurchase(plan); }}
        onRestore={() => setShowPaywall(false)}
        onPrivacyPolicy={() => setShowPaywall(false)}
      />
    </div>
  );
}
