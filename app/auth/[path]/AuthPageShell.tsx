'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, MessageCircle, Bookmark, Star } from 'lucide-react';

const testimonials = [
  { quote: 'This changed how I absorb ideas from books. It feels like a real conversation.', name: 'Sarah K.', role: 'Product Designer' },
  { quote: 'I\'ve read more books this month than the entire last year.', name: 'Michael R.', role: 'Software Engineer' },
];

const highlights = [
  { icon: <BookOpen size={13} />, text: '500+ curated books' },
  { icon: <MessageCircle size={13} />, text: 'AI-powered conversations' },
  { icon: <Bookmark size={13} />, text: 'Save & share insights' },
];

export function AuthPageShell({
  isSignUp,
  children,
}: {
  isSignUp: boolean;
  children: React.ReactNode;
}) {
  const t = testimonials[isSignUp ? 1 : 0];

  return (
    <div className="h-screen overflow-hidden bg-background relative">
      {/* Shared ambient glow */}
      <div className="absolute top-[8%] left-[15%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      {/* Fixed logo -- top left */}
      <div className="absolute top-6 left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-base">
          <span className="w-8 h-8 rounded-[10px] accent-button inline-flex items-center justify-center">
            <Sparkles size={14} />
          </span>
          <span>ConversAI</span>
        </Link>
      </div>

      <div className="relative z-10 h-full flex items-center">
        {/* Left panel -- vertically centered as one block */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] justify-end pr-10 xl:pr-16">
          <div className="max-w-[340px] space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-[1.15] mb-3">
                <span className="text-gradient">Talk</span> to any book.<br />
                Learn faster.
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every book has a voice. Ask questions, get insights, and build your knowledge — one conversation at a time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap gap-2"
            >
              {highlights.map((h) => (
                <span key={h.text} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2/50 border border-border text-[11px] font-medium text-muted-foreground">
                  <span className="text-primary">{h.icon}</span> {h.text}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {t.name[0]}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-foreground/75 italic mb-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">{t.name}</span> &middot; {t.role}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right panel -- auth form, vertically centered */}
        <div className="flex-1 flex flex-col items-center lg:items-start lg:pl-10 xl:pl-16 px-6">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between w-full max-w-[400px] mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-sm">
              <span className="w-7 h-7 rounded-[8px] accent-button inline-flex items-center justify-center">
                <Sparkles size={12} />
              </span>
              ConversAI
            </Link>
            <Link
              href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'}
              className="text-xs font-medium text-primary hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Create account'}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-[400px]"
          >
            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight mb-1">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isSignUp
                  ? 'Start chatting with books for free — no credit card needed.'
                  : 'Sign in to continue your conversations.'}
              </p>
            </div>

            {/* Neon AuthView -- no wrapper card, let it render directly */}
            <div className="[&>div]:!bg-transparent [&>div]:!border-none [&>div]:!shadow-none [&>div]:!p-0 [&_input]:!bg-surface-2 [&_input]:!border-border [&_input]:!text-foreground [&_button[type=submit]]:!bg-[var(--neo-accent)] [&_button[type=submit]]:!text-[#1A1816] [&_button[type=submit]]:!font-semibold [&_button[type=submit]]:!rounded-[10px]">
              {children}
            </div>

            {/* Footer link */}
            <p className="text-xs text-muted-foreground mt-5">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">Sign in</Link>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">Create one for free</Link>
                </>
              )}
            </p>

            <p className="text-[10px] text-muted-foreground/40 mt-3">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
