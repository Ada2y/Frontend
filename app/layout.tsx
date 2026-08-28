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

// Runs before first paint, so the page never flashes the wrong theme. It
// always resolves to an explicit data-theme, which is why globals.css needs
// only two token blocks instead of three.
const THEME_INIT = `(function(){try{
  var stored = localStorage.getItem('theme');
  var resolved = stored === 'light' || stored === 'dark'
    ? stored
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', resolved);
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

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
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{__html: THEME_INIT}} />
      </head>
      <body className="min-h-full bg-background">
        <AuthProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </AuthProvider>
        {/* hl=en pins Google Identity Services to English; without it the
            sign-in button and One Tap follow the browser's UI language. */}
        <Script src="https://accounts.google.com/gsi/client?hl=en" strategy="afterInteractive" />
      </body>
    </html>
  );
}
