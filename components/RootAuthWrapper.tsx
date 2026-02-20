'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth/client';

const NeonAuthProvider = dynamic(
  () => import('@/components/NeonAuthProvider'),
  { ssr: false }
);

const AuthSync = dynamic(
  () => import('@/components/AuthSync').then((m) => ({ default: m.AuthSync })),
  { ssr: false }
);

/**
 * Wraps the app with NeonAuthProvider and AuthSync so session and profile
 * are available (and created) on every page, including after OAuth redirect to landing.
 * Redirects authenticated users from / to /home.
 */
export function RootAuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const redirectDone = useRef(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || redirectDone.current) return;
    if (pathname !== '/') return;
    if (session?.user?.id) {
      redirectDone.current = true;
      router.replace('/home');
    }
  }, [pathname, session?.user?.id, isPending, router]);

  return (
    <NeonAuthProvider>
      <AuthSync />
      {children}
    </NeonAuthProvider>
  );
}
