'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Shield, X } from 'lucide-react';
import { LampGlow } from '@/components/LampGlow';

interface PremiumPaywallDrawerProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (plan: 'weekly' | 'monthly' | 'yearly') => void;
  onRestore: () => void;
  onPrivacyPolicy: () => void;
}

export function PremiumPaywallDrawer({
  visible,
  onClose,
  onPurchase,
  onRestore,
  onPrivacyPolicy,
}: PremiumPaywallDrawerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed z-91 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md"
          >
            <div className="ink-card p-6 sm:p-8 relative overflow-hidden">
              <LampGlow className="-top-12 right-0" size={280} opacity={0.5} />

              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-overlay) transition-colors cursor-pointer z-10"
              >
                <X size={15} />
              </button>

              {/* Header */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full gold-button inline-flex items-center justify-center mb-3 mx-auto shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                  <Crown size={20} />
                </div>
                <h3 className="font-serif text-xl font-bold text-(--text-primary) mb-1">Go Premium</h3>
                <p className="text-sm text-(--text-muted)">
                  Unlimited conversations with every book.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-6 relative z-10">
                {[
                  { icon: Sparkles, text: 'Unlimited messages' },
                  { icon: Zap, text: 'Priority AI quality' },
                  { icon: Check, text: 'Save & share insights' },
                  { icon: Shield, text: 'Early access features' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-(--text-muted)">
                    <item.icon size={13} className="text-(--neo-accent) shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
                <button
                  className="ink-panel px-4 py-4 text-left hover:border-(--border-strong) transition-all cursor-pointer rounded-lg border border-(--border)"
                  onClick={() => onPurchase('monthly')}
                >
                  <p className="font-semibold text-sm text-(--text-primary)">Monthly</p>
                  <p className="font-serif text-xl font-bold mt-1 text-(--text-primary)">CHF 6</p>
                  <p className="mono text-[10px] text-(--text-muted) mt-0.5">per month</p>
                </button>
                <button
                  className="relative px-4 py-4 text-left cursor-pointer rounded-lg border border-(--neo-accent)/40 hover:border-(--neo-accent)/70 transition-all"
                  style={{ backgroundColor: 'var(--neo-accent-light)' }}
                  onClick={() => onPurchase('yearly')}
                >
                  <span className="absolute -top-2.5 right-3 mono text-[9px] font-bold text-(--text-on-accent) bg-(--neo-accent) px-2 py-0.5 rounded-full uppercase">
                    Best value
                  </span>
                  <p className="font-semibold text-sm text-(--text-primary)">Yearly</p>
                  <p className="font-serif text-xl font-bold mt-1 text-(--neo-accent)">CHF 35</p>
                  <p className="mono text-[10px] text-(--text-muted) mt-0.5">per year · save 50%+</p>
                </button>
              </div>

              {/* CTA */}
              <button
                className="gold-button w-full py-3 rounded-xl font-bold text-sm cursor-pointer relative z-10 shadow-[0_4px_20px_rgba(201,168,76,0.25)]"
                onClick={() => onPurchase('yearly')}
              >
                Start Premium
              </button>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-4 relative z-10">
                <button onClick={onClose} className="mono text-[10px] text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                  Continue free
                </button>
                <span className="text-(--text-muted) text-[10px]">&middot;</span>
                <button onClick={onRestore} className="mono text-[10px] text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                  Restore
                </button>
                <span className="text-(--text-muted) text-[10px]">&middot;</span>
                <button onClick={onPrivacyPolicy} className="mono text-[10px] text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                  Privacy
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
