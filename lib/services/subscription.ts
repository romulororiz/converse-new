export interface SubscriptionInfo {
  subscription_plan: 'free' | 'premium' | 'trial';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_expires_at: string | null;
  message_count: number;
  message_limit: number;
  last_message_reset_date: string | null;
}

export interface MessageInfo {
  canSend: boolean;
  remainingMessages: number;
  limit: number;
  plan: 'free' | 'premium' | 'trial';
}

export async function fetchSubscriptionStatus() {
  const response = await fetch('/api/subscription', { cache: 'no-store' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load subscription status');
  }

  return data as {
    subscription: SubscriptionInfo | null;
    messageInfo: MessageInfo;
  };
}

export async function upgradeSubscription(plan: 'weekly' | 'monthly' | 'yearly') {
  const response = await fetch('/api/subscription/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to upgrade subscription');
  }

  return data as { success: boolean };
}
