'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicShell } from '@/components/PublicShell';
import {
  ArrowRight, BookOpen, MessageCircle, Sparkles, Zap, Crown, Share2,
  Compass, ChevronDown, Check, Bookmark,
} from 'lucide-react';

const steps = [
  { icon: <Compass size={20} />, title: 'Discover', description: 'Browse curated books by mood, topic, or genre.' },
  { icon: <MessageCircle size={20} />, title: 'Chat', description: 'Start a conversation with any book. It knows its story.' },
  { icon: <Bookmark size={20} />, title: 'Save & Share', description: 'Highlight insights, save quotes, share with friends.' },
];

const features = [
  { icon: <Sparkles size={18} />, title: 'AI Book Personas', description: 'Every book has a unique voice. Chat naturally like you\'re talking to the author.' },
  { icon: <Compass size={18} />, title: 'Discover by Mood', description: 'Find your next read through topics, moods, and personalized recommendations.' },
  { icon: <Zap size={18} />, title: '10 Free Daily Messages', description: 'Start for free. Chat with any book, every day. No credit card required.' },
  { icon: <Crown size={18} />, title: 'Premium Unlimited', description: 'Upgrade for unlimited conversations, deeper insights, and priority responses.' },
  { icon: <Bookmark size={18} />, title: 'Save Highlights', description: 'Save the quotes and insights that matter. Build your personal knowledge base.' },
  { icon: <Share2 size={18} />, title: 'Shareable Insights', description: 'Generate beautiful quote cards from any conversation. Built for sharing.' },
];

const testimonials = [
  { quote: 'This changed how I read. I retain so much more when I can talk through the ideas.', name: 'Sarah K.', role: 'Product Designer' },
  { quote: 'The book personas are surprisingly good. It feels like the author is guiding you.', name: 'Michael R.', role: 'Software Engineer' },
  { quote: 'I\'ve read more books in the last month than the entire previous year.', name: 'Lisa T.', role: 'Marketing Lead' },
];

const faqs = [
  { q: 'How does the AI know about each book?', a: 'Each book has a carefully crafted persona that understands the themes, characters, and insights of the work. The AI responds in the voice and style of the book itself.' },
  { q: 'Is there a free plan?', a: 'Yes! Every user gets 10 free messages per day. This resets daily, so you can chat with any book every single day without paying.' },
  { q: 'What books are available?', a: 'We have a curated library spanning personal development, psychology, business, philosophy, creativity, and more. New books are added regularly.' },
  { q: 'Can I use ConversAI on mobile?', a: 'ConversAI is a web app that works beautifully on any device — phone, tablet, or desktop. No app download required.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicShell>
      <div className="overflow-hidden">
        <section className="relative py-20 sm:py-28 lg:py-36">
          <div className="absolute inset-0 hero-gradient pointer-events-none" />
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">AI-Powered Reading Companion</p>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.08] tracking-tight mb-6">
                  The modern way to{' '}<span className="text-gradient">read, think and converse.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                  Discover books, open guided conversations, and extract actionable insights from every chapter — in one premium experience.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/sign-up" className="accent-button h-12 px-6 inline-flex items-center gap-2 font-semibold text-base">Start chatting <ArrowRight size={18} /></Link>
                  <Link href="/books" className="outline-button h-12 px-6 inline-flex items-center gap-2 font-semibold text-base">Explore library</Link>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
                <div className="surface-card p-6 relative">
                  <div className="absolute -top-3 -right-3 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-[12px] bg-primary/20 flex items-center justify-center"><BookOpen size={18} className="text-primary" /></div>
                    <div><p className="font-semibold text-sm">Atomic Habits</p><p className="text-xs text-muted-foreground">by James Clear</p></div>
                    <span className="ml-auto text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">Book Persona</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-end"><div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[75%] text-sm">How do I actually build a habit that sticks?</div></div>
                    <div className="flex justify-start"><div className="bg-surface-2 border border-border px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%] text-sm text-foreground/90 leading-relaxed accent-border-left pl-5">Great question. The key isn&apos;t motivation — it&apos;s systems. Start with the Two-Minute Rule: scale any habit down to just two minutes.</div></div>
                    <div className="flex justify-end"><div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[75%] text-sm">What if I keep forgetting?</div></div>
                    <div className="flex justify-start"><div className="bg-surface-2 border border-border px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%] text-sm text-foreground/90 leading-relaxed accent-border-left pl-5">Use habit stacking. Link your new habit to something you already do every day: &ldquo;After I pour my morning coffee, I will read one page.&rdquo;</div></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-success animate-pulse" />Live conversation preview</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-8 border-y border-border">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
              <span className="font-semibold text-foreground">Trusted by readers</span>
              <span>500+ active conversations</span><span>100+ curated books</span><span>4.9/5 satisfaction</span>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Three steps to deeper reading</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="surface-card p-6 text-center">
                  <div className="w-12 h-12 rounded-[14px] accent-button inline-flex items-center justify-center mb-4 mx-auto">{step.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-surface-1/50">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to read smarter</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="surface-card p-5">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center mb-3 text-primary">{feature.icon}</div>
                  <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by readers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="surface-card p-6">
                  <p className="text-foreground/90 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-surface-1/50">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Start free, upgrade when ready</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="surface-card p-6">
                <h3 className="font-semibold text-lg mb-1">Free</h3>
                <p className="text-3xl font-bold mb-4">CHF 0<span className="text-sm font-normal text-muted-foreground"> / forever</span></p>
                <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
                  {['10 messages per day', 'Full book library access', 'Basic chat experience', 'Daily limit resets'].map((f) => (<li key={f} className="flex items-center gap-2"><Check size={14} className="text-success shrink-0" /> {f}</li>))}
                </ul>
                <Link href="/auth/sign-up" className="outline-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm">Try free</Link>
              </div>
              <div className="surface-card p-6 ring-2 ring-primary/30 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                <h3 className="font-semibold text-lg mb-1">Premium</h3>
                <p className="text-3xl font-bold mb-4">CHF 6<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
                <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
                  {['Unlimited messages', 'Priority AI responses', 'Advanced insights', 'Save & share highlights', 'Early access to new features'].map((f) => (<li key={f} className="flex items-center gap-2"><Check size={14} className="text-success shrink-0" /> {f}</li>))}
                </ul>
                <Link href="/auth/sign-up" className="accent-button w-full h-11 inline-flex items-center justify-center font-semibold text-sm">Start premium</Link>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-muted-foreground"><Link href="/pricing" className="text-primary hover:underline">See all plans and features</Link></p>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Common questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="surface-card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer">
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="surface-card p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 hero-gradient pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to start your first conversation?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">Join hundreds of readers who are already discovering books in a whole new way.</p>
                <Link href="/auth/sign-up" className="accent-button h-12 px-8 inline-flex items-center gap-2 font-semibold text-base">Get started free <ArrowRight size={18} /></Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
