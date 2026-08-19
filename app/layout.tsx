import type {Metadata} from 'next';
import Script from 'next/script';
import {Inter, Geist_Mono} from 'next/font/google';
import './globals.css';
import {AuthProvider} from '@/lib/auth-context';
import {TooltipProvider} from '@/components/ui/tooltip';

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
    // Known gap, not yet scoped: the product is Arabic-first/RTL per the
    // requirements doc, but the UI chrome (nav, labels, buttons) is
    // English-only and this is hardcoded ltr. Only specific AI-generated
    // content fields (nutrition text, coach messages) get per-element
    // dir="rtl" today. Full i18n is a separate, deliberate effort.
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background">
        <AuthProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </AuthProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
