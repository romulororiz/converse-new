'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Shield, X } from 'lucide-react';

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[91] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg mx-4"
          >
            <div className="surface-card p-6 sm:p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 ghost-button p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full accent-button inline-flex items-center justify-center mb-3 mx-auto">
                  <Crown size={20} />
                </div>
                <h3 className="text-xl font-bold mb-1">Go Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited conversations with every book.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm">
                {[
                  { icon: Sparkles, text: 'Unlimited messages' },
                  { icon: Zap, text: 'Priority AI quality' },
                  { icon: Check, text: 'Save & share insights' },
                  { icon: Shield, text: 'Early access features' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                    <item.icon size={14} className="text-primary shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Plan cards side by side */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  className="surface-raised px-4 py-4 text-left hover:bg-surface-2 transition cursor-pointer rounded-[14px]"
                  onClick={() => onPurchase('monthly')}
                >
                  <p className="font-semibold text-sm">Monthly</p>
                  <p className="text-lg font-bold mt-1">CHF 6</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </button>
                <button
                  className="relative px-4 py-4 text-left cursor-pointer rounded-[14px] bg-primary/10 border-2 border-primary/30 hover:border-primary/50 transition"
                  onClick={() => onPurchase('yearly')}
                >
                  <span className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Best value
                  </span>
                  <p className="font-semibold text-sm">Yearly</p>
                  <p className="text-lg font-bold mt-1">CHF 35</p>
                  <p className="text-xs text-muted-foreground">per year &middot; save 50%+</p>
                </button>
              </div>

              {/* CTA */}
              <button
                className="w-full accent-button py-3 rounded-[12px] font-bold text-sm cursor-pointer"
                onClick={() => onPurchase('yearly')}
              >
                Start Premium
              </button>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <button onClick={onClose} className="hover:text-foreground cursor-pointer">Continue free</button>
                <span>&middot;</span>
                <button onClick={onRestore} className="hover:text-foreground cursor-pointer">Restore</button>
                <span>&middot;</span>
                <button onClick={onPrivacyPolicy} className="hover:text-foreground cursor-pointer">Privacy</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
