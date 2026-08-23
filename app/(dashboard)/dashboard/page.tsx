'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Activity,
  Apple,
  CheckCircle2,
  Dumbbell,
  LayoutDashboard,
  Moon,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import OnboardingBanner from '@/app/(dashboard)/_components/OnboardingBanner';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import {useAuth} from '@/lib/auth-context';
import {
  ApiClient,
  type NutritionRecommendation,
  type Readiness,
  type ReadinessVerdict,
  type RiskAssessment,
  type TrainingPlan,
  type VideoListItem
} from '@/lib/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

const BAND_STYLES: Record<string, {label: string; ring: string; text: string}> = {
  low: {label: 'Low', ring: 'ring-green-500/25', text: 'text-green-600'},
  moderate: {label: 'Moderate', ring: 'ring-amber-500/25', text: 'text-amber-600'},
  elevated: {label: 'Elevated', ring: 'ring-red-500/25', text: 'text-red-600'}
};

const VERDICT_STYLES: Record<
  ReadinessVerdict,
  {label: string; ring: string; text: string; icon: typeof CheckCircle2}
> = {
  train: {
    label: 'Train',
    ring: 'ring-green-500/25',
    text: 'text-green-600',
    icon: CheckCircle2
  },
  modify: {
    label: 'Modify',
    ring: 'ring-amber-500/25',
    text: 'text-amber-600',
    icon: SlidersHorizontal
  },
  rest: {label: 'Rest', ring: 'ring-red-500/25', text: 'text-red-600', icon: Moon}
};

/** The one primary element on this page, and the question an athlete actually
 * asks. The risk score sits underneath it as supporting detail rather than
 * leading - a number out of 100 is not an answer to "should I train today". */
function ReadinessHero({
  readiness,
  risk
}: {
  readiness: Readiness | null;
  risk: RiskAssessment | null;
}) {
  if (!readiness) return null;

  if (!readiness.available) {
    return (
      <Card className="p-8">
        <CardContent className="flex flex-col gap-2 px-0">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Should I train today?
          </span>
          <p className="text-lg text-foreground">{readiness.headline}</p>
          <p className="text-sm text-muted-foreground">
            Log a training session or upload a video and this starts working.
          </p>
        </CardContent>
      </Card>
    );
  }

  const style = VERDICT_STYLES[readiness.verdict ?? 'train'];
  const Icon = style.icon;
  const band = BAND_STYLES[risk?.band ?? 'low'] ?? BAND_STYLES.low;
  // reasons[0] is the one that decided the verdict - the server sorts
  // worst-first so the deciding reason can never end up buried.
  const [deciding, ...rest] = readiness.reasons;

  return (
    <Card className={`p-8 ring-1 ${style.ring}`}>
      <CardContent className="flex flex-col gap-6 px-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Should I train today?
            </span>
            <div className="flex items-center gap-3">
              <Icon className={`size-9 shrink-0 ${style.text}`} />
              <span className={`text-4xl leading-none font-semibold ${style.text}`}>
                {style.label}
              </span>
            </div>
            {deciding && <p className="max-w-prose text-sm text-foreground">{deciding.text}</p>}
          </div>

          {risk?.available && (
            <Link
              href="/dashboard/injury-risk"
              className="flex flex-col items-end gap-0.5 rounded-lg px-2 py-1 hover:bg-muted"
            >
              <span className="text-xs text-muted-foreground">Risk screening</span>
              <span className="font-mono text-2xl leading-none font-semibold tabular-nums text-foreground">
                {risk.score}
              </span>
              <span className={`text-xs font-medium ${band.text}`}>{band.label}</span>
            </Link>
          )}
        </div>

        {rest.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-border pt-4">
            {rest.map((reason) => (
              <li key={reason.key} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${VERDICT_STYLES[reason.verdict].text.replace('text-', 'bg-')}`}
                />
                <span className="text-muted-foreground">{reason.text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Naming what we could not read matters: a verdict that silently
            skipped sleep and HRV would be read as having seen them. */}
        {readiness.inputs_missing.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Based on {readiness.inputs_used.join(' and ')}. Not included:{' '}
            {readiness.inputs_missing.join(', ')} - connect a wearable to add them.
          </p>
        )}

        <p className="text-xs text-muted-foreground">{readiness.disclaimer}</p>
      </CardContent>
    </Card>
  );
}

function AthleteOverview() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [nutrition, setNutrition] = useState<NutritionRecommendation | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // All server-side now - no localStorage, so the dashboard is correct in
    // any browser and after a logout.
    Promise.all([
      ApiClient.listVideos().catch(() => []),
      ApiClient.getCurrentTrainingPlan().catch(() => null),
      ApiClient.getCurrentNutrition().catch(() => null),
      ApiClient.getInjuryRisk().catch(() => null),
      ApiClient.getReadiness().catch(() => null)
    ]).then(([videoList, planResult, nutritionResult, riskResult, readinessResult]) => {
      if (cancelled) return;
      setVideos(videoList);
      setPlan(planResult);
      setNutrition(nutritionResult);
      setRisk(riskResult);
      setReadiness(readinessResult);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const recentVideos = videos.slice(0, 5);
  const hasNothing = !loading && recentVideos.length === 0 && !plan && !nutrition;

  if (loading) {
    // Skeletons shaped like the real content, not the word "Loading".
    return (
      <div className="flex flex-col gap-4">
        <div className="h-36 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (hasNothing) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No sessions yet"
        description="Once a video is processed, your training plan and nutrition summary will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ReadinessHero readiness={readiness} risk={risk} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-8">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="size-4" />
              Training plan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {plan ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">{plan.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{plan.status}</p>
                <Link
                  href="/dashboard/training-plan"
                  className="mt-2 text-xs font-medium text-primary underline"
                >
                  View plan
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">No plan generated yet.</p>
                <Link
                  href="/dashboard/training-plan"
                  className="text-xs font-medium text-primary underline"
                >
                  Generate one
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Apple className="size-4" />
              Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {nutrition ? (
              <div className="flex flex-col gap-2">
                <NutritionStatusBadge status={nutrition.status} />
                <Link
                  href="/dashboard/nutrition"
                  className="text-xs font-medium text-primary underline"
                >
                  View recommendation
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">No recommendation generated yet.</p>
                <Link
                  href="/dashboard/nutrition"
                  className="text-xs font-medium text-primary underline"
                >
                  Generate one
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-8">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" />
              Recent videos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-0">
            {recentVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
            ) : (
              recentVideos.map((v) => (
                <Link
                  key={v.id}
                  href={
                    v.status === 'completed'
                      ? `/dashboard/biomechanics/${v.id}`
                      : '/dashboard/videos'
                  }
                  className="flex items-center justify-between gap-2 text-xs hover:text-primary"
                >
                  <span className="truncate text-foreground">
                    {v.original_filename ?? 'Untitled video'}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{formatDate(v.created_at)}</span>
                </Link>
              ))
            )}
            <Link
              href="/dashboard/videos"
              className="mt-1 text-xs font-medium text-primary underline"
            >
              View all videos
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewerOverview() {
  return (
    <Card className="max-w-md p-8">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="size-4" />
          Review queue
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-sm text-muted-foreground">
          Flagged nutrition recommendations awaiting your sign-off live in the review queue.
        </p>
        <Link
          href="/dashboard/admin/review-queue"
          className="mt-3 inline-block text-xs font-medium text-primary underline"
        >
          Go to review queue
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const {user, loading} = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'athlete'
            ? 'Your latest training plan and nutrition status.'
            : 'Welcome back.'}
        </p>
      </div>
      <OnboardingBanner />
      {!loading && (user?.role === 'athlete' ? <AthleteOverview /> : <ReviewerOverview />)}
    </div>
  );
}
