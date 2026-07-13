'use client';

import {useSyncExternalStore} from 'react';
import Link from 'next/link';
import {ClipboardList} from 'lucide-react';
import {Button} from '@/components/ui/button';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): boolean {
  try {
    const data = localStorage.getItem('athlete-onboarding');
    if (!data) return true;
    const parsed = JSON.parse(data);
    return !(parsed.dob || parsed.gender || parsed.height || parsed.sport);
  } catch {
    return true;
  }
}

export default function OnboardingBanner() {
  const show = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!show) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Complete your profile</p>
          <p className="text-xs text-muted-foreground">Takes about 2 minutes</p>
        </div>
      </div>
      <Link href="/dashboard/onboarding">
        <Button size="sm">Start</Button>
      </Link>
    </div>
  );
}
