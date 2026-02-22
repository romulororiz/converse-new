'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, ArrowRight, X, Plus,
  Flame, Briefcase, Heart, Brain, TrendingUp, Palette, Cpu, BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Category {
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  tags: string[];
}

const categories: Category[] = [
  {
    label: 'Personal Growth',
    description: 'Mindfulness, habits, self-discovery',
    icon: Flame,
    gradient: 'from-[#2A1608] to-[#0E0B08]',
    iconColor: '#E8A855',
    tags: ['Personal Growth', 'Self-Discovery', 'Mindfulness', 'Emotional Intelligence', 'Habits & Routines', 'Spirituality', 'Meditation', 'Wellness'],
  },
  {
    label: 'Career & Business',
    description: 'Leadership, strategy, productivity',
    icon: Briefcase,
    gradient: 'from-[#08180D] to-[#0E0B08]',
    iconColor: '#6EC49A',
    tags: ['Career Development', 'Leadership', 'Entrepreneurship', 'Productivity', 'Innovation', 'Business Strategy', 'Professional Skills', 'Work-Life Balance'],
  },
  {
    label: 'Relationships',
    description: 'Communication, empathy, connection',
    icon: Heart,
    gradient: 'from-[#28080F] to-[#0E0B08]',
    iconColor: '#E87C8E',
    tags: ['Relationships', 'Communication', 'Social Skills', 'Family Dynamics', 'Friendship', 'Dating & Romance', 'Conflict Resolution', 'Empathy'],
  },
  {
    label: 'Mental Health',
    description: 'Psychology, resilience, wellbeing',
    icon: Brain,
    gradient: 'from-[#081828] to-[#0E0B08]',
    iconColor: '#6EAEE8',
    tags: ['Mental Health', 'Psychology', 'Anxiety & Stress', 'Depression', 'Resilience', 'Trauma Healing', 'Self-Care', 'Therapy'],
  },
  {
    label: 'Finance',
    description: 'Wealth, investing, financial freedom',
    icon: TrendingUp,
    gradient: 'from-[#1E1408] to-[#0E0B08]',
    iconColor: '#C9A84C',
    tags: ['Personal Finance', 'Investing', 'Wealth Building', 'Financial Freedom', 'Money Mindset', 'Budgeting', 'Retirement Planning', 'Financial Education'],
  },
  {
    label: 'Creativity',
    description: 'Art, writing, creative thinking',
    icon: Palette,
    gradient: 'from-[#180828] to-[#0E0B08]',
    iconColor: '#B87AE8',
    tags: ['Creativity', 'Art & Design', 'Writing', 'Music', 'Photography', 'Storytelling', 'Creative Thinking', 'Visual Arts'],
  },
  {
    label: 'Science & Tech',
    description: 'Innovation, AI, discovery',
    icon: Cpu,
    gradient: 'from-[#081428] to-[#0E0B08]',
    iconColor: '#6EC4E8',
    tags: ['Science', 'Technology', 'Artificial Intelligence', 'Space & Astronomy', 'Biology', 'Physics', 'Chemistry', 'Mathematics'],
  },
  {
    label: 'Philosophy & History',
    description: 'Ethics, wisdom, world cultures',
    icon: BookOpen,
    gradient: 'from-[#1A1208] to-[#0E0B08]',
    iconColor: '#C9A84C',
    tags: ['Philosophy', 'History', 'Ethics', 'Critical Thinking', 'World Cultures', 'Ancient Wisdom', 'Modern Thought', 'Social Sciences'],
  },
];

const INITIAL_CATEGORIES = 4;

export default function DiscoverPage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, INITIAL_CATEGORIES);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleFindBooks = () => {
    if (selectedTags.length === 0) return;
    router.push(`/books?tags=${selectedTags.join(',')}`);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-(--neo-accent) mb-2">
          <Compass size={13} />
          <span className="mono text-[10px] font-medium uppercase tracking-[0.18em]">Discover</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-1.5 text-(--text-primary)">
          Find your next great read
        </h1>
        <p className="text-sm text-(--text-secondary) max-w-lg leading-relaxed">
          Select topics that interest you and we&apos;ll match you with the perfect books.
        </p>
      </div>

      {/* Selected tags bar */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ink-card p-4 flex flex-wrap items-center gap-2"
          >
            <span className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mr-1">
              Selected ({selectedTags.length})
            </span>
            {selectedTags.map((tag) => (
              <Chip key={tag} variant="active" onClick={() => toggleTag(tag)} size="sm">
                {tag} <X size={11} />
              </Chip>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="mono text-[11px] text-(--text-muted) hover:text-(--neo-accent) transition-colors ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tiles */}
      <div className="grid sm:grid-cols-2 gap-4">
        {visibleCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={cn(
                'relative overflow-hidden rounded-xl border p-5 bg-linear-to-br cursor-default',
                cat.gradient
              )}
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Decorative icon watermark */}
              <Icon
                size={80}
                className="absolute -right-4 -bottom-4 opacity-[0.07] pointer-events-none"
                style={{ color: cat.iconColor }}
              />

              <div className="relative z-10">
                {/* Category header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.iconColor}18` }}
                  >
                    <Icon size={16} style={{ color: cat.iconColor }} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-(--text-primary) leading-tight">{cat.label}</h3>
                    <p className="mono text-[10px] text-(--text-muted) mt-0.5">{cat.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        variant={isSelected ? 'active' : 'default'}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        data-testid={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {tag}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more */}
      {!showAll && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="ghost-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
          >
            <Plus size={14} /> Show {categories.length - INITIAL_CATEGORIES} more categories
          </button>
        </div>
      )}

      {/* Find books CTA — sticky */}
      <div className="sticky bottom-20 md:bottom-4 z-40">
        <motion.button
          disabled={selectedTags.length === 0}
          onClick={handleFindBooks}
          data-testid="find-books-btn"
          animate={selectedTags.length > 0 ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 4 }}
          className={cn(
            'w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
            selectedTags.length > 0
              ? 'gold-button'
              : 'bg-(--bg-elevated) text-(--text-muted) cursor-not-allowed'
          )}
        >
          <span className="font-serif">Find Books</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
