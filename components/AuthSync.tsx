'use client';

import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth/client';

/**
 * Client-side profile bootstrap after OAuth redirect.
 * Uses session state from Neon Auth and retries briefly to absorb
 * transient post-redirect cookie/session propagation delays.
 */
export default function AuthSync() {
  const { data: session, isPending } = authClient.useSession();
  const syncedForId = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (isPending || !userId || syncedForId.current === userId) return;

    syncedForId.current = userId;

    const attempt = (retries = 5, delayMs = 400) => {
      fetch('/api/auth/sync', { method: 'POST' })
        .then((response) => {
          if (!response.ok && retries > 0) {
            setTimeout(() => attempt(retries - 1, delayMs), delayMs);
          }
        })
        .catch(() => {
          if (retries > 0) {
            setTimeout(() => attempt(retries - 1, delayMs), delayMs);
          }
        });
    };

    attempt();
  }, [session?.user?.id, isPending]);

  return null;
}
