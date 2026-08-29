'use client';

/**
 * The Help centre: how to film every movement Ada2y analyses, and an assistant
 * that answers questions about the platform from the platform's own docs.
 *
 * The demo clips already existed, but only inside the upload flow and only for
 * the one movement being uploaded - so the answer to "how do I film a
 * deadlift?" was reachable only by starting a deadlift upload. Here they are a
 * browsable library, grouped by movement pattern.
 */

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {Activity, BookOpen, Camera, LifeBuoy, Search, ShieldAlert, Upload, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import ExerciseGuideCard from '@/app/(dashboard)/_components/ExerciseGuideCard';
import HelpChat from '@/app/(dashboard)/_components/HelpChat';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import {guideCategories} from '@/lib/exercise-guides';

const QUICK_LINKS = [
  {
    href: '/dashboard/videos',
    icon: Upload,
    label: 'Upload a video',
    description: 'Record 3-5 reps and send them for analysis.'
  },
  {
    href: '/dashboard/biomechanics',
    icon: Activity,
    label: 'Your analyses',
    description: 'Per-rep checks, evidence frames and corrections.'
  },
  {
    href: '/dashboard/injury-risk',
    icon: ShieldAlert,
    label: 'Injury risk',
    description: 'Risk indicators, and what they do and do not mean.'
  }
];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const categories = useMemo(() => guideCategories(), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories
      .map((category) => ({
        ...category,
        guides: category.guides.filter(
          (guide) =>
            guide.label.toLowerCase().includes(needle) ||
            guide.style.label.toLowerCase().includes(needle) ||
            guide.sport.includes(needle)
        )
      }))
      .filter((category) => category.guides.length > 0);
  }, [categories, query]);

  const totalShown = filtered.reduce((sum, category) => sum + category.guides.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <LifeBuoy className="size-6 text-primary" />
          Help
        </h1>
        <p className="text-base text-muted-foreground">
          How to film every movement Ada2y analyses, and an assistant that answers questions about
          the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{link.label}</span>
                <span className="text-xs text-muted-foreground">{link.description}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* The library and the assistant sit side by side on a wide screen: the
          questions the assistant gets asked are mostly about the clips, and
          making someone scroll past twelve videos to reach the ask box would
          hide the fastest route to an answer. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex-col items-start gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="size-4 text-primary" />
                  How to film each movement
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Copy the framing in the clip. A wrong angle completes with the analysis skipped.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a movement…"
                  aria-label="Filter movements"
                  className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-8 text-sm text-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear filter"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </CardHeader>
          </Card>

          {totalShown === 0 ? (
            <EmptyState
              icon={Search}
              title="No movement matches that"
              description="Try a movement name like squat or deadlift, a camera angle like side, or a sport."
            />
          ) : (
            filtered.map((category) => (
              <section key={category.key} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{category.label}</h2>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {category.guides.map((guide) => (
                    <ExerciseGuideCard key={guide.value} guide={guide} />
                  ))}
                </div>
              </section>
            ))
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-primary" />
                What Ada2y deliberately does not measure
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                Where a measurement cannot be made honestly from one camera, Ada2y does not estimate
                it. An absent check means &ldquo;we cannot see this&rdquo;, never &ldquo;this was
                fine&rdquo;.
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs">
                <li>
                  Spinal rounding is never checked, for any exercise — the pose model produces 17
                  body keypoints and none of them are on the spine.
                </li>
                <li>
                  Knee valgus needs a front-facing camera and is not checked from the side view most
                  gym movements ask for.
                </li>
                <li>
                  Every measurement is a 2D projection of a 3D movement, so angles shift with camera
                  position.
                </li>
              </ul>
              <p className="text-xs">
                Ada2y is a movement-analysis tool, not a medical device. Nothing it produces is a
                diagnosis. If something hurts, that is a question for a clinician.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sticky on a wide screen so the assistant stays reachable while
            scrolling a long library; static below that, where a pinned panel
            would eat most of the viewport. */}
        <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-6rem)]">
          <HelpChat />
        </div>
      </div>
    </div>
  );
}
