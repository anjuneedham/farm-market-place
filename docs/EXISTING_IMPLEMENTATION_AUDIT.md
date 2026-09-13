# AgriLoop — Existing Implementation Audit

Written before the V2 upgrade, per the preservation rule: **inspect first, don't rebuild.**
Every number and claim below was verified against the actual repository on this branch
(`claude/agriloop-product-architecture-aewx3l`, commit `9c4bff5`) — not recalled from memory.

---

## 1. Stack (confirmed)

- **Framework:** Next.js 16.3.5, App Router, Turbopack, React 19, TypeScript, strict mode.
- **Styling:** Tailwind CSS v4, custom design tokens in `src/app/globals.css` (no component
  library, no shadcn — a hand-built system, see docs/DESIGN_SYSTEM.md).
- **Data:** In-memory data source (`src/lib/db/datasource.ts`) seeded from
  `src/lib/db/seed/*`, with a complete, validated PostgreSQL schema at `prisma/schema.prisma`
  (43 models) not yet wired to a running database — this is the single largest piece of
  technical debt (see §5).
- **Auth:** Custom scrypt password hashing + HMAC-signed session cookies
  (`src/lib/auth/{password,tokens,session}.ts`), no third-party auth provider.
- **Payments:** Real PayPal Express Checkout for Premium only
  (`src/lib/integrations/paypal.ts`), added most recently. Marketplace transactions remain
  off-platform by design.
- **Routes:** 46 pages under `src/app`, enumerated in §2.

## 2. Route map (all 46 verified via `find src/app -name page.tsx`)

| Area | Routes |
| --- | --- |
| Marketing/auth | `/`, `/signin`, `/signup` |
| Marketplace | `/market`, `/market/listing/[slug]` |
| Farmers/Businesses | `/farmers`, `/farmers/[slug]`, `/businesses`, `/businesses/[slug]` |
| Buyer Requests | `/requests`, `/requests/[slug]`, `/requests/new` |
| Community | `/community`, `/community/[categorySlug]`, `/community/[categorySlug]/[postSlug]`, `/community/new` |
| Academy | `/academy`, `/academy/[courseSlug]`, `/academy/[courseSlug]/[lessonSlug]` |
| Messaging | `/messages`, `/messages/[id]`, `/messages/new` |
| Farmer dashboard | `/dashboard/farmer` (+ `/listings`, `/listings/new`, `/listings/[id]/edit`, `/orders`, `/reviews`) |
| Buyer dashboard | `/dashboard/buyer` (+ `/orders`, `/saved`, `/lists`, `/requests`) |
| Premium | `/premium`, `/premium/start` |
| Account | `/account` |
| Admin | `/admin` (+ `/users`, `/listings`, `/verification`, `/community`, `/academy`, `/premium`, `/categories`, `/locations`, `/reports`) |
| Infra | `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx`, `proxy.ts` |

## 3. Data (actual seed counts, not approximate)

| Entity | Count | Source |
| --- | --- | --- |
| Farmers | 14 | `src/lib/db/seed/people.ts` |
| Buyers | 8 | same |
| Businesses | 5 | same |
| Marketplace listings | 46 | `src/lib/db/seed/listings.ts` |
| Buyer requests | 10 | `src/lib/db/seed/requests.ts` |
| Community posts | 14 (across 9 categories) | `src/lib/db/seed/community.ts` |
| Academy courses / lessons | 14 / 38 | `src/lib/db/seed/academy.ts` |
| Orders (for reviews/savings) | 10 | `src/lib/db/seed/activity.ts` |
| Catalogue categories | 6 top-level, ~29 sub | `src/lib/db/seed/catalog.ts` |
| Prisma models | 43 | `prisma/schema.prisma` |

Every seed record carries `isDemoData: true` and is fictional (real Jamaican geography —
14 parishes with real communities and centroid coordinates — but invented people, farms and
businesses). This separation is real and enforced: `db.users.create()` (the sign-up path) never
sets `isDemoData`, so genuine accounts are structurally distinguishable from seed accounts.

## 4. What already works end-to-end (verified by building + signing in as seeded users, not assumed)

- **Marketplace:** search (token-based, matches title/description/product/synonyms/region/
  community), category filter, parish filter, wholesale filter, verified-seller filter, sort
  (recent/price/rating), pagination. Listing detail pages with wholesale price tiers, related
  listings, more-from-seller, save, contact-seller with quick-message templates, report.
- **Farmer/business profiles:** story, products, specialties, farming methods, reviews,
  save/contact. Public, SEO-metadata'd.
- **Buyer Requests:** post a request, browse open requests, respond (creates a `RequestResponse`
  + opens a conversation), one response per responder enforced.
- **Community:** 9 free categories, posts, nested comments, likes, reporting — genuinely free,
  no premium gate anywhere in the code path (verified: `communityService` has no premium check).
- **Academy:** 14 courses / 38 lessons, free/premium split enforced per-lesson, progress
  tracking, bookmarks, restricted-markdown rendering (no `dangerouslySetInnerHTML` on raw user
  content).
- **Messaging:** inbox, threads, read receipts, quick-message templates, conversation
  deduplication by (participants, listing, request).
- **Dashboards:** farmer (listings CRUD, orders with a validated status state machine, reviews,
  real stats) and buyer (orders, saved, shopping lists with a free-tier quota, own requests,
  Premium Savings — shown as an honest empty state when no real savings exist, never fabricated).
- **Admin:** users (suspend/reinstate), listings (feature/remove), verification queue,
  community moderation, Academy publish toggle, Premium plan pricing (admin-editable, two
  currencies per plan — local + PayPal), category tree, per-country go-live toggle, reports.
- **Premium checkout:** real PayPal Express Checkout, gated honestly behind
  `paymentService.isConfigured()` and a per-plan PayPal price — shows "not available yet"
  rather than a fake button when either is missing.
- **Auth/security:** scrypt hashing with upgradeable parameters, signed sessions, rate limiting
  (in-memory, documented as per-instance), `/admin/**` guarded both by `proxy.ts` (cookie
  presence, defense-in-depth) and `requireRole('ADMIN')` in the layout (the actual role check) —
  confirmed by testing: an authenticated buyer hitting `/admin/users` gets a real 404, not a
  redirect or a 403 page that confirms the route exists.

## 5. What should remain untouched (working, correctly architected, no reason to touch)

- The repository layer (`src/lib/db/repositories/*`) and its data-source abstraction — pages
  and services never import the data source directly; this boundary is clean and should stay
  that way as new features are added.
- The service layer's `ServiceResult<T>` contract (`{ ok, data }` / `{ ok: false, error }`) —
  consistent across every service, no reason to introduce a second error-handling pattern.
- The integration abstractions (`PaymentService`, `EmailService`, `NotificationService`,
  `StorageService`, `AIService`, `WeatherService`, `MarketIntelligenceService`) — each has a
  real or honestly-"not configured" implementation, selected in `src/lib/integrations/index.ts`.
  This is exactly the shape the V2 brief asks for; it already exists.
- The design system (`src/components/ui/*`) — Button, Badge, Card, Field, Money, Rating, Stat,
  Pagination, States, UpgradePrompt. New UI should compose these, not introduce parallel
  primitives.
- The location architecture (`src/lib/location/*`) — country is configuration
  (`regionLabel`/`communityLabel`/`currency`/`isLive` per country), not an enum; 12 other
  Caribbean countries are already modelled with `isLive: false`. Nothing here is Jamaica-
  hardcoded at the type level.
- Authentication and the admin permission boundary (§4, last bullet).

## 6. What needs improvement (real gaps, verified, not assumed)

These are the genuine deltas between what exists and the V2 brief — this is the actual scope
of the upgrade, not a rewrite:

1. **`/market` is a flat filtered grid, not a marketplace homepage.** It always renders one
   `ListingCardGrid`, whether or not any filter is active. There is no "Fresh Today / Popular /
   Wholesale Opportunities / Featured Farmers / Near You / Recently Added" browsing structure —
   that hierarchy doesn't exist yet anywhere. This is the core of the V2 brief's §3–4 and the
   highest-value single change.
2. **Listing cards have no inline actions.** The whole card is one link to the detail page;
   Save and Contact only exist on the detail page. `SaveButton` already exists as a component —
   it's just not placed on the card.
3. **Buyer request "quotes" have no status.** `RequestResponse` (the farmer's quote on a buyer
   request) has no `status` field — a buyer can read responses but there's no Accept/Reject.
   This is the single missing piece of the "discover → contact → negotiate → agree" loop the
   product is built around.
4. **No Farm Updates.** Doesn't exist as a concept — no model, no UI. This is genuinely new,
   not a gap in something partially built.
5. **No Community ↔ Marketplace or Academy ↔ Marketplace linking.** Community posts and
   Academy lessons are self-contained; nothing surfaces "related listings/farmers" anywhere.
6. **No "Near You" page**, despite having the data to build one cheaply: all 14 parish
   centroids are already seeded (`src/lib/location/jamaica.ts`), so this needs no external
   geocoding — browser geolocation (or manual parish choice) can resolve to nearest parish
   locally.
7. **No visible "+ Sell" entry point.** The listing-creation flow itself
   (`/dashboard/farmer/listings/new`) works and is reasonably mobile-friendly, but there is no
   prominent, mobile-first call to action surfacing it — a farmer has to already be in the
   dashboard to find it.
8. **Premium has no "Regular / Premium / You Save" comparison.** Benefits and prices are shown,
   but never a concrete before/after number, despite `Discount` records already existing in
   seed data that could back a real (not fabricated) example.
9. **No report/block UI on farm or business profiles.** `ReportButton` exists and is used on
   listings and community posts, but not on `/farmers/[slug]` or `/businesses/[slug]`.
   `db.moderation.block/unblock` exists in the repository layer and is enforced defensively in
   messaging and buyer-request responses, but there is **no UI anywhere** that lets a user
   actually initiate a block.
10. **Natural-language search is token-matching, not structured parsing.** "wholesale pepper
    Manchester" currently works only because the literal words happen to appear in listing text
    or location names it checks against — it doesn't parse "wholesale" into `wholesaleOnly=true`
    or extract "Manchester" as a location filter distinct from a text match. It usually produces
    the right answer by coincidence, not by design.

## 7. Broken links (verified by grepping every `href` in the codebase against the actual route list)

Three dead links found — all pre-existing, none introduced by this audit:

| Link | Referenced from | Status |
| --- | --- | --- |
| `/notifications` | Header bell icon (every signed-in page) | No route exists — 404 on click |
| `/guidelines` | Sign-up form, footer | No route exists — 404 on click |
| `/about` | Footer | No route exists — 404 on click |

No other dead links, no duplicate components, no hardcoded prices found outside seed data (a
targeted grep for `priceMinor` assignments outside `src/lib/db/seed/**` and admin editors found
none), and no leftover `TODO`/`FIXME`/`HACK` markers anywhere in `src/`.

## 8. What is technically risky

- **The in-memory data source is not production-durable** (documented already in
  docs/DATABASE_SCHEMA.md § Migration path) — this predates and is unrelated to the V2 upgrade,
  but any feature that assumes data survives a process restart (e.g. a real notification queue)
  inherits this limitation until `PrismaDataSource` is implemented.
  need a `provider`/`kind` discriminator rather than a schema rewrite.
- **Rate limiting is per-instance in-memory** — fine for the MVP's single-instance deployment,
  documented as a known limitation, unaffected by this upgrade.
- Nothing found in this audit rises to "broken" — the risks above are pre-existing, documented
  limitations, not new discoveries.

## 9. Recommended upgrade order

Following the brief's own phase numbering, adjusted for actual dependency order (Report/Block
UI is cheap and has no dependents, so it's pulled earlier; Community/Academy linking depends on
nothing new being built first, so it can run in parallel with marketplace work):

1. **Marketplace homepage sections** (§6.1) — highest visible impact, touches only `/market`
   and adds new read-only query helpers; zero risk to existing filtered-search behavior, which
   remains the fallback view when a filter is active.
2. **Listing card inline actions** (§6.2) — small, composes existing `SaveButton`.
3. **Quote accept/reject** (§6.3) — additive field on `RequestResponse`, new actions, no
   destructive migration (existing responses default to a sensible status).
4. **Report/Block UI** (§6.9) — cheap, reuses `ReportButton`/`db.moderation`, no new concepts.
5. **Fix the three dead links** (§7) — trivial, done alongside whichever phase touches those
   pages (`/notifications` alongside dashboards, `/guidelines` and `/about` as short static pages).
6. **Farmer storefront: Farm Updates** (§6.4) — new, additive model and UI.
7. **Community ↔ Marketplace and Academy ↔ Marketplace linking** (§6.5) — new shared
   "Related on AgriLoop" component, additive.
8. **"Near You"** (§6.6) — new page, reuses existing parish centroids and repository filters.
9. **Mobile "+ Sell" entry point** (§6.7) — reuses the existing listing form; adds prominence,
   does not rebuild the form into a wizard (judged not worth the regression risk for the gain).
10. **Premium savings comparison** (§6.8) — reuses existing `Discount` seed data; shown only
    when a real discount exists to reference, never a fabricated number.
11. **Natural-language search parsing** (§6.10) — smallest independent win, done last since it's
    the least load-bearing for the "feels like a real marketplace" goal.
12. **Regression pass + doc updates** — after every phase above, not only at the end (see
    docs/MVP_ROADMAP.md and the regression checklist this audit's phases were tested against).

This order is what the rest of this session follows.
