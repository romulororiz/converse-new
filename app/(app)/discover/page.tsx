'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';

const categories = [
  {
    label: 'Personal Growth',
    description: 'Mindfulness, habits, self-discovery',
    gradient: 'from-[#F5E6D3] to-[#FAF0E8]',
    accent: '#C4822A',
    tags: ['Personal Growth', 'Self-Discovery', 'Mindfulness', 'Emotional Intelligence', 'Habits & Routines', 'Spirituality', 'Meditation', 'Wellness'],
  },
  {
    label: 'Career & Business',
    description: 'Leadership, strategy, productivity',
    gradient: 'from-[#F2E3CC] to-[#FAF1E5]',
    accent: '#C4822A',
    tags: ['Career Development', 'Leadership', 'Entrepreneurship', 'Productivity', 'Innovation', 'Business Strategy', 'Professional Skills', 'Work-Life Balance'],
  },
  {
    label: 'Relationships',
    description: 'Communication, empathy, connection',
    gradient: 'from-[#F5D4DC] to-[#FAE8EC]',
    accent: '#C05070',
    tags: ['Relationships', 'Communication', 'Social Skills', 'Family Dynamics', 'Friendship', 'Dating & Romance', 'Conflict Resolution', 'Empathy'],
  },
  {
    label: 'Mental Health',
    description: 'Psychology, resilience, wellbeing',
    gradient: 'from-[#D4EDE4] to-[#E8F5EF]',
    accent: '#2E7D5E',
    tags: ['Mental Health', 'Psychology', 'Anxiety & Stress', 'Depression', 'Resilience', 'Trauma Healing', 'Self-Care', 'Therapy'],
  },
  {
    label: 'Finance',
    description: 'Wealth, investing, financial freedom',
    gradient: 'from-[#EDE8D4] to-[#F5F1E8]',
    accent: '#6B5A2A',
    tags: ['Personal Finance', 'Investing', 'Wealth Building', 'Financial Freedom', 'Money Mindset', 'Budgeting', 'Retirement Planning', 'Financial Education'],
  },
  {
    label: 'Creativity',
    description: 'Art, writing, creative thinking',
    gradient: 'from-[#EAD4F5] to-[#F3E8FA]',
    accent: '#7A3A9E',
    tags: ['Creativity', 'Art & Design', 'Writing', 'Music', 'Photography', 'Storytelling', 'Creative Thinking', 'Visual Arts'],
  },
  {
    label: 'Science & Tech',
    description: 'Innovation, AI, discovery',
    gradient: 'from-[#D4EAF5] to-[#E8F3FA]',
    accent: '#1A5070',
    tags: ['Science', 'Technology', 'Artificial Intelligence', 'Space & Astronomy', 'Biology', 'Physics', 'Chemistry', 'Mathematics'],
  },
  {
    label: 'Philosophy & History',
    description: 'Ethics, wisdom, world cultures',
    gradient: 'from-[#E8E0D4] to-[#F0EBE4]',
    accent: '#5A4A3A',
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
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#C4822A] text-xs font-semibold uppercase tracking-wide mb-2">
          <Compass size={13} /> Discover
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Find your next great read</h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Select topics that interest you and we&apos;ll match you with the perfect books.
        </p>
      </div>

      {/* Selected tags */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="surface-card p-4 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">
              Selected ({selectedTags.length})
            </span>
            {selectedTags.map((tag) => (
              <Chip key={tag} variant="active" onClick={() => toggleTag(tag)}>
                {tag} <X size={12} />
              </Chip>
            ))}
            <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground transition ml-2 cursor-pointer">
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tiles */}
      <div className="grid sm:grid-cols-2 gap-4">
        {visibleCategories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`surface-card p-5 relative overflow-hidden bg-gradient-to-br ${cat.gradient}`}
          >
            <div className="relative z-10">
              <div className="mb-3">
                <h3 className="font-bold text-base text-foreground">{cat.label}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
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
        ))}
      </div>

      {/* Show more */}
      {!showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="outline-button mx-auto flex items-center gap-2 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Plus size={15} /> Show {categories.length - INITIAL_CATEGORIES} more categories
        </button>
      )}

      {/* Find books CTA */}
      <div className="sticky bottom-20 md:bottom-4 z-40">
        <button
          disabled={selectedTags.length === 0}
          onClick={handleFindBooks}
          data-testid="find-books-btn"
          className={cn(
            'w-full py-3.5 rounded-[14px] text-base font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer',
            selectedTags.length > 0
              ? 'accent-button'
              : 'bg-surface-2 text-muted-foreground cursor-not-allowed opacity-60'
          )}
        >
          Find Books <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
