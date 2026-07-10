import {LayoutDashboard} from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Your latest training plan and nutrition status.
        </p>
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="No sessions yet"
        description="Once a video is processed, your training plan and nutrition summary will appear here."
      />
    </div>
  );
}
