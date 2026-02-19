'use client';

import { useEffect, useState } from 'react';
import { fetchSubscriptionStatus, type MessageInfo } from '@/lib/services/subscription';

interface MessageCounterBadgeProps {
  onPress?: () => void;
  variant?: 'pill' | 'circle';
  label?: string;
  className?: string;
  refreshKey?: unknown;
  showSkeleton?: boolean;
  remainingOverride?: number | null;
  planOverride?: 'free' | 'premium' | 'trial' | null;
}

export function MessageCounterBadge({
  onPress,
  variant = 'pill',
  label = 'FREE MESSAGES',
  className,
  refreshKey,
  showSkeleton = false,
  remainingOverride = null,
  planOverride = null,
}: MessageCounterBadgeProps) {
  const [messageInfo, setMessageInfo] = useState<MessageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSubscriptionStatus();
        if (mounted) { setMessageInfo(data.messageInfo); setHasLoadedOnce(true); }
      } catch {
        if (mounted) setMessageInfo(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [refreshKey]);

  const shouldShowSkeleton = (showSkeleton || (loading && !hasLoadedOnce)) && !messageInfo;
  if (shouldShowSkeleton) {
    return <div className={`h-7 min-w-[80px] rounded-full bg-surface-2 animate-pulse ${className ?? ''}`} />;
  }

  const plan = planOverride ?? messageInfo?.plan ?? 'free';
  const remaining =
    remainingOverride !== undefined && remainingOverride !== null
      ? Number(remainingOverride)
      : (messageInfo?.remainingMessages ?? 0);
  const isExhausted = remaining === 0 && plan === 'free';

  if (variant === 'circle') {
    const text = plan === 'premium' ? '\u221E' : String(remaining);
    return (
      <div className={`w-7 h-7 rounded-full ${isExhausted ? 'bg-danger/15 text-danger' : 'accent-button'} flex items-center justify-center font-bold text-xs ${className ?? ''}`}>
        {text}
      </div>
    );
  }

  if (plan === 'premium') {
    return (
      <span className={`text-xs font-semibold uppercase rounded-full px-3 py-1.5 bg-primary/10 text-primary ${className ?? ''}`}>
        UNLIMITED
      </span>
    );
  }

  if (isExhausted) {
    return (
      <button
        onClick={onPress}
        className={`text-xs font-semibold uppercase rounded-full px-3 py-1.5 bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer ${className ?? ''}`}
      >
        UPGRADE
      </button>
    );
  }

  return (
    <button
      onClick={onPress}
      className={`text-xs font-semibold uppercase rounded-full px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${className ?? ''}`}
      disabled={!onPress}
    >
      {loading && remainingOverride === null ? '...' : `${remaining} ${label}`}
    </button>
  );
}
