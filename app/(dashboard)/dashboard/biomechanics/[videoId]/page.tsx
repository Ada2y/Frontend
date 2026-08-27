'use client';

import {use, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  Loader2,
  TrendingUp
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import CoachCard from '@/app/(dashboard)/_components/CoachCard';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import {RepBreakdownChart, PassFailPieChart} from '@/app/(dashboard)/_components/ReportCharts';
import {cn} from '@/lib/utils';
import {
  ApiClient,
  exerciseGifUrl,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type AnalysisReport,
  type CheckResult,
  type CheckSeverity,
  type VideoStatus
} from '@/lib/api';

const POLL_INTERVAL_MS = 4000;

const ALL_EXERCISES = [...GYM_EXERCISES, ...FOOTBALL_EXERCISES];

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

const SEVERITY_STYLES: Record<CheckSeverity, {bg: string; text: string; accent: string}> = {
  info: {bg: 'bg-blue-500/10', text: 'text-blue-600', accent: 'border-l-blue-500'},
  warn: {bg: 'bg-amber-500/10', text: 'text-amber-600', accent: 'border-l-amber-500'},
  risk: {bg: 'bg-red-500/10', text: 'text-red-600', accent: 'border-l-red-500'}
};

function exerciseLabel(exercise: string | null): string {
  if (!exercise) return 'Exercise';
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

function SeverityChip({severity, size = 'sm'}: {severity: CheckSeverity; size?: 'sm' | 'md'}) {
  const style = SEVERITY_STYLES[severity];
  return (
    <span
      className={cn(
        'rounded-full font-medium capitalize',
        style.bg,
        style.text,
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      )}
    >
      {severity}
    </span>
  );
}

function OutcomeIcon({outcome}: {outcome: CheckResult['outcome']}) {
  if (outcome === 'pass') return <CheckCircle className="size-4 shrink-0 text-green-600" />;
  if (outcome === 'fail') return <AlertTriangle className="size-4 shrink-0 text-red-600" />;
  return <HelpCircle className="size-4 shrink-0 text-muted-foreground" />;
}

function EvidenceImage({videoId, filename}: {videoId: string; filename: string}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ApiClient.fetchEvidenceBlob(videoId, filename)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urlRef.current = url;
        setSrc(url);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [videoId, filename]);

  if (error)
    return <p className="text-sm text-muted-foreground">Evidence image unavailable.</p>;
  if (!src) {
    return (
      <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-xl bg-muted">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- blob: URL, next/image can't optimize it
  return (
    <img
      src={src}
      alt="Evidence frame"
      className="w-full max-w-sm rounded-xl border border-border"
    />
  );
}

function CheckRow({videoId, check}: {videoId: string; check: CheckResult}) {
  const style = SEVERITY_STYLES[check.severity];
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border border-l-4 p-4 ${style.accent}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <OutcomeIcon outcome={check.outcome} />
          <span className="text-base font-medium capitalize text-foreground">
            {check.check_id.replace(/_/g, ' ')}
          </span>
        </div>
        <SeverityChip severity={check.severity} />
      </div>
      {check.value != null && check.threshold != null && (
        <p className="text-sm font-mono text-muted-foreground">
          measured {check.value} (target {check.op} {check.threshold})
        </p>
      )}
      {check.outcome === 'not_assessable' && (
        <p className="text-sm text-muted-foreground">Not enough visibility to assess this check.</p>
      )}
      {check.message && <p className="text-base text-foreground">{check.message}</p>}
      {check.evidence_image && <EvidenceImage videoId={videoId} filename={check.evidence_image} />}
    </div>
  );
}

function MetricsTable({metrics}: {metrics: Record<string, number>}) {
  const entries = Object.entries(metrics);
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map(([name, value]) => (
        <div
          key={name}
          className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-3 py-2"
        >
          <span className="text-xs text-muted-foreground">{name.replace(/_/g, ' ')}</span>
          <span className="text-base font-semibold tabular-nums text-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}

function RepAccordion({videoId, rep, defaultOpen}: {videoId: string; rep: AnalysisReport['reps'][0]; defaultOpen?: boolean}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const repFailed = rep.checks.some((c) => c.outcome === 'fail');
  const repPassed = rep.checks.filter((c) => c.outcome === 'pass').length;
  const repTotal = rep.checks.length;

  return (
    <div
      className={`overflow-hidden rounded-xl ring-1 ring-foreground/10 border-l-4 ${
        repFailed ? 'border-l-red-500' : 'border-l-green-500'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 bg-card px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        {open ? (
          <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        )}
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            repFailed ? 'bg-red-500/10' : 'bg-green-500/10'
          }`}
        >
          {repFailed ? (
            <AlertTriangle className="size-4 text-red-500" />
          ) : (
            <CheckCircle className="size-4 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-base font-semibold text-foreground">Rep {rep.index + 1}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {repPassed}/{repTotal} checks
        </span>
      </button>
      {open && (
        <div className="border-t border-border bg-card/50 px-5 py-4">
          <div className="flex flex-col gap-3">
            {rep.checks.map((check) => (
              <CheckRow key={check.check_id} videoId={videoId} check={check} />
            ))}
            {Object.keys(rep.metrics).length > 0 && (
              <div className="mt-2">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Metrics</p>
                <MetricsTable metrics={rep.metrics} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BiomechanicsReportPage({params}: {params: Promise<{videoId: string}>}) {
  const {videoId} = use(params);
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function check() {
      try {
        const s = await ApiClient.getVideoStatus(videoId);
        if (cancelled) return;
        setStatus(s.status);
        setFailureReason(s.failure_reason);

        if (s.status === 'completed') {
          const r = await ApiClient.getReport(videoId);
          if (!cancelled) setReport(r);
          if (pollTimer) clearInterval(pollTimer);
        } else if (s.status === 'failed') {
          if (pollTimer) clearInterval(pollTimer);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load this video');
        if (pollTimer) clearInterval(pollTimer);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    pollTimer = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [videoId]);

  const backLink = (
    <Link href="/dashboard/biomechanics" className="w-fit">
      <Button variant="ghost" size="lg">
        <ArrowLeft className="mr-1 size-4" />
        Back to reports
      </Button>
    </Link>
  );

  if (loading && !status) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-base text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="mt-1 text-base text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (status && status !== 'completed') {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="mt-1 text-base text-muted-foreground">
            {status === 'failed'
              ? (failureReason ?? 'Analysis failed.')
              : 'Your video is still being analyzed — this page will update automatically.'}
          </p>
        </div>
        {status !== 'failed' && (
          <div className="relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{background: COLORS.amber}}
            />
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <Loader2 className="size-6 text-amber-500 animate-spin" />
              </div>
              <div>
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
                <p className="text-base font-medium text-foreground capitalize">{status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div className="relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-base text-muted-foreground">No report available for this video.</p>
          </div>
        </div>
      </div>
    );
  }

  const isWrongView = report.input.flags.includes('wrong_view');
  const {summary} = report;
  const formGif = exerciseGifUrl(report.exercise);
  const totalChecks = summary.passed + summary.failed + summary.not_assessable;
  const passRate = totalChecks > 0 ? Math.round((summary.passed / totalChecks) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        {backLink}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-base text-muted-foreground">
            {exerciseLabel(report.exercise)} · {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Wrong view warning */}
      {isWrongView && (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
          <div className="flex items-start gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                We couldn&apos;t assess this video
              </p>
              <p className="mt-1 text-base text-muted-foreground">{summary.headline}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Passed
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {summary.passed}
              </span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle className="size-6" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.red}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Failed
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {summary.failed}
              </span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="size-6" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.blue}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Reps
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {report.segmentation.count}
              </span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <BarChart3 className="size-6" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Pass rate
              </span>
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {passRate != null ? `${passRate}%` : '--'}
              </span>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.primary}} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Summary
            </span>
            <span className="text-sm text-muted-foreground">
              View: {report.input.view.measured ?? 'unknown'} (expected{' '}
              {report.input.view.expected})
            </span>
          </div>
          <p className="mt-3 text-base leading-relaxed text-foreground">{summary.headline}</p>
          {Object.keys(summary.severity_counts).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(summary.severity_counts).map(([severity, count]) => (
                <div key={severity} className="flex items-center gap-1.5">
                  <SeverityChip severity={severity as CheckSeverity} size="md" />
                  <span className="text-sm text-muted-foreground">×{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coach */}
      <CoachCard videoId={videoId} />

      {/* Charts */}
      {report.reps.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RepBreakdownChart report={report} />
          <PassFailPieChart report={report} />
        </div>
      )}

      {/* Per-rep breakdown */}
      {report.reps.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BarChart3 className="size-5 text-primary" />
            Per-rep breakdown
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {report.reps.length}
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {report.reps.map((rep) => (
              <RepAccordion key={rep.index} videoId={videoId} rep={rep} />
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Info className="size-4 shrink-0" />
        Analysis generated on{' '}
        {new Date(report.created_at).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      {/* GIF reference */}
      {formGif && (
        <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.green}} />
          <div className="p-5">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Correct form reference
            </span>
            <div className="mt-3 flex flex-col items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- gif is a static asset */}
              <img
                src={formGif}
                alt={`${exerciseLabel(report.exercise)} correct form`}
                className="w-full max-w-sm rounded-xl border border-border"
              />
              <p className="text-sm text-muted-foreground">
                Follow this motion as your reference while reviewing your rep breakdown above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
