import {Dumbbell, Moon} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {mockTrainingPlan} from '@/lib/mocks/training-plan';

export default function TrainingPlanPage() {
  const plan = mockTrainingPlan;

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
          <Card key={d.day} size="sm" className="p-8">
            <CardHeader className="px-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{d.day}</CardTitle>
                {d.is_rest_day && <Moon className="size-4 text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {d.is_rest_day ? (
                <p className="text-sm text-muted-foreground">Rest day</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {d.exercises.map((ex) => (
                    <li key={ex.name} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-foreground">{ex.name}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {ex.sets}×{ex.reps} · {ex.load}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
