'use client';

import {use, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  HelpCircle,
  Info,
  Loader2,
  TrendingUp
} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import CoachCard from '@/app/(dashboard)/_components/CoachCard';
import CorrectionCanvas from '@/app/(dashboard)/_components/CorrectionCanvas';
import AthletePicker from '@/app/(dashboard)/_components/AthletePicker';
import EvidenceNote from '@/app/(dashboard)/_components/EvidenceNote';
import ProgressRing from '@/app/(dashboard)/_components/ProgressRing';
import {RepBreakdownChart, PassFailPieChart} from '@/app/(dashboard)/_components/ReportCharts';
import SkeletonPlayer from '@/app/(dashboard)/_components/SkeletonPlayer';
import {useAuth} from '@/lib/auth-context';
import {cn} from '@/lib/utils';
import {
  ApiClient,
  exerciseGifUrl,
  FOOTBALL_EXERCISES,
  GYM_EXERCISES,
  type AnalysisReport,
  type CheckResult,
  type CheckSeverity,
  type RepBlock,
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
  if (outcome === 'pass') return <CheckCircle className="size-4 shrink-0 text-success" />;
  // Borderline counts as correct, so it gets a tick - a warning triangle here
  // would tell the athlete they got it wrong when they essentially got it right.
  if (outcome === 'borderline') return <CheckCircle2 className="size-4 shrink-0 text-info" />;
  if (outcome === 'fail') return <AlertTriangle className="size-4 shrink-0 text-danger" />;
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

  if (error) return <p className="text-sm text-muted-foreground">Evidence image unavailable.</p>;
  if (!src) {
    return (
      <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-xl bg-muted">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    // unoptimized because the source is a blob: URL created in this browser
    // from an authenticated fetch - the optimizer runs server-side and cannot
    // reach it. Everything else next/image gives us (layout stability from
    // the explicit intrinsic size, lazy loading, decoding) still applies.
    <Image
      src={src}
      alt="Evidence frame"
      width={640}
      height={480}
      unoptimized
      sizes="(max-width: 640px) 100vw, 384px"
      className="h-auto w-full max-w-sm rounded-lg border border-border"
    />
  );
}

function DownloadPdfButton({videoId}: {videoId: string}) {
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle');

  async function handleDownload() {
    setState('working');
    try {
      await ApiClient.downloadReportPdf(videoId);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={state === 'working'}>
        {state === 'working' ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 size-3.5" />
        )}
        Share as PDF
      </Button>
      {state === 'error' && (
        <span className="text-xs text-danger">Couldn&apos;t generate the PDF.</span>
      )}
    </div>
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
          <span className="text-base font-medium text-foreground first-letter:uppercase">
            {check.label ?? check.check_id.replace(/_/g, ' ')}
          </span>
        </div>
        {check.outcome === 'fail' && <SeverityChip severity={check.severity} />}
      </div>

      {/* Coaching first. The raw measurement lives in Technical details. */}
      <p className="text-sm leading-relaxed text-foreground">
        {check.plain ?? check.message ?? ''}
      </p>

      {/* Prefer the vector comparison: the baked overlay is unreadable
          whenever the source footage is busy. The JPEG stays as the fallback
          for reports generated before correction_pose existed. */}
      {check.correction_pose ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CorrectionCanvas correction={check.correction_pose} />
          {check.evidence_image && (
            <figure className="flex flex-col gap-1">
              <figcaption className="text-xs font-medium text-muted-foreground">
                The frame this came from
              </figcaption>
              <EvidenceImage videoId={videoId} filename={check.evidence_image} />
            </figure>
          )}
        </div>
      ) : check.correction_image ? (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {check.evidence_image && (
              <figure className="flex flex-col gap-1">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  Your rep
                </figcaption>
                <EvidenceImage videoId={videoId} filename={check.evidence_image} />
              </figure>
            )}
            <figure className="flex flex-col gap-1">
              <figcaption className="text-xs font-medium text-muted-foreground">
                With the correction
              </figcaption>
              <EvidenceImage videoId={videoId} filename={check.correction_image} />
            </figure>
          </div>
          <p className="text-xs text-muted-foreground">
            The cyan outline is an illustrative guide generated from your own frame, not an exact
            biomechanical prescription.
          </p>
        </div>
      ) : (
        check.evidence_image && <EvidenceImage videoId={videoId} filename={check.evidence_image} />
      )}
    </div>
  );
}

function MetricsTable({rep}: {rep: RepBlock}) {
  const entries =
    rep.labelled_metrics ??
    Object.entries(rep.metrics).map(([key, value]) => ({key, label: key, unit: null, value}));
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
      {entries.map((m) => (
        <div key={m.key} className="flex items-center justify-between gap-2 text-muted-foreground">
          <span className="truncate">{m.label}</span>
          <span className="font-mono tabular-nums text-foreground">
            {m.value}
            {m.unit ?? ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function RepAccordion({
  videoId,
  rep,
  defaultOpen
}: {
  videoId: string;
  rep: AnalysisReport['reps'][0];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const repFailed = rep.checks.some((c) => c.outcome === 'fail');
  // `borderline` counts as correct. Counting only `pass` made a rep with one
  // pass and one borderline read "1/2 checks" while being styled as a full
  // pass - contradicting itself in both directions.
  const repPassed = rep.checks.filter(
    (c) => c.outcome === 'pass' || c.outcome === 'borderline'
  ).length;
  const repClose = !repFailed && rep.checks.some((c) => c.outcome === 'borderline');
  const repTotal = rep.checks.length;
  const failedLabels = rep.checks
    .filter((c) => c.outcome === 'fail')
    .map((c) => c.label ?? c.check_id.replace(/_/g, ' '));

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border-l-4 ring-1 ring-foreground/10',
        repFailed ? 'border-l-red-500' : repClose ? 'border-l-info' : 'border-l-green-500'
      )}
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
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            repFailed ? 'bg-red-500/10' : repClose ? 'bg-info/10' : 'bg-green-500/10'
          )}
        >
          {repFailed ? (
            <AlertTriangle className="size-4 text-red-500" />
          ) : (
            <CheckCircle className={cn('size-4', repClose ? 'text-info' : 'text-green-500')} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-base font-semibold text-foreground">Rep {rep.index + 1}</span>
          {/* Naming the failed checks makes the list scannable without opening
              anything - seven failing reps otherwise look identical. */}
          <span className="ml-2 text-sm text-muted-foreground">
            {repFailed
              ? failedLabels.join(', ')
              : repClose
                ? 'all checks passed, some were close'
                : 'all checks passed'}
          </span>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">
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
                <MetricsTable rep={rep} />
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
  const {user} = useAuth();
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

  // The reports index lists only your own uploads, so a coach who arrived here
  // from a team alert belongs back on the team, not on a page they can't open.
  const isCoach = user?.role === 'coach';
  const backLink = (
    <Link href={isCoach ? '/dashboard/team' : '/dashboard/biomechanics'} className="w-fit">
      <Button variant="ghost" size="lg">
        <ArrowLeft className="mr-1 size-4" />
        {isCoach ? 'Back to teams' : 'Back to reports'}
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
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-danger">{error}</p>
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
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{background: COLORS.amber}} />
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
            <p className="text-sm text-muted-foreground">
              {exerciseLabel(report.exercise)} · {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
          <DownloadPdfButton videoId={videoId} />
        </div>
      </div>

      {/* Wrong view warning */}
      {isWrongView && (
        <Card className="border-warning/40">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="text-base font-medium text-foreground">
                We couldn&apos;t assess this video
              </p>
              <p className="mt-1 text-base text-muted-foreground">{summary.headline}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero: what to actually do. Counts and geometry are secondary. */}
      {report.coaching && summary.assessable !== false && (
        <Card className="p-8">
          <CardContent className="flex flex-col gap-5 px-0">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Focus on next
              </span>
              <p className="text-2xl leading-snug font-medium text-foreground">
                {report.coaching.next_session_cue}
              </p>
            </div>

            {report.coaching.focus_on.length > 0 && (
              <ul className="flex flex-col gap-2">
                {report.coaching.focus_on.map((f) => (
                  <li key={f.check_id} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span className="text-foreground">
                      <span className="first-letter:uppercase">{f.label}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        - {f.reps_affected} of {f.of_reps} reps
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {report.coaching.what_went_well.length > 0 && (
              <ul className="flex flex-col gap-2 border-t border-border pt-4">
                {report.coaching.what_went_well.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-foreground first-letter:uppercase">{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Session summary</CardTitle>
            <span className="text-xs text-muted-foreground">
              View: {report.input.view.measured ?? 'unknown'} (expected {report.input.view.expected}
              )
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {report.technique_score != null && (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
                {report.technique_score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100 technique score</span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-success">{summary.passed} passed</span>
            {summary.borderline > 0 && (
              <span className="text-info">{summary.borderline} of them close</span>
            )}
            <span className="text-danger">{summary.failed} failed</span>
            <span className="text-muted-foreground">{summary.not_assessable} not assessable</span>
            <span className="text-muted-foreground">{report.segmentation.count} reps detected</span>
          </div>
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
        </CardContent>
      </Card>

      {/* Renders itself away unless the video has more than one person. */}
      <AthletePicker
        videoId={videoId}
        athletes={report.input.athletes ?? []}
        selectedTrackId={report.input.selected_track_id ?? null}
        wasRequested={report.input.selection_was_requested ?? false}
      />

      <EvidenceNote evidence={report.input.evidence} />

      {/* A coach reaches this page from a team alert and may read the report,
          but CoachService still scopes the chat to the athlete who owns the
          video - so the card would only ever 403 for them. */}
      {user?.role === 'athlete' && <CoachCard videoId={videoId} />}

      {/* Renders itself away when the analysis has no stored pose frames. */}
      <SkeletonPlayer videoId={videoId} />

      {/* Charts */}
      {report.reps.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RepBreakdownChart report={report} />
          <PassFailPieChart report={report} />
        </div>
      )}

      {formGif && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Correct form reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-2">
              {/* unoptimized: the optimizer would rasterise an animated GIF
                  to a single still frame, and the animation is the content. */}
              <Image
                src={formGif}
                alt={`${exerciseLabel(report.exercise)} correct form`}
                width={480}
                height={480}
                unoptimized
                sizes="(max-width: 640px) 100vw, 384px"
                className="h-auto w-full max-w-sm rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground">
                Follow this motion as your reference while you work through the reps below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-rep breakdown */}
      {report.reps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-rep breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {report.reps.map((rep) => (
              <RepAccordion
                key={rep.index}
                videoId={videoId}
                rep={rep}
                defaultOpen={report.reps.length === 1}
              />
            ))}
          </CardContent>
        </Card>
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
    </div>
  );
}
