'use client';

import {useEffect, useState} from 'react';
import {
  AlertCircle,
  Apple,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  FileText,
  Globe,
  Languages,
  Loader2,
  Ruler,
  ShieldAlert,
  Sparkles,
  Tag,
  XCircle,
  Zap
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import NutritionStatusBadge from '@/app/(dashboard)/_components/NutritionStatusBadge';
import {
  ApiClient,
  type AthleteMedicalCondition,
  type BodyMetricEntry,
  type NutritionRecommendation,
  type NutritionStatus,
  type TrainingPlan
} from '@/lib/api';
const LAST_NUTRITION_ID_KEY = 'ada2y:last_nutrition_id';
const LAST_TRAINING_PLAN_ID_KEY = 'ada2y:last_training_plan_id';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

const STATUS_ACCENT: Record<NutritionStatus, string> = {
  auto_approved: 'from-green-500 via-emerald-400 to-green-500',
  approved: 'from-green-500 via-emerald-400 to-green-500',
  pending_review: 'from-amber-500 via-yellow-400 to-amber-500',
  flagged: 'from-red-500 via-rose-400 to-red-500',
  rejected: 'from-red-500 via-rose-400 to-red-500'
};

const STATUS_ICON_BG: Record<NutritionStatus, string> = {
  auto_approved: 'bg-green-500/10',
  approved: 'bg-green-500/10',
  pending_review: 'bg-amber-500/10',
  flagged: 'bg-red-500/10',
  rejected: 'bg-red-500/10'
};

const STATUS_ICON_COLOR: Record<NutritionStatus, string> = {
  auto_approved: 'text-green-500',
  approved: 'text-green-500',
  pending_review: 'text-amber-500',
  flagged: 'text-red-500',
  rejected: 'text-red-500'
};

const STATUS_LABEL: Record<NutritionStatus, string> = {
  auto_approved: 'Auto-approved',
  approved: 'Reviewed & approved',
  pending_review: 'Pending clinical review',
  flagged: 'Flagged for review',
  rejected: 'Rejected'
};

function formatCreated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function NutritionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-8 w-36 animate-pulse rounded bg-muted" />
        <div className="h-5 w-80 animate-pulse rounded bg-muted [animation-delay:100ms]" />
      </div>
      <div className="relative overflow-hidden rounded-xl bg-card p-8 ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-xl bg-muted" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded bg-muted [animation-delay:100ms]" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted [animation-delay:100ms]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted [animation-delay:200ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyNutrition({onGenerate, generating}: {onGenerate: () => void; generating: boolean}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nutrition</h1>
        <p className="text-base text-muted-foreground">
          Clinically aware nutrition advice based on your training load and medical conditions.
        </p>
      </div>

      {/* Generate card */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
              <Sparkles className="size-7 text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Generate nutrition advice</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI analyzes your training plan, body metrics, and any logged medical conditions
                to produce personalised nutrition guidance. Takes a few seconds.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Button size="lg" onClick={onGenerate} disabled={generating}>
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Zap className="size-4" />
                  )}
                  Generate recommendation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Training-aware</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Considers your current training plan load and exercise intensity.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldAlert className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Clinically safe</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Flags recommendations that interact with your medical conditions for expert review.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <Languages className="size-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">Bilingual</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Delivered in both English and Arabic for your convenience.
          </p>
        </div>
      </div>
    </div>
  );
}

function HistorySection({items}: {items: NutritionRecommendation[]}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 3);

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <Clock className="size-5 text-blue-500" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Previous recommendations
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {items.length}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {shown.map((item) => {
            const isApproved = item.status === 'approved' || item.status === 'auto_approved';
            const isPending = item.status === 'pending_review';
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3"
              >
                <div
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                    isApproved
                      ? 'bg-green-500/10'
                      : isPending
                        ? 'bg-amber-500/10'
                        : 'bg-red-500/10'
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle className="size-3.5 text-green-500" />
                  ) : isPending ? (
                    <Clock className="size-3.5 text-amber-500" />
                  ) : (
                    <XCircle className="size-3.5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatCreated(item.created_at)}
                    </span>
                    <NutritionStatusBadge status={item.status} />
                  </div>
                  {item.recommendation_en && (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground">
                      {item.recommendation_en}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {items.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Show {items.length - 3} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ContextPanel({conditions, bodyMetrics, trainingPlan}: {
  conditions: AthleteMedicalCondition[];
  bodyMetrics: BodyMetricEntry[];
  trainingPlan: TrainingPlan | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const latestMetric = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1] : null;
  const hasData = conditions.length > 0 || latestMetric || trainingPlan;

  if (!hasData) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
      <div className="p-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>
          <span className="flex-1 text-left text-sm font-medium uppercase tracking-wider text-muted-foreground">
            What we considered
          </span>
          {expanded ? (
            <ChevronUp className="size-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-5 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Medical conditions */}
            {conditions.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Tag className="size-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground">Medical conditions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((c) => (
                    <span
                      key={c.medical_condition_id}
                      className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                    >
                      {c.condition.name_en}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Body metrics */}
            {latestMetric && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Ruler className="size-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Body metrics</span>
                </div>
                <div className="flex items-center gap-4">
                  {latestMetric.weight_kg != null && (
                    <span className="text-sm text-muted-foreground">
                      Weight: <span className="font-medium text-foreground">{latestMetric.weight_kg} kg</span>
                    </span>
                  )}
                  {latestMetric.height_cm != null && (
                    <span className="text-sm text-muted-foreground">
                      Height: <span className="font-medium text-foreground">{latestMetric.height_cm} cm</span>
                    </span>
                  )}
                  {latestMetric.bmi != null && (
                    <span className="text-sm text-muted-foreground">
                      BMI: <span className="font-medium text-foreground">{latestMetric.bmi}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Training plan */}
            {trainingPlan && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Dumbbell className="size-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Training plan</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{trainingPlan.title}</span>
                  {' · '}
                  {trainingPlan.exercises.length} exercise{trainingPlan.exercises.length !== 1 ? 's' : ''}
                  {' across '}
                  {new Set(trainingPlan.exercises.map((e) => e.day_of_week)).size} day{new Set(trainingPlan.exercises.map((e) => e.day_of_week)).size !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationView({rec, history, conditions, bodyMetrics, trainingPlan, onRegenerate, generating}: {
  rec: NutritionRecommendation;
  history: NutritionRecommendation[];
  conditions: AthleteMedicalCondition[];
  bodyMetrics: BodyMetricEntry[];
  trainingPlan: TrainingPlan | null;
  onRegenerate: () => void;
  generating: boolean;
}) {
  const isPending = rec.status === 'pending_review';
  const isFlagged = rec.status === 'flagged' || rec.status === 'rejected';
  const isApproved = rec.status === 'approved' || rec.status === 'auto_approved';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nutrition</h1>
          <p className="text-base text-muted-foreground">
            Clinically aware nutrition advice based on your training load and medical conditions.
          </p>
        </div>
        <Button size="lg" variant="outline" onClick={onRegenerate} disabled={generating}>
          {generating && <Loader2 className="size-4 animate-spin" />}
          Regenerate
        </Button>
      </div>

      {/* Status overview strip */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${STATUS_ACCENT[rec.status]}`} />
        <div className="flex items-center gap-4 p-5">
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${STATUS_ICON_BG[rec.status]}`}>
            {isApproved ? (
              <CheckCircle className={`size-6 ${STATUS_ICON_COLOR[rec.status]}`} />
            ) : isFlagged ? (
              <XCircle className={`size-6 ${STATUS_ICON_COLOR[rec.status]}`} />
            ) : (
              <Clock className={`size-6 ${STATUS_ICON_COLOR[rec.status]}`} />
            )}
          </div>
          <div className="flex flex-1 items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <NutritionStatusBadge status={rec.status} />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            {formatCreated(rec.created_at)}
          </div>
        </div>
      </div>

      {/* Pending review warning */}
      {isPending && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-base font-medium text-amber-700">Awaiting clinical review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This recommendation touches a logged medical condition and is held for a clinical
              safety check before it becomes final. Do not act on it until it&apos;s approved.
            </p>
          </div>
        </div>
      )}

      {/* Flagged/rejected warning */}
      {isFlagged && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-4">
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
          <div>
            <p className="text-base font-medium text-red-700">
              {rec.status === 'flagged' ? 'Flagged for review' : 'Rejected'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This recommendation has been flagged by a reviewer. Please consult with your coach
              or medical team before following this advice.
            </p>
          </div>
        </div>
      )}

      {/* What we considered */}
      <ContextPanel conditions={conditions} bodyMetrics={bodyMetrics} trainingPlan={trainingPlan} />

      {/* English recommendation */}
      {rec.recommendation_en && (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                English
              </span>
            </div>
            <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground">
              {rec.recommendation_en}
            </div>
          </div>
        </div>
      )}

      {/* Arabic recommendation */}
      {rec.recommendation_ar && (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <Languages className="size-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Arabic
              </span>
            </div>
            <div
              dir="rtl"
              className="mt-4 whitespace-pre-line text-right text-base leading-relaxed text-foreground"
            >
              {rec.recommendation_ar}
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {rec.considers_conditions && rec.considers_conditions.length > 0 && (
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="size-4" />
            Considers {rec.considers_conditions.length} medical condition{rec.considers_conditions.length > 1 ? 's' : ''}
          </span>
        )}
        {rec.reviewed_at && (
          <span className="flex items-center gap-1.5">
            <CheckCircle className="size-4" />
            Reviewed {formatCreated(rec.reviewed_at)}
          </span>
        )}
      </div>

      {/* History */}
      {history.filter((h) => h.id !== rec.id).length > 0 && (
        <HistorySection items={history.filter((h) => h.id !== rec.id)} />
      )}
    </div>
  );
}

export default function NutritionPage() {
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [history, setHistory] = useState<NutritionRecommendation[]>([]);
  const [conditions, setConditions] = useState<AthleteMedicalCondition[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem(LAST_NUTRITION_ID_KEY)
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server-side source of truth. Previously this read an id out of
  // localStorage, so your recommendation vanished on logout or in another
  // browser and the only way back was to Generate again.
  useEffect(() => {
    let cancelled = false;
    const savedId =
      typeof window !== 'undefined' ? localStorage.getItem(LAST_NUTRITION_ID_KEY) : null;
    if (savedId) {
      ApiClient.getNutrition(savedId)
        .then((rec) => !cancelled && setRecommendation(rec))
        .catch(() => {
          if (typeof window !== 'undefined') localStorage.removeItem(LAST_NUTRITION_ID_KEY);
        })
        .finally(() => !cancelled && setLoading(false));
    }
    ApiClient.listNutrition()
      .then((items) => !cancelled && setHistory(items))
      .catch(() => {});
    ApiClient.listMyMedicalConditions()
      .then((items) => !cancelled && setConditions(items))
      .catch(() => {});
    ApiClient.listMyBodyMetrics()
      .then((items) => !cancelled && setBodyMetrics(items))
      .catch(() => {});
    const planId =
      typeof window !== 'undefined' ? localStorage.getItem(LAST_TRAINING_PLAN_ID_KEY) : null;
    if (planId) {
      ApiClient.getTrainingPlan(planId)
        .then((plan) => !cancelled && setTrainingPlan(plan))
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const rec = await ApiClient.generateNutrition();
      setRecommendation(rec);
      localStorage.setItem(LAST_NUTRITION_ID_KEY, rec.id);
      ApiClient.listNutrition().then(setHistory).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a recommendation.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <NutritionSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-3 text-base text-red-600">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {generating && !recommendation && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <Loader2 className="size-5 animate-spin text-primary" />
          <div>
            <p className="text-base font-medium text-foreground">Generating your recommendation</p>
            <p className="text-sm text-muted-foreground">
              This calls a real LLM and can take several seconds...
            </p>
          </div>
        </div>
      )}

      {!recommendation && !generating ? (
        <EmptyNutrition onGenerate={handleGenerate} generating={generating} />
      ) : (
        recommendation && (
          <RecommendationView
            rec={recommendation}
            history={history}
            conditions={conditions}
            bodyMetrics={bodyMetrics}
            trainingPlan={trainingPlan}
            onRegenerate={handleGenerate}
            generating={generating}
          />
        )
      )}
    </div>
  );
}
