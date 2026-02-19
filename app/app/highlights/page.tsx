'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Share2, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { useHighlights } from '@/lib/hooks/useHighlights';
import { ShareCard } from '@/components/ShareCard';
import Link from 'next/link';

export default function HighlightsPage() {
  const { highlights, remove } = useHighlights();
  const [shareItem, setShareItem] = useState<{ title: string; author?: string; cover?: string; quote: string } | null>(null);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#C4822A] text-xs font-semibold uppercase tracking-wide mb-2">
          <BookMarked size={13} /> Highlights
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Highlights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
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
          className="surface-card p-14 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-[20px] bg-[#C4822A]/8 flex items-center justify-center mb-4">
            <BookMarked size={28} className="text-[#C4822A]" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">No highlights yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
            When you chat with a book, tap the bookmark icon on any AI response to save it here as a highlight.
          </p>
          <Link
            href="/app/books"
            data-testid="browse-books-btn"
            className="accent-button h-10 px-5 inline-flex items-center gap-2 text-sm font-medium"
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
                className="surface-card p-5 flex flex-col group"
                data-testid={`highlight-card-${h.id}`}
              >
                {/* Book info */}
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-border">
                  <div className="w-8 h-11 rounded-[6px] overflow-hidden shrink-0 shadow-sm">
                    {h.bookCover ? (
                      <img src={h.bookCover} alt={h.bookTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-surface-2 flex items-center justify-center">
                        <Sparkles size={10} className="text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{h.bookTitle}</p>
                    {h.bookAuthor && <p className="text-[11px] text-muted-foreground truncate">{h.bookAuthor}</p>}
                  </div>
                </div>

                {/* Quote */}
                <div className="highlight-callout p-3 mb-3 flex-1">
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-5 italic">
                    &ldquo;{h.content}&rdquo;
                  </p>
                </div>

                {/* Meta + actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(h.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setShareItem({ title: h.bookTitle, author: h.bookAuthor, cover: h.bookCover, quote: h.content })}
                      className="p-1.5 rounded-[8px] text-muted-foreground hover:text-[#C4822A] hover:bg-[#C4822A]/8 transition-colors"
                      title="Share"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      onClick={() => remove(h.id)}
                      data-testid={`remove-highlight-${h.id}`}
                      className="p-1.5 rounded-[8px] text-muted-foreground hover:text-danger hover:bg-danger/8 transition-colors"
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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShareItem(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="mx-4 max-h-[80vh] overflow-y-auto">
            <ShareCard
              bookTitle={shareItem.title}
              bookAuthor={shareItem.author}
              bookCover={shareItem.cover}
              quote={shareItem.quote}
            />
            <button onClick={() => setShareItem(null)} className="outline-button h-9 px-4 text-sm font-medium mt-4 mx-auto flex">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
