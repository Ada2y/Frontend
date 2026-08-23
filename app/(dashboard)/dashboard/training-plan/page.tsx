'use client';

import {useEffect, useState} from 'react';
import {Check, Dumbbell, Loader2} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {cn} from '@/lib/utils';
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

// Borg CR10. Anchors matter more than the numbers - an unlabelled 1-10 slider
// gets answered inconsistently, which is worse than no data for a ratio that
// compares this week against the same athlete's baseline.
const RPE_SCALE = [
  {value: 2, label: '2 — very easy'},
  {value: 3, label: '3 — easy'},
  {value: 4, label: '4 — comfortable'},
  {value: 5, label: '5 — moderate'},
  {value: 6, label: '6 — somewhat hard'},
  {value: 7, label: '7 — hard'},
  {value: 8, label: '8 — very hard'},
  {value: 9, label: '9 — near maximal'},
  {value: 10, label: '10 — maximal'}
];

const SPORTS: {value: VideoSport; label: string}[] = [
  {value: 'gym', label: 'Gym'},
  {value: 'football', label: 'Football'}
];

const selectClassName =
  'flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2362666d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")]';

function formatLoad(ex: TrainingPlanExercise): string {
  if (ex.load_kg == null) return 'Bodyweight';
  // The API sends a NUMERIC, so 80 arrives as "80.00". Two decimals on a
  // barbell load implies a precision no plate set has.
  const kg = Math.round(ex.load_kg * 10) / 10;
  return `${kg} kg`;
}

function formatRest(seconds: number | null) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s rest`;
  const minutes = seconds / 60;
  return `${minutes % 1 === 0 ? minutes : minutes.toFixed(1)}m rest`;
}

/** JS getDay() is 0=Sunday; the backend's day_of_week is 1=Monday..7=Sunday. */
function todayDayOfWeek(): number {
  const js = new Date().getDay();
  return js === 0 ? 7 : js;
}

function DayCard({
  dayIndex,
  exercises,
  isToday
}: {
  dayIndex: number;
  exercises: TrainingPlanExercise[];
  isToday: boolean;
}) {
  const isRestDay = exercises.length === 0;

  return (
    // The page's job is answering "what am I doing today", and seven equal
    // cards made the athlete work that out for themselves.
    <Card
      size="sm"
      className={cn(
        'flex flex-col p-8',
        isToday && 'ring-1 ring-primary',
        isRestDay && 'opacity-70'
      )}
    >
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {DAY_NAMES[dayIndex]}
          {isToday && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
              Today
            </span>
          )}
        </CardTitle>
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
  const [logRpe, setLogRpe] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const today = todayDayOfWeek();
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
        perceived_exertion: logRpe ? Number(logRpe) : undefined,
        notes: logNotes || undefined
      });
      setLogs(await ApiClient.listTrainingSessionLogs(plan.id));
      setLogMessage('Session logged.');
      setLogDay('');
      setLogRpe('');
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

        {error && <p className="text-sm text-danger">{error}</p>}

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
            {/* plan.status is an internal enum (DRAFT/ACTIVE/ARCHIVED). The
                athlete only ever sees their current plan, so the state adds
                nothing and "Draft" reads as though it isn't ready. */}
            {plan.title}
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
          <DayCard
            key={day}
            dayIndex={day}
            exercises={exercisesByDay.get(day) ?? []}
            isToday={day === today}
          />
        ))}
      </div>

      <Card className="max-w-3xl p-8">
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
          <fieldset className="flex flex-col gap-1.5 border-0 p-0">
            <legend className="text-xs font-medium text-muted-foreground">How hard was it?</legend>
            {/* This is the load proxy behind the injury-risk workload factor,
                the training-load ratio and the "hard session recently"
                readiness rule. The form never asked for it, so all three were
                running on the backend's neutral fallback. */}
            <div className="flex flex-wrap gap-1">
              {RPE_SCALE.map((step) => (
                <button
                  key={step.value}
                  type="button"
                  onClick={() => setLogRpe(logRpe === String(step.value) ? '' : String(step.value))}
                  aria-pressed={logRpe === String(step.value)}
                  title={step.label}
                  className={cn(
                    'size-8 rounded-md font-mono text-xs tabular-nums transition-colors',
                    logRpe === String(step.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {step.value}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {logRpe
                ? RPE_SCALE.find((s) => String(s.value) === logRpe)?.label
                : 'Optional, but it powers your readiness and injury-risk screening.'}
            </span>
          </fieldset>

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
