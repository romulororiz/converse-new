'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles } from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';

const plans = [
  {
    name: 'Free',
    price: 'CHF 0',
    period: 'forever',
    description: 'Perfect for casual readers who want to explore.',
    features: [
      '10 messages per day',
      'Full book library access',
      'Basic chat experience',
      'Daily limit resets automatically',
      'Search and discover books',
    ],
    cta: 'Get started free',
    href: '/auth/sign-up',
    highlight: false,
  },
  {
    name: 'Monthly',
    price: 'CHF 6',
    period: 'month',
    description: 'For avid readers who want unlimited depth.',
    features: [
      'Unlimited messages',
      'Priority AI responses',
      'Advanced insights & summaries',
      'Save & share highlights',
      'Early access to new features',
      'Priority support',
    ],
    cta: 'Start premium',
    href: '/auth/sign-up',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Yearly',
    price: 'CHF 35',
    period: 'year',
    description: 'Best value for committed learners.',
    features: [
      'Everything in Monthly',
      'Save over 50%',
      'Annual billing convenience',
      'Exclusive yearly member perks',
    ],
    cta: 'Start yearly',
    href: '/auth/sign-up',
    highlight: false,
    badge: 'Best value',
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Pricing</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Start free with 10 daily messages. Upgrade for unlimited conversations and premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`surface-card p-6 relative flex flex-col ${
                plan.highlight ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {plan.highlight ? (
                    <Crown size={18} className="text-primary" />
                  ) : (
                    <Sparkles size={18} className="text-muted-foreground" />
                  )}
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                </div>
                <p className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground"> / {plan.period}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="text-success shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`w-full h-11 inline-flex items-center justify-center font-semibold text-sm ${
                  plan.highlight ? 'accent-button' : 'outline-button'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </PublicShell>
  );
}
