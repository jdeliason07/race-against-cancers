import type { Metadata } from 'next';
import { Anton, Saira } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  EVENT_NAME, META_DESCRIPTION, SITE_URL,
} from '@/config/site';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const saira = Saira({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-saira',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: `${EVENT_NAME} — 10K & Fun Run`, template: `%s | ${EVENT_NAME}` },
  description: META_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: EVENT_NAME,
    description: META_DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: EVENT_NAME,
    description: META_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${saira.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
