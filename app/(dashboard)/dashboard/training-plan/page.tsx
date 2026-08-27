'use client';

import {useEffect, useState} from 'react';
import {AlertCircle, Calendar, Check, CheckCircle, Dumbbell, Loader2, Plus, Sparkles, Zap} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {
  ApiClient,
  type TrainingPlan,
  type TrainingPlanExercise,
  type TrainingSessionLog,
  type VideoSport
} from '@/lib/api';
import {LAST_TRAINING_PLAN_ID_KEY} from '@/lib/last-generated';

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
  'flex h-10 min-w-0 rounded-lg bg-input px-3 py-1 text-base text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

const DAY_COLORS: Record<number, string> = {
  1: COLORS.primary,
  2: COLORS.blue,
  3: COLORS.green,
  4: COLORS.amber,
  5: COLORS.red,
  6: '#8b5cf6',
  7: '#ec4899'
};

function formatLoad(ex: TrainingPlanExercise): string {
  if (ex.load_kg == null) return 'BW';
  return `${ex.load_kg}kg`;
}

function formatRest(seconds: number | null) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  return `${minutes % 1 === 0 ? minutes : minutes.toFixed(1)}m`;
}

function formatLogDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function TrainingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-8 w-44 animate-pulse rounded bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded bg-muted [animation-delay:100ms]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
            <div className="flex flex-col gap-3">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted [animation-delay:100ms]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyPlan({sport, onSportChange, onGenerate, generating}: {
  sport: VideoSport;
  onSportChange: (s: VideoSport) => void;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Training Plan</h1>
        <p className="text-base text-muted-foreground">
          Day-by-day exercises, sets, load, and rest periods.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Generate a plan
              </span>
              <p className="mt-0.5 text-sm text-muted-foreground">
                AI-powered plan based on your profile and history
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Sport</span>
              <select
                value={sport}
                onChange={(e) => onSportChange(e.target.value as VideoSport)}
                className={selectClassName}
              >
                {SPORTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <Button size="lg" onClick={onGenerate} disabled={generating}>
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4" />
              )}
              Generate plan
            </Button>
          </div>
        </div>
      </div>

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

function DayCard({dayIndex, exercises}: {dayIndex: number; exercises: TrainingPlanExercise[]}) {
  const isRestDay = exercises.length === 0;
  const color = DAY_COLORS[dayIndex] ?? COLORS.primary;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: color}} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">{DAY_NAMES[dayIndex]}</span>
          {!isRestDay && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {exercises.length} exercise{exercises.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isRestDay ? (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="size-4" />
            <span className="text-sm">Rest day</span>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {exercises.map((ex) => {
              const rest = formatRest(ex.rest_seconds);
              return (
                <div key={ex.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                  <span className="text-base font-medium text-foreground">{ex.exercise.name_en}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                      {ex.sets ?? '-'}×{ex.reps ?? '-'}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                      {formatLoad(ex)}
                    </span>
                    {rest && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                        {rest}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrainingPlanPage() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [logs, setLogs] = useState<TrainingSessionLog[]>([]);
  const [loading, setLoading] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem(LAST_TRAINING_PLAN_ID_KEY)
  );
  const [sport, setSport] = useState<VideoSport>('gym');
  const [generating, setGenerating] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logDay, setLogDay] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedId =
      typeof window !== 'undefined' ? localStorage.getItem(LAST_TRAINING_PLAN_ID_KEY) : null;
    if (!savedId) return;
    ApiClient.getTrainingPlan(savedId)
      .then(setPlan)
      .catch(() => localStorage.removeItem(LAST_TRAINING_PLAN_ID_KEY))
      .finally(() => setLoading(false));
    ApiClient.listTrainingSessionLogs(savedId)
      .then(setLogs)
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const newPlan = await ApiClient.generateTrainingPlan(sport);
      setPlan(newPlan);
      setLogs([]);
      localStorage.setItem(LAST_TRAINING_PLAN_ID_KEY, newPlan.id);
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

  if (loading) return <TrainingSkeleton />;

  if (!plan) {
    return (
      <EmptyPlan
        sport={sport}
        onSportChange={setSport}
        onGenerate={handleGenerate}
        generating={generating}
      />
    );
  }

  const exercisesByDay = new Map<number, TrainingPlanExercise[]>();
  for (const ex of plan.exercises) {
    const list = exercisesByDay.get(ex.day_of_week) ?? [];
    list.push(ex);
    exercisesByDay.set(ex.day_of_week, list);
  }

  const totalExercises = plan.exercises.length;
  const totalSets = plan.exercises.reduce((sum, ex) => sum + (ex.sets ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Training Plan</h1>
          <p className="text-base text-muted-foreground">
            {plan.title} · <span className="capitalize">{plan.status}</span>
          </p>
        </div>
        <Button size="lg" variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating && <Loader2 className="size-4 animate-spin" />}
          Regenerate
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-base text-red-600">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Exercises</span>
              <span className="text-4xl font-bold tracking-tight text-foreground">{totalExercises}</span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Dumbbell className="size-6" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total sets</span>
              <span className="text-4xl font-bold tracking-tight text-foreground">{totalSets}</span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="size-6" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Sessions logged</span>
              <span className="text-4xl font-bold tracking-tight text-foreground">{logs.length}</span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Calendar className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Day grid */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Weekly schedule</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <DayCard key={day} dayIndex={day} exercises={exercisesByDay.get(day) ?? []} />
          ))}
        </div>
      </div>

      {/* Log session */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Check className="size-6 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Log a completed session
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Which day?</span>
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
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Notes</span>
              <input
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Optional notes"
                className="h-10 rounded-lg border border-border bg-background px-3 text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="lg" onClick={handleLogSession} disabled={logging}>
              {logging ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Log session
            </Button>
            {logMessage && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {logMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session history */}
      {logs.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                <Calendar className="size-6 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Session history
                </span>
                <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                  {logs.length}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-base text-foreground">
                    <CheckCircle className="size-4 text-green-500" />
                    {log.day_of_week ? DAY_NAMES[log.day_of_week] : 'Session'}
                    {log.notes && (
                      <span className="text-sm text-muted-foreground">· {log.notes}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                    {formatLogDate(log.completed_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
