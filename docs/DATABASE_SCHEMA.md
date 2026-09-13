# AgriLoop — Database Schema

The canonical, production schema is [`prisma/schema.prisma`](../prisma/schema.prisma)
(PostgreSQL). This document explains the modelling decisions behind it, the indexes that matter,
and how the MVP's in-memory adapter maps onto it.

Validate with `npm run db:validate`.

---

## 1. Design principles

1. **Normalized.** Geography, categories and the product catalogue are reference tables, not
   free-typed strings. "Manchester" exists once.
2. **Denormalize only aggregates, and only where a list view would otherwise N+1.** Exactly four:
   `FarmProfile.ratingAverage/ratingCount`, `BusinessProfile.*` same pair, `Listing.viewCount`,
   `CommunityPost.commentCount/likeCount`. Each is recomputed by the service that writes the
   underlying rows, never edited by hand.
3. **Money is an integer of minor units plus a currency code.** No floats, ever. `85000` +
   `"JMD"` is $850.00 JMD.
4. **Soft state, not soft delete.** Users are `SUSPENDED`, listings are `ARCHIVED`. Hard deletes
   are reserved for user-initiated account deletion.
5. **Every foreign key is indexed**, and every list query has a covering composite index that
   matches its sort order.

## 2. Entity map

```
                          ┌──────────┐
                          │ Country  │──┐
                          └────┬─────┘  │ currency, regionLabel, isLive
                               │        │
                          ┌────▼─────┐  │
                          │  Region  │  │   (parish / state / county)
                          └────┬─────┘  │
                               │        │
                        ┌──────▼─────┐  │
                        │ Community  │  │   (district / town)
                        └──────┬─────┘  │
                               │        │
   ┌───────────┐        ┌──────▼───────────────────┐
   │   User    │────────│ FarmProfile              │
   │  (role)   │───┐    │ BusinessProfile          │──┐
   └─────┬─────┘   │    │ BuyerProfile             │  │
         │         │    └──────────────────────────┘  │
         │         │                                  │
         │         │    ┌──────────┐   ┌───────────┐  │
         │         └────│ Listing  │───│  Product  │──┴── Category (self-referencing tree)
         │              └────┬─────┘   └───────────┘
         │                   │
         │              ┌────▼──────┐   ┌────────────┐
         ├──────────────│  Order    │───│ OrderItem  │
         │              └────┬──────┘   └────────────┘
         │                   │
         │              ┌────▼──────┐  ┌─────────────┐
         ├──────────────│  Review   │  │ Transaction │
         │              └───────────┘  └─────────────┘
         │
         │   ┌──────────────┐  ┌──────────────────┐  ┌───────────────┐
         ├───│ BuyerRequest │──│ RequestResponse  │  │ ShoppingList  │
         │   └──────────────┘  └──────────────────┘  └───────────────┘
         │
         │   ┌───────────────┐  ┌──────────┐   ┌──────────┐
         ├───│ Conversation  │──│ Message  │   │ Favorite │
         │   └───────────────┘  └──────────┘   └──────────┘
         │
         │   ┌───────────────┐  ┌──────────┐  ┌──────────┐
         ├───│ CommunityPost │──│ Comment  │  │ PostLike │
         │   └───────────────┘  └──────────┘  └──────────┘
         │
         │   ┌────────────────┐  ┌────────┐  ┌────────────────┐
         ├───│ AcademyCourse  │──│ Lesson │──│ LessonProgress │
         │   └────────────────┘  └────────┘  └────────────────┘
         │
         │   ┌──────────────┐  ┌──────────────────┐  ┌────────────┐
         ├───│ Subscription │──│ SubscriptionPlan │──│ Discount   │
         │   └──────────────┘  └──────────────────┘  └────────────┘
         │
         │   ┌──────────────┐  ┌────────┐  ┌──────────────┐  ┌───────────┐
         └───│ Notification │  │ Report │  │ Verification │  │ Referral  │
             └──────────────┘  └────────┘  └──────────────┘  └───────────┘
```

## 3. Key decisions

### 3.1 One `User`, three optional profiles

`User` holds identity, credentials, role and account state. Role-specific data lives in
`FarmProfile`, `BusinessProfile` or `BuyerProfile`, each a nullable 1:1.

*Why not separate user tables?* Messaging, reviews, reports, notifications, community posts and
favourites all reference "a user" regardless of role. A single `User.id` keeps every one of those
foreign keys simple and makes role migration (buyer decides to start farming) a profile insert.

### 3.2 Geography as a tree, `Country` as configuration

`Country` is not an enum. It stores:

| Column | Purpose |
| --- | --- |
| `code` | ISO 3166-1 alpha-2, primary key (`JM`) |
| `currency` | ISO 4217 default for listings in that country |
| `regionLabel` | `"Parish"` (JM), `"County"` (TT), `"Parish"` (BB) — drives all UI copy |
| `communityLabel` | `"Community"` / `"District"` |
| `dialCode`, `locale`, `flagEmoji` | Presentation + phone/WhatsApp formatting |
| `isLive` | Whether the market is open for signups |

Listings, farms, businesses and buyer requests each carry `countryCode`, `regionId` and nullable
`communityId`. Storing `countryCode` directly on the leaf (rather than joining up through
region) is a conscious, bounded denormalization: it makes the single most common query in the
product — "listings in country X, sorted by recency" — a one-index lookup, and country is
immutable for a given region.

### 3.3 Category tree

`Category` is self-referencing (`parentId`) with `level` 0 (the six top categories) and 1
(sub-categories). Depth is not enforced by the schema but is by the service layer; going deeper
later needs no migration. `sortOrder` and `isActive` are admin-editable.

### 3.4 `Product` vs `Listing`

Discussed in [PRODUCT_ARCHITECTURE.md §6](./PRODUCT_ARCHITECTURE.md#6-marketplace-model).
`Product.synonyms` is a string array feeding search ("pepper" ↔ "scotch bonnet" ↔ "hot pepper").
`Product.status` gates seller-proposed catalogue entries (`PENDING` → admin → `ACTIVE`).

### 3.5 Wholesale and bulk pricing

`Listing.pricingMode` plus a `PriceTier[]` child table (`minQuantity`, `unitPrice`). A fixed-price
listing has zero tiers; a bulk-tiered listing has two or more. This beats nullable
`wholesalePrice` columns because the number of tiers is genuinely variable.

### 3.6 Orders exist even though checkout does not

The MVP's transaction flow is *discover → contact → negotiate → arrange payment → complete*,
off-platform. `Order` still exists, created when a seller (or buyer) records an agreed deal, and
it is what unlocks reviews and Premium Savings. `Order.paymentStatus` defaults to `OFF_PLATFORM`.
When real payments land, `Transaction` rows attach to the same orders and nothing else changes.

Statuses: `REQUESTED → CONFIRMED → PROCESSING → READY → COMPLETED`, plus `CANCELLED` and
`DISPUTED`. Transitions are validated in `src/lib/services/orders.ts`, not by the database.

### 3.7 Messaging

`Conversation` is keyed by a deterministic pair (`participantAId` < `participantBId`) with an
optional `listingId` / `buyerRequestId` context, so "message this farmer about this listing"
does not create a second thread with the same person. `Message` supports `text`, `image`,
`listing_ref` and `quote` kinds via a `kind` enum plus a nullable JSON `payload`.

### 3.8 Premium

`SubscriptionPlan` (per country, per currency, admin-editable price) ← `Subscription` (per user,
with `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`). `PremiumBenefit` rows describe what a
plan unlocks and carry an `alwaysFree` flag used to guarantee core Community/Academy access.

### 3.9 Analytics and privacy

`AnalyticsEvent` stores `type`, `entityType`, `entityId`, a coarse `countryCode`, a bucketed
timestamp and an **optional** `userId`. No IP addresses, no user agents, no cross-site
identifiers. Search terms are stored without any user linkage. See
[SECURITY.md §Privacy](./SECURITY.md#privacy).

## 4. Indexes that matter

| Query | Index |
| --- | --- |
| Marketplace browse | `Listing(status, countryCode, categoryId, createdAt DESC)` |
| Regional browse | `Listing(status, countryCode, regionId, createdAt DESC)` |
| Featured rail | `Listing(status, featuredUntil DESC)` partial where `featuredUntil > now()` |
| Seller's listings | `Listing(sellerId, status, updatedAt DESC)` |
| Product page | `Listing(productId, status, priceMinor ASC)` |
| Open buyer requests | `BuyerRequest(status, countryCode, regionId, createdAt DESC)` |
| Inbox | `Conversation(participantAId, lastMessageAt DESC)` + same for B |
| Thread | `Message(conversationId, createdAt ASC)` |
| Community feed | `CommunityPost(categoryId, isPinned DESC, lastActivityAt DESC)` |
| Unread badge | `Notification(userId, readAt, createdAt DESC)` |
| Reviews on a seller | `Review(subjectUserId, createdAt DESC)` |
| Search | Postgres `tsvector` GIN over `Listing.title + description` and `Product.name + synonyms` |

## 5. Migration path

The MVP runs on `MemoryDataSource`. Moving to Postgres:

1. Provision Postgres, set `DATABASE_URL`.
2. `npx prisma migrate dev --name init` — the schema is already written.
3. Implement `PrismaDataSource` against the interfaces in
   `src/lib/db/repositories/types.ts` (one file per repository, same method signatures).
4. Flip `AGRILOOP_DATA_SOURCE=prisma` in the environment; `datasource.ts` binds the adapter.
5. Run `scripts/seed.ts` against the new database if demo data is wanted in staging. **Never in
   production** — the script refuses to run when `NODE_ENV=production` unless
   `ALLOW_SEED_IN_PRODUCTION=true` is explicitly set.

Seeded rows carry `isDemoData: true` on every entity that has it, so demo content can always be
identified and purged, and is never presented as a real business, real price or real verified
user.
