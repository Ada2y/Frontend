'use client';

/**
 * This session vs your previous one vs your best.
 *
 * The design constraint is not to overclaim. "Best" is defined server-side by
 * one rule applied to every session, and a metric no rule governs is drawn in
 * neutral grey - colouring it green would assert a direction nobody defined.
 */

import {useEffect, useMemo, useState} from 'react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Equal, Trophy, TrendingDown, TrendingUp} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type SessionComparison as Comparison,
  type TrendDirection
} from '@/lib/api';
import {cn} from '@/lib/utils';

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

const DIRECTION: Record<TrendDirection, {icon: typeof TrendingUp; className: string}> = {
  improving: {icon: TrendingUp, className: 'text-success'},
  regressing: {icon: TrendingDown, className: 'text-danger'},
  stable: {icon: Equal, className: 'text-muted-foreground'},
  neutral: {icon: Equal, className: 'text-muted-foreground'}
};

function exerciseLabel(value: string): string {
  return ALL_EXERCISES.find((e) => e.value === value)?.label ?? value.replace(/_/g, ' ');
}

function DeltaRow({delta}: {delta: Comparison['deltas'][number]}) {
  const {icon: Icon, className} = DIRECTION[delta.direction];
  const sign = delta.change > 0 ? '+' : '';
  const unit = delta.unit ?? '';

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm text-foreground">{delta.label}</span>
        {!delta.has_polarity && (
          // Say why it isn't coloured, rather than leaving it looking broken.
          <span className="text-[11px] text-muted-foreground">
            no target for this measure - shown for context
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 font-mono text-xs tabular-nums">
        <span className="text-muted-foreground">
          {delta.previous}
          {unit} → <span className="text-foreground">{delta.current}</span>
          {unit}
        </span>
        <span className={cn('flex w-16 items-center justify-end gap-1', className)}>
          <Icon className="size-3" />
          {sign}
          {delta.change}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function SessionComparison() {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  // Keyed by exercise so "is this stale?" is derived rather than tracked in a
  // separate loading flag that has to be flipped from inside an effect.
  const [loaded, setLoaded] = useState<{exercise: string; result: Comparison | null} | null>(null);
  const [exercisesLoaded, setExercisesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ApiClient.listMyExercises()
      .then((list) => {
        if (cancelled) return;
        setExercises(list);
        setSelected((current) => current ?? list[0] ?? null);
        setExercisesLoaded(true);
      })
      .catch(() => !cancelled && setExercisesLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const exercise = selected;
    ApiClient.getSessionComparison(exercise)
      .then((result) => !cancelled && setLoaded({exercise, result}))
      .catch(() => !cancelled && setLoaded({exercise, result: null}));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const data = loaded?.exercise === selected ? loaded.result : null;
  const loading = selected !== null && loaded?.exercise !== selected;

  const chartData = useMemo(
    () =>
      (data?.sessions ?? []).map((s) => ({
        date: s.date.slice(5),
        passRate: s.pass_rate === null ? null : Math.round(s.pass_rate * 100),
        reps: s.rep_count
      })),
    [data]
  );

  if (exercisesLoaded && exercises.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Nothing to compare yet"
        description="Upload a couple of sessions for the same exercise and you'll see how they stack up."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {exercises.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                selected === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {exerciseLabel(value)}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="h-64 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      )}

      {!loading && data && !data.available && (
        <Card>
          <CardContent className="flex flex-col gap-1 p-8">
            <p className="text-lg text-foreground">Not enough sessions yet</p>
            <p className="text-sm text-muted-foreground">{data.note}</p>
          </CardContent>
        </Card>
      )}

      {!loading && data?.available && (
        <>
          <Card className={cn(data.is_personal_best && 'ring-1 ring-success/25')}>
            <CardContent className="flex flex-col gap-6 p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Latest {exerciseLabel(data.exercise)} session
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-5xl leading-none font-semibold tabular-nums text-foreground">
                      {Math.round((data.current?.pass_rate ?? 0) * 100)}
                      <span className="text-2xl text-muted-foreground">%</span>
                    </span>
                    <span className="text-sm text-muted-foreground">checks passed</span>
                  </div>
                </div>
                {data.is_personal_best && (
                  <span className="flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-sm font-medium text-success">
                    <Trophy className="size-4" />
                    Personal best
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                {[
                  {label: 'Previous', session: data.previous},
                  {label: 'Best', session: data.best},
                  {label: 'Reps this time', value: data.current?.rep_count}
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-lg tabular-nums text-foreground">
                      {'value' in item
                        ? (item.value ?? '-')
                        : `${Math.round((item.session?.pass_rate ?? 0) * 100)}%`}
                    </span>
                    {'session' in item && item.session && (
                      <span className="text-[11px] text-muted-foreground">{item.session.date}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checks passed over time</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top: 8, right: 8, bottom: 0, left: -20}}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="passRate"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{r: 3}}
                    // Skipped sessions would otherwise be bridged by a
                    // straight line implying data we don't have.
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {data.deltas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  What changed since {data.previous?.date}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col">
                {data.deltas.map((delta) => (
                  <DeltaRow key={delta.key} delta={delta} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
