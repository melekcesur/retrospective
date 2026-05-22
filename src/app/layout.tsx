import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RetroApp',
  description: 'Anonim sprint retrospektif aracı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
