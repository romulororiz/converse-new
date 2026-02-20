'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Crown, Check, Sparkles } from 'lucide-react';
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
    <div className="max-w-2xl space-y-6 pb-24 md:pb-6">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-1">
          <CreditCard size={13} /> Billing
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and usage</p>
      </div>

      {loading ? (
        <div className="surface-card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Current plan */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {plan === 'premium' ? <Crown size={16} className="text-primary" /> : <Sparkles size={16} className="text-muted-foreground" />}
                <span className="font-semibold">{plan === 'premium' ? 'Premium' : 'Free'} Plan</span>
              </div>
              {plan === 'premium' && (
                <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">Active</span>
              )}
            </div>
            {plan !== 'premium' && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Messages today</span>
                  <span>{limit - remaining} / {limit}</span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${limit > 0 ? ((limit - remaining) / limit) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upgrade options */}
          {plan !== 'premium' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="surface-card p-5 flex flex-col">
                <h3 className="font-semibold mb-1">Monthly</h3>
                <p className="text-2xl font-bold mb-1">CHF 6<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 flex-1">
                  {['Unlimited messages', 'Priority responses', 'Save highlights'].map((f) => (
                    <li key={f} className="flex items-center gap-1.5"><Check size={13} className="text-success" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade('monthly')} className="outline-button w-full h-10 font-semibold text-sm">
                  Upgrade monthly
                </button>
              </div>
              <div className="surface-card p-5 flex flex-col ring-2 ring-primary/30 relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  Best value
                </span>
                <h3 className="font-semibold mb-1">Yearly</h3>
                <p className="text-2xl font-bold mb-1">CHF 35<span className="text-sm font-normal text-muted-foreground"> / year</span></p>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 flex-1">
                  {['Everything in monthly', 'Save over 50%', 'Exclusive perks'].map((f) => (
                    <li key={f} className="flex items-center gap-1.5"><Check size={13} className="text-success" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade('yearly')} className="accent-button w-full h-10 font-semibold text-sm">
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
