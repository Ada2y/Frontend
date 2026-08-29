'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {ArrowDown, ArrowUp, Minus, Trophy} from 'lucide-react';
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import AthleteLabel, {
  athleteNamesFrom,
  shortAthleteId
} from '@/app/(dashboard)/_components/AthleteLabel';
import MockBadge from '@/app/(dashboard)/_components/MockBadge';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type SessionComparison,
  type TeamDetail
} from '@/lib/api';
import {TeamService, type CoachAnnotation} from '@/lib/mocks/team-service';

const chartConfig = {
  pass_rate: {label: 'Pass rate %', color: 'var(--chart-1)'}
} satisfies ChartConfig;

/** The coach endpoint compares one athlete's own sessions over time (same
 * ComparisonService the athlete's own view uses). There is no head-to-head
 * endpoint, so this tab charts a single athlete's progression rather than
 * overlaying two players. */
const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

function DeltaIcon({direction}: {direction: string}) {
  if (direction === 'improving') return <ArrowUp className="size-3.5 text-success" />;
  if (direction === 'regressing') return <ArrowDown className="size-3.5 text-danger" />;
  return <Minus className="size-3.5 text-muted-foreground" />;
}

function PrivateNotes({
  athleteUserId,
  athleteName
}: {
  athleteUserId: string;
  athleteName: string | null | undefined;
}) {
  const [annotations, setAnnotations] = useState<CoachAnnotation[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    TeamService.listAnnotations(athleteUserId).then((data) => {
      if (!cancelled) setAnnotations(data);
    });
    return () => {
      cancelled = true;
    };
  }, [athleteUserId]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    const added = await TeamService.addAnnotation(athleteUserId, note.trim());
    setAnnotations((prev) => [...prev, added]);
    setNote('');
  }

  return (
    <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Private notes on {athleteName || shortAthleteId(athleteUserId)}
        </p>
        <MockBadge />
      </div>
      <div className="flex flex-col gap-2">
        {annotations.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No notes yet — these live in this browser only, until the backend has a notes endpoint.
          </p>
        )}
        {annotations.map((a) => (
          <div key={a.id} className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
            {a.note}
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(a.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a private note…"
          className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        <Button type="submit" size="sm" disabled={!note.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}

export default function CompareTab({team}: {team: TeamDetail}) {
  const [athleteId, setAthleteId] = useState(team.members[0]?.user_id ?? '');
  const [exercise, setExercise] = useState(ALL_EXERCISES[0].value as string);
  const [comparison, setComparison] = useState<SessionComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // compare-reports takes a user id and returns sessions, never a name, so the
  // roster is what turns the picker and the header into readable labels.
  const namesById = athleteNamesFrom(team.members);

  useEffect(() => {
    if (!athleteId || !exercise) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiClient.compareAthleteReports(athleteId, exercise);
        if (!cancelled) setComparison(data);
      } catch (err) {
        if (cancelled) return;
        setComparison(null);
        setError(err instanceof Error ? err.message : 'Failed to load this comparison.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [athleteId, exercise]);

  if (team.members.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
        Add a player to the roster before comparing sessions.
      </p>
    );
  }

  const chartData = (comparison?.sessions ?? []).map((s) => ({
    date: s.date,
    pass_rate: s.pass_rate != null ? Math.round(s.pass_rate * 100) : null
  }));

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Athlete</Label>
          <Select value={athleteId} onValueChange={setAthleteId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {team.members.map((m) => (
                <SelectItem
                  key={m.user_id}
                  value={m.user_id}
                  className={m.athlete_name ? undefined : 'font-mono'}
                >
                  {m.athlete_name || shortAthleteId(m.user_id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Exercise</Label>
          <Select value={exercise} onValueChange={setExercise}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_EXERCISES.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Selected</Label>
          <AthleteLabel
            userId={athleteId}
            name={namesById.get(athleteId)}
            className="h-9 items-center"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-72 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
      ) : comparison && !comparison.available ? (
        <p className="rounded-xl bg-card p-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
          {comparison.note ?? 'Nothing to compare for this exercise yet.'}
        </p>
      ) : comparison ? (
        <>
          <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Pass rate per session (%)
              </p>
              {comparison.is_personal_best && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success">
                  <Trophy className="size-3" />
                  Personal best
                </span>
              )}
            </div>
            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
              <LineChart data={chartData} margin={{left: 12, right: 12}}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
                  }
                />
                <YAxis tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="pass_rate"
                  stroke="var(--color-pass_rate)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ChartContainer>
          </div>

          {comparison.deltas.length > 0 && (
            <div className="rounded-xl bg-card p-8 ring-1 ring-foreground/10">
              <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                This session vs the previous one
              </p>
              <div className="flex flex-col gap-3">
                {comparison.deltas.map((d) => (
                  <div key={d.key} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <DeltaIcon direction={d.direction} />
                      {d.label}
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {d.previous.toFixed(1)} → {d.current.toFixed(1)}
                      {d.unit ? ` ${d.unit}` : ''}
                    </span>
                  </div>
                ))}
              </div>
              {/* Metrics with no rule governing them are reported as changed,
                  never as improved - so the icon stays neutral for those. */}
              <p className="mt-4 text-xs text-muted-foreground">
                Metrics without a governing rule are shown as changed, not better or worse.
              </p>
            </div>
          )}
        </>
      ) : null}

      {athleteId && (
        <PrivateNotes athleteUserId={athleteId} athleteName={namesById.get(athleteId)} />
      )}
    </div>
  );
}
