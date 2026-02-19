import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConversAI',
  description: 'Interactive Library — Chat with your favorite books.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('[ROOT LAYOUT] Rendering root layout');
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
