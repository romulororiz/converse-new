'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AuthGateProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthGate({ open, onClose, message }: AuthGateProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[91] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4"
          >
            <div className="surface-card p-8 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 ghost-button p-2 rounded-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-[14px] accent-button inline-flex items-center justify-center mb-4 mx-auto">
                <Sparkles size={20} />
              </div>

              <h3 className="text-xl font-bold mb-2">Sign in to continue</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {message || 'Create a free account to start chatting with books.'}
              </p>

              <div className="space-y-3">
                <Link
                  href="/auth/sign-up"
                  className="accent-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm"
                >
                  Continue with Google
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="outline-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm"
                >
                  Sign in with email
                </Link>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Free accounts get 10 messages per day
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
