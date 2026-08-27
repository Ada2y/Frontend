'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  Apple,
  CheckCircle2,
  Dumbbell,
  LayoutDashboard,
  Moon,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Video,
  Zap
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import OnboardingBanner from '@/app/(dashboard)/_components/OnboardingBanner';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import StatCard from '@/app/(dashboard)/_components/StatCard';
import StreakCard from '@/app/(dashboard)/_components/StreakCard';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import QuickActions from '@/app/(dashboard)/_components/QuickActions';
import ActivityFeed from '@/app/(dashboard)/_components/ActivityFeed';
import {SessionsChart, BodyMetricsChart} from '@/app/(dashboard)/_components/OverviewCharts';
import {useAuth} from '@/lib/auth-context';
import {
  ApiClient,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type BodyMetricEntry,
  type Injury,
  type NutritionRecommendation,
  type Readiness,
  type ReadinessVerdict,
  type RiskAssessment,
  type TrainingPlan,
  type VideoListItem
} from '@/lib/api';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-14 animate-pulse rounded bg-muted [animation-delay:150ms]" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted [animation-delay:300ms]" />
        </div>
        <div className="size-12 animate-pulse rounded-xl bg-muted [animation-delay:100ms]" />
      </div>
    </div>
  );
}

const BAND_STYLES: Record<string, {label: string; ring: string; text: string}> = {
  low: {label: 'Low', ring: 'ring-success/25', text: 'text-success'},
  moderate: {label: 'Moderate', ring: 'ring-warning/25', text: 'text-warning'},
  elevated: {label: 'Elevated', ring: 'ring-danger/25', text: 'text-danger'}
};

const VERDICT_STYLES: Record<
  ReadinessVerdict,
  {label: string; ring: string; text: string; dot: string; icon: typeof CheckCircle2}
> = {
  train: {
    label: 'Train',
    ring: 'ring-success/25',
    text: 'text-success',
    dot: 'bg-success',
    icon: CheckCircle2
  },
  modify: {
    label: 'Modify',
    ring: 'ring-warning/25',
    text: 'text-warning',
    dot: 'bg-warning',
    icon: SlidersHorizontal
  },
  rest: {
    label: 'Rest',
    ring: 'ring-danger/25',
    text: 'text-danger',
    dot: 'bg-danger',
    icon: Moon
  }
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
                {Math.round(risk.score ?? 0)}
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
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${VERDICT_STYLES[reason.verdict].dot}`}
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

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

function exerciseLabel(exercise: string | null): string | null {
  if (!exercise) return null;
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

/** A filename and a date told the athlete nothing about how the session went. */
function VideoOutcomeDot({video}: {video: VideoListItem}) {
  if (video.status !== 'completed') {
    return <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />;
  }
  if (video.assessable === false) {
    return <AlertCircle className="size-3 shrink-0 text-danger" />;
  }
  return (video.failed ?? 0) > 0 ? (
    <span className="size-1.5 shrink-0 rounded-full bg-warning" />
  ) : (
    <span className="size-1.5 shrink-0 rounded-full bg-success" />
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function AthleteOverview() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [nutrition, setNutrition] = useState<NutritionRecommendation | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
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
      ApiClient.getReadiness().catch(() => null),
      ApiClient.listMyBodyMetrics().catch(() => []),
      ApiClient.listMyInjuries().catch(() => [])
    ]).then(([videoList, planResult, nutritionResult, riskResult, readinessResult, metricsResult, injuriesResult]) => {
      if (cancelled) return;
      setVideos(videoList);
      setPlan(planResult);
      setNutrition(nutritionResult);
      setRisk(riskResult);
      setReadiness(readinessResult);
      setBodyMetrics(metricsResult);
      setInjuries(injuriesResult);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const completedVideos = videos.filter((v) => v.status === 'completed');
  const totalPassed = completedVideos.reduce((sum, v) => sum + (v.passed ?? 0), 0);
  const totalChecks = completedVideos.reduce(
    (sum, v) => sum + (v.passed ?? 0) + (v.failed ?? 0),
    0
  );
  const formScore = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = completedVideos.filter(
    (v) => new Date(v.created_at) > weekAgo
  ).length;

  const recentVideos = videos.slice(0, 5);

  const hasNothing = !loading && completedVideos.length === 0 && !plan && !nutrition;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-5 w-64 animate-pulse rounded bg-muted [animation-delay:100ms]" />
        </div>
        <div className="h-36 animate-pulse rounded-xl bg-card ring-1 ring-foreground/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
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
    <div className="flex flex-col gap-6">
      {/* Readiness Hero + Streak */}
      <ReadinessHero readiness={readiness} risk={risk} />
      <StreakCard />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Video}
          label="Sessions"
          value={completedVideos.length}
          description="Videos analyzed"
          accentColor={COLORS.blue}
        />

        {/* Form Score with ring */}
        <div className="group relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:ring-foreground/20">
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{background: COLORS.primary}}
          />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Form score
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {formScore > 0 ? `${formScore}%` : '\u2014'}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                {formScore > 0 ? 'Across all reps' : 'Upload a video to start'}
              </span>
            </div>
            {formScore > 0 && (
              <div className="relative shrink-0">
                <ProgressRing value={formScore} size={52} strokeWidth={5} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                  {formScore}
                </span>
              </div>
            )}
            {formScore === 0 && (
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
                style={{backgroundColor: `${COLORS.primary}10`, color: COLORS.primary}}
              >
                <Zap className="size-6" />
              </div>
            )}
          </div>
        </div>

        <StatCard
          icon={Activity}
          label="This week"
          value={sessionsThisWeek}
          description="Sessions completed"
          accentColor={COLORS.green}
        />
        <StatCard
          icon={Apple}
          label="Nutrition"
          value={nutrition ? 'Active' : 'None'}
          description={nutrition ? 'Recommendation ready' : 'No plan yet'}
          accentColor={COLORS.amber}
        />
      </div>

      {/* Body Metrics + Injury Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(() => {
          const latest = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
          const weight = latest?.weight_kg;
          const height = latest?.height_cm;
          const bmi = latest?.bmi;
          const summary =
            weight != null && height != null && bmi != null
              ? `${weight}kg / ${height}cm / BMI ${bmi}`
              : weight != null
                ? `${weight}kg`
                : '\u2014';
          return (
            <StatCard
              icon={Ruler}
              label="Body metrics"
              value={summary}
              description={latest ? `Recorded ${new Date(latest.recorded_at).toLocaleDateString()}` : 'No data yet'}
              accentColor={COLORS.blue}
            />
          );
        })()}

        {(() => {
          const activeInjuries = injuries.filter((i) => !i.recovered_at);
          const count = activeInjuries.length;
          const highCount = activeInjuries.filter(
            (i) => i.severity === 'high' || i.severity === 'critical'
          ).length;
          const value = count === 0 ? 'None' : `${count} active`;
          let description: string;
          if (count === 0) {
            description = 'You\'re all clear';
          } else if (count === 1) {
            const inj = activeInjuries[0];
            description = `${inj.body_part} — ${inj.severity}`;
          } else {
            const parts = activeInjuries.slice(0, 2).map((i) => i.body_part);
            const rest = count - 2;
            description = rest > 0 ? `${parts.join(', ')} +${rest} more` : parts.join(', ');
          }
          const color = count === 0 ? COLORS.green : highCount > 0 ? COLORS.red : COLORS.amber;
          return (
            <StatCard
              icon={count === 0 ? ShieldCheck : ShieldAlert}
              label="Injury status"
              value={value}
              description={description}
              accentColor={color}
            />
          );
        })()}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Training Plan + Nutrition + Recent Videos */}
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
                <p className="text-xs text-muted-foreground">
                  {plan.exercises?.length ?? 0} exercises this week
                </p>
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
                {nutrition.recommendation_en && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {nutrition.recommendation_en}
                  </p>
                )}
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
                  <span className="flex min-w-0 items-center gap-1.5">
                    <VideoOutcomeDot video={v} />
                    <span className="truncate text-foreground">
                      {exerciseLabel(v.exercise) ?? v.original_filename ?? 'Untitled video'}
                    </span>
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SessionsChart videos={videos} />
        <BodyMetricsChart metrics={bodyMetrics} />
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="size-5" />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed videos={videos} />
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewerOverview() {
  return (
    <Card className="max-w-md p-8">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="size-5" />
          Review queue
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-base text-muted-foreground">
          Flagged nutrition recommendations awaiting your sign-off live in the review queue.
        </p>
        <Link
          href="/dashboard/admin/review-queue"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to review queue
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const {user, loading} = useAuth();

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {firstName ? `${getGreeting()}, ${firstName}` : 'Overview'}
        </h1>
        <p className="text-base text-muted-foreground">
          {user?.role === 'athlete'
            ? 'Your readiness, consistency and latest sessions at a glance.'
            : 'Welcome back.'}
        </p>
      </div>
      <OnboardingBanner />
      {!loading && (user?.role === 'athlete' ? <AthleteOverview /> : <ReviewerOverview />)}
    </div>
  );
}
