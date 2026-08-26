# Coaching UI, injury screening and interface audit — branch handover

Branch: `feat/injury-screening-and-ux` (cut from `dev`)
Companion backend branch: `feature/injury-screening-and-ux` on `Ada2y/ada2y-backend`

12 commits. Added a test runner where there was none: **27 tests**, plus
`pnpm lint` clean with zero warnings and `pnpm build` clean.

---

## Where this started

The UI read as vague and unfinished — cluttered with raw data in places, bare
in others. The root cause was not decoration, it was the **total absence of
visual hierarchy**: every element the same size, weight, card and gap, so
nothing led.

Measured across the dashboard at the start: **97× `text-sm`, 69× `text-xs`,
17× `text-xl`, and zero `text-2xl` or larger** — 166 uses of small text and no
display type at all. On top of that `html { font-size: 88% }` shrank the rem
root to ~14.08px, so `text-sm` rendered at ~12.3px and `text-xs` at ~10.6px,
while `body { font-size: 16px }` was an absolute px override — meaning
unstyled text rendered _larger_ than its styled neighbours. The type was not
just small, it was internally inconsistent.

There were also no charts in a product whose entire value is numbers over
time, no motion, "Loading…" as a loading state, and plans that vanished on
logout because the last id lived in `localStorage`.

---

## What changed

### 1. The report page leads with coaching, not geometry

Hero is the one thing to fix next. Raw metrics collapse into _Technical
details_, closed by default. Every check carries a plain sentence for pass as
well as fail.

### 2. Corrections are drawn, not photographed

`CorrectionCanvas` renders the athlete's pose and the solved target pose as
**vectors on a neutral canvas**, sharing one aspect-preserving transform —
separately-fitted skeletons would hide the very difference being shown. The
baked JPEG remains as a fallback for reports generated before
`correction_pose` existed.

`SkeletonPlayer` replays the tracked skeleton with scrubbing, per-rep jump
buttons coloured by outcome, and a ground line. One transform is fitted over
the whole clip so the skeleton doesn't swim as limbs enter and leave tracking.
Left and right limbs are drawn in different hues; in a side view a single
colour turns a readable pose into a tangle of crossing lines.

`lib/pose/draw.ts` holds the geometry, out of the components, so it is
testable. Bones touching a missing keypoint are skipped rather than drawn to
the origin — that bug sends a limb into the corner of the canvas.

### 3. The dashboard answers the question athletes actually ask

The hero was a risk number out of 100, which is not an answer to _"should I
train today"_. It now leads with the verdict, states the reason that decided
it, demotes the risk score to a supporting stat, **and prints which signals it
could not read** — a readiness hero that silently skipped sleep and HRV would
be taken as having seen them.

### 4. Data that persists, and history that doesn't pile up

Plans and nutrition load from the server, survive logout and a different
browser. Regenerate is a quiet secondary action behind a confirm, not the hero
button. Sport suggestions no longer stack as identical cards forever — latest
is the hero, earlier ones are a compact dated list, which makes the bug
structurally impossible to reintroduce.

### 5. Injury Risk, Compare, streaks, PDF

An Injury Risk tab with every factor itemised and its points shown; a Compare
tab (this session vs previous vs personal best, with a pass-rate chart);
consistency streaks with an activity chart and milestones; and a
_Share as PDF_ action.

Metrics with no governing rule render in neutral grey **and say why** — the
backend flags `has_polarity: false`, so nothing is coloured as an improvement
nobody defined.

### 6. Evidence is visible

`EvidenceNote` renders what each analysis is allowed to claim, with **both
sides of the literature at equal weight**. Collapsed by default: present and
findable on every report, not shouted on every report.

---

## The interface audit

Every athlete-facing screen was captured at 1440px and 390px in both colour
schemes and checked against the rendered DOM. Seventeen findings, all fixed.
The three that mattered:

**Dark mode did not exist.** Zero dark tokens in `globals.css`, no provider,
no toggle — and **34 `dark:` classes across components that were all inert**,
so the code read as though it worked. An inline script now resolves the theme
to an explicit `data-theme` before first paint, which means one attribute
drives both the token blocks and every `dark:` utility, with no unstamped
state and no flash. The toggle renders both icons and lets CSS pick, because
anything rendered from server state hydrates wrong. Semantic colour is
tokenised (`--success` / `--warning` / `--danger` / `--info`) and swept across
18 files, with dark values lifted — the 600-weight Tailwind shades fall below
4.5:1 on a dark ground.

**Keyboard focus painted nothing anywhere** — `outline: none` plus a
transparent shadow. The fix had to go in the _utilities_ layer with a doubled
pseudo-class: `outline-none` is applied to dozens of controls, and utilities
beat the base layer regardless of specificity. A first attempt in `@layer
base` did nothing and was caught by re-running the DOM check rather than
trusting the CSS. Verified across ten consecutive tab stops.

The readiness call also now sends the browser's timezone, matching what
streaks already did — consecutive training days are a question about the
athlete's local calendar, not the server's.

**The UI never collected RPE**, while `perceived_exertion` drives the
injury-risk workload factor, the training-load ratio and the "hard session
recently" readiness rule. The backend falls back to a neutral 5, so nothing
errored — all three features simply ran on a constant. The log form now offers
an anchored Borg CR10 scale; unlabelled 1–10 sliders get answered
inconsistently, which is worse than no data for a ratio comparing an athlete
against their own baseline.

The other fourteen: app shell not filling the viewport, a green _Completed_
badge beside a fault on every rep, Title Case applied to whole sentences, the
report repeating its own headline, seven identical rep rows, false decimal
precision on a screening score, an internal `Draft` enum leaking to the
athlete, `80.00kg` loads, no "today" marker on the week grid, zero-activity
weeks invisible in the streak chart, a minus glyph reading as a negative sign,
a 40%-width content column, a misplaced form-reference GIF, and a breadcrumb
that said "Dashboard" on every detail route.

---

## Current state

- `pnpm lint` — clean, **zero warnings**
- `pnpm build` — clean
- `pnpm test` — 27 passing (Vitest; the repo had no test runner before)
- Both `<img>` tags replaced with `next/image`
- `prefers-reduced-motion` honoured globally

Both remaining images are `unoptimized`, deliberately: one src is a `blob:`
URL created in-browser from an authenticated fetch, which the server-side
optimizer cannot reach; the other is an animated GIF the optimizer would
flatten to a single still frame, and the animation is the content. Both still
get intrinsic sizing, lazy loading and `sizes`.

---

## What could be improved

**Test coverage is geometry-only.** Vitest covers `lib/pose/draw.ts` — the
part where a bug produces a picture that looks plausible but is wrong. No
component or integration tests exist. Adding `@testing-library/react` and
covering the report page's assessable/unassessable branching would be the
highest-value next step.

**Team and Admin screens still run on mocks** (`lib/mocks/team-service.ts`,
`lib/mocks/admin-service.ts`) pending their backend endpoints.

**Motion was specced and not built.** The plan called for Motion via
`LazyMotion` + `m` with a four-place budget. There is one hand-rolled
`CountUp` and CSS transitions. The audit fixes addressed the underlying
"feels unfinished" complaint through hierarchy instead; adding a library now
would be decoration. Worth a deliberate decision rather than drift.

**Exercise demo GIF licensing is unverified.** Six GIFs in
`public/exercise-gifs/` ship on the report page. The plan asked to confirm
licensing before shipping and that check was never done — an open risk on
assets already live.

**Arabic-first / RTL is unmet.** UI chrome is English-only and `dir="ltr"` is
hardcoded in `app/layout.tsx`; only AI-generated content fields carry
`dir="rtl"`. Full i18n is a separate, deliberate effort and is flagged in the
layout.

**The videos list has no pagination** — every upload renders in one list.

**Two native `<select>` elements remain.** They now carry the site's styling
and a custom chevron, but they are not the shadcn `Select` component, so they
won't match its keyboard and popover behaviour.
