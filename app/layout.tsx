import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import NeonAuthProvider from '@/components/NeonAuthProvider';
import AuthSync from '@/components/AuthSync';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ConversAI',
  description: 'Interactive Library — Discover books that transform lives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <NeonAuthProvider>
          <AuthSync />
          {children}
        </NeonAuthProvider>
      </body>
    </html>
  );
}
