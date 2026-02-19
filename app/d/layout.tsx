'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/components/AppShell';

const NeonAuthProvider = dynamic(
  () => import('@/components/NeonAuthProvider'),
  { ssr: false }
);

const AuthSync = dynamic(
  () => import('@/components/AuthSync').then(m => ({ default: m.AuthSync })),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthProvider>
      <AuthSync />
      <AppShell>{children}</AppShell>
    </NeonAuthProvider>
  );
}
