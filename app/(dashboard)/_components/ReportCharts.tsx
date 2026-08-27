'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ChartCard from './ChartCard';
import {type AnalysisReport} from '@/lib/api';

const COLORS = {
  green: '#22c55e',
  red: '#ef4444',
  gray: '#94a3b8',
  blue: '#3b82f6',
  primary: '#5e6ad2'
} as const;

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

export function RepBreakdownChart({report}: {report: AnalysisReport}) {
  const data = report.reps.map((rep) => {
    const passed = rep.checks.filter((c) => c.outcome === 'pass').length;
    const failed = rep.checks.filter((c) => c.outcome === 'fail').length;
    const notAssessable = rep.checks.filter((c) => c.outcome === 'not_assessable').length;
    return {
      rep: `Rep ${rep.index + 1}`,
      passed,
      failed,
      not_assessable: notAssessable
    };
  });

  return (
    <ChartCard
      title="Per-rep breakdown"
      subtitle="Checks per repetition"
      accentColor={COLORS.primary}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{top: 5, right: 5, bottom: 0, left: -20}}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="rep" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{fontSize: 12, paddingTop: 8}}
              formatter={(value) => (
                <span className="text-muted-foreground">{value}</span>
              )}
            />
            <Bar
              dataKey="passed"
              name="Passed"
              fill={COLORS.green}
              stackId="a"
              radius={[0, 0, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="failed"
              name="Failed"
              fill={COLORS.red}
              stackId="a"
              radius={[0, 0, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="not_assessable"
              name="Not assessed"
              fill={COLORS.gray}
              stackId="a"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

const PIE_COLORS = [COLORS.green, COLORS.red, COLORS.gray];

export function PassFailPieChart({report}: {report: AnalysisReport}) {
  const data = [
    {name: 'Passed', value: report.summary.passed},
    {name: 'Failed', value: report.summary.failed},
    {name: 'Not assessed', value: report.summary.not_assessable}
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <ChartCard
        title="Check distribution"
        subtitle="Overall outcomes"
        accentColor={COLORS.green}
      >
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No checks to display
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Check distribution"
      subtitle="Overall outcomes"
      accentColor={COLORS.green}
    >
      <div className="flex h-64 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({active, payload}) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                const total = data.reduce((s, x) => s + x.value, 0);
                const val = (d.value as number) ?? 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-muted-foreground">
                      {d.value} checks ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{fontSize: 12, paddingTop: 4}}
              formatter={(value) => (
                <span className="text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
