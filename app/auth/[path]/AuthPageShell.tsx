'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Bookmark, Star } from 'lucide-react';
import converseLogo from '@/lib/assets/converse-logo-nobg.png';

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
    <div className="h-screen overflow-hidden bg-[#FAF9F6] relative">
      <div className="absolute top-[8%] left-[15%] w-[600px] h-[600px] rounded-full bg-[#C4822A]/10 blur-[150px] pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-6 left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-base text-[#1A1816]">
          <Image src={converseLogo} alt="Converse logo" width={30} height={30} className="shrink-0" />
          <span className="text-[#C4822A]">Converse</span>
        </Link>
      </div>

      <div className="relative z-10 h-full flex items-center">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] justify-end pr-10 xl:pr-16">
          <div className="max-w-[340px] space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-[1.15] mb-3 text-[#1A1816]">
                <span className="text-[#C4822A]">Talk</span> to any book.<br />
                Learn faster.
              </h1>
              <p className="text-sm text-[#6B6560] leading-relaxed">
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
                <span key={h.text} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 border border-[#E8E4DF] text-[11px] font-medium text-[#6B6560]">
                  <span className="text-[#C4822A]">{h.icon}</span> {h.text}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#C4822A]/15 text-[#C4822A] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {t.name[0]}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className="fill-[#C4822A] text-[#C4822A]" />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-[#3D3A37] italic mb-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-[11px] text-[#6B6560]">
                  <span className="font-medium text-[#3D3A37]">{t.name}</span> &middot; {t.role}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right panel — auth form */}
        <div className="flex-1 flex flex-col items-center lg:items-start lg:pl-10 xl:pl-16 px-6">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between w-full max-w-[400px] mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-sm text-[#1A1816]">
              <Image src={converseLogo} alt="Converse logo" width={26} height={26} className="shrink-0" />
              <span className="text-[#C4822A]">Converse</span>
            </Link>
            <Link
              href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'}
              className="text-xs font-medium text-[#C4822A] hover:underline"
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
              <h2 className="text-xl font-bold tracking-tight mb-1 text-[#1A1816]">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-[#6B6560]">
                {isSignUp
                  ? 'Start chatting with books for free — no credit card needed.'
                  : 'Sign in to continue your conversations.'}
              </p>
            </div>

            {/* Neon AuthView with proper style overrides */}
            <div className="neon-auth-form">
              {children}
            </div>

            <p className="text-[10px] text-[#A09A94] mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
