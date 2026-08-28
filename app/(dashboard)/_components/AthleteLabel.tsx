'use client';

import {useState} from 'react';
import {Check, Copy} from 'lucide-react';
import {cn} from '@/lib/utils';

/** The coach-facing endpoints (/coach/teams/{id}, /alerts, /risk-stats) return
 * bare athlete user ids - the backend exposes no name lookup to a coach - so a
 * roster row can only honestly identify a player by that id. Showing the first
 * and last few characters keeps rows scannable; the copy button hands over the
 * full id, which is what the coach needs to paste anywhere else. */
export function shortAthleteId(userId: string): string {
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}

export default function AthleteLabel({userId, className}: {userId: string; className?: string}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is unavailable outside a secure context - the id is still
      // selectable by hand, so there is nothing useful to report here.
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="font-mono text-sm text-foreground" title={userId}>
        {shortAthleteId(userId)}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Athlete id copied' : 'Copy full athlete id'}
        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active-scale-98"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}
