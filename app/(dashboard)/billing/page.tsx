'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Crown, Check, Sparkles } from 'lucide-react';
import { LampGlow } from '@/components/LampGlow';
import { fetchSubscriptionStatus, upgradeSubscription } from '@/lib/services/subscription';

export default function BillingPage() {
  const [plan, setPlan] = useState<string>('free');
  const [remaining, setRemaining] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus()
      .then((data) => {
        setPlan(data.messageInfo.plan);
        setRemaining(data.messageInfo.remainingMessages);
        setLimit(data.messageInfo.limit);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    try {
      await upgradeSubscription(planType);
      const data = await fetchSubscriptionStatus();
      setPlan(data.messageInfo.plan);
      setRemaining(data.messageInfo.remainingMessages);
      setLimit(data.messageInfo.limit);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-(--neo-accent) mb-2">
          <CreditCard size={13} />
          <span className="mono text-[10px] font-medium uppercase tracking-[0.18em]">Billing</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-(--text-primary)">Billing & Subscription</h1>
        <p className="text-sm text-(--text-muted) mt-0.5">Manage your plan and usage</p>
      </div>

      {loading ? (
        <div className="ink-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-(--neo-accent)/30 border-t-(--neo-accent) animate-spin" />
        </div>
      ) : (
        <>
          {/* Current plan */}
          <div className="ink-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {plan === 'premium'
                  ? <Crown size={16} className="text-(--neo-accent)" />
                  : <Sparkles size={16} className="text-(--text-muted)" />
                }
                <span className="font-semibold text-(--text-primary)">{plan === 'premium' ? 'Premium' : 'Free'} Plan</span>
              </div>
              {plan === 'premium' && (
                <span className="mono text-[10px] font-medium text-(--neo-accent) bg-(--neo-accent-light) px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Active
                </span>
              )}
            </div>
            {plan !== 'premium' && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-(--text-muted)">Messages today</span>
                  <span className="mono font-semibold text-(--text-primary)">{limit - remaining} / {limit}</span>
                </div>
                <div className="h-2 bg-(--bg-overlay) rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${limit > 0 ? ((limit - remaining) / limit) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, var(--neo-accent) 0%, var(--neo-accent-hover) 100%)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upgrade options */}
          {plan !== 'premium' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="ink-card p-5 flex flex-col">
                <h3 className="font-serif font-semibold text-base mb-1 text-(--text-primary)">Monthly</h3>
                <p className="text-2xl font-bold text-(--text-primary) mb-0.5">
                  CHF 6
                  <span className="text-sm font-normal text-(--text-muted)"> / month</span>
                </p>
                <ul className="space-y-2 text-sm text-(--text-muted) mb-5 flex-1 mt-3">
                  {['Unlimited messages', 'Priority responses', 'Save highlights'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={12} className="text-(--neo-success) shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade('monthly')} className="ghost-gold w-full h-10 font-semibold text-sm">
                  Upgrade monthly
                </button>
              </div>

              {/* Yearly — highlighted */}
              <div className="relative ink-card p-5 flex flex-col ring-1 ring-(--neo-accent)/40 overflow-hidden">
                <LampGlow className="-top-8 -right-8" size={200} opacity={0.6} />
                <span className="absolute top-3 right-3 mono text-[9px] font-semibold text-(--text-on-accent) bg-(--neo-accent) px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Best value
                </span>
                <h3 className="font-serif font-semibold text-base mb-1 text-(--text-primary) relative z-10">Yearly</h3>
                <p className="text-2xl font-bold text-(--text-primary) mb-0.5 relative z-10">
                  CHF 35
                  <span className="text-sm font-normal text-(--text-muted)"> / year</span>
                </p>
                <ul className="space-y-2 text-sm text-(--text-muted) mb-5 flex-1 mt-3 relative z-10">
                  {['Everything in monthly', 'Save over 50%', 'Exclusive perks'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={12} className="text-(--neo-success) shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade('yearly')}
                  className="gold-button w-full h-10 font-semibold text-sm relative z-10"
                >
                  Upgrade yearly
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
