'use client';

import dynamic from 'next/dynamic';

const NeonAuthProvider = dynamic(
  () => import('@/components/NeonAuthProvider'),
  { ssr: false }
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <NeonAuthProvider>{children}</NeonAuthProvider>;
}
