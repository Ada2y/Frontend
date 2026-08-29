import {cn} from '@/lib/utils';
import type {TeamRiskStat} from '@/lib/api';

/** The backend's screening bands are low / moderate / elevated (RiskService
 * `_band_for`), which is a different vocabulary from the low/medium/high used
 * by InjuryRiskBadge - hence a separate component rather than a mapping that
 * would quietly rename "elevated" to "high". */
const styles: Record<string, string> = {
  low: 'bg-success-bg text-success',
  moderate: 'bg-warning-bg text-warning',
  elevated: 'bg-danger-bg text-danger'
};

export default function RiskBandBadge({
  band,
  available,
  className
}: {
  band: TeamRiskStat['band'];
  available?: boolean;
  className?: string;
}) {
  if (available === false || !band) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
          className
        )}
      >
        Not enough data
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        styles[band] ?? 'bg-muted text-muted-foreground',
        className
      )}
    >
      {band}
    </span>
  );
}
