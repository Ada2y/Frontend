'use client';

/**
 * What this analysis is allowed to claim, and why.
 *
 * The caveats used to live in a comment at the top of a rules YAML - visible
 * to whoever opened the repo, and to nobody else - while the app told athletes
 * a stiff landing meant "higher ACL injury risk". The content is served from
 * the same file the thresholds come from, so the claim and the caveat cannot
 * drift apart.
 *
 * Collapsed by default: it has to be present and findable on every report, not
 * shouted on every report.
 */

import {useState} from 'react';
import {ChevronDown, ShieldQuestion} from 'lucide-react';
import type {Evidence} from '@/lib/api';
import {cn} from '@/lib/utils';

const CALIBRATION_NOTE: Record<string, string> = {
  uncalibrated: 'Thresholds here have not been calibrated against real clips of this movement yet.',
  negative_control:
    'Thresholds were checked against curated good-form clips to keep false flags low.'
};

export default function EvidenceNote({evidence}: {evidence: Evidence | null}) {
  const [open, setOpen] = useState(false);
  if (!evidence) return null;

  const supporting = evidence.literature.filter((l) => l.direction === 'supports');
  const contradicting = evidence.literature.filter((l) => l.direction === 'contradicts');
  const calibration = evidence.calibration ? CALIBRATION_NOTE[evidence.calibration] : null;

  return (
    <div className="rounded-lg border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 rounded-lg px-4 py-3 text-left"
      >
        <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{evidence.headline}</span>
          <span className="text-xs text-muted-foreground">
            {open ? 'Hide what this is based on' : 'What is this based on?'}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 text-sm">
          <p className="max-w-prose text-muted-foreground">{evidence.detail}</p>

          {supporting.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What supports it
              </p>
              {supporting.map((item) => (
                <p key={item.finding} className="max-w-prose text-xs text-muted-foreground">
                  {item.finding}
                </p>
              ))}
            </div>
          )}

          {contradicting.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {/* Shown with equal weight, deliberately. Citing only the
                  supporting side would make a contested finding look settled. */}
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What argues against it
              </p>
              {contradicting.map((item) => (
                <p key={item.finding} className="max-w-prose text-xs text-muted-foreground">
                  {item.finding}
                </p>
              ))}
            </div>
          )}

          {evidence.limitations.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What this cannot see
              </p>
              <ul className="flex flex-col gap-1">
                {evidence.limitations.map((limitation) => (
                  <li
                    key={limitation}
                    className="max-w-prose text-xs text-muted-foreground before:mr-1.5 before:content-['—']"
                  >
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {calibration && <p className="text-xs text-muted-foreground">{calibration}</p>}
        </div>
      )}
    </div>
  );
}
