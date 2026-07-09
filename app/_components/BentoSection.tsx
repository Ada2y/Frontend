'use client';

import {Globe} from 'lucide-react';
import Image from 'next/image';
import {type CSSProperties, useMemo, useState} from 'react';

type DashboardChartPoint = {
  x: number;
  mobileY: number;
  desktopY: number;
  mobileValue: number;
  desktopValue: number;
};

const DASHBOARD_CHART_WIDTH = 517;
const DASHBOARD_CHART_HEIGHT = 224;
const DASHBOARD_TOOLTIP_HEIGHT = 66;
const DASHBOARD_POINTS: DashboardChartPoint[] = [
  {x: 0, mobileY: 182.187, desktopY: 171.733, mobileValue: 224, desktopValue: 56},
  {x: 103.4, mobileY: 182.187, desktopY: 171.733, mobileValue: 222, desktopValue: 57},
  {x: 206.8, mobileY: 176.96, desktopY: 153.44, mobileValue: 230, desktopValue: 78},
  {x: 310.2, mobileY: 147.467, desktopY: 109.2, mobileValue: 262, desktopValue: 132},
  {x: 413.6, mobileY: 200.48, desktopY: 163.147, mobileValue: 205, desktopValue: 69},
  {x: 517, mobileY: 74.667, desktopY: 0, mobileValue: 340, desktopValue: 224}
];

function interpolatePoint(points: DashboardChartPoint[], x: number) {
  const clampedX = Math.max(0, Math.min(DASHBOARD_CHART_WIDTH, x));

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];

    if (clampedX >= start.x && clampedX <= end.x) {
      const segmentWidth = end.x - start.x || 1;
      const ratio = (clampedX - start.x) / segmentWidth;

      return {
        x: clampedX,
        mobileY: start.mobileY + (end.mobileY - start.mobileY) * ratio,
        desktopY: start.desktopY + (end.desktopY - start.desktopY) * ratio,
        mobileValue: Math.round(start.mobileValue + (end.mobileValue - start.mobileValue) * ratio),
        desktopValue: Math.round(
          start.desktopValue + (end.desktopValue - start.desktopValue) * ratio
        )
      };
    }
  }

  const fallback = points[points.length - 1];
  return {
    x: clampedX,
    mobileY: fallback.mobileY,
    desktopY: fallback.desktopY,
    mobileValue: fallback.mobileValue,
    desktopValue: fallback.desktopValue
  };
}

const bentoColorTokens = {
  '--background': '#fafafa',
  '--foreground': 'lab(2.51107% .242703 -.886115)',
  '--card': '#ffffff',
  '--card-foreground': 'lab(2.51107% .242703 -.886115)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'lab(35.1166% 1.78212 -6.1173)',
  '--primary': 'oklch(0.58 0.22 277)',
  '--primary-foreground': '#ffffff',
  '--ring': 'oklch(0.58 0.22 277)',
  '--border': 'color-mix(in oklab, oklch(0.145 0 0) 7.5%, transparent)'
} as CSSProperties;

export function Ada2yBentoSection() {
  const [hoverX, setHoverX] = useState(0);
  const interpolated = useMemo(() => interpolatePoint(DASHBOARD_POINTS, hoverX), [hoverX]);
  const tooltipY = Math.max(
    0,
    Math.min(DASHBOARD_CHART_HEIGHT - DASHBOARD_TOOLTIP_HEIGHT, interpolated.mobileY - 60)
  );

  return (
    <div
      data-theme="global"
      style={bentoColorTokens}
      className="scheme-light selection:bg-foreground/10 selection:text-foreground bg-background dark:scheme-dark @container py-24"
    >
      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="@xl:grid-cols-2 @4xl:grid-cols-10 grid grid-cols-1 gap-3">
            <div
              data-slot="card"
              className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @4xl:col-span-4 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
            >
              <div>
                <h3 className="text-foreground font-semibold">Ada2y Club & Session Management</h3>
                <p className="text-muted-foreground mt-3">
                  Manage clubs, venues, and weekly sessions from one place with a clear, role-based
                  workflow for admins and coaches.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="@4xl:aspect-auto flex aspect-video items-center justify-center"
              >
                <div className="relative mx-auto flex w-fit gap-3">
                  <div className="border-border-illustration absolute -inset-x-6 inset-y-0 border-y border-dashed" />
                  <div className="border-border-illustration absolute -inset-y-6 inset-x-0 border-x border-dashed" />
                  <div className="dark:ring-background dark:border-border-illustration bg-foreground/65 relative flex aspect-square size-16 items-center rounded-[7px] border border-white/25 p-3 text-white shadow-lg shadow-black/35 ring ring-black dark:bg-zinc-900">
                    <span className="absolute right-2 top-1 block text-sm">fn</span>
                    <Globe className="lucide lucide-globe mt-auto size-4" />
                  </div>
                  <div className="dark:ring-background dark:border-border-illustration bg-foreground/65 relative flex aspect-square size-16 items-center justify-center rounded-[7px] border border-white/25 p-3 shadow-lg shadow-black/35 ring ring-black dark:bg-zinc-900">
                    <span className="text-white">K</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @xl:col-span-2 @4xl:col-span-6 grid grid-rows-[auto_1fr] gap-8 rounded-2xl p-8 [--color-background:var(--color-muted)]"
            >
              <div>
                <h3 className="text-foreground font-semibold">
                  Interactive Performance Dashboards
                </h3>
                <p className="text-muted-foreground mt-3">
                  Track players, training performance, and operational insights with live dashboards
                  that help clubs make faster decisions.
                </p>
              </div>
              <div className="relative">
                <style>{`
[data-chart=chart-_R_155fiv5udb_] {
  --color-desktop: var(--color-indigo-500);
  --color-mobile: var(--color-emerald-400);
}
.dark [data-chart=chart-_R_155fiv5udb_] {
  --color-desktop: var(--color-indigo-500);
  --color-mobile: var(--color-emerald-400);
}`}</style>
                <div
                  data-slot="chart"
                  data-chart="chart-_R_155fiv5udb_"
                  className="[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden flex justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-sector[stroke='#fff']]:stroke-transparent h-120 aspect-auto md:h-56"
                >
                  <div
                    className="recharts-responsive-container"
                    style={{width: '100%', height: '100%', minWidth: 0}}
                  >
                    <div
                      className="recharts-wrapper"
                      style={{
                        position: 'relative',
                        cursor: 'default',
                        width: '100%',
                        height: '100%',
                        maxHeight: 224,
                        maxWidth: 517
                      }}
                    >
                      <svg
                        tabIndex={0}
                        role="application"
                        className="recharts-surface"
                        width="517"
                        height="224"
                        viewBox="0 0 517 224"
                        style={{width: '100%', height: '100%'}}
                      >
                        <title />
                        <desc />
                        <defs>
                          <clipPath id="recharts2-clip">
                            <rect x="0" y="0" height="224" width="517" />
                          </clipPath>
                        </defs>
                        <defs>
                          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity="0.8" />
                            <stop offset="55%" stopColor="var(--color-desktop)" stopOpacity="0.1" />
                          </linearGradient>
                          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-mobile)" stopOpacity="0.8" />
                            <stop offset="55%" stopColor="var(--color-mobile)" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        <g className="recharts-cartesian-grid">
                          <g className="recharts-cartesian-grid-horizontal">
                            <line
                              stroke="#ccc"
                              fill="none"
                              x="0"
                              y="0"
                              width="517"
                              height="224"
                              x1="0"
                              y1="168"
                              x2="517"
                              y2="168"
                            />
                            <line
                              stroke="#ccc"
                              fill="none"
                              x="0"
                              y="0"
                              width="517"
                              height="224"
                              x1="0"
                              y1="112"
                              x2="517"
                              y2="112"
                            />
                            <line
                              stroke="#ccc"
                              fill="none"
                              x="0"
                              y="0"
                              width="517"
                              height="224"
                              x1="0"
                              y1="56"
                              x2="517"
                              y2="56"
                            />
                            <line
                              stroke="#ccc"
                              fill="none"
                              x="0"
                              y="0"
                              width="517"
                              height="224"
                              x1="0"
                              y1="0"
                              x2="517"
                              y2="0"
                            />
                            <line
                              stroke="#ccc"
                              fill="none"
                              x="0"
                              y="0"
                              width="517"
                              height="224"
                              x1="0"
                              y1="224"
                              x2="517"
                              y2="224"
                            />
                          </g>
                        </g>
                        <path
                          stroke="#ccc"
                          pointerEvents="none"
                          width="517"
                          height="224"
                          className="recharts-curve recharts-tooltip-cursor"
                          d={`M${interpolated.x},0L${interpolated.x},224`}
                        />
                        <g className="recharts-layer recharts-area">
                          <g className="recharts-layer">
                            <defs>
                              <clipPath id="animationClipPath-recharts-area-3">
                                <rect x="0" y="0" width="517" height="226" />
                              </clipPath>
                            </defs>
                            <g
                              className="recharts-layer"
                              clipPath="url(#animationClipPath-recharts-area-3)"
                            >
                              <g className="recharts-layer">
                                <path
                                  strokeWidth="2"
                                  fill="url(#fillMobile)"
                                  fillOpacity="0.1"
                                  width="517"
                                  height="224"
                                  stroke="none"
                                  className="recharts-curve recharts-area-area"
                                  d="M0,182.187C34.467,181.261,68.933,180.336,103.4,182.187C137.867,184.037,172.333,188.664,206.8,176.96C241.267,165.256,275.733,137.222,310.2,147.467C344.667,157.711,379.133,206.234,413.6,200.48C448.067,194.726,482.533,134.697,517,74.667L517,224C482.533,224,448.067,224,413.6,224C379.133,224,344.667,224,310.2,224C275.733,224,241.267,224,206.8,224C172.333,224,137.867,224,103.4,224C68.933,224,34.467,224,0,224Z"
                                />
                                <path
                                  strokeWidth="2"
                                  fill="none"
                                  fillOpacity="0.1"
                                  stroke="var(--color-mobile)"
                                  width="517"
                                  height="224"
                                  className="recharts-curve recharts-area-curve"
                                  d="M0,182.187C34.467,181.261,68.933,180.336,103.4,182.187C137.867,184.037,172.333,188.664,206.8,176.96C241.267,165.256,275.733,137.222,310.2,147.467C344.667,157.711,379.133,206.234,413.6,200.48C448.067,194.726,482.533,134.697,517,74.667"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                        <g className="recharts-layer recharts-active-dot">
                          <circle
                            cx={interpolated.x}
                            cy={interpolated.mobileY}
                            r="4"
                            fill="var(--color-mobile)"
                            strokeWidth="2"
                            stroke="#fff"
                            className="recharts-dot"
                          />
                        </g>
                        <g className="recharts-layer recharts-area">
                          <g className="recharts-layer">
                            <defs>
                              <clipPath id="animationClipPath-recharts-area-4">
                                <rect x="0" y="0" width="517" height="202" />
                              </clipPath>
                            </defs>
                            <g
                              className="recharts-layer"
                              clipPath="url(#animationClipPath-recharts-area-4)"
                            >
                              <g className="recharts-layer">
                                <path
                                  strokeWidth="2"
                                  fill="url(#fillDesktop)"
                                  fillOpacity="0.1"
                                  width="517"
                                  height="224"
                                  stroke="none"
                                  className="recharts-curve recharts-area-area"
                                  d="M0,171.733C34.467,171.774,68.933,171.814,103.4,171.733C137.867,171.652,172.333,171.45,206.8,153.44C241.267,135.43,275.733,99.613,310.2,109.2C344.667,118.787,379.133,173.779,413.6,163.147C448.067,152.514,482.533,76.257,517,0L517,74.667C482.533,134.697,448.067,194.726,413.6,200.48C379.133,206.234,344.667,157.711,310.2,147.467C275.733,137.222,241.267,165.256,206.8,176.96C172.333,188.664,137.867,184.037,103.4,182.187C68.933,180.336,34.467,181.261,0,182.187Z"
                                />
                                <path
                                  strokeWidth="2"
                                  fill="none"
                                  fillOpacity="0.1"
                                  stroke="var(--color-desktop)"
                                  width="517"
                                  height="224"
                                  className="recharts-curve recharts-area-curve"
                                  d="M0,171.733C34.467,171.774,68.933,171.814,103.4,171.733C137.867,171.652,172.333,171.45,206.8,153.44C241.267,135.43,275.733,99.613,310.2,109.2C344.667,118.787,379.133,173.779,413.6,163.147C448.067,152.514,482.533,76.257,517,0"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                        <g className="recharts-layer recharts-active-dot">
                          <circle
                            cx={interpolated.x}
                            cy={interpolated.desktopY}
                            r="4"
                            fill="var(--color-desktop)"
                            strokeWidth="2"
                            stroke="#fff"
                            className="recharts-dot"
                          />
                        </g>
                      </svg>
                      <div
                        tabIndex={-1}
                        className="recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-bottom"
                        style={{
                          transition: 'transform 120ms linear',
                          visibility: 'visible',
                          pointerEvents: 'none',
                          position: 'absolute',
                          top: '0px',
                          left: '0px',
                          transform: `translate(${Math.min(interpolated.x + 10, DASHBOARD_CHART_WIDTH - 128)}px, ${tooltipY}px)`
                        }}
                      >
                        <div className="border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl dark:bg-zinc-900">
                          <div className="font-medium">Active players</div>
                          <div className="grid gap-1.5">
                            <div className="flex w-full flex-wrap items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-xs"
                                style={{
                                  background: 'var(--color-mobile)',
                                  borderColor: 'var(--color-mobile)'
                                }}
                              />
                              <div className="flex flex-1 items-center justify-between leading-none">
                                <span className="text-muted-foreground">Player 1</span>
                                <span className="text-foreground font-mono font-medium tabular-nums">
                                  {interpolated.mobileValue}
                                </span>
                              </div>
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-xs"
                                style={{
                                  background: 'var(--color-desktop)',
                                  borderColor: 'var(--color-desktop)'
                                }}
                              />
                              <div className="flex flex-1 items-center justify-between leading-none">
                                <span className="text-muted-foreground">Player 2</span>
                                <span className="text-foreground font-mono font-medium tabular-nums">
                                  {interpolated.desktopValue}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        onMouseMove={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          const nextX =
                            ((event.clientX - rect.left) / rect.width) * DASHBOARD_CHART_WIDTH;
                          setHoverX(nextX);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @4xl:col-span-3 group grid grid-rows-[1fr_auto] gap-8 overflow-hidden rounded-2xl p-8"
              data-theme="dark"
            >
              <div className="relative aspect-square max-w-64">
                <div className="mask-radial-from-0% mask-radial-to-75% relative flex aspect-square justify-center">
                  <Image
                    alt="Fingerprint scanner"
                    loading="lazy"
                    width="224"
                    height="224"
                    className="size-full scale-110 object-cover"
                    src="https://raw.githubusercontent.com/tailark/assets/refs/heads/main/fingerprint-scanner_vtvyyq.png"
                  />
                </div>
                <div className="aspect-3/4 bg-linear-to-b from-foreground/5 to-foreground/5 -translate-y-9.5 inset-18 absolute m-auto translate-x-1.5 border border-white/5 via-transparent">
                  <span className="animate-breathing absolute -left-px -top-px block size-2.5 rounded-tl border-l-[1.5px] border-t-[1.5px] border-primary" />
                  <span className="animate-breathing absolute -right-px -top-px block size-2.5 rounded-tr border-r-[1.5px] border-t-[1.5px] border-primary" />
                  <span className="animate-breathing absolute -bottom-px -left-px block size-2.5 rounded-bl border-b-[1.5px] border-l-[1.5px] border-primary" />
                  <span className="animate-breathing absolute -bottom-px -right-px block size-2.5 rounded-br border-b-[1.5px] border-r-[1.5px] border-primary" />
                  <div className="animate-scan absolute inset-0 z-10">
                    <div className="absolute inset-x-0 m-auto h-2 w-2/3 bg-indigo-500 blur-lg" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Secure Member Check-in</h3>
                <p className="text-muted-foreground mt-3">
                  Verify member access instantly and keep accurate records for every Ada2y class and
                  event.
                </p>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @4xl:col-span-4 group grid grid-rows-[1fr_auto] gap-8 overflow-hidden rounded-2xl p-8 [--color-background:var(--color-muted)]"
            >
              <div
                aria-hidden="true"
                className="before:z-1 mask-b-from-65% before:bg-card after:bg-card before:border-foreground/10 after:border-foreground/5 group relative -mx-4 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-2xl before:border after:absolute after:inset-x-8 after:bottom-0 after:top-2 after:rounded-2xl after:border"
              >
                <div className="bg-card border-border-illustration relative z-10 h-full rounded-t-2xl border p-4 pb-10 text-xs shadow-lg duration-300">
                  <div className="mb-0.5 text-sm font-semibold">Compaign</div>
                  <div className="mb-4 flex gap-2 text-sm">
                    <span>Loyalty program</span>
                    <span className="text-muted-foreground">loyalty program</span>
                  </div>
                  <div className="@md:grid-cols-2 mb-4 grid gap-2">
                    {Array.from({length: 2}).map((_, idx) => (
                      <div
                        key={`campaign-${idx}`}
                        className="bg-illustration border-border-illustration flex gap-2 rounded-md border p-2"
                      >
                        <div className="bg-primary w-1 rounded-full" />
                        <div>
                          <div className="text-sm font-medium">Start Date</div>
                          <div className="text-muted-foreground line-clamp-1">
                            Feb 6, 2024 at 00:00
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p>
                    Connected to 12{' '}
                    <span className="text-primary font-medium">Marketing Campaigns</span>.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Campaign & Communication Hub</h3>
                <p className="text-muted-foreground mt-3">
                  Launch announcements and campaigns for members, parents, and staff with
                  Ada2y-ready templates.
                </p>
              </div>
            </div>

            <div
              data-slot="card"
              className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @4xl:row-start-auto @4xl:col-span-3 row-start-1 grid grid-rows-[1fr_auto] gap-8 overflow-hidden rounded-2xl p-8"
            >
              <div className="**:mt-0 grid h-fit grid-cols-3 gap-3">
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
                <div className="bg-illustration ring-[#d1d5db] w-16 space-y-2 rounded-md p-2 shadow-sm ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] [--color-border-illustration:color-mix(in_oklab,var(--color-foreground)15%,transparent)]">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary size-2.5 rounded-full" />
                    <div className="bg-foreground/15 h-0.75 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2.5 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="bg-foreground/15 h-0.75 w-full rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="bg-foreground/15 h-0.75 w-2/3 rounded-full" />
                      <div className="bg-foreground/15 h-0.75 w-1/3 rounded-full" />
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-signature ml-auto size-3"
                  >
                    <path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284" />
                    <path d="M3 21h18" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Real-time insights</h3>
                <p className="text-muted-foreground mt-3">
                  Immediate feedback. Athletes and coaches get results in the moment — not days
                  later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
