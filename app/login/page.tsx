'use client';

import {useState, type FormEvent} from 'react';
import Link from 'next/link';
import {ApiClient} from '@/lib/api';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const tokens = await ApiClient.login(form.get('email') as string, form.get('password') as string);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="selection:bg-foreground/10 selection:text-foreground bg-background">
      <main className="bg-background">
        <div className="grid min-h-dvh grid-rows-[1fr_auto] gap-6 p-6">
          <div className="m-auto w-full max-w-72 self-center text-center">
            <Link aria-label="go home" className="mx-auto flex size-10 *:m-auto" href="/">
              <svg className="size-7" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M80 100H28C12.536 100 0 87.464 0 72V28C0 12.536 12.536 0 28 0H72C87.464 0 100 12.536 100 28V80H160C171.046 80 180 88.9543 180 100V167.639C180 175.215 175.72 182.14 168.944 185.528L103.416 218.292C101.17 219.415 98.6923 220 96.1803 220C87.2442 220 80 212.756 80 203.82V100ZM28 20C23.5817 20 20 23.5817 20 28V72C20 76.4183 23.5817 80 28 80H80V28C80 23.5817 76.4183 20 72 20H28ZM100 100H152C156.418 100 160 103.582 160 108V165.092C160 168.103 158.309 170.859 155.625 172.224L111.625 194.591C106.303 197.296 100 193.429 100 187.459V100Z"
                  fill="url(#paint_logo)"
                />
                <defs>
                  <linearGradient id="paint_logo" x1="90" y1="0" x2="90" y2="220" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5e6ad2" />
                    <stop offset="1" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
            <h1 className="mb-10 mt-6 text-xl font-semibold">Log in to Ada2y</h1>
            <div className="space-y-2">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none block text-left" htmlFor="email">
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
                  <label className="text-sm font-medium leading-none block text-left" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full"
                    id="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Continue'}
                </button>
              </form>
              <a
                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 hover:bg-foreground/[0.04] hover:text-foreground h-8 rounded-md px-3 text-xs not-hover:text-muted-foreground w-full"
                href="#"
              >
                Forgot your password?
              </a>
              <div className="text-muted-foreground mt-4 text-sm">
                Don&apos;t have an account?{' '}
                <a className="text-primary font-medium hover:underline" href="/signup">
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}