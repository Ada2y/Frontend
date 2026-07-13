'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ClipboardList} from 'lucide-react';
import {Button} from '@/components/ui/button';

export default function OnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem('athlete-onboarding');
      if (!data) {
        setShow(true);
        return;
      }
      const parsed = JSON.parse(data);
      const hasData = parsed.dob || parsed.gender || parsed.height || parsed.sport;
      if (!hasData) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

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
