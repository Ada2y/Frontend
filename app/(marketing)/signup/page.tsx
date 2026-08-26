'use client';

import {useState, useEffect, useRef, type FormEvent} from 'react';
import Link from 'next/link';
import {ApiClient} from '@/lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {credential: string}) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            config: {theme: string; size: string; text: string}
          ) => void;
        };
      };
    };
  }
}

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await ApiClient.register({
        full_name: `${form.get('name')} ${form.get('last-name')}`,
        email: form.get('email') as string,
        password: form.get('password') as string
      });
      setRegisteredEmail(form.get('email') as string);
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    try {
      await ApiClient.resendVerification(registeredEmail);
    } catch {
      // silently ignore
    }
  }

  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    function tryInit() {
      if (cancelled || !clientId || initializedRef.current) return;
      if (!window.google) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: {credential: string}) => {
          ApiClient.googleLogin(response.credential)
            .then((tokens) => {
              localStorage.setItem('access_token', tokens.access_token);
              localStorage.setItem('refresh_token', tokens.refresh_token);
              window.location.href = '/dashboard';
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : 'Google sign-up failed');
            });
        }
      });

      const container = document.getElementById('google-signup-button');
      if (container) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with'
        });
      }
    }

    tryInit();

    const interval = setInterval(() => {
      if (document.getElementById('google-signup-button')?.innerHTML) {
        clearInterval(interval);
        return;
      }
      tryInit();
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="selection:bg-foreground/10 selection:text-foreground bg-background">
      <main className="bg-background">
        <div className="grid min-h-dvh grid-rows-[1fr_auto] gap-6 p-6">
          <div className="m-auto w-full max-w-72 self-center text-center">
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
            <h1 className="mb-10 mt-6 text-xl font-semibold">Sign up for Ada2y</h1>
            <div className="space-y-2">
              {registered ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-success-bg px-3 py-2 text-sm text-success dark:text-green-400">
                    Check your email ({registeredEmail}) for a verification link.
                  </div>
                  <button
                    className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                    onClick={handleResendVerification}
                  >
                    Resend verification email
                  </button>
                  <Link
                    className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 hover:bg-foreground/[0.04] hover:text-foreground h-9 px-4 py-2 w-full"
                    href="/login"
                  >
                    Back to login
                  </Link>
                </div>
              ) : (
                <>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none block text-left"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                        id="name"
                        name="name"
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none block text-left"
                        htmlFor="last-name"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                        id="last-name"
                        name="last-name"
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none block text-left"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                        id="email"
                        name="email"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium leading-none block text-left"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                        id="password"
                        name="password"
                        required
                        placeholder="Create a password"
                        minLength={8}
                      />
                    </div>
                    <button
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-foreground/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background text-muted-foreground px-2">or</span>
                    </div>
                  </div>
                  <div id="google-signup-button" className="w-full flex justify-center" />
                  <div className="text-muted-foreground mt-4 text-sm">
                    Already have an account?{' '}
                    <a className="text-primary font-medium hover:underline" href="/login">
                      Sign in
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
