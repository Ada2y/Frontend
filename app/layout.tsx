import type {Metadata} from 'next';
import Script from 'next/script';
import {Inter, Geist_Mono} from 'next/font/google';
import './globals.css';
import {AuthProvider} from '@/lib/auth-context';

const inter = Inter({
  variable: '--font-inter-variable',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Ada2y',
  description: 'Sports analytics platform'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background">
        <AuthProvider>{children}</AuthProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
