console.error('=== ROOT LAYOUT FILE LOADED ===');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.error('=== ROOT LAYOUT RENDERING ===');
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
