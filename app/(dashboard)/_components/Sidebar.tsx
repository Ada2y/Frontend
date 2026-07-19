'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';
import {navItemsForRole} from '@/lib/dashboard-nav';
import {useAuth} from '@/lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const {user} = useAuth();
  const navItems = navItemsForRole(user?.role);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center px-6">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight text-foreground">
          Ada2y
        </Link>
      </div>
      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none',
                'hover:bg-foreground/4 hover:text-foreground',
                'focus-visible:ring-3 focus-visible:ring-ring/50',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
