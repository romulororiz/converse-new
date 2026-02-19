import type { Metadata } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import { NeonAuthProvider } from '@/components/NeonAuthProvider';
import { AuthSync } from '@/components/AuthSync';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ConversAI',
  description: 'Interactive Library — Chat with your favorite books.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <NeonAuthProvider>
          <AuthSync />
          {children}
        </NeonAuthProvider>
      </body>
    </html>
  );
}
