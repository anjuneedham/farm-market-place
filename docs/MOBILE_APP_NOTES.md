# AgriLoop — Notes for the Native Mobile App

AgriLoop is planned to eventually ship as a native mobile app in addition to
the web app. This document exists so that decision isn't lost between now
(web-only, PayPal Express Checkout for Premium) and whenever the native app
gets built. Read this before adding in-app purchases to a native build.

**Status:** an Android shell now exists (`android/`, via Capacitor — see
docs/PLAY_STORE_TESTING.md for build/signing/Play Console setup). It loads
the live web app remotely rather than bundling a native rewrite, so
everything below about payments still applies unchanged: the shell does not
touch checkout at all yet, and §1's Google Play Billing requirement is the
gating item before any *public* Play Store track.

---

## 1. The payment integration built today does not carry over as-is

`src/lib/integrations/paypal.ts` implements PayPal Express Checkout for
**AgriLoop Premium on the web app only**. It is real, working code (REST
Orders API v2, no SDK dependency) — see docs/PREMIUM_STRATEGY.md § Online
checkout currency for the currency constraint (PayPal cannot settle in JMD
or AgriLoop's other Caribbean currencies, hence the separate
`paypalPriceMinor`/`paypalCurrency` fields on `SubscriptionPlan`).

**This does not mean the native app can reuse it unmodified.** Apple and
Google both restrict how digital subscriptions may be sold *from inside a
native app*:

### iOS (Apple App Store Review Guidelines §3.1.1, "In-App Purchase")

- Digital subscriptions/content purchased from within a native iOS app
  generally **must** use Apple's In-App Purchase (StoreKit), not PayPal,
  Stripe, or any other processor, when the purchase flow is presented inside
  the app.
- There are narrow, evolving exceptions: the "reader app" exception (content
  consumed, not purchased, in-app — doesn't obviously fit a farm marketplace's
  Premium tier), and region-specific carve-outs from the EU's Digital Markets
  Act and similar regulation elsewhere that permit linking out to external
  purchase flows under specific conditions (entitlements, disclosures,
  sometimes a fee to Apple regardless).
- **Verify current policy at build time** — this area has changed
  significantly over 2024–2026 and will likely keep changing. Do not assume
  either "IAP is mandatory" or "external links are fine" without checking
  https://developer.apple.com/app-store/review/guidelines/#in-app-purchase
  and the current state of DMA-driven exceptions for the target regions.

### Android (Google Play Billing policy)

- Similarly requires Google Play's Billing Library for digital
  subscriptions purchased within the app, with somewhat more room historically
  for external payment links than iOS, and its own regional exceptions.
  Verify at https://support.google.com/googleplay/android-developer/answer/9858738
  at build time.

### What this means concretely

- The PayPal integration stays valid for **web and mobile-web** purchases
  (someone subscribing through a browser, including from a phone).
- A native app's Premium purchase flow will very likely need a **second**
  `PaymentService` implementation — `AppleIAPPaymentService` /
  `GooglePlayBillingService` — rather than embedding the PayPal buttons
  directly in the native UI.
- `SubscriptionPlan` and the `Subscription` model already support this: the
  `provider`/`providerRef` fields on `Subscription` are provider-agnostic
  (already storing `'manual'` for admin grants and `'paypal'` for web
  purchases today), so adding `'apple_iap'` / `'google_play'` as additional
  provider values, each verified server-side via Apple's/Google's own
  receipt-validation APIs, is additive — it does not require redesigning the
  subscription model.
- Store commission (typically 15–30%, sometimes reduced for small
  developers) applies to IAP-routed purchases and does not apply to the
  PayPal web flow. This is a real pricing/margin decision, not just a
  technical one — plan for it before setting native-app subscription prices,
  independently of the web PayPal prices already seeded in
  `src/lib/db/seed/premium.ts`.

## 2. Other mobile-app considerations already covered elsewhere

These were already accounted for in the web architecture and should transfer
directly rather than needing rework:

- **Mobile-first design.** The whole design system
  (docs/DESIGN_SYSTEM.md) and bottom navigation are already built mobile-first;
  a native app's information architecture can mirror it closely.
- **Push notifications.** `NotificationService`
  (src/lib/integrations/notifications.ts) already has an explicit channel
  list (`in_app` only today); adding `push` is documented as the next step
  in docs/MVP_ROADMAP.md and slots into the same interface a native app
  would need for push tokens.
- **Currency and location.** The country/region architecture
  (src/lib/location) already keys everything off `Country`, not off any
  assumption about platform — nothing there needs to change for mobile.

## 3. What is genuinely new and not yet designed

- **Receipt validation / server-to-server notifications** from Apple
  (App Store Server Notifications V2) and Google (Real-time Developer
  Notifications) for subscription renewal, cancellation, and refund events —
  there is no equivalent today because PayPal's flow is a single capture, not
  a recurring native subscription managed by the platform.
- **Restore purchases** flow (a standard mobile requirement — a user
  reinstalling the app must be able to recover an active subscription without
  paying again). Nothing in the current `PaymentService` interface models
  this yet; it will need a new method or a dedicated restore endpoint.
- **App Store / Play Store metadata, screenshots, and review-specific
  copy for Premium** (Apple in particular reviews subscription screens for
  clear pricing/terms disclosure before approving an app).

None of this needs to be built now. It needs to be **read before writing the
native app's payment code**, so PayPal Express Checkout isn't mistakenly
reused as-is inside a native purchase flow in a way that fails App Store or
Play Store review.
