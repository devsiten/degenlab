import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DegenLab | Launch Memecoins on Solana',
  description: 'The fastest way to create and trade memecoins on Solana. Launch your token in seconds with bonding curves.',
  keywords: ['solana', 'memecoin', 'token', 'launchpad', 'defi', 'crypto', 'pump.fun'],
  openGraph: {
    title: 'DegenLab | Launch Memecoins on Solana',
    description: 'The fastest way to create and trade memecoins on Solana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DegenLab | Launch Memecoins on Solana',
    description: 'The fastest way to create and trade memecoins on Solana',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
