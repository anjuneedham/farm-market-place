# AgriLoop — User Flows

Each flow lists the screens, the states that must exist (loading / empty / error / success), and
the permission boundary. Flows marked **MVP** are implemented; flows marked **Architected** have
data models and seams but no shipped UI.

---

## 1. Farmer onboarding → first listing *(MVP)*

```
/signup  ──► choose role: I'm a Farmer
   │
   ├─► Account step   name, email, password              (zod: signupSchema)
   ├─► Farm step      farm name, parish, community        (zod: farmProfileSchema)
   └─► Done ──► /dashboard/farmer
                  │  "Your farm has no listings yet" empty state
                  └─► /dashboard/farmer/listings/new
                          product (catalogue or new) → price mode → quantity
                          → location (defaults from farm) → photos → publish
                          └─► /market/<category>/<slug>  (public, shareable)
```

**Success criterion (spec §60):** sign up → farm profile → add product → publish → receive
inquiry → respond → post in community → read Academy. Each arrow above is a single tap on
mobile; the farm's parish and community pre-fill the listing form so a farmer publishing their
second listing types a title, a price and nothing else.

**States.** Signup: field-level validation errors, duplicate-email error, submitting state.
Listing form: image upload progress, per-field errors, draft save. Dashboard: skeleton, then
either metrics or the first-listing empty state.

**Permission boundary.** `/dashboard/farmer/**` requires `role === FARMER`. Listing mutations
re-check `listing.sellerId === session.userId` server-side in the action, not only in the UI.

**V2 addition — mobile "+ Sell" entry point.** A floating action button, visible on mobile on
every non-admin page, links straight to `/dashboard/farmer/listings/new`. It does not change the
flow above — `requireRole` on that page still handles a buyer or signed-out visitor landing there
— it just removes "I have to already be in the dashboard to find this" as a barrier.

## 2. Buyer discovery → contact *(MVP)*

```
/            ──► search box or "Explore the Market"
/market      ──► with no filter active: curated homepage sections (Fresh Today, Popular
                  Products, Wholesale Opportunities, Featured Farmers, Products Near You,
                  Buyer Requests, Recently Added) — real queries, not fabricated content
             ──► once a filter/search/sort is applied: category rail · filters (parish, price,
                  availability, verified, wholesale) · the original paginated grid
/market/vegetables/scotch-bonnet-pepper-green-valley
             ──► price, quantity, farm, verification, reviews
             ├─► Contact Seller ──► /messages/new?listing=…  (auth required)
             │      quick actions: availability · price · wholesale quote · I'm interested
             ├─► Save listing    (auth required)
             ├─► Share           (Web Share API, or copy-link fallback)
             ├─► View farm       ──► /farmers/green-valley-farm
             └─► WhatsApp        (only rendered when the seller configured a number)
```

**Auth wall placement.** Browsing, searching, filtering, farm profiles, community reading and
the whole Academy are open to logged-out visitors — this is the SEO and acquisition surface.
The wall sits exactly at *contacting, saving, posting and transacting*. A logged-out user who
taps "Contact Seller" is sent to `/signin?next=…` and returns to the same listing.

**V2 addition — Near You.** `/near-you` resolves a visitor's parish (browser geolocation matched
to the nearest parish centroid, or a manual choice) and sorts real farmers, businesses and
listings by parish-to-parish distance from there. It reuses the same repository queries and
existing parish centroid data — no geocoding service.

## 3. Buyer request → farmer response *(MVP)*

```
Buyer:  /dashboard/buyer/requests/new
          what · quantity + unit · frequency · budget (or "negotiable") · parish · needed by
          └─► /requests/<slug>  (public)

Farmer: /requests  (filter by parish + category)
          └─► /requests/<slug> ──► Respond
                 message + optional quoted price/quantity
                 └─► creates RequestResponse + Conversation + Notification to the buyer
```

This is the demand-first inversion described in the architecture doc: it works with zero
listings in the catalogue, which is why it is MVP and not phase two.

**Constraint.** One response per farmer per request (`@@unique([buyerRequestId, responderId])`);
a second attempt edits the first rather than spamming the buyer.

**V2 addition — accept/reject.** The buyer can Accept or Decline each response from
`/requests/<slug>`; the responder sees the outcome on their own quote. Declining does not lock a
farmer out — revising and resending resets the response to `PENDING`. Accepting is "let's
proceed," not a payment or a binding order; the flow after that point is unchanged (arrange
payment off-platform, then record the `Order`).

## 4. Messaging *(MVP)*

```
/messages ──► conversation list (last message, unread count, context chip)
/messages/<id> ──► thread
     composer: text · image · quick actions
     context header: the listing or buyer request this thread is about
```

Conversations are deduplicated on `(participantA, participantB, listing, buyerRequest)`, so
messaging the same farmer about the same listing twice continues one thread.

**Architected, not built:** email and push delivery. `NotificationService` already receives
every event; only the in-app channel is implemented.

## 5. Order and review *(MVP, off-platform payment)*

```
Negotiation happens in messages (or by phone/WhatsApp).
Seller or buyer records the agreed deal:
   /dashboard/<role>/orders/new  ──► Order(status REQUESTED, paymentStatus OFF_PLATFORM)
   ──► CONFIRMED ──► PROCESSING ──► READY ──► COMPLETED
                                                  │
                                                  └─► both parties may review, once each
```

Reviews are gated on `COMPLETED`. There is no way to review a stranger you have not traded with
— that is the anti-spam design, and it is enforced in `orders.ts` / `reviews.ts`, not in the UI.

## 6. Community *(MVP)*

```
/community                    category grid + recent activity
/community/<category>         post list (pinned first, then last activity)
/community/<category>/<slug>  post · comments · replies · likes
                              report · block author
Posting requires auth; reading does not.
```

**V2 addition — optional marketplace link.** When posting, an author may paste the slug of a
real listing, farm, business or buyer request to attach it; the server resolves and validates the
slug before saving. The post page renders it as a single "Related on AgriLoop" card — never a
feed of suggestions, so Community stays a place for real questions rather than an advertising
surface.

## 7. Academy *(MVP)*

```
/academy                      tracks
/academy/<course>             course + lesson list, progress bar when signed in
/academy/<course>/<lesson>    lesson body, mark complete, bookmark
```

Free lessons render in full for everyone including logged-out visitors. Premium lessons render
their summary plus an explicit upgrade panel — never a blank page and never a bait-and-switch
after the content has started.

**V2 addition — Related on AgriLoop.** A course may carry a `relatedCategoryId` pointing at the
marketplace category it most directly teaches (seeded for five real courses against categories
that already exist — nothing fabricated); the same "Related on AgriLoop" card renders on both the
course page and its lessons.

## 8. Premium *(MVP, real checkout for one flow)*

```
/premium  ──► audience toggle (Farmer | Buyer | Business) · benefits by category
          ──► buyer audience: "See the savings" — real Regular/Premium/You-Save
              examples from active Discount rows applied to a real listing's real price
          ──► "Start Premium" / "Join AgriLoop"
                 │
                 ├─ no PayPal price set for this plan ──► "not available yet", honestly labelled
                 └─ PayPal price set                  ──► /premium/start?plan=…
                                                             PayPal Express Checkout
```

Premium checkout is real — see docs/PREMIUM_STRATEGY.md §7. Every other AgriLoop transaction
(a buyer paying a seller) stays off-platform; the button never claims otherwise.

## 9. Admin *(MVP)*

```
/admin            platform metrics
/admin/users      suspend · reinstate · change role
/admin/verification  pending queue ──► approve/reject with note  ──► badge + notification
/admin/listings   feature · remove · restore
/admin/community  moderation queue from Report rows
/admin/academy    publish/unpublish courses and lessons
/admin/premium    edit plan prices and benefits   ← the only place prices are set
/admin/locations  countries, regions, communities; toggle a market live
/admin/categories category tree, product catalogue approvals
```

Every admin route is guarded by `requireRole('ADMIN')` in a layout *and* by a check inside each
server action. A non-admin hitting an admin URL gets a 404, not a 403 — admin surface area is
not advertised.

## 10. Architected, not implemented

| Flow | What exists today |
| --- | --- |
| AI assistant | `AIService` interface + a disabled UI panel explaining the status |
| Crop calendar | Route + inputs modelled; refuses to output advice without a data source |
| Market intelligence | Service returns `insufficient-data`; UI shows the threshold |
| Marketplace escrow/on-platform payment | `Order`/`Transaction` models exist; buyer-seller payment stays off-platform. (Premium subscription checkout itself is real — PayPal Express Checkout, docs/PREMIUM_STRATEGY.md §7 — this row is specifically about paying a seller through AgriLoop.) |
| Referrals | `Referral` model + share URLs; no reward engine |
