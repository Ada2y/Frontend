'use client';

import {use} from 'react';
import Link from 'next/link';
import {ArrowLeft, AlertTriangle, CheckCircle, Info} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  MOCK_ANALYSES,
  RISK_STYLES,
  type MockBiomechanicsAnalysis,
  type JointAngle,
  type FlaggedIssue
} from '@/lib/mocks/biomechanics';
import type {InjurySeverity} from '@/lib/api';

function ScoreGauge({score}: {score: number}) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  const ringColor =
    score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-red-500';
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={ringColor}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">Technique Score</span>
    </div>
  );
}

function RiskBadge({level}: {level: InjurySeverity}) {
  const style = RISK_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {level !== 'none' && <AlertTriangle className="size-3" />}
      {style.label} risk
    </span>
  );
}

function JointAngleBar({angle}: {angle: JointAngle}) {
  const barColor =
    angle.status === 'normal'
      ? 'bg-green-500'
      : angle.status === 'warning'
        ? 'bg-amber-500'
        : 'bg-red-500';
  const min = 0;
  const max = 200;
  const normalMin = (angle.normalRange[0] / max) * 100;
  const normalMax = (angle.normalRange[1] / max) * 100;
  const valuePos = (angle.angle / max) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{angle.joint}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {angle.angle}°{' '}
          <span className="text-[10px]">
            ({angle.normalRange[0]}–{angle.normalRange[1]}°)
          </span>
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted">
        <div
          className="absolute h-full rounded-full bg-muted-foreground/20"
          style={{left: `${normalMin}%`, width: `${normalMax - normalMin}%`}}
        />
        <div
          className={`absolute h-full w-1.5 rounded-full ${barColor}`}
          style={{left: `calc(${valuePos}% - 3px)`}}
        />
      </div>
    </div>
  );
}

function IssueRow({issue}: {issue: FlaggedIssue}) {
  const style = RISK_STYLES[issue.severity];
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{issue.joint}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{issue.issue}</p>
      <span className="text-[11px] text-muted-foreground">{issue.frameRange}</span>
    </div>
  );
}

export default function BiomechanicsReportPage({params}: {params: Promise<{videoId: string}>}) {
  const {videoId} = use(params);
  const analysis = MOCK_ANALYSES.find((a) => a.videoSessionId === videoId);

  if (!analysis) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-muted-foreground">Analysis not found for this video.</p>
        </div>
        <Link href="/dashboard/videos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-3" />
            Back to videos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard/videos" className="w-fit">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-3" />
            Back to videos
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Biomechanics Report</h1>
          <p className="text-sm text-muted-foreground">
            {analysis.videoFileName} — {analysis.athleteName} · {analysis.sport}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <ScoreGauge score={analysis.techniqueScore} />
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Injury Risk</span>
              <RiskBadge level={analysis.injuryRiskLevel} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{analysis.summaryEn}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground" dir="rtl">
              {analysis.summaryAr}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Joint Angles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {analysis.jointAngles.map((ja) => (
            <JointAngleBar key={ja.joint} angle={ja} />
          ))}
        </CardContent>
      </Card>

      {analysis.flaggedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Flagged Issues</CardTitle>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                {analysis.flaggedIssues.length} issues
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {analysis.flaggedIssues.map((issue, i) => (
              <IssueRow key={i} issue={issue} />
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.flaggedIssues.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle className="size-5 text-green-600" />
            <p className="text-sm text-foreground">No issues flagged. Technique looks good.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0" />
        Analysis generated on{' '}
        {new Date(analysis.createdAt).toLocaleDateString(undefined, {
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
