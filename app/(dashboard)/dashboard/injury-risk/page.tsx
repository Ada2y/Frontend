'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Activity,
  ChevronDown,
  HeartPulse,
  Info,
  ShieldCheck,
  TrendingUp,
  Weight
} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {ApiClient, type RiskAssessment, type RiskFactor} from '@/lib/api';
import {cn} from '@/lib/utils';

const BAND = {
  low: {label: 'Low', text: 'text-green-600', ring: 'ring-green-500/25', bar: 'bg-green-500'},
  moderate: {
    label: 'Moderate',
    text: 'text-amber-600',
    ring: 'ring-amber-500/25',
    bar: 'bg-amber-500'
  },
  elevated: {label: 'Elevated', text: 'text-red-600', ring: 'ring-red-500/25', bar: 'bg-red-500'}
} as const;

/** Icon per factor family, so the list scans without reading every label. */
function FactorIcon({factorKey, className}: {factorKey: string; className?: string}) {
  if (factorKey.startsWith('injury:')) return <HeartPulse className={className} />;
  if (factorKey.startsWith('movement:')) return <Activity className={className} />;
  if (factorKey === 'workload') return <TrendingUp className={className} />;
  if (factorKey === 'body_metrics') return <Weight className={className} />;
  return <Info className={className} />;
}

/** Counts up once on reveal. Deliberately the only animation on the page -
 * it marks the moment the number arrives, and nothing else moves. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function CountUp({value}: {value: number}) {
  // Seed with the final value when motion is reduced (or during SSR) so the
  // effect never has to synchronously correct state.
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const duration = 600;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out: fast then settling, so it reads as landing rather than ticking
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{shown}</>;
}

function FactorRow({factor, max}: {factor: RiskFactor; max: number}) {
  const [open, setOpen] = useState(false);
  const width = max > 0 ? Math.max((factor.points / max) * 100, 2) : 0;

  return (
    <li className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <FactorIcon factorKey={factor.key} className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-foreground">{factor.label}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              +{factor.points}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/30 transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{width: `${width}%`}}
            />
          </div>
        </div>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-2 pb-3 pl-7">
          <p className="text-sm text-muted-foreground">{factor.detail}</p>
          {Object.keys(factor.evidence).length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(factor.evidence).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 text-xs">
                  <dt className="truncate text-muted-foreground">{k.replace(/_/g, ' ')}</dt>
                  <dd className="shrink-0 font-mono tabular-nums text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </li>
  );
}

export default function InjuryRiskPage() {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.getInjuryRisk()
      .then((r) => !cancelled && setRisk(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to load.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const header = (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Injury Risk</h1>
      <p className="text-sm text-muted-foreground">
        A screening indicator built from your own training data.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="h-40 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
        <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!risk?.available) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          icon={ShieldCheck}
          title="Not enough data yet"
          description={
            risk?.note ??
            'Log a few training sessions or upload a video and this will start working.'
          }
        />
      </div>
    );
  }

  const band = BAND[risk.band ?? 'low'];
  const scoring = risk.factors.filter((f) => f.points > 0);
  const context = risk.factors.filter((f) => f.points === 0);
  const max = Math.max(...scoring.map((f) => f.points), 1);

  return (
    <div className="flex flex-col gap-6">
      {header}

      <Card className={cn('p-8 ring-1', band.ring)}>
        <CardContent className="flex flex-col gap-5 px-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Current screening score
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-6xl leading-none font-semibold tabular-nums text-foreground">
                  <CountUp value={risk.score ?? 0} />
                </span>
                <span className={cn('text-xl font-medium', band.text)}>{band.label}</span>
              </div>
            </div>
            <Link href="/dashboard/profile" className="text-xs font-medium text-primary underline">
              Update injuries & metrics
            </Link>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none',
                band.bar
              )}
              style={{width: `${Math.min(risk.score ?? 0, 100)}%`}}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="p-8">
        <CardContent className="flex flex-col gap-1 px-0">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            What&apos;s driving it
          </p>
          <ul className="flex flex-col divide-y divide-border">
            {scoring.map((f) => (
              <FactorRow key={f.key} factor={f} max={max} />
            ))}
          </ul>
          {scoring.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing is currently adding to your score.
            </p>
          )}
        </CardContent>
      </Card>

      {context.length > 0 && (
        <Card className="p-8">
          <CardContent className="flex flex-col gap-2 px-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tracked, not currently contributing
            </p>
            {context.map((f) => (
              <div key={f.key} className="flex items-start gap-2 text-sm">
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{f.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {risk.disclaimer}
      </div>
    </div>
  );
}
