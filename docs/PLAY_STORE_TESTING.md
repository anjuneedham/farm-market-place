# AgriLoop — Google Play Store Testing Setup

How the Android app is packaged, how to build it, and how to get it into a Play Console
internal testing track. Read docs/MOBILE_APP_NOTES.md first — it covers the payment-policy
constraint this document assumes.

---

## 1. What this actually is

AgriLoop does not have a separate native codebase. `android/` is a **Capacitor** shell — a
thin native Android app whose one job is to open the live AgriLoop web app, full-screen, with
native chrome (status bar, splash screen, hardware back button) instead of a browser tab.

```
android/            The generated Android Studio project (Gradle, Java, res/)
capacitor.config.ts Points the shell at your live deployment via AGRILOOP_APP_URL
www/                Placeholder only — never actually shown, see the comment in www/index.html
```

**This is deliberate, not a shortcut.** AgriLoop is fully server-rendered — Server Actions,
cookie-based sessions, per-request dynamic data throughout the marketplace, dashboards and
admin. None of that survives `next export`, so there is no static bundle that could be shipped
inside the app instead. Loading the live deployment remotely is the same mechanism a Trusted
Web Activity uses; Capacitor was chosen over a bare TWA because it gives a path to real native
plugins (push notifications, share, camera) later without a rewrite — see §6.

**What is genuinely native today:** status bar theming, splash screen, and hardware/gesture
back-button handling (`src/components/native/CapacitorBridge.tsx`, mounted in the root
layout, gated on `Capacitor.isNativePlatform()` so it never runs for a normal browser
visitor), plus a native share sheet on the existing Share button
(`src/components/marketplace/ShareButton.tsx`). Google Play's review policy rejects apps that
are "just a WebView with no native value" — this is why those exist now rather than being
deferred, not decoration.

## 2. Prerequisites

- **A live HTTPS deployment.** Not `localhost`. Cookies (session auth) must round-trip to a
  real domain.
- **Android Studio** (or the standalone Android SDK command-line tools) — not available in
  every environment this repository is edited from; the Android project is fully generated and
  configured, but compiling an APK/AAB requires the Android SDK/build tools locally or in CI.
- **A Google Play Console developer account** ($25 one-time fee, identity verification can take
  1–3 days if not already done).
- Node 20+ and the repository's own `npm install` (already required for the web app).

## 3. Building locally

```bash
npm install
export AGRILOOP_APP_URL=https://agriloopmain.vercel.app   # the live deployment — no default on purpose, see capacitor.config.ts
npm run android:sync     # copies config into android/, no-op on web assets since we load remotely
npm run android:open     # opens android/ in Android Studio
```

(`npx cap sync android` with this exact URL has been verified to generate
`android/app/src/main/assets/capacitor.config.json` correctly — the sandbox this was built in
cannot reach `*.vercel.app` itself due to its own outbound network policy, so open the URL in an
actual browser to confirm the deployment is live before building.)

From Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**, or from the
command line once you have a signing config (§4):

```bash
npm run android:assembleDebug    # unsigned debug APK — fine for sideloading to your own device
npm run android:bundleRelease    # release AAB — what Play Console actually wants
```

`AGRILOOP_APP_URL` must be exported in the same shell every time you run a `cap` or `gradle`
command — `capacitor.config.ts` throws immediately if it is missing rather than silently
building against a placeholder.

## 4. Signing

Play Console uses **Play App Signing**: you generate an *upload key* to sign the AAB you upload;
Google re-signs it with the *app signing key* it manages for you. You never upload an unsigned
build to Play Console.

```bash
keytool -genkey -v -keystore agriloop-upload.keystore -alias agriloop \
  -keyalg RSA -keysize 2048 -validity 9125
```

- Store the resulting `.keystore` file and its passwords **outside this repository** — a
  password manager or your CI's secret store, never committed. `.gitignore` already excludes
  `android/app/*.keystore` and `android/keystore.properties` for this reason.
- Create `android/keystore.properties` locally (also git-ignored) and wire it into
  `android/app/build.gradle`'s `signingConfigs` block per the
  [official Android signing guide](https://developer.android.com/studio/publish/app-signing) —
  the generated `build.gradle` does not have a release signing config yet; add one before your
  first `bundleRelease`.
- **Back up the upload keystore.** Losing it means asking Google to reset your upload key, which
  is a support process, not a self-serve one.

## 5. Play Console: internal testing track

Internal testing is the lightest track — up to 100 testers by email, no review wait, live
within minutes of upload.

1. **Create the app** in Play Console (if not already done): app name "AgriLoop", default
   language, app/game = App, free/paid = Free (Premium is a subscription purchased through the
   app's own web checkout today, not a Play-billed IAP — see §6 before that changes).
2. **App content** section — even for internal testing, Play Console requires these before
   letting a release go out:
   - **Privacy policy URL.** AgriLoop collects accounts, messages, and location (parish-level).
     You need a real, reachable privacy policy URL — do not point this at a placeholder.
   - **Data safety form.** Answer honestly from what the app actually does: collects account
     info (name, email, phone/WhatsApp optional), location (parish/region, not precise GPS
     unless a farmer opts in — see docs/SECURITY.md), user-generated content (listings, posts,
     messages, reviews); data is used for app functionality and is not sold. Update this if the
     answer changes later — Play actively audits mismatches between the form and observed
     behaviour.
   - **Content rating questionnaire.** A marketplace/community app with messaging and
     user-generated content — answer the questionnaire as-is; do not guess a rating.
   - **Target audience.** Not primarily directed at children.
   - **App access.** Since sign-in is required for most features, provide a **test account**
     (one of the seeded demo accounts, e.g. `green-valley-farm@agriloop.demo` /
     `agriloop-demo-2026` from README.md) so reviewers can actually get past the sign-in wall —
     Play review rejects apps it cannot evaluate.
3. **Store listing** — short description, full description, app icon, at least 2 phone
   screenshots. `store-assets/android/icon-512.png` (generated alongside the in-app icon, same
   sprout mark, 512×512, fully opaque as Play requires) covers the icon; screenshots need to be
   taken from a running build (emulator or device) since they must show the real app.
4. **Testing → Internal testing** → create a release, upload the signed AAB from §4, add release
   notes, add tester emails (or a Google Group), publish.
5. Testers install via the opt-in link Play Console generates — no public listing yet.

## 6. Before any *public* Play Store track (open testing, production)

Two things flagged in docs/MOBILE_APP_NOTES.md are fine for a handful of invited internal
testers but **must** be resolved before wider distribution:

- **Google Play Billing.** Digital subscriptions purchased *inside* an app must go through
  Play Billing, not PayPal — AgriLoop Premium's existing checkout
  (`src/lib/integrations/paypal.ts`) stays valid for the web app but needs a second
  `PaymentService` implementation for in-app purchase before a public release. Verify current
  policy at https://support.google.com/googleplay/android-developer/answer/9858738 — it changes.
- **Minimum functionality / "just a WebView" rejection.** §1 above lists what already makes
  this more than a bare wrapper. If Play review still flags it, the next real additions are
  push notifications (the `NotificationService` interface already has the seam — see
  docs/MVP_ROADMAP.md) and native camera-backed listing photo uploads.

Neither blocks internal testing with people you invite directly.

## 7. Regenerating brand assets

The launcher icon, adaptive-icon foreground/background, and splash screens are all generated
programmatically from one sprout glyph (a stem + two leaves) in AgriLoop's brand green
(`#0D5138`, matching `theme-color` in `src/app/layout.tsx`) — there is no separate logo file to
hand-edit. If the mark ever changes, regenerate every density from the same source rather than
editing individual PNGs, so the icon, splash screen and Play Store listing icon never drift out
of sync with each other.
