import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { SellFab } from '@/components/layout/SellFab';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AgriLoop — Connect. Grow. Trade.', template: '%s · AgriLoop' },
  description:
    'AgriLoop connects Caribbean farmers, buyers and agricultural communities in one digital ecosystem. Built for Jamaica. Architected for the Caribbean.',
  openGraph: {
    title: 'AgriLoop — Connect. Grow. Trade.',
    description: 'The digital agricultural ecosystem for Jamaica and the Caribbean.',
    siteName: 'AgriLoop',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d5138',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col pb-safe-nav">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <SellFab />
        <BottomNav />
      </body>
    </html>
  );
}
