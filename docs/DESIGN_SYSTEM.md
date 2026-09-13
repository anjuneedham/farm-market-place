# AgriLoop — Design System

**Brand:** AgriLoop · **Tagline:** Connect. Grow. Trade.

The product should read as a serious Caribbean technology company. Not a green agricultural
template, not a tourism brochure, not generic SaaS.

Implementation: design tokens in `src/app/globals.css`, primitives in `src/components/ui`,
composed patterns in `src/components/marketplace`, `src/components/community`, etc.

---

## 1. Brand direction

**Is:** modern, trustworthy, helpful, community-driven, ambitious, Caribbean, agricultural,
technology-enabled.

**Is not:** farming clichés (wheat, barns, tractor silhouettes as decoration), cartoon
illustration, stock-corporate gradients, flags as decoration, cluttered marketplace chrome.

Caribbean identity comes through **photography, language, geography and content** — parish
names, JMD prices, scotch bonnet and yellow yam, real community names — not through decoration.
There is exactly one flag emoji in the entire UI: the country switcher, where it carries
information.

## 2. Colour

Tokens are defined once as CSS custom properties and consumed through Tailwind. No component
declares a raw hex value.

```
--brand-900  #06281c   deep canopy — headers, dark sections
--brand-700  #0d5138   primary brand
--brand-600  #12704b   primary interactive
--brand-500  #178f60   hover
--brand-100  #dcf2e6   tinted surfaces
--brand-50   #f1faf5   subtle surfaces

--accent-600 #c2620a   earth ochre — secondary actions, highlights
--accent-100 #fdf0e0

--sun-500    #e8a317   Premium, featured, savings
--sun-100    #fdf3dc

--ink-900    #0c1611   primary text
--ink-600    #47554e   secondary text
--ink-400    #7d8a84   tertiary / meta
--line       #e2e8e4   borders
--surface    #ffffff
--canvas     #f7f9f8

--positive   #1a7f4f   in stock, verified, success
--warning    #b45309
--danger     #b4242c
--info       #1d4ed8
```

**Semantic rules.** Green = brand and availability. Ochre = secondary emphasis. Gold =
Premium/featured/savings only — gold is the "money" colour and is never decorative. Red is
reserved for destructive actions and errors; it is never used for a price or a discount badge.

Contrast: body text and interactive labels meet WCAG AA (4.5:1); large display text meets 3:1.
`--brand-600` on white is 4.7:1; white on `--brand-700` is 8.1:1.

## 3. Typography

One family, system-first for mobile performance in markets where a 400 KB font download is real
money on a data plan:

```
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
```

| Token | Size / line-height | Use |
| --- | --- | --- |
| `display` | 2.25rem→3.5rem / 1.05, -0.03em | Hero |
| `h1` | 1.75rem→2.25rem / 1.15, -0.02em | Page title |
| `h2` | 1.375rem→1.75rem / 1.2 | Section |
| `h3` | 1.125rem / 1.3 | Card title |
| `body` | 1rem / 1.6 | Default |
| `small` | 0.875rem / 1.5 | Meta |
| `micro` | 0.75rem / 1.4, 0.04em uppercase | Labels, badges |

Prices use tabular numerals (`font-variant-numeric: tabular-nums`) so columns of money align.

## 4. Spacing, radius, elevation

4px base scale: `1,2,3,4,6,8,12,16` → `4…64px`. Section vertical rhythm: `48px` mobile,
`80px` desktop.

Radius: `sm 6px` (badges, inputs), `md 10px` (buttons, cards), `lg 16px` (panels),
`xl 24px` (hero cards), `full` (pills, avatars).

Elevation is restrained — three levels only. Cards are defined by their 1px `--line` border,
not by shadow. Shadow is reserved for things that genuinely float (dropdowns, sheets, toasts).

## 5. Layout

Mobile-first, three breakpoints that matter: `<640` (single column), `640–1023` (two columns),
`≥1024` (desktop layouts with sidebars).

Desktop is **not** stretched mobile:

| Surface | Mobile | Desktop |
| --- | --- | --- |
| Marketplace | Full-width cards, filter sheet | 280px filter sidebar + 3–4 column grid |
| Listing | Stacked: gallery → price → seller | 2-col: gallery / sticky purchase + seller panel |
| Dashboard | Stacked metrics, select-based nav | Persistent left nav + metric row + content |
| Community | Single feed | Category sidebar + feed + activity rail |
| Academy | Stacked | Track sidebar + course grid; lesson = content + sticky outline |
| Admin | Card list per record | Dense data table with bulk actions |

Max content width `1280px`; long-form reading width `72ch`.

## 6. Components

**Primitives** (`src/components/ui`): `Button`, `IconButton`, `Card`, `Badge`, `Avatar`,
`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Field` (label + hint + error),
`SearchInput`, `Tabs`, `Modal`, `Sheet`, `Toast`, `Tooltip`, `Pagination`, `Skeleton`,
`EmptyState`, `ErrorState`, `Stat`, `ProgressBar`, `Rating`, `FeatureStatus`.

**Patterns:** `ProductCard`, `FarmerCard`, `BusinessCard`, `BuyerRequestCard`, `PostCard`,
`LessonCard`, `FilterPanel`, `DashboardShell`, `AdminTable`, `SectionHeader`, `Money`.

**Button variants:** `primary` (brand-600), `secondary` (outline), `ghost`, `accent`,
`premium` (gold), `danger`. Sizes `sm | md | lg`; `md` is 44px tall — the minimum touch target —
and `sm` is only permitted inside desktop tables.

**Badges:** `verified` (green, shield), `premium` (gold, star), `featured` (gold outline),
`wholesale` (brand tint), `availability` (positive/warning/neutral), `new`, `demo`.
Demo-seeded content carries a `demo` badge so nothing fabricated is ever mistaken for real.

## 7. Navigation

**Mobile bottom nav — exactly five, never more:** Home · Market · Community · Learn · Profile.
56px tall, safe-area padded, icon + 10px label, active state in `--brand-600`.

**Desktop header:** logo · Market · Farmers · Requests · Community · Academy · Premium ·
search · notifications · account.

Secondary destinations (Businesses, Map, Messages, dashboards) are reached from context and
from the account menu — the top-level nav is not allowed to grow.

## 8. Empty states

Every empty state has an illustration-free icon, a specific sentence, and **one primary action
that advances the core loop**. Blank screens are a bug.

| Context | Message | Action |
| --- | --- | --- |
| Category with no listings | "Be one of the first farmers in this category." | List Your Product |
| No buyer requests | "No requests in this parish yet. Check back soon." | Post a Request |
| No community posts | "Start the conversation." | New Post |
| No messages | "No conversations yet. Find a farmer to get started." | Explore the Market |
| No listings (farmer) | "Your farm isn't listed yet. Add your first product." | Add Listing |
| No savings (buyer) | "No savings recorded yet." | *(no CTA — never oversell)* |
| Search, no results | "Nothing matched '<term>'." | Clear filters · Post a buyer request |

## 9. State coverage

Every async surface implements four states: **loading** (skeleton matching final layout, never a
spinner alone), **empty** (above), **error** (human sentence + retry; technical detail is logged
server-side, never rendered), **success**.

## 10. Accessibility

Semantic landmarks (`header`/`nav`/`main`/`footer`); one `h1` per page and no skipped levels;
every input has a real `<label>`; errors are `aria-describedby` + `role="alert"`; visible focus
ring (`2px --brand-600`, 2px offset) that is never removed; all interactive elements are
keyboard reachable in DOM order; modals trap focus and restore it on close; every content image
has meaningful `alt`, decorative images have `alt=""`; no information is conveyed by colour
alone (verified = shield icon + text; availability = dot + text); touch targets ≥ 44×44px;
`prefers-reduced-motion` disables transitions.

## 11. Imagery

Real agricultural photography; people and produce over landscapes; natural light. Aspect ratios
`4:3` (product), `16:9` (hero, course), `1:1` (avatar). Every image is `next/image` with explicit
dimensions, `sizes`, lazy loading below the fold, and a blur placeholder. Uploads are capped
(see [SECURITY.md](./SECURITY.md#file-uploads)).

## 12. Voice

Direct, practical, respectful. Second person. Jamaican agricultural vocabulary where it is the
correct term ("parish", "yellow yam", "scotch bonnet", "reaping"). Prices always with currency
("$850 JMD/lb", never "$850"). No hype, no exclamation marks, no "revolutionary".
