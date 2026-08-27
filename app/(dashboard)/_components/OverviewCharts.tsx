'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ChartCard from './ChartCard';
import {type BodyMetricEntry, type VideoListItem} from '@/lib/api';

const COLORS = {
  blue: '#3b82f6',
  primary: '#5e6ad2',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
} as const;

function sessionsPerWeekData(videos: VideoListItem[]) {
  const completed = videos.filter((v) => v.status === 'completed');
  const weeks: Record<string, number> = {};

  for (const v of completed) {
    const d = new Date(v.created_at);
    const now = new Date();
    const weekNum = Math.floor(
      (now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weekNum < 0 || weekNum >= 12) continue;
    const label = weekNum === 0 ? 'This week' : weekNum === 1 ? '1w ago' : `${weekNum}w ago`;
    const key = `w${weekNum}`;
    weeks[key] = (weeks[key] ?? 0) + 1;
  }

  const result = [];
  for (let i = 11; i >= 0; i--) {
    const key = `w${i}`;
    const label = i === 0 ? 'This wk' : i === 1 ? '1w' : `${i}w`;
    result.push({week: label, sessions: weeks[key] ?? 0});
  }
  return result;
}

function formScoreTrendData(videos: VideoListItem[]) {
  const completed = videos
    .filter((v) => v.status === 'completed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return completed.map((v, i) => {
    const total = (v.passed ?? 0) + (v.failed ?? 0);
    const score = total > 0 ? Math.round(((v.passed ?? 0) / total) * 100) : 0;
    return {
      session: i + 1,
      score,
      label: new Date(v.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    };
  });
}

function bodyMetricsChartData(metrics: BodyMetricEntry[]) {
  return metrics
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      weight: m.weight_kg,
      bmi: m.bmi
    }));
}

const axisStyle = {fontSize: 12, fill: 'var(--muted-foreground)' as const};
const gridStyle = {strokeDasharray: '3 3', stroke: 'var(--border)' as const};

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{color: string; name: string; value: number}>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{String(label)}</p>
      {payload.map((p, i) => (
        <p key={i} style={{color: p.color}} className="text-sm">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function SessionsChart({videos}: {videos: VideoListItem[]}) {
  const data = sessionsPerWeekData(videos);
  const total = data.reduce((s, d) => s + d.sessions, 0);

  return (
    <ChartCard
      title="Sessions per week"
      subtitle={`${total} completed sessions`}
      accentColor={COLORS.blue}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="week" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="sessions"
              name="Sessions"
              fill={COLORS.blue}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function FormScoreChart({videos}: {videos: VideoListItem[]}) {
  const data = formScoreTrendData(videos);

  if (data.length < 2) {
    return (
      <ChartCard
        title="Form score trend"
        subtitle="Need at least 2 sessions"
        accentColor={COLORS.primary}
      >
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Not enough data yet
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Form score trend"
      subtitle="Pass rate across reps"
      accentColor={COLORS.primary}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="session" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              name="Score"
              stroke={COLORS.primary}
              strokeWidth={2.5}
              dot={{fill: COLORS.primary, r: 4, strokeWidth: 0}}
              activeDot={{r: 6, strokeWidth: 0}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function BodyMetricsChart({metrics}: {metrics: BodyMetricEntry[]}) {
  const data = bodyMetricsChartData(metrics);

  if (data.length < 2) {
    return (
      <ChartCard
        title="Body metrics"
        subtitle="Weight and BMI over time"
        accentColor={COLORS.green}
      >
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Not enough data yet
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Body metrics"
      subtitle="Weight and BMI over time"
      accentColor={COLORS.green}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis yAxisId="weight" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis yAxisId="bmi" orientation="right" tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{fontSize: 12, paddingTop: 8}}
              formatter={(value) => (
                <span className="text-muted-foreground">{value}</span>
              )}
            />
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              name="Weight (kg)"
              stroke={COLORS.blue}
              strokeWidth={2}
              dot={{fill: COLORS.blue, r: 3, strokeWidth: 0}}
            />
            <Line
              yAxisId="bmi"
              type="monotone"
              dataKey="bmi"
              name="BMI"
              stroke={COLORS.amber}
              strokeWidth={2}
              dot={{fill: COLORS.amber, r: 3, strokeWidth: 0}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
