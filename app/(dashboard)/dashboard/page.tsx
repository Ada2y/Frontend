'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {
  Activity,
  Apple,
  LayoutDashboard,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Video,
  Zap
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import OnboardingBanner from '@/app/(dashboard)/_components/OnboardingBanner';
import StatCard from '@/app/(dashboard)/_components/StatCard';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import QuickActions from '@/app/(dashboard)/_components/QuickActions';
import ActivityFeed from '@/app/(dashboard)/_components/ActivityFeed';
import {SessionsChart, BodyMetricsChart} from '@/app/(dashboard)/_components/OverviewCharts';
import {useAuth} from '@/lib/auth-context';
import {
  ApiClient,
  type BodyMetricEntry,
  type Injury,
  type NutritionRecommendation,
  type TrainingPlan,
  type VideoListItem
} from '@/lib/api';
import {LAST_NUTRITION_ID_KEY, LAST_TRAINING_PLAN_ID_KEY} from '@/lib/last-generated';

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

function AthleteOverview() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [nutrition, setNutrition] = useState<NutritionRecommendation | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const planId = localStorage.getItem(LAST_TRAINING_PLAN_ID_KEY);
    const nutritionId = localStorage.getItem(LAST_NUTRITION_ID_KEY);

    Promise.all([
      ApiClient.listVideos().catch(() => []),
      planId ? ApiClient.getTrainingPlan(planId).catch(() => null) : Promise.resolve(null),
      nutritionId ? ApiClient.getNutrition(nutritionId).catch(() => null) : Promise.resolve(null),
      ApiClient.listMyBodyMetrics().catch(() => []),
      ApiClient.listMyInjuries().catch(() => [])
    ]).then(([videoList, planResult, nutritionResult, metricsResult, injuriesResult]) => {
      if (cancelled) return;
      setVideos(videoList);
      setPlan(planResult);
      setNutrition(nutritionResult);
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

  const hasNothing = !loading && completedVideos.length === 0 && !plan && !nutrition;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-5 w-64 animate-pulse rounded bg-muted [animation-delay:100ms]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
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
            ? 'Your latest training data at a glance.'
            : 'Welcome back.'}
        </p>
      </div>
      <OnboardingBanner />
      {!loading && (user?.role === 'athlete' ? <AthleteOverview /> : <ReviewerOverview />)}
    </div>
  );
}
