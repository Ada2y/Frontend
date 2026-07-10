import {ShieldAlert} from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';

export default function ReviewQueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          Flagged clinically sensitive recommendations awaiting human sign-off.
        </p>
      </div>
      <EmptyState
        icon={ShieldAlert}
        title="Queue is clear"
        description="Recommendations flagged as pending_review will appear here until an admin clears or escalates them."
      />
    </div>
  );
}
