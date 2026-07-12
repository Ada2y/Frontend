import {Users} from 'lucide-react';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">Manage your squad from a single dashboard.</p>
      </div>
      <EmptyState
        icon={Users}
        title="No team yet"
        description="Create a team and invite players via a unique link or phone number to get started."
      />
    </div>
  );
}
