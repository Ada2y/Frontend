'use client';

import {useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Menu, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {dashboardNavItems} from '@/lib/dashboard-nav';

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <Link
        href="/dashboard"
        className="text-base font-semibold tracking-tight text-foreground lg:hidden"
      >
        Ada2y
      </Link>
      <div className="hidden text-sm font-medium text-foreground lg:block">
        {dashboardNavItems.find((item) => item.href === pathname)?.label ?? 'Dashboard'}
      </div>
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className="-me-2 rounded-md p-2 text-foreground lg:hidden"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav
          aria-label="Dashboard"
          className="absolute inset-x-0 top-14 z-40 flex flex-col gap-1 border-b border-border bg-card p-3 shadow-lg lg:hidden"
        >
          {dashboardNavItems.map((item) => {
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
