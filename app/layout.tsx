import type { Metadata } from 'next';
import { Cormorant_Garamond, Instrument_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { RootAuthWrapper } from '@/components/RootAuthWrapper';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Converse',
  description: 'Interactive Library — Chat with your favorite books.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrumentSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <RootAuthWrapper>{children}</RootAuthWrapper>
      </body>
    </html>
  );
}
