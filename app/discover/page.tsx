'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, X, Plus, Heart, Briefcase, Users, Brain, DollarSign, Palette, Cpu, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PublicShell } from '@/components/PublicShell';
import { AuthGate } from '@/components/AuthGate';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'Personal Development', icon: Heart, description: 'Growth, mindfulness, and self-discovery', tags: ['Personal Growth', 'Self-Discovery', 'Mindfulness', 'Emotional Intelligence', 'Habits & Routines', 'Spirituality'] },
  { label: 'Career & Business', icon: Briefcase, description: 'Leadership, strategy, and productivity', tags: ['Career Development', 'Leadership', 'Entrepreneurship', 'Productivity', 'Innovation', 'Business Strategy'] },
  { label: 'Relationships', icon: Users, description: 'Communication, empathy, and connection', tags: ['Relationships', 'Communication', 'Social Skills', 'Family Dynamics', 'Empathy'] },
  { label: 'Mental Health', icon: Brain, description: 'Psychology, resilience, and wellbeing', tags: ['Mental Health', 'Psychology', 'Anxiety & Stress', 'Resilience', 'Self-Care'] },
  { label: 'Finance', icon: DollarSign, description: 'Wealth, investing, and financial freedom', tags: ['Personal Finance', 'Investing', 'Wealth Building', 'Financial Freedom'] },
  { label: 'Creativity', icon: Palette, description: 'Art, writing, and creative thinking', tags: ['Creativity', 'Art & Design', 'Writing', 'Storytelling'] },
  { label: 'Science & Technology', icon: Cpu, description: 'Innovation, AI, and discovery', tags: ['Science', 'Technology', 'Artificial Intelligence', 'Physics'] },
  { label: 'Philosophy & History', icon: BookOpen, description: 'Ethics, wisdom, and world cultures', tags: ['Philosophy', 'History', 'Ethics', 'Critical Thinking'] },
];
const INITIAL = 4;

export default function PublicDiscoverPage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const visible = showAll ? categories : categories.slice(0, INITIAL);
  const toggleTag = (tag: string) => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  const handleFindBooks = () => { if (selectedTags.length === 0) return; router.push(`/books?tags=${selectedTags.join(',')}`); };

  return (
    <PublicShell>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-2"><Compass size={13} /> Discover</div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Find your next great conversation</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Select topics that interest you. Sign in to start chatting with matched books.</p>
        </div>
        <AnimatePresence>
          {selectedTags.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="surface-card p-4 mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mr-1">Selected ({selectedTags.length})</span>
              {selectedTags.map((tag) => (<Chip key={tag} variant="active" onClick={() => toggleTag(tag)}>{tag} <X size={12} /></Chip>))}
              <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground ml-2 cursor-pointer">Clear all</button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {visible.map((cat, i) => (
            <motion.div key={cat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="surface-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center"><cat.icon size={16} className="text-primary" /></div>
                  <div><h3 className="font-semibold text-sm">{cat.label}</h3><p className="text-xs text-muted-foreground">{cat.description}</p></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (<Chip key={tag} variant={selectedTags.includes(tag) ? 'active' : 'default'} size="sm" onClick={() => toggleTag(tag)}>{tag}</Chip>))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {!showAll && (
          <button onClick={() => setShowAll(true)} className="outline-button mx-auto flex items-center gap-2 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6">
            <Plus size={15} /> Show {categories.length - INITIAL} more categories
          </button>
        )}
        <div className="max-w-lg mx-auto">
          <button disabled={selectedTags.length === 0} onClick={handleFindBooks} className={cn('w-full py-3.5 rounded-[14px] text-base font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer', selectedTags.length > 0 ? 'accent-button' : 'bg-surface-2 text-muted-foreground cursor-not-allowed opacity-60')}>
            Find Books <ArrowRight size={18} />
          </button>
        </div>
        <AuthGate open={authGateOpen} onClose={() => setAuthGateOpen(false)} />
      </div>
    </PublicShell>
  );
}
