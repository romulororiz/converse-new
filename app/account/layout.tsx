'use client';

import dynamic from 'next/dynamic';

const NeonAuthProvider = dynamic(
  () => import('@/components/NeonAuthProvider'),
  { ssr: false }
);

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <NeonAuthProvider>{children}</NeonAuthProvider>;
}
