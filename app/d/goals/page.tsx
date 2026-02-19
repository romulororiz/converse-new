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
    <div className="space-y-6 pb-24 md:pb-6 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide mb-2">
          <Target size={13} /> Goals
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reading Goals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Set intentions and track your reading journey</p>
      </div>

      {/* Progress */}
      {goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Your Progress</span>
            <span className="text-sm font-bold text-primary">{completedCount} / {goals.length}</span>
          </div>
          <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progressPct}% complete</p>
        </motion.div>
      )}

      {/* Add goal */}
      <div className="surface-card p-5">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Add a new goal</h3>
        <div className="flex flex-col gap-3">
          <input
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="e.g. Read 2 books about mindfulness..."
            data-testid="new-goal-input"
            className="surface-inset flex h-10 w-full px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          <div className="flex gap-2">
            <select
              value={newGoalCategory}
              onChange={(e) => setNewGoalCategory(e.target.value)}
              className="surface-inset h-10 px-3 text-sm text-foreground flex-1 focus-visible:outline-none cursor-pointer"
            >
              {['Personal', 'Growth', 'Career', 'Finance', 'Mental Health', 'Discovery'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={addGoal}
              disabled={!newGoalText.trim()}
              data-testid="add-goal-btn"
              className="accent-button h-10 px-4 inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-40"
            >
              <Plus size={15} /> Add Goal
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
              className={`surface-card p-4 flex items-start gap-3 group transition-opacity ${goal.completed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  goal.completed ? 'bg-[#2E7D5E] border-[#2E7D5E]' : 'border-border hover:border-primary'
                }`}
              >
                {goal.completed && <Check size={11} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-foreground leading-relaxed ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {goal.text}
                </p>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">{goal.category}</span>
              </div>
              <button
                onClick={() => removeGoal(goal.id)}
                data-testid={`remove-goal-${goal.id}`}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-[6px] text-muted-foreground hover:text-danger hover:bg-danger/8 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-12 text-center">
          <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Target size={26} className="text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Set your first reading goal</h3>
          <p className="text-sm text-muted-foreground mb-5">Intentions help you stay focused and motivated on your reading journey.</p>
        </motion.div>
      )}

      {/* Suggested goals */}
      <div className="surface-card p-5">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Suggested goals</h3>
        <div className="space-y-2">
          {goalTemplates.map((t) => {
            const alreadyAdded = goals.some((g) => g.text === t.text);
            return (
              <div key={t.text} className="flex items-center justify-between gap-3 p-2.5 rounded-[10px] hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-surface-2 flex items-center justify-center shrink-0">
                    <t.icon size={14} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground line-clamp-1">{t.text}</p>
                </div>
                <button
                  onClick={() => addTemplate(t.text, t.category)}
                  disabled={alreadyAdded}
                  className={`shrink-0 h-7 px-3 rounded-[8px] text-xs font-medium transition-colors ${
                    alreadyAdded
                      ? 'bg-[#2E7D5E]/10 text-[#2E7D5E] cursor-default'
                      : 'bg-primary/8 text-primary hover:bg-primary/15'
                  }`}
                >
                  {alreadyAdded ? <Check size={12} /> : <Plus size={12} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
