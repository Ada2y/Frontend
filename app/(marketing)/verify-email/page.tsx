'use client';

import {Suspense, useEffect, useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {ApiClient} from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(token ? '' : 'No verification token provided');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        await ApiClient.verifyEmail(token);
        if (!cancelled) {
          setStatus('success');
          setMessage('Email verified successfully');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err instanceof Error ? err.message : 'Verification failed');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="theme-light selection:bg-foreground/10 selection:text-foreground bg-background">
      <main className="relative bg-background">
        {/* One indigo wash off the top edge - the logo's own hue - so the white
            form card has something to lift off of. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80rem_45rem_at_50%_-15%,rgba(94,106,210,0.12),transparent_65%)]"
        />
        {/* pt clears the fixed floating header, which otherwise sits on top of
            the logo above the form. */}
        <div className="relative grid min-h-dvh grid-rows-[1fr_auto] gap-6 p-6 pt-20 lg:pt-24">
          <div className="m-auto w-full max-w-sm self-center text-center">
            <Link aria-label="go home" className="mx-auto flex size-10 *:m-auto" href="/">
              <svg
                className="size-7"
                viewBox="0 0 180 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M80 100H28C12.536 100 0 87.464 0 72V28C0 12.536 12.536 0 28 0H72C87.464 0 100 12.536 100 28V80H160C171.046 80 180 88.9543 180 100V167.639C180 175.215 175.72 182.14 168.944 185.528L103.416 218.292C101.17 219.415 98.6923 220 96.1803 220C87.2442 220 80 212.756 80 203.82V100ZM28 20C23.5817 20 20 23.5817 20 28V72C20 76.4183 23.5817 80 28 80H80V28C80 23.5817 76.4183 20 72 20H28ZM100 100H152C156.418 100 160 103.582 160 108V165.092C160 168.103 158.309 170.859 155.625 172.224L111.625 194.591C106.303 197.296 100 193.429 100 187.459V100Z"
                  fill="url(#paint_logo)"
                />
                <defs>
                  <linearGradient
                    id="paint_logo"
                    x1="90"
                    y1="0"
                    x2="90"
                    y2="220"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#5e6ad2" />
                    <stop offset="1" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
            <h1 className="mb-6 mt-5 text-xl font-semibold tracking-tight text-foreground">
              Verify your email
            </h1>
            <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(8,9,10,0.04),0_12px_32px_-12px_rgba(8,9,10,0.16)] ring-1 ring-foreground/[0.06] sm:p-8">
              <div className="space-y-4">
                {status === 'loading' && (
                  <p className="text-muted-foreground text-sm">Verifying your email...</p>
                )}
                {status === 'success' && (
                  <>
                    <div className="rounded-md bg-success-bg px-3 py-2 text-sm text-success">
                      {message}
                    </div>
                    <Link
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                      href="/login"
                    >
                      Go to login
                    </Link>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {message}
                    </div>
                    <Link
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                      href="/login"
                    >
                      Back to login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
