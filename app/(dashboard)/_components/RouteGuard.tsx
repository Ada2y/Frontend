'use client';

import {useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {Loader2, ShieldX} from 'lucide-react';
import {useAuth} from '@/lib/auth-context';
import {allowedRolesForPath} from '@/lib/dashboard-nav';

/** Client-side guard for everything under /dashboard.
 *
 * It has to run in the browser rather than in Next middleware: the access
 * token lives in localStorage, which the server never sees, so a middleware
 * check would have no way to tell a signed-in visitor from an anonymous one.
 *
 * This is a UX guard, not a security boundary - every endpoint behind these
 * screens re-checks the role server-side (`require_role`), so bypassing this
 * only gets you a page that 403s. */
export default function RouteGuard({children}: {children: React.ReactNode}) {
  const {user, loading} = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const allowedRoles = allowedRolesForPath(pathname);
  const forbidden = !!user && !!allowedRoles && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // Rendering the page while /auth/me is still in flight would flash the
  // dashboard at someone who turns out to be signed out.
  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-8 py-16 text-center ring-1 ring-foreground/10">
        <div className="flex size-10 items-center justify-center rounded-full bg-danger-bg">
          <ShieldX className="size-5 text-danger" />
        </div>
        <h1 className="text-base font-medium text-foreground">You don&apos;t have access</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page is limited to a different role. If you think that&apos;s wrong, ask a platform
          admin to update your account.
        </p>
        <Link href="/dashboard" className="mt-1 text-sm font-medium text-primary hover:underline">
          Back to overview
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
