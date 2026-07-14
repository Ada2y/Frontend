import {cn} from '@/lib/utils';
import type {InjurySeverity} from '@/lib/api';

const styles: Record<InjurySeverity, string> = {
  none: 'bg-muted text-muted-foreground',
  low: 'bg-[#22c55e]/10 text-[#22c55e]',
  moderate: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  high: 'bg-destructive/10 text-destructive',
  critical: 'bg-destructive/15 text-destructive'
};

export default function SeverityBadge({severity}: {severity: InjurySeverity}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        styles[severity]
      )}
    >
      {severity}
    </span>
  );
}
