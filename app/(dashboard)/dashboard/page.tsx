'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Activity, Apple, Dumbbell, LayoutDashboard, ShieldAlert} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import EmptyState from '@/app/(dashboard)/_components/EmptyState';
import OnboardingBanner from '@/app/(dashboard)/_components/OnboardingBanner';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import {useAuth} from '@/lib/auth-context';
import {
  ApiClient,
  type NutritionRecommendation,
  type TrainingPlan,
  type VideoListItem
} from '@/lib/api';
import {LAST_NUTRITION_ID_KEY, LAST_TRAINING_PLAN_ID_KEY} from '@/lib/last-generated';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function AthleteOverview() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [nutrition, setNutrition] = useState<NutritionRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const planId = localStorage.getItem(LAST_TRAINING_PLAN_ID_KEY);
    const nutritionId = localStorage.getItem(LAST_NUTRITION_ID_KEY);

    Promise.all([
      ApiClient.listVideos().catch(() => []),
      planId ? ApiClient.getTrainingPlan(planId).catch(() => null) : Promise.resolve(null),
      nutritionId ? ApiClient.getNutrition(nutritionId).catch(() => null) : Promise.resolve(null)
    ]).then(([videoList, planResult, nutritionResult]) => {
      if (cancelled) return;
      setVideos(videoList);
      setPlan(planResult);
      setNutrition(nutritionResult);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const recentVideos = videos.slice(0, 5);
  const hasNothing = !loading && recentVideos.length === 0 && !plan && !nutrition;

  if (loading) return null;

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
                  v.status === 'completed' ? `/dashboard/biomechanics/${v.id}` : '/dashboard/videos'
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
