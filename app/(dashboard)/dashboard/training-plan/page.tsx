import {Dumbbell} from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';

export default function TrainingPlanPage() {
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
