'use client';

import {useEffect, useState} from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Dumbbell,
  Loader2,
  Medal,
  Ruler,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import {
  ApiClient,
  type BiometricProfile,
  type BodyMetricEntry,
  type Injury,
  type VideoSport
} from '@/lib/api';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

const SPORT_CONFIG: Record<string, {icon: typeof Dumbbell; color: string; label: string; description: string}> = {
  gym: {
    icon: Dumbbell,
    color: COLORS.blue,
    label: 'Gym',
    description: 'Strength training, compound lifts, and hypertrophy work.'
  },
  football: {
    icon: Medal,
    color: COLORS.green,
    label: 'Football',
    description: 'Agility, endurance, and team-based field sport.'
  }
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
      <div className="flex items-start gap-4">
        <div className="size-14 animate-pulse rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted [animation-delay:100ms]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted [animation-delay:200ms]" />
        </div>
        <div className="size-16 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
      </div>
    </div>
  );
}

function EmptySportSuggestion({hasMetrics, onGenerate, generating}: {
  hasMetrics: boolean;
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Generate card */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-purple-400 to-primary" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Discover your sport</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI analyses your body metrics, injury history, and fitness level to suggest
                a sport that suits you best. It&apos;s a fun recommendation, not a clinical verdict.
              </p>
              <div className="mt-4">
                <Button size="lg" onClick={onGenerate} disabled={generating}>
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Zap className="size-4" />
                  )}
                  Generate suggestion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile required warning */}
      {!hasMetrics && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-4">
          <Ruler className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-base font-medium text-amber-700">Complete your profile first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              For the best suggestion, add your height, weight, and any injuries in your{' '}
              <a href="/dashboard/profile" className="font-medium text-primary hover:underline">
                profile
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ruler className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Body metrics</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your height, weight, and BMI factor into the recommendation.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldAlert className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Injury history</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Past injuries help avoid suggestions that could aggravate recovery.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <TrendingUp className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Fitness level</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your experience level helps match intensity to your current capacity.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({suggestion, bodyMetrics, injuries}: {
  suggestion: BiometricProfile;
  bodyMetrics: BodyMetricEntry[];
  injuries: Injury[];
}) {
  const sport = suggestion.recommended_sport ?? 'gym';
  const config = SPORT_CONFIG[sport] ?? SPORT_CONFIG.gym;
  const SportIcon = config.icon;
  const confidence = suggestion.confidence_score != null ? Math.round(suggestion.confidence_score * 100) : null;
  const latestMetric = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
  const activeInjuries = injuries.filter((i) => !i.recovered_at);

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 hover:shadow-lg hover:ring-foreground/20 transition-all duration-200">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: config.color}} />
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Sport icon */}
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
            style={{backgroundColor: `${config.color}15`, color: config.color}}
          >
            <SportIcon className="size-8" />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Latest
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(suggestion.measured_at)}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold capitalize text-foreground">
              {suggestion.recommended_sport ?? 'No suggestion'}
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              {config.description}
            </p>

            {/* Notes */}
            {suggestion.notes && (
              <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3">
                <p className="text-base leading-relaxed text-foreground">{suggestion.notes}</p>
              </div>
            )}

            {/* Context row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {latestMetric && latestMetric.weight_kg != null && (
                <span className="flex items-center gap-1.5">
                  <Ruler className="size-3.5" />
                  {latestMetric.weight_kg}kg
                  {latestMetric.bmi != null && ` · BMI ${latestMetric.bmi}`}
                </span>
              )}
              {activeInjuries.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-amber-500" />
                  {activeInjuries.length} active injury{activeInjuries.length > 1 ? 's' : ''}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formatFullDate(suggestion.measured_at)}
              </span>
            </div>
          </div>

          {/* Confidence ring */}
          {confidence != null && (
            <div className="relative shrink-0">
              <ProgressRing value={confidence} size={88} strokeWidth={7} color={config.color} />
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold leading-none text-foreground">{confidence}</span>
                <span className="text-[10px] font-medium text-muted-foreground">%</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryCard({suggestion, index}: {suggestion: BiometricProfile; index: number}) {
  const sport = suggestion.recommended_sport ?? 'gym';
  const config = SPORT_CONFIG[sport] ?? SPORT_CONFIG.gym;
  const SportIcon = config.icon;
  const confidence = suggestion.confidence_score != null ? Math.round(suggestion.confidence_score * 100) : null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 hover:shadow-md hover:ring-foreground/20 transition-all duration-200">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: config.color}} />
      <div className="flex items-center gap-4 p-5">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{backgroundColor: `${config.color}15`, color: config.color}}
        >
          <SportIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold capitalize text-foreground">
              {suggestion.recommended_sport ?? 'No suggestion'}
            </span>
            {confidence != null && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{backgroundColor: `${config.color}15`, color: config.color}}
              >
                {confidence}%
              </span>
            )}
          </div>
          {suggestion.notes && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{suggestion.notes}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(suggestion.measured_at)}
        </span>
      </div>
    </div>
  );
}

function StatsRow({suggestions}: {suggestions: BiometricProfile[]}) {
  if (suggestions.length === 0) return null;

  const total = suggestions.length;
  const withConfidence = suggestions.filter((s) => s.confidence_score != null);
  const avgConfidence =
    withConfidence.length > 0
      ? Math.round(
          (withConfidence.reduce((sum, s) => sum + (s.confidence_score ?? 0), 0) /
            withConfidence.length) *
            100
        )
      : null;

  const sportCounts: Record<string, number> = {};
  for (const s of suggestions) {
    const sport = s.recommended_sport ?? 'unknown';
    sportCounts[sport] = (sportCounts[sport] ?? 0) + 1;
  }
  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground">{total}</span>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
        </div>
      </div>

      {avgConfidence != null && (
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Avg confidence
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">{avgConfidence}%</span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp className="size-6" />
            </div>
          </div>
        </div>
      )}

      {topSport && (() => {
        const TopIcon = SPORT_CONFIG[topSport[0]]?.icon ?? Medal;
        const topColor = SPORT_CONFIG[topSport[0]]?.color ?? COLORS.blue;
        return (
          <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{background: topColor}}
            />
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Top pick
                </span>
                <span className="text-4xl font-bold tracking-tight capitalize text-foreground">
                  {topSport[0]}
                </span>
              </div>
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                style={{backgroundColor: `${topColor}10`, color: topColor}}
              >
                <TopIcon className="size-6" />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function SportSuggestionPage() {
  const [suggestions, setSuggestions] = useState<BiometricProfile[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      ApiClient.listSportSuggestions().catch(() => []),
      ApiClient.listMyBodyMetrics().catch(() => []),
      ApiClient.listMyInjuries().catch(() => [])
    ]).then(([suggestionsResult, metricsResult, injuriesResult]) => {
      if (cancelled) return;
      setSuggestions(suggestionsResult);
      setBodyMetrics(metricsResult);
      setInjuries(injuriesResult);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const suggestion = await ApiClient.generateSportSuggestion();
      setSuggestions((prev) => [suggestion, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a suggestion.');
    } finally {
      setGenerating(false);
    }
  }

  const latest = suggestions.length > 0 ? suggestions[0] : null;
  const older = suggestions.length > 1 ? suggestions.slice(1) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sport Suggestion</h1>
          <p className="text-base text-muted-foreground">
            A fun, non-clinical suggestion based on your profile, BMI, and injury history — not a
            talent-identification verdict.
          </p>
        </div>
        {latest && (
          <Button size="lg" variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating && <Loader2 className="size-4 animate-spin" />}
            Regenerate
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-3 text-base text-red-600">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Generating */}
      {generating && !latest && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <Loader2 className="size-5 animate-spin text-primary" />
          <div>
            <p className="text-base font-medium text-foreground">Analysing your profile</p>
            <p className="text-sm text-muted-foreground">
              Checking your body metrics, injury history, and fitness level...
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      ) : suggestions.length === 0 && !generating ? (
        <EmptySportSuggestion
          hasMetrics={bodyMetrics.length > 0}
          onGenerate={handleGenerate}
          generating={generating}
        />
      ) : (
        <>
          {/* Stats */}
          <StatsRow suggestions={suggestions} />

          {/* Featured (latest) */}
          {latest && (
            <div className="max-w-3xl">
              <FeaturedCard suggestion={latest} bodyMetrics={bodyMetrics} injuries={injuries} />
            </div>
          )}

          {/* History */}
          {older.length > 0 && (
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Earlier suggestions
              </p>
              <ul className="flex flex-col divide-y divide-border rounded-lg ring-1 ring-foreground/10">
                {older.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="capitalize text-foreground">
                      {s.recommended_sport ?? 'No suggestion'}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDate(s.measured_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
