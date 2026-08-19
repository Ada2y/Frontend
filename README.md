# Ada2y Frontend

Next.js (App Router) frontend for **Ada2y**, an AI sports-coaching platform for the MENA region. Athletes upload training video and get a biomechanics report, a personalised training plan, and clinically-aware nutrition advice; coaches manage a squad; admins run the review queue and knowledge base.

See `../ARCHITECTURE.md` for the full system design and `../Ada2y_Backend_AI_TODO.md` for current backend status.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** + **shadcn/ui** ("new-york" style) — a mix of `@base-ui/react` (the project's original components: button, card, sheet, accordion, navigation-menu) and `radix-ui` (everything added later: dialog, select, tabs, dropdown-menu, tooltip, form, table) — both are real deps, this isn't a mistake, just two component generations
- **recharts** (+ shadcn's `chart.tsx` wrapper) for the trend/compare/stats charts
- **react-hook-form** + **zod** (available via shadcn's `form.tsx`, not yet used everywhere)
- No data-fetching library — a typed `fetch` wrapper (`lib/api.ts`) + manual `useEffect`, no SWR/React Query
- No test runner configured yet (see Known gaps)

## Project layout

```
app/
  (marketing)/          # public pages - landing, auth screens
  (dashboard)/
    dashboard/           # one folder per route, e.g. dashboard/team/[teamId]/
    _components/          # shared dashboard components (nav, badges, empty states)
lib/
  api.ts                  # the entire backend contract - every endpoint call + response type
  auth-context.tsx          # current-user context, populated from ApiClient.me()
  dashboard-nav.ts           # role-gated nav items
  mocks/                      # data layers for screens whose backend doesn't exist yet
    team-service.ts             # Team/Coach dashboard (US-C01-C05) - no /teams backend yet
    admin-service.ts             # Admin user-mgmt + KB upload (US-AD01/AD02) - no backend yet
components/ui/                  # shadcn primitives
.interface-design/system.md      # design tokens, spacing/type scale, component patterns - read
                                   # this before building new UI
```

## Setup

```bash
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL + NEXT_PUBLIC_GOOGLE_CLIENT_ID
pnpm dev
```

Needs the backend running (see `../Backend/README.md`) for anything past the marketing pages — there's no mock-backend mode for the real endpoints, only for the two screens listed above that have no backend yet.

## Commands

```bash
pnpm dev            # dev server, Turbopack
pnpm build           # production build (also runs in CI)
pnpm lint             # eslint
pnpm format:check      # prettier --check
npx tsc --noEmit --skipLibCheck   # typecheck (not a package.json script, but what CI runs)
```

CI (`.github/workflows/ci.yml`) runs lint → format:check → typecheck → build on every PR/push to `dev`/`main`. No test step yet.

## Key conventions

- **Contract-first with the backend.** `lib/api.ts` is the single source of truth for every endpoint the frontend calls — it's often built _ahead_ of the backend shipping the route, deliberately, so both sides can develop in parallel. Check it before assuming an endpoint doesn't exist.
- **Mock-then-swap for screens without a backend yet.** `lib/mocks/team-service.ts` and `lib/mocks/admin-service.ts` expose the same async, Promise-based shape a real `ApiClient` method would — so when `/teams` or the admin endpoints ship, swapping a page from `TeamService.foo()` to `ApiClient.foo()` should be close to a one-line change, not a rewrite.
- **Bilingual content fields, not a translated UI.** Athlete-facing AI output (nutrition advice, coach messages) carries both `_en` and `_ar` fields, rendered side by side with `dir="rtl"` on the Arabic block. The UI chrome itself (nav, labels, buttons) is English-only and `app/layout.tsx` is hardcoded `dir="ltr"` — a known, deliberately-unscoped gap against the product's Arabic-first requirement (see the comment in `app/layout.tsx`).
- **Design system**: read `.interface-design/system.md` before adding new UI — it documents actual token usage extracted from the codebase (spacing, type scale, radius, elevation), not just aspirational values.

## Known gaps

- No frontend test tooling (no Vitest/Jest/RTL) and no test step in CI.
- Team/Coach dashboard (`app/(dashboard)/dashboard/team/`) and Admin user-management/knowledge-base screens run on mock data — real once their backend endpoints ship.
- No app-wide RTL/i18n — see above.
- Only `en` marketing/auth copy; no locale switcher.
