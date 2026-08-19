'use client';

import {use, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {AlertTriangle, ArrowLeft, CheckCircle, HelpCircle, Info, Loader2} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import CoachCard from '@/app/(dashboard)/_components/CoachCard';
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

const SEVERITY_STYLES: Record<CheckSeverity, {bg: string; text: string}> = {
  info: {bg: 'bg-blue-500/10', text: 'text-blue-600'},
  warn: {bg: 'bg-amber-500/10', text: 'text-amber-600'},
  risk: {bg: 'bg-red-500/10', text: 'text-red-600'}
};

function exerciseLabel(exercise: string | null): string {
  if (!exercise) return 'Exercise';
  return ALL_EXERCISES.find((e) => e.value === exercise)?.label ?? exercise;
}

function SeverityChip({severity}: {severity: CheckSeverity}) {
  const style = SEVERITY_STYLES[severity];
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
        style.bg,
        style.text
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

  if (error) return <p className="text-xs text-muted-foreground">Evidence image unavailable.</p>;
  if (!src) {
    return (
      <div className="flex h-40 w-full max-w-sm items-center justify-center rounded-lg bg-muted">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- blob: URL, next/image can't optimize it
  return (
    <img
      src={src}
      alt="Evidence frame"
      className="w-full max-w-sm rounded-lg border border-border"
    />
  );
}

function CheckRow({videoId, check}: {videoId: string; check: CheckResult}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <OutcomeIcon outcome={check.outcome} />
          <span className="text-sm font-medium capitalize text-foreground">
            {check.check_id.replace(/_/g, ' ')}
          </span>
        </div>
        <SeverityChip severity={check.severity} />
      </div>
      {check.value != null && check.threshold != null && (
        <p className="text-xs font-mono text-muted-foreground">
          measured {check.value} (target {check.op} {check.threshold})
        </p>
      )}
      {check.outcome === 'not_assessable' && (
        <p className="text-xs text-muted-foreground">Not enough visibility to assess this check.</p>
      )}
      {check.message && <p className="text-sm text-foreground">{check.message}</p>}
      {check.evidence_image && <EvidenceImage videoId={videoId} filename={check.evidence_image} />}
    </div>
  );
}

function MetricsTable({metrics}: {metrics: Record<string, number>}) {
  const entries = Object.entries(metrics);
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
      {entries.map(([name, value]) => (
        <div key={name} className="flex items-center justify-between gap-2 text-muted-foreground">
          <span className="truncate">{name.replace(/_/g, ' ')}</span>
          <span className="font-mono tabular-nums text-foreground">{value}</span>
        </div>
      ))}
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
    <Link href="/dashboard/videos" className="w-fit">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="mr-1 size-3" />
        Back to videos
      </Button>
    </Link>
  );

  if (loading && !status) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (status && status !== 'completed') {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-muted-foreground">
            {status === 'failed'
              ? (failureReason ?? 'Analysis failed.')
              : 'Your video is still being analyzed — this page will update automatically.'}
          </p>
        </div>
        {status !== 'failed' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Status: {status}
          </div>
        )}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <p className="text-sm text-muted-foreground">No report available for this video.</p>
      </div>
    );
  }

  const isWrongView = report.input.flags.includes('wrong_view');
  const {summary} = report;
  const formGif = exerciseGifUrl(report.exercise);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {backLink}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-muted-foreground">
            {exerciseLabel(report.exercise)} · {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {isWrongView && (
        <Card className="border-amber-500/40">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-foreground">
                We couldn&apos;t assess this video
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{summary.headline}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Summary</CardTitle>
            <span className="text-xs text-muted-foreground">
              View: {report.input.view.measured ?? 'unknown'} (expected {report.input.view.expected}
              )
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-foreground">{summary.headline}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-green-600">{summary.passed} passed</span>
            <span className="text-red-600">{summary.failed} failed</span>
            <span className="text-muted-foreground">{summary.not_assessable} not assessable</span>
            <span className="text-muted-foreground">{report.segmentation.count} reps detected</span>
          </div>
          {Object.keys(summary.severity_counts).length > 0 && (
            <div className="flex gap-3">
              {Object.entries(summary.severity_counts).map(([severity, count]) => (
                <span key={severity} className="flex items-center gap-1.5">
                  <SeverityChip severity={severity as CheckSeverity} />
                  <span className="text-xs text-muted-foreground">×{count}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CoachCard videoId={videoId} />

      {report.reps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-rep breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion>
              {report.reps.map((rep) => {
                const repFailed = rep.checks.some((c) => c.outcome === 'fail');
                return (
                  <AccordionItem key={rep.index} value={`rep-${rep.index}`}>
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        Rep {rep.index + 1}
                        {repFailed ? (
                          <AlertTriangle className="size-3.5 text-red-600" />
                        ) : (
                          <CheckCircle className="size-3.5 text-green-600" />
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-3">
                        {rep.checks.map((check) => (
                          <CheckRow key={check.check_id} videoId={videoId} check={check} />
                        ))}
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Metrics
                          </p>
                          <MetricsTable metrics={rep.metrics} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
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

      {formGif && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Correct form reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- gif is a static asset */}
              <img
                src={formGif}
                alt={`${exerciseLabel(report.exercise)} correct form`}
                className="w-full max-w-sm rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground">
                Follow this motion as your reference while reviewing your rep breakdown above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
