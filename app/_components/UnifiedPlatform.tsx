'use client';

import Image from 'next/image';
import {HeartPulse, Activity, Crosshair, Compass} from 'lucide-react';
import {useState} from 'react';

const tabs = [
  {
    id: 'injury-prediction',
    label: 'Injury Prediction',
    icon: HeartPulse,
    kicker: 'INJURY PREDICTION',
    title: 'Identify risk before it becomes injury.',
    description:
      'Ada2y analyzes movement patterns and load indicators to flag potential injury risks early — helping athletes stay healthy and available.'
  },
  {
    id: 'physical-assessments',
    label: 'Physical Assessments',
    icon: Activity,
    kicker: 'PHYSICAL ASSESSMENTS',
    title: 'Measure what matters most.',
    description:
      'Speed, power, agility, and endurance — captured instantly with no wearables or lab setups.'
  },
  {
    id: 'skill-assessments',
    label: 'Skill Assessments',
    icon: Crosshair,
    kicker: 'SKILL ASSESSMENTS',
    title: 'Assess technique clearly.',
    description:
      'Analyze accuracy, mechanics, timing, and execution quality across sport-specific skills.'
  },
  {
    id: 'sports-recommendation',
    label: 'Sports Recommendation',
    icon: Compass,
    kicker: 'SPORTS RECOMMENDATION',
    title: 'Put athletes where they belong.',
    description:
      'Using performance data and physical profiles, Ada2y recommends the sports and positions where each athlete is most likely to excel.'
  }
] as const;

export function Ada2yUnifiedPlatformSection() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const ActiveIcon = active.icon;

  return (
    <section className="bg-background @container overflow-hidden py-24 [--background:#f7f8f8] [--color-background:#f7f8f8] [--foreground:#08090a] [--color-foreground:#08090a] [--muted-foreground:#62666d] [--color-muted-foreground:#62666d] [--muted:#f3f3f5] [--color-muted:#f3f3f5] [--primary:#5e6ad2] [--color-primary:#5e6ad2] [--border:#e2e4e7] [--color-border:#e2e4e7] [--illustration:#ffffff] [--color-illustration:#ffffff] [--border-illustration:#e2e4e7] [--color-border-illustration:#e2e4e7] scheme-light">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid sm:grid-cols-7 sm:gap-6 md:gap-12">
          <div className="flex flex-col gap-12 pb-6 sm:col-span-3 md:py-12">
            <div className="text-balance">
              <h2 className="text-foreground text-3xl font-semibold lg:text-4xl">
                Advanced analysis. Simplified insights.
              </h2>
              <p className="text-muted-foreground mt-6 text-lg">
                Everything you need to understand performance — instantly.
              </p>
            </div>
            <div className="-ml-6 mt-auto flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`active-scale-98 relative w-fit cursor-pointer px-6 pb-3 pt-2 text-left text-sm font-medium duration-200 ${
                    activeTab === tab.id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground/75'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="not-sm:overflow-hidden relative sm:col-span-4">
            <div
              aria-hidden="true"
              className="mask-x-from-45 border-foreground/15 pointer-events-none absolute -inset-x-1 -inset-y-10 rotate-45 border-y border-dashed max-lg:hidden"
            />
            <div
              aria-hidden="true"
              className="mask-y-from-75 border-foreground/15 pointer-events-none absolute -inset-x-1 -inset-y-24 border-x border-dashed"
            />

            <div className="corner-tr-bevel aspect-4/5 bg-muted relative overflow-hidden rounded-xl rounded-bl-[5rem] rounded-tr-[5rem]">
              <div className="scale-85 relative z-10 flex h-full items-center justify-start max-sm:pt-12 md:justify-center">
                <div aria-hidden="true" className="min-w-sm max-w-md px-6 pt-1">
                  <div className="bg-illustration/95 shadow-black/4 ring-border-illustration z-1 relative rounded-2xl p-6 shadow-md ring-1">
                    <div className="mask-t-from-5 bg-illustration/50 mask-t-to-65 absolute inset-0 rounded-2xl backdrop-blur" />

                    <span className="text-muted-foreground text-xs uppercase tracking-wider">
                      {active.kicker}
                    </span>

                    <div className="mt-1 text-lg font-semibold">{active.title}</div>

                    <div className="group relative mb-4 mt-3 h-fit w-fit cursor-pointer overflow-hidden rounded-full bg-foreground/10 p-px shadow shadow-black/5">
                      <div className="bg-linear-to-br/increasing mask-r-to-75 mask-r-from-25 absolute inset-0 aspect-square -translate-y-1/3 animate-spin from-emerald-400 via-blue-500 to-indigo-400 opacity-50 animation-duration-[2000ms]" />
                      <div className="group-hover:bg-illustration bg-background/95 relative flex h-8 items-center gap-1.5 rounded-full px-3 text-sm duration-100">
                        <ActiveIcon className="fill-foreground *:not-first:opacity-50 size-3" />
                        <span className="text-muted-foreground">Analysis</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-5 border-b *:-mb-px *:flex *:cursor-pointer *:items-center *:gap-1.5 *:py-2 *:text-sm *:[&>svg]:size-3.5 *:not-first:text-foreground/50">
                        {tabs.slice(0, 3).map((tab, i) => {
                          const TabIcon = tab.icon;
                          return (
                            <div
                              key={tab.id}
                              className={activeTab === tab.id ? 'border-primary border-b' : ''}
                              onClick={() => setActiveTab(tab.id)}
                            >
                              <TabIcon className="size-3.5" />
                              <span>{i === 0 ? 'Risk' : i === 1 ? 'Physical' : 'Skill'}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">{active.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0">
                <Image
                  alt="feature background image"
                  loading="lazy"
                  fill
                  className="size-full object-cover opacity-75 dark:opacity-50"
                  sizes="100vw"
                  src="/images/unsplash-platform-bg.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
