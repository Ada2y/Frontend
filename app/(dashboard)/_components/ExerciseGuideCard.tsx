'use client';

/**
 * One movement's filming guide: the demo clip, the angle it needs, the steps,
 * and what good form looks like.
 *
 * The clip is the guide and everything else is a caption for it - people copy
 * framing they can see far more reliably than framing described in a sentence.
 * The form GIF is deliberately secondary and behind a toggle: it answers a
 * different question ("what am I aiming for?") and showing both looping at once
 * makes the card read as decoration rather than instruction.
 */

import {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Camera, CheckCircle, Dumbbell, Upload, VideoOff, X} from 'lucide-react';
import {FILMING_DONTS, FILMING_DOS, type ExerciseGuide} from '@/lib/exercise-guides';
import {cn} from '@/lib/utils';

type Panel = 'angle' | 'form';

export default function ExerciseGuideCard({guide}: {guide: ExerciseGuide}) {
  const [panel, setPanel] = useState<Panel>('angle');
  const showingForm = panel === 'form' && guide.gif;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-video w-full bg-black">
        {showingForm ? (
          // unoptimized: an optimized GIF loses its animation, which is the
          // entire content of this image.
          <Image
            src={guide.gif!}
            alt={`${guide.label} performed with good form`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain"
          />
        ) : guide.clip ? (
          <video
            key={guide.clip.video}
            src={guide.clip.video}
            poster={guide.clip.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={`${guide.label} filmed from the required camera angle`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <VideoOff className="size-5" />
            <span className="text-xs">No demo clip yet</span>
          </div>
        )}

        <span
          className={cn(
            'absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 backdrop-blur-sm',
            guide.style.color
          )}
        >
          <span className="text-xs">{guide.style.icon}</span>
          {guide.style.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{guide.label}</h3>
          {guide.gif && guide.clip && (
            <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setPanel('angle')}
                aria-pressed={panel === 'angle'}
                title="How to film it"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                  panel === 'angle'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Camera className="size-3" />
                Filming
              </button>
              <button
                type="button"
                onClick={() => setPanel('form')}
                aria-pressed={panel === 'form'}
                title="What good form looks like"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                  panel === 'form'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Dumbbell className="size-3" />
                Form
              </button>
            </div>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{guide.view}</p>

        <ol className="flex flex-col gap-1.5">
          {guide.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-semibold text-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-3">
          {FILMING_DOS.map((tip) => (
            <div key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="mt-0.5 size-3 shrink-0 text-success" />
              <span>{tip}</span>
            </div>
          ))}
          {FILMING_DONTS.map((tip) => (
            <div key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <X className="mt-0.5 size-3 shrink-0 text-danger" />
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/videos"
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-border text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Upload className="size-3.5" />
          Upload a {guide.label.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
