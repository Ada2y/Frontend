import {CheckCircle2, Clock} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {NutritionStatus} from '@/lib/api';

export default function NutritionStatusBadge({status}: {status: NutritionStatus}) {
  const isPending = status === 'pending_review';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        isPending ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#22c55e]/10 text-[#22c55e]'
      )}
    >
      {isPending ? <Clock className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
      {isPending ? 'Pending clinical review' : 'Reviewed & approved'}
    </span>
  );
}
