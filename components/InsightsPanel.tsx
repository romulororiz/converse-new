'use client';

import { useState } from 'react';
import { Check, Copy, Lightbulb, Share2, Sparkles, X } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

interface InsightsPanelProps {
  highlights: string[];
  onPrompt: (prompt: string) => void;
  onShareHighlight: (content: string) => void;
  onRemoveHighlight?: (index: number) => void;
}

const quickPrompts = [
  'Summarize the key ideas',
  'Give me action steps',
  'Explain chapter by chapter',
  'Who should read this?',
  'Compare to similar books',
  'What can I apply today?',
];

export function InsightsPanel({ highlights, onPrompt, onShareHighlight, onRemoveHighlight }: InsightsPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (index: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Quick prompts */}
        <div>
          <h3 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5">
            <Sparkles size={10} /> Quick Prompts
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <Chip key={prompt} size="sm" onClick={() => onPrompt(prompt)} className="text-[11px]">
                {prompt}
              </Chip>
            ))}
          </div>
        </div>

        <div className="gold-rule" />

        {/* Saved highlights */}
        <div>
          <h3 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5">
            <Lightbulb size={10} /> Highlights ({highlights.length})
          </h3>
          {highlights.length === 0 ? (
            <p className="text-xs text-(--text-muted) leading-relaxed italic">
              Tap the bookmark icon on any AI response to save highlights here.
            </p>
          ) : (
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="book-spine ink-panel p-3 text-xs leading-relaxed relative group rounded-md">
                  <span className="line-clamp-3 text-(--text-secondary) italic font-serif text-[13px]">&ldquo;{h}&rdquo;</span>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(i, h)}
                      className="p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay) transition-colors"
                      title="Copy highlight"
                    >
                      {copiedIndex === i ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                    <button
                      onClick={() => onShareHighlight(h)}
                      className="p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay) transition-colors"
                      title="Share highlight"
                    >
                      <Share2 size={11} />
                    </button>
                    {onRemoveHighlight && (
                      <button
                        onClick={() => onRemoveHighlight(i)}
                        className="p-1.5 rounded-md text-(--neo-accent) hover:bg-(--neo-accent-light) transition-colors ml-auto"
                        title="Remove highlight"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
