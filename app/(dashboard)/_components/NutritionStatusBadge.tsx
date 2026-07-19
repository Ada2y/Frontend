import {CheckCircle2, Clock, XCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {NutritionStatus} from '@/lib/api';

const STATUS_META: Record<NutritionStatus, {label: string; className: string; icon: typeof Clock}> =
  {
    pending_review: {
      label: 'Pending clinical review',
      className: 'bg-[#f59e0b]/10 text-[#f59e0b]',
      icon: Clock
    },
    auto_approved: {
      label: 'Auto-approved',
      className: 'bg-[#22c55e]/10 text-[#22c55e]',
      icon: CheckCircle2
    },
    approved: {
      label: 'Reviewed & approved',
      className: 'bg-[#22c55e]/10 text-[#22c55e]',
      icon: CheckCircle2
    },
    flagged: {label: 'Flagged', className: 'bg-red-500/10 text-red-600', icon: XCircle},
    rejected: {label: 'Rejected', className: 'bg-red-500/10 text-red-600', icon: XCircle}
  };

export default function NutritionStatusBadge({status}: {status: NutritionStatus}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        meta.className
      )}
    >
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}
