'use client';

import { Lightbulb, Share2, Sparkles, X } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

interface InsightsPanelProps {
  highlights: string[];
  onPrompt: (prompt: string) => void;
  onShareInsight: () => void;
  onRemoveHighlight?: (index: number) => void;
}

const quickPrompts = [
  'Summarize the key ideas',
  'Explain chapter by chapter',
  'Give me exercises',
  'What are the action steps?',
  'Compare to similar books',
  'Who should read this?',
];

export function InsightsPanel({ highlights, onPrompt, onShareInsight, onRemoveHighlight }: InsightsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-5">
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles size={11} /> Quick prompts
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <Chip key={prompt} size="sm" onClick={() => onPrompt(prompt)}>
                {prompt}
              </Chip>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Lightbulb size={11} /> Saved highlights ({highlights.length})
          </h3>
          {highlights.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              Click the bookmark icon on any response to save it here.
            </p>
          ) : (
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="paper-card p-2.5 text-xs leading-relaxed relative group">
                  <span className="line-clamp-3">&ldquo;{h}&rdquo;</span>
                  {onRemoveHighlight && (
                    <button
                      onClick={() => onRemoveHighlight(i)}
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Remove highlight"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <button
          onClick={onShareInsight}
          className="outline-button w-full h-9 inline-flex items-center justify-center gap-2 text-xs font-medium"
        >
          <Share2 size={13} /> Create shareable insight
        </button>
      </div>
    </div>
  );
}
