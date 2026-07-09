# Ada2y Design System

## Direction & Feel

**Product:** Player performance analytics — movement analysis, skill assessment, injury risk, session tracking, progression over time.

**Feel:** Technical command center. Data-dense but calm. The kind of interface a coach opens at 6am to review last night's session — precise, uncluttered, no decoration. Every pixel earns its place.

**Signature element:** Performance radar chart — the multi-axis skill polygon that instantly says "athlete profile." This is the visual anchor of every player view.

**Stack:** Next.js 16, React 19, Tailwind CSS v4, CVA, @base-ui/react, lucide-react, Inter Variable + Geist Mono.

---

## Color System

Light-first. The app is a light-themed product. The `globals.css` defines a `.dark` class but it is **not applied** anywhere — the dark values exist for potential future use only.

### Primary palette (light theme — what the app actually uses)

| CSS Token                | Value     | Role                                   |
| ------------------------ | --------- | -------------------------------------- |
| `--background`           | `#fafafa` | Canvas, page background                |
| `--card`                 | `#ffffff` | Cards, elevated surfaces               |
| `--popover`              | `#ffffff` | Dropdowns, popovers                    |
| `--input`                | `#ffffff` | Input backgrounds                      |
| `--border`               | `#e2e4e7` | Standard borders                       |
| `--primary`              | `#5e6ad2` | Primary actions, links, focus (indigo) |
| `--primary-foreground`   | `#ffffff` | Text on primary                        |
| `--secondary`            | `#f7f8f8` | Secondary surfaces                     |
| `--secondary-foreground` | `#08090a` | Text on secondary                      |
| `--muted`                | `#f7f8f8` | Muted surfaces, disabled bg            |
| `--muted-foreground`     | `#62666d` | Metadata, captions, labels             |
| `--accent`               | `#5e6ad2` | Highlights (same as primary in light)  |
| `--accent-foreground`    | `#ffffff` | Text on accent                         |
| `--destructive`          | `#ef4444` | Errors, destructive actions            |
| `--ring`                 | `#5e6ad2` | Focus rings                            |
| `--foreground`           | `#08090a` | Headings, body text, hero numbers      |

### All hardcoded colors actually used on the homepage

**Backgrounds:**

| Hex       | Where                                      | Role                             |
| --------- | ------------------------------------------ | -------------------------------- |
| `#fdfcfd` | Layout body, Header, Tailark grid cells    | Page background (warm white)     |
| `#fafafa` | FeatureCards, Faq, BentoSection, Footer    | Section backgrounds              |
| `#f7f8f8` | UnifiedPlatform, Signup, muted surfaces    | Light gray surface               |
| `#f4f4f5` | PreFooterFeatures                          | Slightly cooler gray             |
| `#f3f3f5` | LinearFeaturesSection, Signup button hover | Muted surface variant            |
| `#f5f5f7` | LinearFeaturesSection chat bubbles         | Chat bubble bg                   |
| `#e6e6e6` | Tailark hero section                       | Medium gray hero bg              |
| `#212121` | Main content area (page.tsx)               | Dark section (landing hero only) |

**Text / foreground:**

| Hex       | Where                                   | Role                       |
| --------- | --------------------------------------- | -------------------------- |
| `#08090a` | Header logo, text, icons                | Near-black (dominant text) |
| `#0a0a0a` | PreFooterFeatures                       | Alternate near-black       |
| `#62666d` | Header nav, Signup, Tailark description | Muted text                 |
| `#71717a` | PreFooterFeatures                       | Muted text variant         |
| `#16181d` | LinearFeaturesSection                   | Feature card text          |
| `#17191f` | LinearFeaturesSection headings          | Feature card headings      |
| `#5e616b` | LinearFeaturesSection descriptions      | Feature card descriptions  |
| `#6a6f79` | LinearFeaturesSection muted text        | Chat timestamps            |
| `#666b75` | LinearFeaturesSection chat icons        | Icon color                 |

**Borders:**

| Hex       | Where                              | Role            |
| --------- | ---------------------------------- | --------------- |
| `#e2e4e7` | Header, Signup, FeatureCards       | Standard border |
| `#d4d4d8` | PreFooterFeatures                  | Border variant  |
| `#e4e4e7` | PreFooterFeatures inner borders    | Inner border    |
| `#dcdde2` | LinearFeaturesSection card rings   | Card ring       |
| `#dedfe4` | LinearFeaturesSection chat borders | Chat border     |

**Primary / brand:**

| Hex       | Where                                                       | Role                 |
| --------- | ----------------------------------------------------------- | -------------------- |
| `#5e6ad2` | Header focus ring, Signup buttons, UnifiedPlatform          | Primary indigo       |
| `#4f46e5` | FeatureCards, PreFooterFeatures, Pricing, clock icon stroke | Alternate indigo     |
| `#8fa4ff` | globals.css dark theme only                                 | NOT used on homepage |

**Decorative / SVG fills (not structural):**

| Hex                                                                                                                                | Where                               |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `#36c5f0`, `#2eb67d`, `#ecb22e`, `#e01e5a`                                                                                         | Signup Slack logo                   |
| `#9B99FE`, `#2BC8B7`                                                                                                               | Signup gradient                     |
| `#62A0EA`, `#1A5FB4`, `#F26207`, `#F9AB00`, `#5BB974`, `#129EAF`, `#AF5CF7`, `#FF8BCB`, `#FA7B17`, `#4285F4`, `#F4811F`, `#FAAD3F` | FeatureCards tech logos             |
| `#9ca3af`                                                                                                                          | PreFooterFeatures clock icon stroke |
| `#d1d5db`                                                                                                                          | PreFooterFeatures icon strokes      |

### Key inconsistency to resolve

**Two primary colors:** `#5e6ad2` (Header, Signup) vs `#4f46e5` (FeatureCards, PreFooterFeatures, Pricing). Pick one and standardize. Recommendation: `#5e6ad2` — it's warmer and already used in the Header (the most persistent element).

### Additional notes

- The dark section (`bg-[#212121]`) is a landing page hero choice, not the app theme — don't propagate it to dashboard views
- globals.css `:root` defines `--destructive: #ffc47c` (amber) — this is more of a warning color. Actual destructive should be `#ef4444` (red). The amber is used as a caution/warning semantic.
- The `.dark` class in globals.css is **not applied** anywhere — dark theme values exist but are unused

### Semantic colors (define when building analytics views)

| Token           | Suggested | Use                                |
| --------------- | --------- | ---------------------------------- |
| `--success`     | `#22c55e` | Positive trends, safe states       |
| `--warning`     | `#f59e0b` | Caution, moderate risk             |
| `--destructive` | `#ef4444` | Errors, high risk, negative trends |

### Chart palette

| Token       | Value     |
| ----------- | --------- |
| `--chart-1` | `#5e6ad2` |
| `--chart-2` | `#4f46e5` |
| `--chart-3` | `#22c55e` |
| `--chart-4` | `#f59e0b` |
| `--chart-5` | `#62666d` |

---

## Spacing

Base unit: **4px**. All spacing is a multiple. Tailwind utilities map directly.

### Actual codebase usage (extracted)

| Tailwind | Px         | Frequency | Primary use                    |
| -------- | ---------- | --------- | ------------------------------ |
| `gap-1`  | 4px        | 35        | Tight inline gaps              |
| `gap-2`  | 8px        | 37        | Component internal gaps        |
| `gap-3`  | 12px       | 11        | Button groups                  |
| `gap-4`  | 16px       | 9         | Content gaps                   |
| `gap-6`  | 24px       | 8         | Card body gaps                 |
| `gap-8`  | 32px       | 14        | Card internal spacing          |
| `p-2`    | 8px        | 19        | Compact padding                |
| `p-3`    | 12px       | 9         | Compact card padding           |
| `p-4`    | 16px       | 13        | Standard padding               |
| `p-6`    | 24px       | 10        | Inner card padding             |
| `p-8`    | 32px       | 23        | **Card default padding**       |
| `px-3`   | 12px horiz | 14        | Button padding                 |
| `px-4`   | 16px horiz | 18        | Content padding                |
| `px-6`   | 24px horiz | 17        | **Section horizontal padding** |
| `py-24`  | 96px vert  | 7         | **Section vertical padding**   |
| `mt-24`  | 96px top   | 8         | Section scroll margin          |

### Density decisions

- **Cards:** `p-8` (32px) — airy, not cramped
- **Section padding:** `py-24 px-6` — generous vertical, moderate horizontal
- **Compact elements:** `p-2` to `p-3` — buttons, badges, inline controls
- **Data tables (future):** 8px vertical, 12px horizontal per cell

---

## Type Scale

Ratio: **1.25** (major third). Font: **Inter Variable** (sans), **Geist Mono** (data/code).

### Actual codebase usage (extracted)

| Tailwind    | Count | Role                                                          |
| ----------- | ----- | ------------------------------------------------------------- |
| `text-sm`   | 82    | **Dominant.** Body text, card text, button text, descriptions |
| `text-xs`   | 30    | Labels, captions, small CTAs                                  |
| `text-lg`   | 17    | Section descriptions, feature headings                        |
| `text-base` | 10    | Input text, sheet titles                                      |
| `text-xl`   | 5     | Feature card headings                                         |
| `text-2xl`  | 5     | Section headings                                              |
| `text-3xl`  | 3     | Hero headings                                                 |

### Weights (extracted)

| Tailwind        | Count | Role                                            |
| --------------- | ----- | ----------------------------------------------- |
| `font-medium`   | 90    | **Dominant.** Buttons, nav, labels, card titles |
| `font-semibold` | 31    | Section headings, emphasized text               |
| `font-bold`     | 9     | Logo, hero text                                 |

### Design scale (for new analytics components)

| Name          | Size | Weight | Line Height | Use                          |
| ------------- | ---- | ------ | ----------- | ---------------------------- |
| `caption`     | 11px | 500    | 16px        | Labels, metadata, overlines  |
| `body-sm`     | 13px | 400    | 20px        | Secondary text, descriptions |
| `body`        | 14px | 400    | 24px        | Default text, table cells    |
| `body-strong` | 14px | 600    | 24px        | Emphasized body              |
| `h4`          | 16px | 500    | 24px        | Card titles, section heads   |
| `h3`          | 18px | 600    | 28px        | Subsection heads             |
| `h2`          | 22px | 600    | 32px        | Page sections                |
| `h1`          | 28px | 600    | 36px        | Page titles                  |
| `display`     | 44px | 700    | 48px        | Hero numbers, big metrics    |
| `display-lg`  | 56px | 700    | 56px        | Dashboard hero stats         |

**Hierarchy strategy:** Weight + color over size. A 14px value at 600/primary reads as a hero; the same 14px at 400/muted reads as metadata. Three tiers through weight + opacity, not three different font sizes.

**Data typography:** All dynamic numbers use `font-variant-numeric: tabular-nums`. Monospace (Geist Mono) for raw data, code, and technical readouts.

---

## Radius

### Actual codebase usage (extracted)

| Tailwind             | Count | Role                               |
| -------------------- | ----- | ---------------------------------- |
| `rounded-full`       | 92    | Pills, dots, avatars, badge shapes |
| `rounded-2xl`        | 29    | Bento cards, feature sections      |
| `rounded-md`         | 28    | Buttons, inputs, nav items         |
| `rounded-lg`         | 13    | Button base, nav triggers          |
| `rounded-xl`         | 9     | Card containers                    |
| `rounded-(--radius)` | 15    | Theme token (resolves to 8px)      |

### Token scale

| Token           | Value  | Use                                   |
| --------------- | ------ | ------------------------------------- |
| `--radius-xs`   | 2px    | Tiny indicators                       |
| `--radius-sm`   | 4px    | Inputs, buttons (xs size)             |
| `--radius-md`   | 6px    | Buttons (default), dropdowns          |
| `--radius-lg`   | 8px    | Cards, containers, `--radius` default |
| `--radius-xl`   | 12px   | Modals, large panels                  |
| `--radius-2xl`  | 16px   | Bento cards, feature sections         |
| `--radius-3xl`  | 24px   | Large feature cards                   |
| `--radius-4xl`  | 32px   | Hero sections                         |
| `--radius-full` | 9999px | Pills, badges, avatars                |

**Concentric rule:** Nested elements: outer = inner + padding. Never same radius on parent and child.

---

## Elevation & Depth

Strategy: **Layered shadows + subtle borders**. Light mode — shadows do the lifting, borders provide structure.

### Actual codebase patterns (extracted)

| Pattern                                     | Usage                              | Count  |
| ------------------------------------------- | ---------------------------------- | ------ |
| `ring-border` / `ring-1 ring-foreground/10` | Card borders                       | 23     |
| `shadow-black/6.5 shadow`                   | Card depth                         | 24     |
| `shadow-black/10 shadow-sm`                 | Button depth                       | common |
| `shadow-black/15 shadow-md`                 | Elevated buttons                   | common |
| `shadow-xl shadow-black/10`                 | Feature card illustrations         | 5      |
| `backdrop-blur`                             | Floating elements (Header, Signup) | 3      |
| `shadow-[0_2px_8px_rgba(0,0,0,0.065)]`      | Header scroll state                | 1      |

### Elevation levels

| Level | Definition                                                                      | Use                 |
| ----- | ------------------------------------------------------------------------------- | ------------------- |
| 0     | `bg-background` (`#fafafa`)                                                     | Page canvas         |
| 1     | `bg-card` (`#ffffff`) + `ring-1 ring-foreground/10` + `shadow-black/6.5 shadow` | Cards, sidebars     |
| 2     | `bg-card` + `shadow-lg` + `backdrop-blur`                                       | Dropdowns, popovers |
| 3     | `bg-card` + `shadow-xl` + `backdrop-blur`                                       | Modals, drawers     |

**Light mode shadow stack:** `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)`

**Borders:** `ring-1 ring-foreground/10` for cards. `border-border` for dividers. Low-opacity, not harsh. Disappear when not needed, findable when structure is needed.

---

## Component Patterns

### Existing components (components/ui/)

| Component          | Variants                                                          | Key patterns                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**         | 6 variants: default, outline, secondary, ghost, destructive, link | CVA + @base-ui. 8 sizes (xs→lg, icon variants). `rounded-lg`, `text-sm font-medium`, `focus-visible:ring-3 focus-visible:ring-ring/50`                     |
| **Card**           | 2 sizes: default, sm                                              | `rounded-xl`, `ring-1 ring-foreground/10`, `bg-card`, `gap-4` (default) / `gap-3` (sm). Subcomponents: Header, Title, Description, Action, Content, Footer |
| **Accordion**      | Single style                                                      | `rounded-lg`, `data-open:` / `data-closed:` animation states                                                                                               |
| **NavigationMenu** | Trigger style via CVA                                             | `rounded-lg`, `h-9`, `text-sm font-medium`, `ring-3 ring-ring/50`, complex CSS transition animations                                                       |
| **Sheet**          | 4 sides                                                           | `shadow-lg`, `transition duration-200 ease-in-out`                                                                                                         |
| **Separator**      | horizontal/vertical                                               | `bg-border`, `h-px`/`w-px`                                                                                                                                 |

### Repeated patterns to extract as new components

**Metric Card** (used in FeatureCards, BentoSection)

- Hero number: 28–44px / 600 / foreground / tabular-nums
- Label: 11px / 500 / muted-foreground / uppercase tracked
- Delta badge: 12px / 500 / semantic color
- Padding: 32px (`p-8`). Radius: `rounded-2xl`. Border: `ring-1 ring-foreground/10 shadow-black/6.5 shadow`

**Data Table** (future)

- Header: 11px / 600 / muted-foreground / uppercase tracked
- Cells: 13px / 400 / foreground. 8px vertical, 12px horizontal padding
- Row hover: `bg-foreground/[0.03]`
- Alternating: none (hover only, keeps density)

**Radar Chart** (signature — future)

- Axes: `rgba(0,0,0,0.08)`
- Fill: `primary` at 12% opacity
- Stroke: `primary` at 80% opacity, 2px
- Labels: 11px / 500 / muted-foreground
- Grid rings: 3–5 concentric, `rgba(0,0,0,0.04)`

**Session Timeline** (future)

- Horizontal scroll, card-per-session
- Active session: `ring-2 ring-primary`
- Inactive: `ring-1 ring-foreground/10`
- Timestamp: 11px / 400 / muted-foreground

**Progress Bar** (used in FeatureCards)

- Track: `bg-foreground/[0.06]`, 6px height, full radius
- Fill: `primary` solid
- Label: 12px / 500 / muted-foreground, right-aligned

**Stat Row** (future)

- Layout: `[icon] [label—————value]`
- Icon: 16px, muted-foreground
- Label: 13px / 400 / muted-foreground
- Value: 14px / 600 / foreground, tabular-nums

---

## States

Every interactive element MUST have: default, hover, active (scale 0.97), focus-visible, disabled.
Every data element MUST have: loaded, loading (skeleton), empty, error.

**Hover:** `bg-foreground/[0.04]` on light. Subtle tint, not dramatic.
**Active:** `transform: scale(0.97)` on `:active`. Never below 0.95. Existing pattern: `active-scale-98:active { scale: 0.98 }` in globals.css.
**Focus:** `focus-visible:ring-3 focus-visible:ring-ring/50` — from Button component.

---

## Motion

- Duration: < 300ms for all UI transitions. Sheet uses `duration-200`. NavigationMenu uses `duration-[0.35s]`.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (NavigationMenu). For new components use `cubic-bezier(0.23, 1, 0.32, 1)`.
- Press: `scale(0.98)` on `:active` (existing `active-scale-98` utility).
- Never animate from `scale(0)` — start at `scale(0.95) + opacity: 0`
- Stagger: 30–80ms between list items
- Respect `prefers-reduced-motion`

---

## Anti-patterns to Avoid

- Hardcoded hex for structural colors (use CSS variables)
- Solid hex borders (use `ring-foreground/10` or rgba)
- Same radius on nested elements
- Animating width/height/margin (use transform/opacity only)
- `transition: all` (name exact properties)
- Cards with no hover/empty/error states
- Metric displays without `tabular-nums`
- Flat hierarchy (everything same size/weight)
- Multiple accent colors competing for attention
- Inconsistent card padding (standardize on `p-8` for cards)
