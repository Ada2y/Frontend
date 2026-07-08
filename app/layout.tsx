import type {Metadata} from 'next';
import {Inter, Geist_Mono} from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fdfcfd]">{children}</body>
    </html>
  );
}
