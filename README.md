# AgriLoop

**Connect. Grow. Trade.**

AgriLoop is a mobile-first digital agricultural ecosystem connecting Caribbean farmers, buyers
and agricultural communities. Built for Jamaica. Architected for the Caribbean.

Read the full product and technical documentation in [`/docs`](./docs) before making changes —
in particular [`PRODUCT_ARCHITECTURE.md`](./docs/PRODUCT_ARCHITECTURE.md) for *why* the system is
shaped the way it is, and [`MVP_ROADMAP.md`](./docs/MVP_ROADMAP.md) for what is and isn't built.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Zod · Prisma
(schema only — see below) · scrypt-based auth with signed session cookies.

## Getting started

```bash
npm install
cp .env.example .env.local   # generate AUTH_SECRET: openssl rand -base64 48
npm run dev
```

Open http://localhost:3000. The app runs on an **in-memory data source**, seeded with realistic
Jamaican demo data (farms, listings, buyer requests, community posts, Academy courses) — no
database required to develop against it. See
[`docs/DATABASE_SCHEMA.md § Migration path`](./docs/DATABASE_SCHEMA.md#migration-path) for moving
to Postgres.

### Demo accounts

Every seeded account shares the password `agriloop-demo-2026`. A few to try:

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
```

## What's real vs. architected

The MVP is fully functional end to end: sign up, list products, post buyer requests, message,
review, moderate, administer. What is **deliberately not implemented** — AI assistant, payments,
market intelligence, escrow — has a working interface and an honest "not available yet" UI state
rather than a simulated response. See
[docs/MVP_ROADMAP.md § Deliberately out of scope](./docs/MVP_ROADMAP.md#deliberately-out-of-scope-for-the-mvp).

## Known limitations (MVP)

- The in-memory data source has no durability across processes — fine for development and
  demos, not for production. See the migration path linked above.
- Rate limiting is per-instance in-memory.
- Email delivery is a console transport in development and disabled otherwise.

Full list: [docs/SECURITY.md § Known limitations](./docs/SECURITY.md#10-known-limitations-of-the-mvp).
