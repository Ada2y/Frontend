'use client';

import {useEffect, useState} from 'react';
import {Check, Dumbbell, Loader2} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {
  ApiClient,
  type TrainingPlan,
  type TrainingPlanExercise,
  type TrainingSessionLog,
  type VideoSport
} from '@/lib/api';

// Backend day_of_week is 1=Monday..7=Sunday (TrainingPlanExercise's DB
// check constraint) - index 0 here is deliberately unused so DAY_NAMES[n]
// lines up directly with a day_of_week value of n.
const DAY_NAMES = [
  '',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const SPORTS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];

const selectClassName =
  'flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50';

function formatLoad(ex: TrainingPlanExercise): string {
  if (ex.load_kg == null) return 'Bodyweight';
  return `${ex.load_kg}kg`;
}

function formatRest(seconds: number | null) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s rest`;
  const minutes = seconds / 60;
  return `${minutes % 1 === 0 ? minutes : minutes.toFixed(1)}m rest`;
}

function DayCard({dayIndex, exercises}: {dayIndex: number; exercises: TrainingPlanExercise[]}) {
  const isRestDay = exercises.length === 0;

  return (
    <Card size="sm" className="flex flex-col p-8">
      <CardHeader className="px-0">
        <CardTitle className="text-base">{DAY_NAMES[dayIndex]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-0">
        {isRestDay ? (
          <p className="text-sm text-muted-foreground">Rest day</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {exercises.map((ex) => {
              const rest = formatRest(ex.rest_seconds);
              return (
                <li key={ex.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-foreground">{ex.exercise.name_en}</span>
                  <span className="shrink-0 text-right font-mono text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {ex.sets ?? '-'}×{ex.reps ?? '-'} · {formatLoad(ex)}
                    </span>
                    {rest && <span className="block tabular-nums">{rest}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatLogDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export default function TrainingPlanPage() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [logs, setLogs] = useState<TrainingSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState<VideoSport>('gym');
  const [generating, setGenerating] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logDay, setLogDay] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Server-side source of truth. This used to read an id out of localStorage,
  // so the plan vanished on logout or in another browser and the only way back
  // was to Generate again - a real, billed LLM call every time.
  useEffect(() => {
    let cancelled = false;
    ApiClient.getCurrentTrainingPlan()
      .then((current) => {
        if (cancelled || !current) return;
        setPlan(current);
        // Fetched separately on purpose: losing the (secondary) session-log
        // history must never wipe out an otherwise-valid plan.
        ApiClient.listTrainingSessionLogs(current.id)
          .then((rows) => !cancelled && setLogs(rows))
          .catch(() => {
            // history is a bonus, not core to the page - fail silently
          });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const newPlan = await ApiClient.generateTrainingPlan(sport);
      setPlan(newPlan);
      setLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a training plan.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogSession() {
    if (!plan) return;
    setLogging(true);
    setLogMessage(null);
    try {
      await ApiClient.logTrainingSession(plan.id, {
        day_of_week: logDay ? Number(logDay) : undefined,
        notes: logNotes || undefined
      });
      setLogs(await ApiClient.listTrainingSessionLogs(plan.id));
      setLogMessage('Session logged.');
      setLogDay('');
      setLogNotes('');
    } catch (err) {
      setLogMessage(err instanceof Error ? err.message : 'Failed to log session.');
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Training Plan</h1>
          <p className="text-sm text-muted-foreground">
            Day-by-day exercises, sets, load, and rest periods.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Sport</span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as VideoSport)}
              className={selectClassName}
            >
              {SPORTS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating && <Loader2 className="size-3.5 animate-spin" />}
            Create my plan
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!generating && (
          <EmptyState
            icon={Dumbbell}
            title="No training plan yet"
            description="Generate a personalised week-by-week plan based on your profile and history."
          />
        )}
      </div>
    );
  }

  const exercisesByDay = new Map<number, TrainingPlanExercise[]>();
  for (const ex of plan.exercises) {
    const list = exercisesByDay.get(ex.day_of_week) ?? [];
    list.push(ex);
    exercisesByDay.set(ex.day_of_week, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Training Plan</h1>
          <p className="text-sm text-muted-foreground">
            {plan.title} · <span className="capitalize">{plan.status}</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!window.confirm('This replaces your current plan. Continue?')) return;
            handleGenerate();
          }}
          disabled={generating}
        >
          {generating && <Loader2 className="size-3.5 animate-spin" />}
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <DayCard key={day} dayIndex={day} exercises={exercisesByDay.get(day) ?? []} />
        ))}
      </div>

      <Card className="max-w-xl p-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">Log a completed session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-0">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Which day?</span>
            <select
              value={logDay}
              onChange={(e) => setLogDay(e.target.value)}
              className={selectClassName}
            >
              <option value="">Not tied to a specific day</option>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={day}>
                  {DAY_NAMES[day]}
                </option>
              ))}
            </select>
          </label>
          <textarea
            rows={2}
            placeholder="Optional notes"
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50 resize-none"
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleLogSession} disabled={logging}>
              {logging ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Log session
            </Button>
            {logMessage && <span className="text-xs text-muted-foreground">{logMessage}</span>}
          </div>

          {logs.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5 border-t border-border pt-3">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-foreground">
                    {log.day_of_week ? DAY_NAMES[log.day_of_week] : 'Session'}
                    {log.notes && <span className="text-muted-foreground"> · {log.notes}</span>}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatLogDate(log.completed_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
