import {FlaskConical} from 'lucide-react';
import {cn} from '@/lib/utils';

/** Marks a panel whose data still comes from lib/mocks/* because the backend
 * has no endpoint for it yet. Sitting next to panels that are now wired to the
 * real API, unlabelled mock data would read as production data. */
export default function MockBadge({className}: {className?: string}) {
  return (
    <span
      title="Sample data - this feature has no backend endpoint yet"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning',
        className
      )}
    >
      <FlaskConical className="size-3" />
      Sample data
    </span>
  );
}
