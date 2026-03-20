import type { Metadata } from 'next';
import './globals.scss';
import { DatabaseProvider } from '@/context/DatabaseContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://webtalk-one.vercel.app'),

  title: {
    default: 'WebTalk',
    template: '%s | WebTalk',
  },

  description: 'WebTalk — modern minimal messaging platform. Chat fast, simple and secure.',

  keywords: ['chat app', 'messenger', 'web chat', 'real-time chat', 'social messaging', 'WebTalk'],

  authors: [{ name: 'WebTalk Team' }],
  creator: 'WebTalk',
  publisher: 'WebTalk',

  applicationName: 'WebTalk',

  openGraph: {
    title: 'WebTalk',
    description: 'Minimal social messaging platform for fast communication.',
    url: 'https://webtalk-one.vercel.app',
    siteName: 'WebTalk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WebTalk Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'WebTalk',
    description: 'Minimal social messaging platform.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },

  manifest: '/site.webmanifest',

  themeColor: '#0a0f1c',

  viewport: {
    width: 'device-width',
    initialScale: 1,
  },

  robots: {
    index: true,
    follow: true,
  },

  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <DatabaseProvider>{children}</DatabaseProvider>
      </body>
    </html>
  );
}
