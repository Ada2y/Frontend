'use client';

import {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Home, LogOut, Menu, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {navItemsForRole} from '@/lib/dashboard-nav';
import {useAuth} from '@/lib/auth-context';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {user, logout} = useAuth();
  const navItems = navItemsForRole(user?.role);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <Link
        href="/dashboard"
        className="text-base font-semibold tracking-tight text-foreground lg:hidden"
      >
        Ada2y
      </Link>
      <div className="hidden text-sm font-medium text-foreground lg:block">
        {/* Longest matching prefix, so a detail route like
            /dashboard/biomechanics/<id> says "Biomechanics" rather than
            falling through to the generic "Dashboard". */}
        {navItems
          .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
          .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? 'Dashboard'}
      </div>
      <div className="flex items-center gap-1">
        {user && (
          <div className="hidden items-center gap-2 pr-2 lg:flex">
            <span className="text-sm text-foreground">{user.full_name}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Go to home page"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <Home className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>
        <ThemeToggle />
        <NotificationBell />
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Sign out"
          title="Sign out"
          onClick={() => logout()}
        >
          <LogOut className="size-4" />
        </Button>
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="-me-2 rounded-md p-2 text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Dashboard"
          className="absolute inset-x-0 top-14 z-40 flex flex-col gap-1 border-b border-border bg-card p-3 shadow-lg lg:hidden"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/4 hover:text-foreground',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
