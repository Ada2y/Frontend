'use client';

import {useState} from 'react';
import {Dumbbell, Moon, Check, X, RotateCcw} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {mockTrainingPlan} from '@/lib/mocks/training-plan';
import type {SessionStatus, TrainingPlanDay} from '@/lib/api';
import {cn} from '@/lib/utils';

function formatRest(seconds: number) {
  if (seconds === 0) return null;
  if (seconds < 60) return `${seconds}s rest`;
  const minutes = seconds / 60;
  return `${minutes % 1 === 0 ? minutes : minutes.toFixed(1)}m rest`;
}

function DayStatusPill({status}: {status: SessionStatus}) {
  if (status === 'pending') return null;
  const isCompleted = status === 'completed';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        isCompleted ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-muted text-muted-foreground'
      )}
    >
      {isCompleted ? <Check className="size-3" /> : <X className="size-3" />}
      {isCompleted ? 'Completed' : 'Skipped'}
    </span>
  );
}

function DayCard({
  day,
  onSetStatus
}: {
  day: TrainingPlanDay;
  onSetStatus: (status: SessionStatus) => void;
}) {
  return (
    <Card size="sm" className="flex flex-col p-8">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{day.day}</CardTitle>
          <div className="flex items-center gap-2">
            <DayStatusPill status={day.status} />
            {day.is_rest_day && <Moon className="size-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4 px-0">
        {day.is_rest_day ? (
          <p className="text-sm text-muted-foreground">Rest day</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {day.exercises.map((ex) => {
              const rest = formatRest(ex.rest_seconds);
              return (
                <li key={ex.name} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-foreground">{ex.name}</span>
                  <span className="shrink-0 text-right font-mono text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {ex.sets}×{ex.reps} · {ex.load}
                    </span>
                    {rest && <span className="block tabular-nums">{rest}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {!day.is_rest_day && (
          <div className="flex gap-2">
            {day.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onSetStatus('completed')}
                >
                  <Check className="size-3.5" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => onSetStatus('skipped')}
                >
                  <X className="size-3.5" />
                  Skip
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => onSetStatus('pending')}
              >
                <RotateCcw className="size-3.5" />
                Undo
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TrainingPlanPage() {
  const [plan, setPlan] = useState(mockTrainingPlan);

  function handleSetStatus(dayName: string, status: SessionStatus) {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.day === dayName ? {...d, status} : d))
    }));
    // Real wiring lands once POST /training-plans/{id}/logs is live (Day 6-7):
    // ApiClient.logTrainingSession(plan.id, {day: dayName, completed: status === 'completed'})
  }

  if (!plan.days.length) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Training Plan</h1>
          <p className="text-sm text-muted-foreground">
            Day-by-day exercises, sets, load, and rest periods.
          </p>
        </div>
        <EmptyState
          icon={Dumbbell}
          title="No training plan yet"
          description="A personalised week-by-week plan will appear here after your first biomechanics report."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Training Plan</h1>
        <p className="text-sm text-muted-foreground">
          Week of{' '}
          {new Date(plan.week_start).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plan.days.map((d) => (
          <DayCard key={d.day} day={d} onSetStatus={(status) => handleSetStatus(d.day, status)} />
        ))}
      </div>
    </div>
  );
}
