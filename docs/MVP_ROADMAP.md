# AgriLoop — MVP Roadmap

Phases follow the sequence in the product brief. Status reflects the current repository.

---

## Shipped (MVP)

| # | Phase | Status | Notes |
| --- | --- | --- | --- |
| 1 | Requirements analysis | ✅ | This docs set |
| 2 | Architecture documentation | ✅ | 8 documents in `/docs` |
| 3 | Database schema | ✅ | `prisma/schema.prisma`, validated |
| 4 | Design system | ✅ | Tokens + primitives + patterns in `src/components/ui` |
| 5 | Authentication | ✅ | Email/password, scrypt, HMAC session cookies, password reset seam |
| 6 | Marketplace | ✅ | Categories, listings, detail pages, search, filters, pagination, curated homepage sections |
| 7 | Farmer / buyer / business profiles | ✅ | Public pages, verification badges, reviews |
| 8 | Community | ✅ | 9 categories, posts, comments, likes, reporting |
| 9 | Academy | ✅ | Tracks, courses, lessons, progress, bookmarks, premium gating |
| 10 | Dashboards | ✅ | Farmer + buyer, real metrics from real data |
| 11 | Premium architecture | ✅ | Admin-priced plans, feature gating, savings (real data only) |
| 12 | Admin | ✅ | Users, listings, verification, community, academy, premium, locations, categories |
| 13 | Mobile experience | ✅ | Bottom nav, 44px targets, single-column first |
| 14 | Permissions and security | ✅ | Central permission module, server-side re-checks, see SECURITY.md |
| 15 | Performance | ✅ | Server components, pagination, `next/image`, lazy media |
| 16 | Deployment prep | ✅ | `.env.example`, build passes, data-source swap documented |

## Immediately next (post-MVP, in order)

1. **Prisma data source.** Implement `PrismaDataSource` against the repository interfaces and
   flip `AGRILOOP_DATA_SOURCE`. Nothing above the repository layer changes. *(Largest single
   remaining item, and the blocker for real production traffic.)*
2. **Object storage.** Swap `LocalStorageService` for S3/R2 behind the same interface.
3. **Email.** Wire `EmailService` to a provider: verification, password reset, request alerts.
4. **Push/email notifications.** Second and third channels behind `NotificationService`.
5. **Jamaica field pilot.** 50 farmers in Manchester and St. Elizabeth, 15 Kingston buyers.
   Instrument: listings per farmer, requests per buyer, response rate, first-contact time.

## Later phases

| Theme | Work | Gate |
| --- | --- | --- |
| Payments | Stripe + local rails behind `PaymentService`; escrow | Demonstrated demand for on-platform settlement |
| B2B | Recurring supply agreements, saved suppliers, business plans | ≥ 25 active institutional buyers |
| Market intelligence | Real price/demand aggregates | ≥ 500 listings and ≥ 200 orders per product-region |
| AgriLoop AI | Farm assistant behind `AIService` | Real farm records to ground answers |
| Crop calendar | Planting/harvest guidance | A sourced, attributable agronomic dataset — **not** model-generated advice |
| Weather | Regional conditions | Provider agreement |
| Caribbean expansion | Trinidad & Tobago, then Barbados, Guyana, OECS | Jamaica retention proven |

## Caribbean expansion mechanics

Adding a market is data plus operations, not engineering:

1. Add the `Country` row (currency, `regionLabel`, dial code, locale).
2. Add its regions and communities.
3. Add localised categories and products if they differ.
4. Add `SubscriptionPlan` rows in the local currency.
5. Recruit seed supply and demand.
6. Flip `isLive`.

Countries pre-modelled in `src/lib/location/countries.ts` with `isLive: false`: Trinidad &
Tobago, Barbados, Guyana, Grenada, Dominica, Saint Lucia, St. Vincent & the Grenadines, Antigua
& Barbuda, St. Kitts & Nevis, Bahamas, Haiti, Dominican Republic.

## Deliberately out of scope for the MVP

AI assistant · market intelligence aggregates · escrow · logistics and delivery routing ·
farm accounting · weather intelligence · any market other than Jamaica marked live. Each has an
interface and an honest "not available yet" UI state. None has a button that pretends to work.

**Premium checkout is the one payment flow that is live** (PayPal Express Checkout, when
`PAYMENT_PROVIDER=paypal` — docs/PREMIUM_STRATEGY.md §7); marketplace transactions between
buyers and sellers remain off-platform. A native mobile app is a separate, larger undertaking —
see docs/MOBILE_APP_NOTES.md, which specifically covers why this same PayPal integration cannot
be reused unmodified inside a native app due to Apple/Google in-app-purchase policy.
