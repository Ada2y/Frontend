'use client';

/**
 * A failed check's correction, shown either way the athlete asks for.
 *
 * The pipeline produces the same solved geometry twice: as coordinates
 * (`correction_pose`), which the client redraws as clean vectors, and as a JPEG
 * baked over the source frame (`correction_image`). Both were already being
 * generated; only the vector one was ever shown, on the grounds that the baked
 * overlay is unreadable on busy footage. That is true, and it is also not the
 * whole story - seeing the correction on your own body in the actual room is
 * what makes some people believe it. So: both, and the athlete picks.
 *
 * The choice is shared across every check on the page and remembered between
 * visits (see lib/correction-view).
 */

import {Info, PersonStanding, Video} from 'lucide-react';
import CorrectionCanvas from './CorrectionCanvas';
import EvidenceImage from './EvidenceImage';
import {useCorrectionView, type CorrectionView as View} from '@/lib/correction-view';
import type {CheckResult} from '@/lib/api';
import {cn} from '@/lib/utils';

const OPTIONS: {value: View; label: string; icon: typeof Video}[] = [
  {value: 'skeleton', label: 'Skeleton', icon: PersonStanding},
  {value: 'frame', label: 'On my video', icon: Video}
];

function ViewToggle({value, onChange}: {value: View; onChange: (next: View) => void}) {
  return (
    <div
      role="radiogroup"
      aria-label="Show the correction on"
      className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CorrectionView({videoId, check}: {videoId: string; check: CheckResult}) {
  const [view, setView] = useCorrectionView();

  // Older analyses carry only one of the two - reports predating
  // correction_pose have just the JPEG, and a check whose geometry couldn't be
  // solved honestly has neither. Offering a toggle with one working side would
  // be a control that silently does nothing.
  const hasSkeleton = check.correction_pose !== null;
  const hasFrame = check.correction_image !== null;
  if (!hasSkeleton && !hasFrame) {
    return check.evidence_image ? (
      <EvidenceImage videoId={videoId} filename={check.evidence_image} alt="Evidence frame" />
    ) : null;
  }

  const effective: View = hasSkeleton && hasFrame ? view : hasSkeleton ? 'skeleton' : 'frame';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          How to fix it
          {!hasSkeleton && ' (this analysis predates the skeleton view)'}
        </span>
        {hasSkeleton && hasFrame && <ViewToggle value={view} onChange={setView} />}
      </div>

      {effective === 'skeleton' && check.correction_pose ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CorrectionCanvas correction={check.correction_pose} />
          {check.evidence_image && (
            <figure className="flex flex-col gap-1">
              <figcaption className="text-xs font-medium text-muted-foreground">
                The frame this came from
              </figcaption>
              <EvidenceImage
                videoId={videoId}
                filename={check.evidence_image}
                alt="The video frame this check was measured on"
              />
            </figure>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {check.evidence_image && (
              <figure className="flex flex-col gap-1">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  Your rep
                </figcaption>
                <EvidenceImage
                  videoId={videoId}
                  filename={check.evidence_image}
                  alt="Your rep, with the joints this check measured picked out"
                />
              </figure>
            )}
            {check.correction_image && (
              <figure className="flex flex-col gap-1">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  With the correction
                </figcaption>
                <EvidenceImage
                  videoId={videoId}
                  filename={check.correction_image}
                  alt="Your rep with the target pose drawn over it"
                />
              </figure>
            )}
          </div>
          {check.correction_pose?.summary && (
            <p className="font-mono text-xs tabular-nums text-foreground">
              {check.correction_pose.summary}
            </p>
          )}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3 shrink-0" />
            The cyan outline is an illustrative guide solved from your own frame, not an exact
            biomechanical prescription.
          </p>
        </div>
      )}
    </div>
  );
}
