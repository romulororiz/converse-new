'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Share2, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { useHighlights } from '@/lib/hooks/useHighlights';
import { ShareCard } from '@/components/ShareCard';
import Link from 'next/link';

export default function HighlightsPage() {
  const { highlights, remove } = useHighlights();
  const [shareItem, setShareItem] = useState<{ title: string; author?: string; cover?: string; quote: string } | null>(null);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-(--neo-accent) mb-2">
          <BookMarked size={13} />
          <span className="mono text-[10px] font-medium uppercase tracking-[0.18em]">Highlights</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-(--text-primary)">My Highlights</h1>
        <p className="text-sm text-(--text-muted) mt-0.5">
          {highlights.length > 0
            ? `${highlights.length} saved insight${highlights.length === 1 ? '' : 's'} from your conversations`
            : 'Save key insights from your book conversations'}
        </p>
      </div>

      {/* Empty state */}
      {highlights.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="ink-card p-14 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-xl bg-(--neo-accent-light) flex items-center justify-center mb-4">
            <BookMarked size={28} className="text-(--neo-accent)" />
          </div>
          <h3 className="font-serif font-bold text-lg mb-2 text-(--text-primary)">No highlights yet</h3>
          <p className="text-sm text-(--text-muted) max-w-sm mb-6 leading-relaxed">
            When you chat with a book, tap the bookmark icon on any AI response to save it here as a highlight.
          </p>
          <Link
            href="/books"
            data-testid="browse-books-btn"
            className="gold-button h-10 px-5 inline-flex items-center gap-2 text-sm font-semibold"
          >
            <BookOpen size={15} /> Browse books to chat
          </Link>
        </motion.div>
      )}

      {/* Highlights grid */}
      {highlights.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {highlights.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="book-spine ink-card p-5 flex flex-col group"
                data-testid={`highlight-card-${h.id}`}
              >
                {/* Book info */}
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-8 h-11 rounded-sm overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative">
                    {h.bookCover ? (
                      <Image src={h.bookCover} alt={h.bookTitle} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="w-full h-full bg-(--neo-accent-light) flex items-center justify-center">
                        <Sparkles size={10} className="text-(--neo-accent)" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-(--text-primary) truncate">{h.bookTitle}</p>
                    {h.bookAuthor && (
                      <p className="mono text-[10px] text-(--text-muted) truncate mt-0.5">{h.bookAuthor}</p>
                    )}
                  </div>
                </div>

                {/* Quote */}
                <div className="ink-panel p-3 mb-3 flex-1 rounded-md">
                  <p className="font-serif text-sm text-(--text-secondary) leading-relaxed line-clamp-5 italic">
                    &ldquo;{h.content}&rdquo;
                  </p>
                </div>

                {/* Meta + actions */}
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] text-(--text-muted)">
                    {new Date(h.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setShareItem({ title: h.bookTitle, author: h.bookAuthor, cover: h.bookCover, quote: h.content })}
                      className="p-1.5 rounded-md text-(--text-muted) hover:text-(--neo-accent) hover:bg-(--neo-accent-light) transition-colors"
                      title="Share"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      onClick={() => void remove(h.id)}
                      data-testid={`remove-highlight-${h.id}`}
                      className="p-1.5 rounded-md text-(--text-muted) hover:text-(--neo-danger) hover:bg-(--neo-danger)/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Share modal */}
      {shareItem && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShareItem(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="mx-4 max-h-[80vh] overflow-y-auto">
            <ShareCard
              bookTitle={shareItem.title}
              bookAuthor={shareItem.author}
              bookCover={shareItem.cover}
              quote={shareItem.quote}
            />
            <button onClick={() => setShareItem(null)} className="ghost-gold h-9 px-4 text-sm font-medium mt-4 mx-auto flex">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
