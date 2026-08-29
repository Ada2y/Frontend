'use client';

import {useState} from 'react';
import {Check, Copy} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {TeamMember} from '@/lib/api';

/** Falls back to the first and last few characters of the user id when an
 * athlete has no name on their account. The id stays the only honest label in
 * that case, and shortening it keeps rows scannable. */
export function shortAthleteId(userId: string): string {
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 4)}…${userId.slice(-4)}`;
}

/** Roster rows and alerts carry `athlete_name`, but risk stats and the compare
 * endpoint still return bare user ids - so tabs build this once from the
 * roster and look names up by id. */
export function athleteNamesFrom(members: TeamMember[]): Map<string, string | null> {
  return new Map(members.map((m) => [m.user_id, m.athlete_name]));
}

/** Identifies one athlete to their coach. The copy button always hands over
 * the full user id, name or not: that id is what "Add player" and any other
 * id-keyed flow needs, and it is not otherwise visible once a name is shown. */
export default function AthleteLabel({
  userId,
  name,
  className
}: {
  userId: string;
  name?: string | null;
  className?: string;
}) {
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
      <span
        className={cn('text-sm text-foreground', name ? 'font-medium' : 'font-mono')}
        title={userId}
      >
        {name || shortAthleteId(userId)}
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
