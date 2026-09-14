# AgriLoop — Product Architecture

**Connect. Grow. Trade.**

AgriLoop is a mobile-first digital agricultural ecosystem. It launches in Jamaica and is
architected so that any other Caribbean market can be switched on through configuration and
data, not through a rewrite of application logic.

This document is the source of truth for *why* the system is shaped the way it is. Schema
detail lives in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), journeys in
[USER_FLOWS.md](./USER_FLOWS.md), and delivery sequencing in [MVP_ROADMAP.md](./MVP_ROADMAP.md).

---

## 1. Product thesis

AgriLoop is not an e-commerce store with a farm theme. It is an attempt at the **digital
infrastructure layer for Caribbean agriculture**: the place where supply, demand, knowledge and
trust for the region's food system are represented in software.

The commercial insight is that a marketplace alone cannot reach liquidity in a small market.
Jamaica has roughly 200,000 farmers; a pure listings site would show empty categories for
months and churn its first users. So AgriLoop is built as **four mutually reinforcing layers**,
of which the marketplace is only one:

| Layer | Purpose | Value when the marketplace is still thin |
| --- | --- | --- |
| **Marketplace** | Supply discovery — listings, farms, businesses | Grows with supply |
| **Buyer Requests** | Demand discovery — buyers post what they need | Works with *zero* listings |
| **Community** | Retention and network effects | Works on day one |
| **Academy** | Trust, acquisition, SEO | Works on day one |

Community and Academy are free and useful from the first session. Buyer Requests invert the
marketplace so that demand can be expressed before supply exists. This is the answer to the
cold-start problem, and it is why those two features are MVP scope rather than "phase two".

A response to a buyer request (`RequestResponse.status`: `PENDING` → `ACCEPTED`/`REJECTED`) is a
lightweight quote, not an order — accepting one tells the responder "let's proceed" but is not
payment or a binding contract. This is deliberate: the MVP flow is DISCOVER → CONTACT → NEGOTIATE
→ AGREE → ARRANGE PAYMENT (off-platform) → COMPLETE, and building a heavier quote/order object now
would be complexity ahead of real transaction volume. Revising a declined offer resets it to
`PENDING` rather than leaving a farmer permanently locked out of a request.

## 2. The core loop

```
              ┌──────────────────────────────────────────────┐
              │                                              │
        LEARN ──► CONNECT ──► BUY / SELL ──► BUILD TRUST ──► GROW
        (Academy)  (Community,  (Listings,    (Reviews,      (Dashboards,
                    Farms,       Buyer         Verification)   Premium,
                    Messaging)   Requests,                     Analytics)
                                 Orders)                          │
              │                                                   │
              └───────────────── RETURN TO AGRILOOP ◄─────────────┘
```

Every surface in the product is required to point at the next step in this loop. A listing page
links to the farm; a farm page links to its Academy-relevant specialties and its other listings;
an Academy lesson links to the marketplace category it teaches; a community post links to the
author's farm. Concretely this is enforced by the "next action" rule in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md#empty-states): no page, and no empty state, may be a dead
end.

## 3. Actors and permissions

Four roles, modelled as a single `User` with a `role` discriminator plus optional profile rows.

| Role | Owns | Primary surfaces |
| --- | --- | --- |
| `FARMER` | A `FarmProfile` | Farmer dashboard, listings, buyer-request responses |
| `BUYER` | A `BuyerProfile` | Buyer dashboard, buyer requests, shopping lists, saved farms |
| `BUSINESS` | A `BusinessProfile` | Business dashboard (shares farmer dashboard shell), supply listings |
| `ADMIN` | — | Admin console |

A user has exactly one role at a time. This is deliberate: dual-role accounts ("I farm and I
buy") were considered and deferred, because role-switching UI complicates every dashboard, and
in Jamaica the overlap in the first cohort is small. The schema does not prevent it — `User` has
optional one-to-one links to all three profile types — so the constraint is enforced in the
service layer and can be relaxed without a migration.

Authorization is centralised in `src/lib/auth/permissions.ts`. Pages never inline role checks;
they call `requireRole()` / `can()`. See [SECURITY.md](./SECURITY.md).

## 4. System architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Presentation — Next.js App Router (React Server Components)            │
│  app/(marketing) · app/market · app/community · app/academy             │
│  app/dashboard · app/admin · app/api                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Design system — src/components/ui  (tokens, primitives, patterns)      │
├─────────────────────────────────────────────────────────────────────────┤
│  Application services — src/lib/services                                │
│  marketplace · requests · community · academy · messaging · premium     │
│  Validation (zod schemas) · authorization · business rules              │
├─────────────────────────────────────────────────────────────────────────┤
│  Repository layer — src/lib/db/repositories                             │
│  Typed, paginated data access. The ONLY layer that knows the store.     │
├─────────────────────────────────────────────────────────────────────────┤
│  Data source adapter — src/lib/db/datasource.ts                         │
│  MemoryDataSource (dev/demo, seeded) │ PrismaDataSource (production)    │
├─────────────────────────────────────────────────────────────────────────┤
│  Provider abstractions — src/lib/integrations                           │
│  PaymentService · EmailService · NotificationService · StorageService   │
│  AIService · WeatherService · MarketIntelligenceService                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Why a data-source adapter

The MVP ships with `MemoryDataSource`: an in-process store hydrated from
`src/lib/db/seed/*` and persisted to a git-ignored JSON file in development. This is a
deliberate trade-off, not an accident:

* The product can be run, demoed and evaluated with `npm run dev` and no database, which
  matters for a pre-funding product being shown to farmers and partners on a laptop.
* Every read and write already goes through the same repository interfaces that the Prisma
  adapter implements, so the swap is a single binding in `datasource.ts`.
* `prisma/schema.prisma` is the real, normalized, indexed Postgres design and is kept in sync
  with the repository interfaces. It is reviewed as production code, not as a sketch.

The memory adapter is **not** production-safe (no durability, no cross-instance sharing) and
says so at runtime. See [DATABASE_SCHEMA.md § Migration path](./DATABASE_SCHEMA.md#migration-path).

### 4.2 Rendering strategy

* **Server Components by default.** Marketplace, farm profiles, community and Academy are read
  paths that benefit from server rendering for SEO and mobile TTFB.
* **Client Components only for interaction**: filters, search box, bottom navigation, message
  composer, image picker, admin tables.
* **Server Actions** for mutations, so forms work without a client-side fetch layer and degrade
  reasonably. Each action validates its input with zod and re-checks authorization server-side.
* **Route handlers** (`app/api/*`) exist for anything a future mobile client or webhook needs:
  search, notifications, subscription/webhook endpoints.

## 5. Geography and currency architecture

Geography is a four-level tree, and *nothing above the data layer knows the word "Jamaica"*:

```
Country (JM, TT, BB …)
  └── Region        (parish, state, county — the label is per-country)
        └── Community (district, town, village)
              └── Farm / Business / Listing
```

`Country` carries its own `regionLabel` ("Parish" in Jamaica, "County" in Trinidad & Tobago),
its `currency`, its `locale`, its dial code and its `isLive` flag. Adding Barbados is a row in
`countries.ts` plus its regions — no component changes. See
`src/lib/location/` and [§21 of the roadmap](./MVP_ROADMAP.md).

**Near You** (`/near-you`) reuses this same parish-centroid data — no geocoding service, no new
dependency. A visitor either grants browser geolocation (matched client-side to the nearest parish
centroid by great-circle distance) or picks a parish manually; the result page then sorts existing
farmers, businesses and listings by parish-to-parish distance from that origin
(`sortByRegionProximity()`), same parish first. It is deliberately parish-level, not
address-level — that is the precision the data actually has.

**Currency is never implicit.** Every price-bearing record stores an ISO 4217 `currency` code
alongside a minor-unit integer amount. There is no cross-currency conversion in the MVP and no
fake exchange rate; a listing in JMD renders as JMD everywhere. `formatMoney()` is the single
formatting entry point.

## 6. Marketplace model

Two entities, deliberately split:

* **`Product`** — a catalogue concept ("Scotch Bonnet Pepper") with a slug, category and
  synonyms. Shared across all sellers. Powers clean URLs (`/market/vegetables/scotch-bonnet`),
  SEO, search synonyms and, later, market intelligence (you cannot compute "average pepper
  price" if every seller free-types their product name).
* **`Listing`** — one seller's offer of a product: price, unit, quantity, availability,
  location, wholesale tiers, images.

Sellers may create a listing against a catalogue product, or propose a new product which lands
in an admin review queue. This keeps the catalogue clean without blocking sellers.

`/market` is a marketplace, not a flat product directory: with no filter active it renders
curated sections (Fresh Today, Popular Products, Wholesale Opportunities, Featured Farmers,
Products Near You, Buyer Requests, Recently Added), each a thin query over the same
`ListingFilters`/`db.listings.search()` used everywhere else — no separate search index and no
fabricated content. "Products Near You" personalises from the signed-in user's own farm,
business or buyer profile region and is an honest empty state (not a fake list) for a signed-out
visitor or a parish with nothing new. The moment any filter, search term or sort is applied, the
page falls back to the original filtered, paginated grid.

Pricing modes are an enum (`FIXED`, `NEGOTIABLE`, `CONTACT_FOR_PRICE`, `WHOLESALE`,
`BULK_TIERED`) rather than a nullable price, because "contact for price" is a first-class
Caribbean trading pattern, not a missing value.

### 6.1 Farm Updates

A farm's public profile is a storefront, not a static brochure: the owning farmer can post a
short `FarmUpdate` ("First tomato harvest of the season," a restock, a note of thanks), optionally
linked to one of their own listings. Updates belong to one farm, have no comments or likes, and
never appear in the Community feed uninvited — that boundary is what keeps Community "useful, not
an advertising feed" (docs/PRODUCT_ARCHITECTURE.md §1). Server-side authorization mirrors listing
ownership: a farmer can only link an update to a listing they themselves sell.

### 6.2 Community and Academy ↔ Marketplace

A single reusable component, `RelatedOnAgriLoop`, is the one seam connecting Community and
Academy back to the marketplace — a small card, never a feed of suggestions, because Community
must stay useful rather than become an advertising surface (§1). A Community post may optionally
carry a loose `relatedType`/`relatedId` pointing at a listing, farm, business or buyer request
(the same polymorphic-reference pattern as `Report.targetType`/`targetId` — no foreign key, just
an id resolved at render time via `resolveRelatedRef()`, which quietly omits the panel if the
referenced record no longer exists rather than showing a broken link). The author supplies it by
pasting a real slug when writing a post; nothing is auto-suggested or fabricated. An Academy
course carries an admin/seed-set `relatedCategoryId` pointing at the marketplace category it most
directly teaches (e.g. "Tomato Production" → Vegetables), shown on both the course page and its
lessons.

## 7. Trust architecture

Trust is the scarcest resource in an agricultural marketplace where strangers transact in cash.
Three mechanisms, layered:

1. **Verification** — admin-granted `VERIFIED_FARMER` / `VERIFIED_BUSINESS` / `VERIFIED_BUYER`
   badges, recorded in a `Verification` row with the reviewing admin, timestamp and note. MVP is
   manual by design; the table already supports document-backed workflows.
2. **Reviews** — two-sided, transaction-anchored. A review can only be written against a
   `COMPLETED` order, which is what stops review spam. Aggregates are denormalized onto the
   profile (`ratingAverage`, `ratingCount`) for list performance and recomputed on write.
3. **Reporting and moderation** — `Report` rows against users, listings, posts and reviews, with
   an admin queue, plus user blocking.

## 8. Monetization architecture

Premium is positioned as **save money / make money / get better access** — never as a paywall on
core utility. Community and the core Academy library stay free forever; that is a product
commitment encoded in `PremiumBenefit.category` and in the gating helper
`src/lib/services/premium.ts`, which refuses to gate a resource flagged `alwaysFree`.

Pricing is **data, not code**: `SubscriptionPlan` rows are editable in admin, priced per country
and per currency. Nothing in the codebase hardcodes a subscription amount.

Premium Savings is the tangible mechanism: eligible purchases record a `savedAmount`, and the
buyer dashboard shows month-to-date and lifetime savings. Until real orders flow through the
platform, savings are computed only from recorded orders — the dashboard shows a
"no savings recorded yet" empty state rather than a fabricated number.

Revenue streams the architecture supports (not all MVP): subscriptions, transaction fees
(`Transaction.platformFee`), featured listings (`Listing.featuredUntil`), sponsored placement,
B2B plans, premium education, advertising.

## 9. Integration abstractions

Every third-party capability sits behind an interface in `src/lib/integrations`, with a
`NotConfigured` implementation that reports honestly rather than pretending:

| Service | MVP implementation | Future |
| --- | --- | --- |
| `StorageService` | Local filesystem, size/type limited | S3 / R2 / Supabase Storage |
| `EmailService` | Console transport in dev, no-op otherwise | Resend / SES |
| `NotificationService` | In-app notifications (real) | + email, web push |
| `PaymentService` | `PayPalPaymentService` for Premium checkout when `PAYMENT_PROVIDER=paypal`; `UnavailablePaymentService` otherwise — marketplace flows stay off-platform either way | Stripe, local rails, escrow, native-app IAP (see docs/MOBILE_APP_NOTES.md) |
| `AIService` | `UnavailableAIService` — UI states "coming soon" and is disabled | Claude-backed farm assistant |
| `WeatherService` | Not configured | Met Service / provider |
| `MarketIntelligenceService` | Returns `insufficient-data` until thresholds are met | Real aggregates |

**Rule: no fake functionality.** A button that cannot work is not rendered as if it can. The AI
assistant and market intelligence surfaces render an explicit "not available yet" state that
explains what has to exist first. This is enforced by the `FeatureStatus` component.

## 10. Non-goals for the MVP

Deliberately *not* built (architecture and seams exist; implementations do not):

marketplace escrow, logistics/delivery routing, the AI assistant, weather intelligence,
market-intelligence aggregates, full farm accounting, and any Caribbean market other than
Jamaica being marked live.

**Online checkout is the one exception.** AgriLoop Premium has a real PayPal Express Checkout
path (docs/PREMIUM_STRATEGY.md § Online checkout) — it's the only real-money flow in the
product; every marketplace transaction between a buyer and a seller is still arranged
off-platform, unaffected by this. PayPal cannot settle in JMD or AgriLoop's other Caribbean
currencies, so a plan's online price is a separate, admin-set field
(`SubscriptionPlan.paypalPriceMinor`/`paypalCurrency`) from its listed local-currency price —
checkout stays honestly unavailable for a plan until an admin sets one.
