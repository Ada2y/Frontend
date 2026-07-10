import {Apple} from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';

export default function NutritionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Nutrition</h1>
        <p className="text-sm text-muted-foreground">
          Clinically aware nutrition advice based on your training load and medical conditions.
        </p>
      </div>
      <EmptyState
        icon={Apple}
        title="No nutrition advice yet"
        description="Log a meal or upload a session to receive nutrition recommendations here."
      />
    </div>
  );
}
