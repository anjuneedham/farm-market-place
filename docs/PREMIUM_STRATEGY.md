# AgriLoop — Premium Strategy

**Premium must accelerate value, not gate it.**

---

## 1. The commitment

Two parts of AgriLoop are free forever, and this is enforced in code, not just in marketing:

* **AgriLoop Community** — all categories, reading and posting.
* **The core Academy library** — the Getting Started, Crop Production, Livestock and Farm
  Business fundamentals.

`PremiumBenefit.alwaysFree` marks these resources, and `canAccess()` in
`src/lib/services/premium.ts` returns `true` for them regardless of subscription state. A future
contributor who tries to gate a free-tier resource has to delete that guard deliberately.

**Why.** A farmer with 20 acres in Manchester will not pay before AgriLoop has already made them
money. Gating the trust-building layers would kill acquisition, kill SEO, and kill the network
effects that make the marketplace work at all. Premium monetises the top of a funnel that free
users fill.

## 2. Positioning

Three pillars, in this order:

| Pillar | Farmer | Buyer |
| --- | --- | --- |
| **SAVE MONEY** | Discounted inputs from partner suppliers | Member pricing, bulk discounts |
| **MAKE MONEY** | Featured listings, buyer-request alerts, analytics, marketing tools | — |
| **BETTER ACCESS** | Premium badge, priority placement, advanced education | Early deals, advanced requests, priority support |

Premium is never sold as "unlock the app". Every benefit on `/premium` is written as a
measurable outcome ("be seen first in your parish", "save on every bulk order") and is tied to a
`featureKey` that actually exists in the codebase.

## 3. Benefit catalogue

Benefits live in the database (`PremiumBenefit`), are admin-editable, and map to feature keys:

### Buyer
| Feature key | Benefit | MVP status |
| --- | --- | --- |
| `member_pricing` | Member-only discounts on eligible listings | Architected (needs seller opt-in + orders) |
| `bulk_discounts` | Additional bulk tier for Premium buyers | Architected |
| `early_access_deals` | See new deals before free members | Architected |
| `advanced_requests` | More open requests, longer visibility, priority placement | **Implemented** (quota in code) |
| `saved_lists` | Unlimited reusable shopping lists (free tier: 1) | **Implemented** |
| `priority_support` | Faster response from platform operators | Operational |
| `savings_dashboard` | Month-to-date and lifetime savings | **Implemented** (real data only) |

### Farmer
| Feature key | Benefit | MVP status |
| --- | --- | --- |
| `featured_listings` | Listing placement in the featured rail | **Implemented** (`featuredUntil`) |
| `premium_badge` | Premium badge on farm and listings | **Implemented** |
| `advanced_analytics` | Views, favourites, message and interest trends | **Implemented** (from real events) |
| `buyer_request_alerts` | Notified when a matching request is posted in your parish | **Implemented** |
| `inventory_tools` | Quantity tracking across listings | Architected |
| `marketing_tools` | Share cards, profile promotion | Architected |
| `premium_education` | Advanced courses, templates, calculators | **Implemented** (content gating) |
| `market_intelligence` | Demand and price signals | Architected — shows "not enough data yet" |

## 4. Pricing — configuration, never code

`SubscriptionPlan` rows carry `countryCode`, `audience`, `interval`, `priceMinor` and
`currency`. Admin edits them at `/admin/premium`. There is no constant anywhere in the
application holding a subscription price, and no fallback price in code — if no plan exists for
a country, `/premium` renders a "Premium is not available in your market yet" state.

This matters for Caribbean expansion: Jamaican and Trinidadian pricing will differ in both
amount and currency, and neither should require a deploy.

## 5. Premium Savings

The tangible proof mechanism.

```
Regular   $5,000 JMD
Premium   $4,400 JMD
          ───────────
SAVE        $600 JMD
```

Savings are computed from `Order.savedMinor`, written when an order is recorded against a
listing that had an applicable member or bulk price. The buyer dashboard sums
month-to-date and lifetime.

**Honesty rule.** Until real orders exist, the savings widget shows an empty state
("No savings recorded yet — savings appear here once you complete a purchase through AgriLoop")
rather than a demo number. Fabricating a savings figure would be the single fastest way to
destroy the credibility Premium depends on.

**Proof before purchase.** `/premium` (buyer audience) shows a "See the savings" panel built the
same way: `premiumService.savingsExamplesFor()` takes each currently-active, Premium-only
`Discount` row and applies it to a real listing's real current price in that category — Regular,
Premium, You Save, exactly the worked example above. A discount with no matching priced listing
in its category is skipped rather than shown against an invented price.

## 6. Conversion model

Premium is sold at the moment of demonstrated need, not on a pricing page nobody visits:

| Trigger | Surface |
| --- | --- |
| Farmer's listing gets views but no messages | Dashboard: "Featured listings get seen first" |
| Farmer misses a matching buyer request | Requests page: "Get alerted when this happens" |
| Buyer creates a second shopping list | Inline quota prompt |
| Buyer views a premium-priced listing | Inline savings comparison |
| Any user opens a premium lesson | Lesson summary + what the full course covers |

Each prompt names the specific benefit, not "go Premium". No interstitials, no modal on page
load, no dark patterns, and the free path is always visible next to the upgrade.

## 7. Online checkout

`/premium/start?plan=<id>` carries PayPal Express Checkout (`src/lib/integrations/paypal.ts`,
REST Orders API v2 — no SDK dependency). It is the one real-money flow in AgriLoop; every
marketplace transaction between a buyer and a seller is still arranged off-platform
(docs/PRODUCT_ARCHITECTURE.md §9).

**Currency.** PayPal cannot settle in JMD or any of AgriLoop's other Caribbean currencies (TTD,
XCD, GYD, HTG, DOP). A `SubscriptionPlan`'s online price is therefore a separate, admin-set
field — `paypalPriceMinor`/`paypalCurrency`, edited in `/admin/premium` — from its listed
local-currency price. A plan with no PayPal price set shows the honest "not available yet"
panel rather than a broken or silently-wrong-currency checkout.

**Authorization.** The client never tells the server what plan it paid for. Creating a checkout
writes `{userId, planId}` into the PayPal order's `custom_id`; capturing reads that back from
PayPal's own response and verifies the session user matches before granting anything — a user
cannot activate a different plan than the one actually charged.

**Mobile app.** This integration is for the web app. A native app cannot embed it as-is —
Apple's and Google's app store policies generally require their own in-app purchase systems for
digital subscriptions bought inside a native app. See docs/MOBILE_APP_NOTES.md before wiring up
Premium purchases in a native build.

## 8. What Premium must never become

* A wall in front of Community or the core Academy.
* A requirement to contact a seller or respond to a buyer request.
* A ranking system that hides non-Premium sellers. Featured listings are *additional*
  placement, clearly labelled "Featured", above an unmodified organic list.
* A cosmetic badge with no economic substance.
