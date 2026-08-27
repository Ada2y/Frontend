# Dashboard Redesign — Phase 1 (Final)

## Summary

Transformed the dashboard from a basic text-only layout into a polished, data-driven overview with KPI stats, body metrics, injury tracking, quick actions, and an activity feed. Also shipped: correct-form GIF reference on biomechanics reports, sidebar height fix, and backend Supabase setup with seed accounts.

**Status:** Complete — ready for Phase 2.

---

## What Changed

### Overview Page (`/dashboard`)

**Before:**
- 3 identical text-only Cards (Training Plan, Nutrition, Recent Videos)
- No stats, no data visualization
- Loading state: blank page (`return null`)
- Sidebar overflowed on short pages
- No body metrics or injury tracking

**After:**
- Time-of-day greeting with user's first name
- 4 KPI stat cards (Sessions, Form Score, This Week, Nutrition) with real data
- 2 additional stat cards (Body Metrics, Injury Status)
- Quick action shortcut row
- Timestamped activity feed with pass/fail icons
- Skeleton loading state (4 animated placeholder cards)
- Form score ring visualization

### Biomechanics Report

**Before:** No exercise form reference
**After:** Self-hosted GIF of correct exercise form displayed below the analysis section

### Sidebar

**Before:** Scrollable with page, lost position
**After:** `h-screen lg:sticky lg:top-0` — stays fixed, nav scrolls independently

### Backend

**Before:** No database, no seed data
**After:** Supabase PostgreSQL, 4 seed accounts, working auth flow

---

## Components

### StatCard (`_components/StatCard.tsx`)

Reusable KPI card with colored accent line.

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `LucideIcon` | Icon in the tinted badge |
| `label` | `string` | Uppercase text above the value |
| `value` | `string \| number` | Large bold value |
| `description` | `string` | Optional subtitle |
| `accentColor` | `string` | Hex color for accent line + icon tint |

**Styling:**
- `text-4xl font-bold` value, `text-sm` label/description
- Icon: `size-12 rounded-xl` with `bg-{color}/10`
- Top accent: `h-[3px]` solid line
- Hover: `shadow-md ring-foreground/20`

---

### QuickActions (`_components/QuickActions.tsx`)

4-column shortcut row linking to key pages.

| Action | Route | Color |
|--------|-------|-------|
| Upload Video | `/dashboard/videos` | Blue |
| View Reports | `/dashboard/biomechanics` | Primary (indigo) |
| Training Plan | `/dashboard/training-plan` | Amber |
| Nutrition | `/dashboard/nutrition` | Green |

**Layout:** 4-col desktop, 2-col mobile. Icon `size-11`, label `text-base`.

---

### ActivityFeed (`_components/ActivityFeed.tsx`)

Timestamped list of recent video events (max 6).

| Field | Source |
|-------|--------|
| Icon | `CheckCircle` (green) / `AlertTriangle` (amber) / `Upload` (gray) |
| Title | `video.original_filename` |
| Detail | `"squat · 2/3 passed"` |
| Link | `/dashboard/biomechanics/{id}` if completed |
| Time | Relative: `5m ago`, `2h ago`, `3d ago` |

---

### SkeletonCard (inline in `page.tsx`)

Animated loading placeholder matching StatCard dimensions.

- `h-4` label, `h-10` value, `h-4` description placeholders
- `size-12` icon placeholder
- `animate-pulse` with staggered delays

---

## KPI Calculations

All data from `ApiClient.listVideos()` — no mock data.

### Sessions Analyzed
```typescript
completedVideos = videos.filter(v => v.status === 'completed')
value = completedVideos.length
```

### Form Score
```typescript
totalPassed = sum of v.passed
totalChecks = sum of (v.passed + v.failed)
formScore = round((totalPassed / totalChecks) * 100)
// Edge case: totalChecks === 0 → displays "—"
```

**Seed data example:** Video 1 (1/2 passed = 50%) + Video 2 (2/2 passed = 100%) → formScore = 75%

### Sessions This Week
```typescript
weekAgo = now - 7 days
sessionsThisWeek = completedVideos.filter(v => v.created_at > weekAgo).length
```

### Nutrition
```typescript
value = nutrition ? 'Active' : 'None'
```

### Body Metrics
```typescript
latest = bodyMetrics[bodyMetrics.length - 1]
value = `${latest.weight_kg}kg / ${latest.height_cm}cm / BMI ${latest.bmi}`
description = `Recorded ${new Date(latest.recorded_at).toLocaleDateString()}`
// Empty: value = "—", description = "No data yet"
```

### Injury Status
```typescript
activeInjuries = injuries.filter(i => !i.recovered_at)
count = activeInjuries.length
value = count === 0 ? 'None' : `${count} active`
// 1 injury: description = "Knee — high"
// 2+ injuries: description = "Knee, Shoulder" or "Knee, Shoulder +1 more"
// 0 injuries: description = "You're all clear"
accentColor = count === 0 ? green : highCount > 0 ? red : amber
```

---

## GIF Reference Feature

**Files changed:**
- `public/exercise-gifs/` — 6 self-hosted GIFs (squat, deadlift, bench_press, push_up, shoulder_press, lat_pulldown)
- `lib/api.ts` — added `exerciseGifUrl(exerciseName)` helper
- `app/(dashboard)/biomechanics/[id]/page.tsx` — GIF card rendered below analysis section

**How it works:**
1. After analysis loads, `exerciseGifUrl(exercise)` is called
2. If a matching GIF exists, a card with the correct-form image is shown below the analysis
3. No external CDN calls — all assets self-hosted in `public/exercise-gifs/`

**PR:** #16 (merged to `dev`), #17 (move GIF below analysis)

---

## Sidebar Fix

**File:** `_components/Sidebar.tsx`

```
<aside className="h-screen lg:sticky lg:top-0 ...">
  <nav className="flex-1 overflow-y-auto ...">
```

- Outer `<aside>`: `h-screen` + `lg:sticky lg:top-0` — full viewport height, sticks on desktop
- Inner `<nav>`: `overflow-y-auto` — only the nav links scroll, header/footer stay fixed

---

## Backend Setup

### Database
- **Provider:** Supabase PostgreSQL (eu-central-1 pooler)
- **ORM:** SQLAlchemy + Alembic
- **Env file:** `.env` (was originally `env` without dot — renamed)

### Alembic Fix
`env.py` had `config.set_main_option()` which breaks on `%` in DB URLs:
```python
value = raw_value.replace("%", "%%")  # configparser interpolation fix
```

### Auth Fix
`passlib 1.7.4` incompatible with `bcrypt 5.0.0` — fixed by pinning `bcrypt==4.1.3`.

### Login Format
OAuth2 form-encoded, NOT JSON:
```
Content-Type: application/x-www-form-urlencoded
Body: username=athlete@ada2y.dev&password=Ada2yDev!2026
```

### Seed Accounts
Created via `python scripts/seed_dev_accounts.py`:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| athlete@ada2y.dev | Ada2yDev!2026 | athlete | ACTIVE |
| coach@ada2y.dev | Ada2yDev!2026 | coach | ACTIVE |
| reviewer@ada2y.dev | Ada2yDev!2026 | reviewer | ACTIVE |
| admin@ada2y.dev | Ada2yDev!2026 | admin | ACTIVE |

**Note:** Accounts need `status=ACTIVE` to bypass email verification.

### Running
```bash
# Backend (port 8001 — port 8000 was occupied)
cd ada2y-backend
uvicorn app.main:app --host 0.0.0.0 --port 8001

# Frontend (port 3000)
cd Frontend
npm run dev
```

### Frontend Env
`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
```

---

## Text Size Scale (Final)

All text bumped one size from initial implementation:

| Element | Size |
|---------|------|
| Page heading | `text-2xl` |
| Page subtitle | `text-base` |
| Card label (uppercase) | `text-sm` |
| Card value | `text-4xl` |
| Card description | `text-sm` |
| Card icon | `size-12` / `size-6` |
| Quick action label | `text-base` |
| Activity feed title | `text-base` |
| Activity feed detail | `text-sm` |
| Skeleton placeholders | `h-4` / `h-10` |

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `_components/StatCard.tsx` | Created | Reusable KPI card |
| `_components/QuickActions.tsx` | Created | Shortcut row |
| `_components/ActivityFeed.tsx` | Created | Recent activity list |
| `_components/Sidebar.tsx` | Modified | Sticky + scroll fix |
| `app/(dashboard)/dashboard/page.tsx` | Modified | Full overview redesign |
| `app/(dashboard)/biomechanics/[id]/page.tsx` | Modified | GIF reference below analysis |
| `lib/api.ts` | Modified | `exerciseGifUrl()` helper |
| `public/exercise-gifs/*` | Created | 6 self-hosted GIFs |
| `docs/dashboard-phase1.md` | Created | This document |
| `.env.local` | Created | API URL config |
| `ada2y-backend/.env` | Created | Supabase + secret key |
| `ada2y-backend/app/db/migrations/env.py` | Modified | `%` escaping fix |
| `ada2y-backend/scripts/seed_dev_accounts.py` | Created | Dev account seeder |

---

## Layout Structure

```
Overview page
├── Greeting ("Good morning, {firstName}")
├── Subtitle ("Your latest training data at a glance.")
├── OnboardingBanner (if profile incomplete)
├── KPI Stats Row (4-column grid)
│   ├── StatCard: Sessions analyzed
│   ├── StatCard: Form score (with ProgressRing)
│   ├── StatCard: Sessions this week
│   └── StatCard: Nutrition
├── Body Metrics + Injury Status (2-column grid)
│   ├── StatCard: Body metrics (weight/height/BMI)
│   └── StatCard: Injury status (count + details)
├── Quick Actions (4-column shortcut row)
├── Activity Feed (timestamped video list)
└── (ReviewerOverview for non-athlete roles)
```

---

## Verified

- Page loads: 200 OK on `/dashboard`
- All stat cards render with correct values
- Body metrics card shows latest entry or "No data yet"
- Injury status card shows active injuries with details or "You're all clear"
- Skeleton loading displays during data fetch
- Quick actions link to correct routes
- Activity feed shows recent videos with relative timestamps
- GIF reference displays below biomechanics analysis
- Sidebar sticks on desktop, scrolls nav on mobile
- Backend auth works with seed accounts
- `file solution.patch` → ASCII text (no UTF-16LE BOM)
