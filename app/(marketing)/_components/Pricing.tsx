'use client';

import {Check} from 'lucide-react';
import {type CSSProperties, useMemo, useState} from 'react';

type MainPlan = {
  title: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  ctaClassName: string;
  features: string[];
  firstFeatureEmphasis?: boolean;
  featured?: boolean;
};

const mainPlans: MainPlan[] = [
  {
    title: 'Free',
    description: 'For individual athletes and coaches getting started with Ada2y assessments.',
    monthlyPrice: 'EGP 0',
    annualPrice: 'EGP 0',
    ctaClassName:
      'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm shadow-black/10 border border-transparent bg-card ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 h-9 px-4 py-2 w-full',
    features: [
      'Core physical assessments',
      'Athlete profiles',
      'Instant result summaries',
      'Basic progress tracking'
    ]
  },
  {
    title: 'Pro',
    description:
      'For athletes, coaches, and teams that need deeper analysis and clearer decisions.',
    monthlyPrice: 'EGP 399',
    annualPrice: 'EGP 299',
    ctaClassName:
      'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-md border-[0.5px] border-white/10 shadow-black/15 [&_svg]:drop-shadow-sm text-shadow-sm bg-primary ring-1 ring-(--ring-color) [--ring-color:color-mix(in_oklab,black_15%,var(--color-primary))] dark:border-transparent dark:[--ring-color:color-mix(in_oklab,white_15%,var(--color-primary))] text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full',
    features: [
      'Everything in Free, plus:',
      'Advanced physical assessments',
      'Skill assessment modules',
      'Detailed performance dashboards',
      'Progress reports and exports',
      'Collaborative coach review',
      'Individual athlete improvement insights',
      'Priority support'
    ],
    firstFeatureEmphasis: true,
    featured: true
  },
  {
    title: 'Startup',
    description:
      'For growing academies, teams, and organizations managing more athletes and staff.',
    monthlyPrice: 'EGP 699',
    annualPrice: 'EGP 549',
    ctaClassName:
      'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm shadow-black/10 border border-transparent bg-card ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 h-9 px-4 py-2 w-full',
    features: [
      'Everything in Pro, plus:',
      'Club and session management',
      'Role-based team access',
      'Campaign and communication hub',
      'Secure member check-in',
      'Cross-team operational visibility',
      'Implementation support'
    ],
    firstFeatureEmphasis: true
  }
];

const enterpriseFeatures = [
  'Everything in Startup',
  'Injury risk prediction at scale',
  'Sports and position recommendation workflows',
  'Multi-club and multi-location setup',
  'Custom onboarding and migration support',
  'Custom user roles and permissions',
  'Advanced reporting and API integration options',
  'Custom invoicing and procurement support',
  'Dedicated success and priority support'
];

const replicaColorTokens = {
  '--background': '#fff',
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

function FeatureIcon({hiddenOnFirst = false}: {hiddenOnFirst?: boolean}) {
  return (
    <Check
      strokeWidth={3.5}
      className={`lucide lucide-check text-muted-foreground size-3${hiddenOnFirst ? ' group-first:hidden' : ''}`}
    />
  );
}

function PriceValue({value}: {value: string}) {
  return <span className="text-3xl font-semibold tabular-nums">{value}</span>;
}

function MainPlanCard({
  title,
  description,
  price,
  periodLabel,
  ctaClassName,
  features,
  firstFeatureEmphasis,
  featured
}: MainPlan & {price: string; periodLabel: string}) {
  return (
    <div
      className={
        featured
          ? 'ring-border bg-card rounded-(--radius) @4xl:my-2 @max-4xl:mx-1 shadow-black/6.5 row-span-4 grid grid-rows-subgrid gap-8 shadow-xl ring-1 backdrop-blur'
          : '@max-4xl:p-9 row-span-4 grid grid-rows-subgrid gap-8'
      }
    >
      <div className="self-end">
        <div data-slot="card-title" className="tracking-tight text-lg font-medium">
          {title}
        </div>
        <div
          data-slot={featured ? 'card-description' : undefined}
          className="text-muted-foreground mt-1 text-balance text-sm"
        >
          {description}
        </div>
      </div>

      <div>
        <PriceValue value={price} />
        <div className="text-muted-foreground text-sm">{periodLabel}</div>
      </div>

      <a className={ctaClassName} href="#">
        Get Started
      </a>

      <ul role="list" className="space-y-3 text-sm">
        {features.map((feature) => (
          <li
            key={feature}
            className={
              firstFeatureEmphasis
                ? 'group flex items-center gap-2 first:font-medium'
                : 'flex items-center gap-2'
            }
          >
            <FeatureIcon hiddenOnFirst={Boolean(firstFeatureEmphasis)} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const periodLabel = useMemo(
    () => (billingPeriod === 'annually' ? 'Per month, billed annually' : 'Per month'),
    [billingPeriod]
  );

  return (
    <section
      id="pricing"
      style={replicaColorTokens}
      className="bg-background text-foreground relative scroll-mt-24 py-16 md:scroll-mt-28 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl lg:tracking-tight">
            Pricing that scales with your organization
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance text-lg">
            Choose the plan that fits your goals, whether you are an individual athlete, coach, or
            full organization.
          </p>

          <div className="my-12">
            <div
              data-period={billingPeriod}
              className="bg-foreground/5 *:text-foreground/75 relative mx-auto grid w-fit grid-cols-2 rounded-full p-1 *:block *:h-8 *:w-24 *:rounded-full *:text-sm *:hover:opacity-75"
            >
              <div
                aria-hidden="true"
                className="bg-card in-data-[period=monthly]:translate-x-0 ring-foreground/5 pointer-events-none absolute inset-1 w-1/2 translate-x-full rounded-full border border-transparent shadow ring-1 transition-transform duration-500 ease-in-out"
              />
              <button
                className="data-active:text-foreground data-active:font-medium relative"
                data-active={billingPeriod === 'monthly' ? 'true' : undefined}
                type="button"
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                className="data-active:text-foreground data-active:font-medium relative"
                data-active={billingPeriod === 'annually' ? 'true' : undefined}
                type="button"
                onClick={() => setBillingPeriod('annually')}
              >
                Annually
              </button>
            </div>
            <div className="mt-3 text-center text-xs">
              <span className="text-primary font-medium">Save 25%</span> On Annual Billing
            </div>
          </div>
        </div>

        <div className="@container">
          <div className="rounded-(--radius) @max-4xl:max-w-sm mx-auto border">
            <div className="@4xl:grid-cols-3 grid *:p-8">
              {mainPlans.map((plan) => (
                <MainPlanCard
                  key={plan.title}
                  {...plan}
                  price={billingPeriod === 'annually' ? plan.annualPrice : plan.monthlyPrice}
                  periodLabel={periodLabel}
                />
              ))}
            </div>
          </div>

          <div className="rounded-(--radius) @max-4xl:max-w-sm @4xl:grid-cols-3 @max-4xl:divide-y @4xl:divide-x mx-auto mt-6 grid border *:p-8">
            <div className="space-y-6">
              <div className="self-end">
                <div data-slot="card-title" className="tracking-tight text-lg font-medium">
                  Enterprise Custom Plan
                </div>
                <div className="text-muted-foreground mt-1 text-balance text-sm">
                  For federations, schools, and professional programs with complex workflows and
                  rollout needs.
                </div>
              </div>
              <a
                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm shadow-black/10 border border-transparent bg-card ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 h-9 px-4 py-2 @max-4xl:w-full"
                href="#"
              >
                Contact Sales
              </a>
            </div>

            <div className="col-span-2">
              <ul role="list" className="@4xl:grid-cols-2 grid gap-x-14 gap-y-3 text-sm">
                {enterpriseFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <FeatureIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
