'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await authClient.getSession();
      if (!mounted) return;

      if (!data?.session) {
        router.replace('/auth/sign-in');
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted">Checking session…</p>
      </div>
    );
  }

  if (!authorized) return null;
  return <>{children}</>;
}
