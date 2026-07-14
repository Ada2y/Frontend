import {cn} from '@/lib/utils';
import type {InjuryRiskLevel} from '@/lib/api';

const styles: Record<InjuryRiskLevel, string> = {
  low: 'bg-[#22c55e]/10 text-[#22c55e]',
  medium: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  high: 'bg-destructive/10 text-destructive'
};

const labels: Record<InjuryRiskLevel, string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk'
};

export default function InjuryRiskBadge({level}: {level: InjuryRiskLevel}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        styles[level]
      )}
    >
      {labels[level]}
    </span>
  );
}
