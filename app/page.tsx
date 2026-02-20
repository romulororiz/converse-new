'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicShell } from '@/components/PublicShell';
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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="fill-[#C4822A] text-[#C4822A]" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicShell>
      <div className="overflow-hidden">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 lg:py-36 bg-[#FAF9F6]">
          <div className="absolute inset-0 hero-gradient pointer-events-none" />
          {/* Decorative warm blobs */}
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-[#C4822A]/8 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-[5%] w-80 h-80 rounded-full bg-[#A86A1D]/8 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <div className="inline-flex items-center gap-2 bg-[#C4822A]/10 text-[#C4822A] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[#C4822A]/20">
                  <Sparkles size={12} /> AI-Powered Reading Companion
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6 text-foreground">
                  Chat with your<br />
                  <span className="text-gradient">favorite books</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                  Have conversations with books as if they could talk. Discover, learn, and be inspired — one conversation at a time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href="/auth/sign-up"
                    data-testid="hero-cta-btn"
                    className="accent-button h-12 px-7 inline-flex items-center justify-center gap-2 font-semibold text-base"
                  >
                    Start Chatting <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/books"
                    className="outline-button h-12 px-6 inline-flex items-center justify-center gap-2 font-semibold text-base text-foreground"
                  >
                    <BookOpen size={16} /> Explore Library
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex -space-x-1.5">
                    {['#C4822A', '#A86A1D', '#2E7D5E', '#6B7280'].map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: c }}>
                        {['S', 'M', 'L', 'A'][i]}
                      </div>
                    ))}
                  </div>
                  <span>Trusted by <strong className="text-foreground">125k+</strong> readers</span>
                </div>
              </motion.div>

              {/* Chat Preview Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="surface-card p-6 relative shadow-lg">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#C4822A]/8 rounded-full blur-2xl" />

                  {/* Book header */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                    <div className="w-10 h-14 rounded-[8px] bg-gradient-to-br from-[#C4822A] to-[#8B5A1A] flex items-center justify-center shadow-md">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">Atomic Habits</p>
                      <p className="text-xs text-muted-foreground">by James Clear</p>
                      <StarRating count={5} />
                    </div>
                    <span className="text-xs text-[#C4822A] bg-[#C4822A]/10 px-2.5 py-1 rounded-full font-medium border border-[#C4822A]/15">
                      Live
                    </span>
                  </div>

                  {/* Chat messages */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[75%] text-sm">
                        How do I build a habit that actually sticks?
                      </div>
                    </div>
                    <div className="flex justify-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#C4822A]/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-auto">
                        A
                      </div>
                      <div className="bg-surface-2 border border-border px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] text-sm text-foreground/90 leading-relaxed accent-border-left pl-4">
                        The key isn&apos;t motivation — it&apos;s systems. Start with the Two-Minute Rule: scale any habit down to just two minutes.
                      </div>
                    </div>
                    {/* Key Insight callout */}
                    <div className="highlight-callout px-4 py-3 mx-1">
                      <p className="text-[11px] font-semibold text-[#C4822A] mb-1 flex items-center gap-1.5">
                        <Sparkles size={11} /> Key insight
                      </p>
                      <p className="text-sm text-foreground/85 font-medium">1% better every day → 37x improvement in a year.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D5E] animate-pulse" />
                    Live conversation preview
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="py-6 border-y border-border bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Trusted by readers worldwide</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#2E7D5E]" /> 500+ active conversations</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#2E7D5E]" /> 100+ curated books</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#2E7D5E]" /> 4.9 / 5 satisfaction</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-24 bg-[#FAF9F6]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#C4822A] mb-2 uppercase tracking-wide">How it works</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Three steps to deeper reading</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="surface-card p-7 relative overflow-hidden"
                >
                  <span className="absolute top-5 right-5 font-serif text-5xl font-bold text-foreground/5 select-none">{step.step}</span>
                  <div className="w-11 h-11 rounded-[12px] bg-primary flex items-center justify-center mb-4 text-white">
                    <step.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#C4822A] mb-2 uppercase tracking-wide">Features</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to read smarter</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="surface-card p-6 group hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-[#C4822A]/10 flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <feature.icon size={18} />
                  </div>
                  <h3 className="font-bold mb-1.5 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-24 bg-[#FAF9F6]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#C4822A] mb-2 uppercase tracking-wide">Testimonials</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Loved by readers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="surface-card p-6"
                >
                  <StarRating count={t.rating} />
                  <p className="text-foreground/85 leading-relaxed my-4 italic text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#C4822A] mb-2 uppercase tracking-wide">Pricing</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Start free, upgrade when ready</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="surface-card p-7">
                <h3 className="font-bold text-lg mb-1 text-foreground">Free</h3>
                <p className="text-4xl font-bold mb-1 text-foreground">CHF 0<span className="text-base font-normal text-muted-foreground"> / forever</span></p>
                <p className="text-sm text-muted-foreground mb-5">Perfect for casual readers</p>
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  {['10 messages per day', 'Full book library access', 'Basic chat experience', 'Daily limit resets'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#2E7D5E]/10 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-[#2E7D5E]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="outline-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm">
                  Try free
                </Link>
              </div>
              <div className="surface-card p-7 ring-2 ring-primary/20 relative">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                  MOST POPULAR
                </span>
                <h3 className="font-bold text-lg mb-1 text-foreground">Premium</h3>
                <p className="text-4xl font-bold mb-1 text-foreground">CHF 6<span className="text-base font-normal text-muted-foreground"> / month</span></p>
                <p className="text-sm text-muted-foreground mb-5">For serious readers</p>
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  {['Unlimited messages', 'Priority AI responses', 'Advanced insights', 'Save & share highlights', 'Early access to new features'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#2E7D5E]/10 flex items-center justify-center shrink-0">
                        <Check size={11} className="text-[#2E7D5E]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="accent-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm">
                  Start premium
                </Link>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="text-primary hover:underline font-medium">See all plans and features</Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-24 bg-[#FAF9F6]">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#C4822A] mb-2 uppercase tracking-wide">FAQ</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Common questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="surface-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
                    data-testid={`faq-item-${i}`}
                  >
                    <span className="font-semibold text-sm pr-4 text-foreground">{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="rounded-[24px] bg-[#C4822A] p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(196,130,42,0.8) 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
                  Ready to start your first conversation?
                </h2>
                <p className="text-white/70 max-w-lg mx-auto mb-8 leading-relaxed">
                  Join thousands of readers who are already discovering books in a whole new way.
                </p>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 bg-white text-[#A86A1D] h-12 px-8 rounded-[12px] font-bold text-base hover:bg-white/90 transition-colors"
                >
                  Get started free <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
