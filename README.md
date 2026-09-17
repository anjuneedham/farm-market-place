# AgriLoop

**Connect. Grow. Trade.**

AgriLoop is a mobile-first digital agricultural ecosystem connecting Caribbean farmers, buyers
and agricultural communities. Built for Jamaica. Architected for the Caribbean.

Read the full product and technical documentation in [`/docs`](./docs) before making changes —
in particular [`PRODUCT_ARCHITECTURE.md`](./docs/PRODUCT_ARCHITECTURE.md) for *why* the system is
shaped the way it is, and [`MVP_ROADMAP.md`](./docs/MVP_ROADMAP.md) for what is and isn't built.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Zod · Prisma
(schema only — see below) · Supabase Auth for accounts, sessions and the User/FarmProfile/
BusinessProfile/BuyerProfile tables, enforced with Postgres Row Level Security.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` come from your Supabase
project's dashboard (Project Settings → API) — see `.env.example` and `docs/SECURITY.md §1` for
what each does. Everything else (marketplace listings, community, orders, etc.) still runs on an
**in-memory data source**, seeded with realistic Jamaican demo data — no separate database
required for that part. See
[`docs/DATABASE_SCHEMA.md § Migration path`](./docs/DATABASE_SCHEMA.md#migration-path) for moving
it to Postgres too.

### Demo accounts

Every seeded account shares the password `agriloop-demo-2026` and is a real Supabase Auth account
(not simulated) — sign in with these exactly as you would a real user. A few to try:

| Email | Role |
| --- | --- |
| `admin@agriloop.demo` | Admin |
| `green-valley-farm@agriloop.demo` | Farmer (verified) |
| `harbour-street-kitchen@agriloop.demo` | Buyer (restaurant) |
| `islandwide-agri-supplies@agriloop.demo` | Business |

All seeded content is marked `isDemoData: true` and is fictional — see
[docs/DATABASE_SCHEMA.md § Migration path](./docs/DATABASE_SCHEMA.md#migration-path).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:validate` | Validate `prisma/schema.prisma` |

## Project layout

```
docs/                    Architecture, schema, flows, premium, roadmap, design, API, security
prisma/schema.prisma     Production Postgres schema (not yet wired to a running database)
src/app/                 Routes — marketing, marketplace, community, academy, dashboards, admin
src/components/          ui/ (design system) · marketplace/ · community/ · academy/ · dashboard/ · admin/
src/lib/
  types.ts               Domain types mirroring the Prisma schema
  db/                     Seed data, dataset shape, data source adapter, repositories
  services/               Business logic — the only thing pages/actions call
  integrations/           Payment/email/notification/storage/AI/weather/market-intel abstractions
  auth/                   Password hashing, session tokens, permissions
  validation/             zod schemas
  location/               Country/parish configuration (Jamaica live, 12 more modelled)
android/                 Capacitor Android shell (loads the live deployment remotely — see docs/PLAY_STORE_TESTING.md)
capacitor.config.ts      Android shell config (requires AGRILOOP_APP_URL — see docs/PLAY_STORE_TESTING.md)
```

## What's real vs. architected

The MVP is fully functional end to end: sign up, list products, post buyer requests, message,
review, moderate, administer, and pay for Premium via PayPal Express Checkout (set
`PAYMENT_PROVIDER=paypal` — see [docs/PREMIUM_STRATEGY.md § Online checkout](./docs/PREMIUM_STRATEGY.md#7-online-checkout)).
Marketplace transactions between buyers and sellers are still arranged off-platform by design.
What is **deliberately not implemented** — the AI assistant, market intelligence, escrow — has a
working interface and an honest "not available yet" UI state rather than a simulated response.
See [docs/MVP_ROADMAP.md § Deliberately out of scope](./docs/MVP_ROADMAP.md#deliberately-out-of-scope-for-the-mvp)
and [docs/MOBILE_APP_NOTES.md](./docs/MOBILE_APP_NOTES.md) before adding a native mobile app.

## Known limitations (MVP)

- The in-memory data source has no durability across processes — fine for development and
  demos, not for production. See the migration path linked above.
- Rate limiting is per-instance in-memory.
- Email delivery is a console transport in development and disabled otherwise.

Full list: [docs/SECURITY.md § Known limitations](./docs/SECURITY.md#10-known-limitations-of-the-mvp).
