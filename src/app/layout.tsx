import type { Metadata } from 'next';
import './globals.scss';
import { DatabaseProvider } from '@/context/DatabaseContext';

export const metadata: Metadata = {
  title: 'WebTalk',
  description: 'Minimal social messaging platform',
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
