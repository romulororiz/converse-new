'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicShell } from '@/components/PublicShell';
import { LampGlow } from '@/components/LampGlow';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight, BookOpen, MessageCircle, Sparkles, Crown, Share2,
  Compass, ChevronDown, Check, Bookmark, Star,
} from 'lucide-react';

const steps: { step: string; icon: LucideIcon; title: string; description: string }[] = [
  { step: '01', icon: Compass, title: 'Discover', description: 'Browse a curated library of transformative books by mood, topic, or genre.' },
  { step: '02', icon: MessageCircle, title: 'Converse', description: 'Open a conversation with any book. Ask anything — it speaks in the author\'s voice.' },
  { step: '03', icon: Bookmark, title: 'Save & Share', description: 'Highlight key insights, save them forever, and share beautiful quote cards.' },
];

const features: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Sparkles, title: 'AI Book Personas', description: 'Every book has a unique voice. Chat naturally like you\'re talking directly to the author.' },
  { icon: Compass, title: 'Discover by Mood', description: 'Find your next read through topics, moods, and personalized recommendations.' },
  { icon: BookOpen, title: '10 Free Daily Messages', description: 'Start for free. Chat with any book, every day. No credit card required.' },
  { icon: Crown, title: 'Premium Unlimited', description: 'Upgrade for unlimited conversations, deeper insights, and priority responses.' },
  { icon: Bookmark, title: 'Save Highlights', description: 'Save the quotes and insights that matter most. Build your personal knowledge base.' },
  { icon: Share2, title: 'Shareable Insights', description: 'Generate beautiful quote cards from any conversation — designed for sharing.' },
];

const testimonials = [
  { quote: 'This changed how I read. I retain so much more when I can talk through the ideas.', name: 'Sarah K.', role: 'Product Designer', rating: 5 },
  { quote: 'The book personas are surprisingly good. It feels like the author is actually guiding you.', name: 'Michael R.', role: 'Software Engineer', rating: 5 },
  { quote: 'I\'ve read more books in the last month than the entire previous year. Incredible.', name: 'Lisa T.', role: 'Marketing Lead', rating: 5 },
];

const faqs = [
  { q: 'How does the AI know about each book?', a: 'Each book has a carefully crafted persona that understands the themes, characters, and insights of the work. The AI responds in the voice and style of the book itself.' },
  { q: 'Is there a free plan?', a: 'Yes! Every user gets 10 free messages per day. This resets daily, so you can chat with any book every single day without paying.' },
  { q: 'What books are available?', a: 'We have a curated library spanning personal development, psychology, business, philosophy, creativity, and more. New books are added regularly.' },
  { q: 'Can I use Converse on mobile?', a: 'Converse is a web app that works beautifully on any device — phone, tablet, or desktop. No app download required.' },
];

function GoldStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-(--neo-accent) text-(--neo-accent)" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicShell>
      <div className="overflow-hidden">

        {/* ═══ HERO ═══ */}
        <section className="relative py-24 sm:py-32 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
          <LampGlow className="top-0 right-0" size={700} opacity={0.35} />
          <LampGlow className="bottom-0 left-0" size={400} opacity={0.12} />

          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <div
                  className="inline-flex items-center gap-2 text-(--neo-accent) text-xs font-semibold px-3 py-1.5 rounded-full mb-7 border"
                  style={{ backgroundColor: 'var(--neo-accent-light)', borderColor: 'var(--neo-accent)/30' }}
                >
                  <Sparkles size={11} />
                  <span className="mono uppercase tracking-wider">AI-Powered Reading Companion</span>
                </div>

                <h1 className="font-serif leading-[1.05] tracking-tight mb-7 text-(--text-primary)"
                  style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}>
                  Chat with your<br />
                  <em className="text-(--neo-accent) not-italic">favorite books</em>
                </h1>

                <p className="text-lg text-(--text-secondary) max-w-lg mb-9 leading-relaxed">
                  Have conversations with books as if they could talk. Discover, learn, and be inspired — one conversation at a time.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-9">
                  <Link
                    href="/auth/sign-up"
                    data-testid="hero-cta-btn"
                    className="gold-button h-13 px-8 inline-flex items-center justify-center gap-2 font-semibold text-base shadow-[0_4px_24px_rgba(201,168,76,0.3)]"
                  >
                    Start Chatting <ArrowRight size={17} />
                  </Link>
                  <Link
                    href="/books"
                    className="ghost-gold h-13 px-7 inline-flex items-center justify-center gap-2 font-semibold text-base"
                  >
                    <BookOpen size={16} /> Explore Library
                  </Link>
                </div>

                {/* Trust bar */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['#C9A84C', '#9A7A38', '#6B7280', '#4A90A4'].map((c, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center mono text-[10px] font-bold"
                        style={{ backgroundColor: c, borderColor: 'var(--bg)', color: 'var(--text-on-accent)' }}
                      >
                        {['S', 'M', 'L', 'A'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="mono text-[11px] text-(--text-muted) uppercase tracking-wide">
                    Trusted by <strong className="text-(--text-primary)">125k+</strong> readers
                  </span>
                </div>
              </motion.div>

              {/* Chat Preview Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="ink-card p-6 relative shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
                  <LampGlow className="-top-8 -right-8" size={200} opacity={0.5} />

                  {/* Book header */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div
                      className="w-10 h-14 rounded-md flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                      style={{ background: 'linear-gradient(135deg, #2A1608 0%, #1A0E05 100%)' }}
                    >
                      <BookOpen size={15} className="text-(--neo-accent)" />
                    </div>
                    <div className="flex-1">
                      <p className="font-serif font-semibold text-sm text-(--text-primary)">Atomic Habits</p>
                      <p className="mono text-[10px] text-(--text-muted) uppercase tracking-widest">by James Clear</p>
                      <GoldStars count={5} />
                    </div>
                    <span
                      className="mono text-[9px] font-semibold text-(--neo-accent) px-2 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--neo-accent-light)' }}
                    >
                      Live
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[78%] text-sm border-r-2"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--neo-accent)', color: 'var(--text-primary)' }}
                      >
                        How do I build a habit that actually sticks?
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full shrink-0 mt-auto ring-1 ring-(--neo-accent)/30 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--neo-accent-light)' }}
                      >
                        <span className="mono text-[9px] font-bold text-(--neo-accent)">A</span>
                      </div>
                      <div
                        className="px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] text-sm text-(--text-primary) leading-relaxed border-l-2"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--neo-accent)/40', borderLeftColor: 'var(--neo-accent)' }}
                      >
                        The key isn&apos;t motivation — it&apos;s systems. Start with the Two-Minute Rule: scale any habit down to just two minutes.
                      </div>
                    </div>
                    {/* Key Insight */}
                    <div className="book-spine ink-panel px-4 py-3 mx-1 rounded-md">
                      <p className="mono text-[9px] font-medium text-(--neo-accent) mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles size={9} /> Key insight
                      </p>
                      <p className="font-serif text-sm text-(--text-primary) font-medium italic">
                        1% better every day → 37× improvement in a year.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 rounded-full bg-(--neo-success) animate-pulse" />
                    <span className="mono text-[10px] text-(--text-muted)">Live conversation preview</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF BAR ═══ */}
        <section className="py-5 border-y" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <span className="mono text-[11px] font-semibold text-(--text-primary) uppercase tracking-widest">Trusted worldwide</span>
              {[
                '500+ active conversations',
                '100+ curated books',
                '4.9 / 5 satisfaction',
              ].map((s) => (
                <span key={s} className="flex items-center gap-1.5 mono text-[11px] text-(--text-muted)">
                  <Check size={12} className="text-(--neo-success)" /> {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-24 sm:py-32" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-3">How it works</p>
              <h2 className="font-serif tracking-tight text-(--text-primary)" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Three steps to deeper reading
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="ink-card p-7 relative overflow-hidden"
                >
                  {/* Background step numeral */}
                  <span
                    className="absolute top-3 right-4 font-serif font-bold select-none pointer-events-none"
                    style={{ fontSize: '6rem', lineHeight: 1, color: 'var(--neo-accent)', opacity: 0.06 }}
                  >
                    {step.step}
                  </span>
                  <div className="w-11 h-11 rounded-xl gold-button flex items-center justify-center mb-4 relative z-10">
                    <step.icon size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2 text-(--text-primary) relative z-10">{step.title}</h3>
                  <p className="text-sm text-(--text-muted) leading-relaxed relative z-10">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="py-24 sm:py-32" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-3">Features</p>
              <h2 className="font-serif tracking-tight text-(--text-primary)" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Everything you need to read smarter
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="ink-card p-6 group hover:border-(--neo-accent)/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-(--neo-accent-light) flex items-center justify-center mb-3.5 group-hover:bg-(--neo-accent)/20 transition-colors">
                    <feature.icon size={17} className="text-(--neo-accent)" />
                  </div>
                  <h3 className="font-serif font-bold mb-1.5 text-(--text-primary)">{feature.title}</h3>
                  <p className="text-sm text-(--text-muted) leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="py-24 sm:py-32" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-3">Testimonials</p>
              <h2 className="font-serif tracking-tight text-(--text-primary)" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Loved by readers
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="ink-card p-7 flex flex-col"
                >
                  {/* Big decorative quote mark */}
                  <span className="font-serif text-7xl text-(--neo-accent) leading-none mb-1 opacity-40 select-none">&ldquo;</span>
                  <GoldStars count={t.rating} />
                  <p className="font-serif text-(--text-secondary) leading-relaxed my-4 italic text-[15px] flex-1">{t.quote}</p>
                  <div>
                    <p className="font-semibold text-sm text-(--text-primary)">{t.name}</p>
                    <p className="mono text-[10px] text-(--text-muted) uppercase tracking-wider mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section className="py-24 sm:py-32" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-3">Pricing</p>
              <h2 className="font-serif tracking-tight text-(--text-primary)" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Start free, upgrade when ready
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Free */}
              <div className="ink-card p-7 flex flex-col">
                <h3 className="font-serif font-bold text-xl mb-1 text-(--text-primary)">Free</h3>
                <p className="mb-0.5">
                  <span className="font-serif text-4xl font-bold text-(--text-primary)">CHF 0</span>
                  <span className="text-sm text-(--text-muted)"> / forever</span>
                </p>
                <p className="text-sm text-(--text-muted) mb-6">Perfect for casual readers</p>
                <ul className="space-y-3 text-sm text-(--text-muted) mb-7 flex-1">
                  {['10 messages per day', 'Full book library access', 'Basic chat experience', 'Daily limit resets'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check size={12} className="text-(--neo-success) shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="ghost-gold w-full h-11 inline-flex items-center justify-center font-semibold text-sm">
                  Try free
                </Link>
              </div>
              {/* Premium */}
              <div className="ink-card p-7 ring-1 ring-(--neo-accent)/40 relative overflow-hidden flex flex-col">
                <LampGlow className="-top-8 -right-8" size={220} opacity={0.5} />
                <span className="absolute top-4 right-4 mono text-[9px] font-bold text-(--text-on-accent) bg-(--neo-accent) px-2.5 py-1 rounded-full uppercase tracking-wide z-10">
                  Popular
                </span>
                <h3 className="font-serif font-bold text-xl mb-1 text-(--text-primary) relative z-10">Premium</h3>
                <p className="mb-0.5 relative z-10">
                  <span className="font-serif text-4xl font-bold text-(--neo-accent)">CHF 6</span>
                  <span className="text-sm text-(--text-muted)"> / month</span>
                </p>
                <p className="text-sm text-(--text-muted) mb-6 relative z-10">For serious readers</p>
                <ul className="space-y-3 text-sm text-(--text-muted) mb-7 flex-1 relative z-10">
                  {['Unlimited messages', 'Priority AI responses', 'Advanced insights', 'Save & share highlights', 'Early access to new features'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check size={12} className="text-(--neo-success) shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/sign-up"
                  className="gold-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm relative z-10 shadow-[0_4px_20px_rgba(201,168,76,0.25)]"
                >
                  Start premium
                </Link>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-(--text-muted)">
              <Link href="/pricing" className="text-(--neo-accent) hover:underline font-medium">
                See all plans and features
              </Link>
            </p>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-24 sm:py-32" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="mx-auto max-w-[800px] px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.2em] mb-3">FAQ</p>
              <h2 className="font-serif tracking-tight text-(--text-primary)" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Common questions
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="ink-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-(--bg-overlay) transition-colors"
                    data-testid={`faq-item-${i}`}
                  >
                    <span className="font-semibold text-sm pr-4 text-(--text-primary)">{faq.q}</span>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-(--text-muted) transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-sm text-(--text-muted) leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-24 sm:py-28" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="relative rounded-2xl overflow-hidden ink-card p-12 sm:p-16 text-center ring-1 ring-(--neo-accent)/20">
              <LampGlow className="top-0 right-0" size={400} opacity={0.4} />
              <LampGlow className="bottom-0 left-0" size={300} opacity={0.2} />
              <div className="relative z-10">
                <h2
                  className="font-serif tracking-tight mb-4 text-(--text-primary)"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                >
                  Ready to start your first conversation?
                </h2>
                <p className="text-(--text-muted) max-w-lg mx-auto mb-9 leading-relaxed">
                  Join thousands of readers who are already discovering books in a whole new way.
                </p>
                <Link
                  href="/auth/sign-up"
                  className="gold-button inline-flex items-center gap-2 h-12 px-8 font-bold text-base shadow-[0_4px_24px_rgba(201,168,76,0.35)]"
                >
                  Get started free <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
