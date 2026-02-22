'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Check, Trash2, Trophy, BookOpen, Brain, Heart, Briefcase } from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'conversai_goals';

const goalTemplates = [
  { text: 'Read 1 book about personal growth this month', category: 'Growth', icon: Heart },
  { text: 'Chat with 3 finance books this quarter', category: 'Finance', icon: Briefcase },
  { text: 'Explore books on leadership', category: 'Career', icon: Trophy },
  { text: 'Read a psychology book for better self-awareness', category: 'Mental Health', icon: Brain },
  { text: 'Discover 5 new books outside my comfort zone', category: 'Discovery', icon: BookOpen },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Personal');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setGoals(JSON.parse(stored) as Goal[]);
    } catch { /* ignore */ }
  }, []);

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    const goal: Goal = {
      id: String(Date.now()),
      text: newGoalText.trim(),
      category: newGoalCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveGoals([goal, ...goals]);
    setNewGoalText('');
  };

  const addTemplate = (text: string, category: string) => {
    if (goals.some((g) => g.text === text)) return;
    const goal: Goal = { id: String(Date.now()), text, category, completed: false, createdAt: new Date().toISOString() };
    saveGoals([goal, ...goals]);
  };

  const toggleGoal = (id: string) => {
    saveGoals(goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const removeGoal = (id: string) => saveGoals(goals.filter((g) => g.id !== id));

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-(--neo-accent) mb-2">
          <Target size={13} />
          <span className="mono text-[10px] font-medium uppercase tracking-[0.18em]">Goals</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-(--text-primary)">Reading Goals</h1>
        <p className="text-sm text-(--text-muted) mt-0.5">Set intentions and track your reading journey</p>
      </div>

      {/* Progress */}
      {goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ink-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-(--text-primary)">Your Progress</span>
            <span className="mono text-sm font-bold text-(--neo-accent)">{completedCount} / {goals.length}</span>
          </div>
          <div className="h-2 bg-(--bg-overlay) rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--neo-accent) 0%, var(--neo-accent-hover) 100%)' }}
            />
          </div>
          <p className="mono text-[10px] text-(--text-muted) mt-2">{progressPct}% complete</p>
        </motion.div>
      )}

      {/* Add goal */}
      <div className="ink-card p-5">
        <h3 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mb-4">Add a new goal</h3>
        <div className="flex flex-col gap-3">
          <input
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="e.g. Read 2 books about mindfulness..."
            data-testid="new-goal-input"
            className="w-full h-10 px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) rounded-md border outline-none focus:border-(--neo-accent)/40 transition-colors"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          />
          <div className="flex gap-2">
            <select
              value={newGoalCategory}
              onChange={(e) => setNewGoalCategory(e.target.value)}
              className="h-10 px-3 text-sm text-(--text-primary) flex-1 rounded-md border outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              {['Personal', 'Growth', 'Career', 'Finance', 'Mental Health', 'Discovery'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={addGoal}
              disabled={!newGoalText.trim()}
              data-testid="add-goal-btn"
              className="gold-button h-10 px-4 inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-40"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-2">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              data-testid={`goal-item-${goal.id}`}
              className={`ink-card p-4 flex items-start gap-3 group transition-opacity ${goal.completed ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  goal.completed
                    ? 'border-(--neo-accent) bg-(--neo-accent)'
                    : 'border-(--border) hover:border-(--neo-accent)'
                }`}
              >
                {goal.completed && <Check size={11} style={{ color: 'var(--text-on-accent)' }} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${goal.completed ? 'line-through text-(--text-muted)' : 'text-(--text-primary)'}`}>
                  {goal.text}
                </p>
                <span className="mono text-[10px] text-(--text-muted) mt-0.5 block">{goal.category}</span>
              </div>
              <button
                onClick={() => removeGoal(goal.id)}
                data-testid={`remove-goal-${goal.id}`}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-(--text-muted) hover:text-(--neo-danger) hover:bg-(--neo-danger)/10 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ink-card p-12 text-center">
          <div className="w-14 h-14 rounded-xl bg-(--neo-accent-light) flex items-center justify-center mx-auto mb-4">
            <Target size={26} className="text-(--neo-accent)" />
          </div>
          <h3 className="font-serif font-bold text-lg mb-2 text-(--text-primary)">Set your first reading goal</h3>
          <p className="text-sm text-(--text-muted) mb-5 leading-relaxed">Intentions help you stay focused and motivated on your reading journey.</p>
        </motion.div>
      )}

      {/* Suggested goals */}
      <div className="ink-card p-5">
        <h3 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] mb-4">Suggested goals</h3>
        <div className="space-y-1.5">
          {goalTemplates.map((t) => {
            const alreadyAdded = goals.some((g) => g.text === t.text);
            return (
              <div
                key={t.text}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-(--bg-overlay) transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-(--neo-accent-light) flex items-center justify-center shrink-0">
                    <t.icon size={13} className="text-(--neo-accent)" />
                  </div>
                  <p className="text-sm text-(--text-secondary) line-clamp-1">{t.text}</p>
                </div>
                <button
                  onClick={() => addTemplate(t.text, t.category)}
                  disabled={alreadyAdded}
                  className={`shrink-0 h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                    alreadyAdded
                      ? 'bg-(--neo-success)/10 text-(--neo-success) cursor-default'
                      : 'bg-(--neo-accent-light) text-(--neo-accent) hover:bg-(--neo-accent)/20'
                  }`}
                >
                  {alreadyAdded ? <Check size={11} /> : <Plus size={11} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
