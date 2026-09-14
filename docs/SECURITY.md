# AgriLoop — Security

A marketplace holds two things worth attacking: user accounts and trust signals (verification
badges, reviews, ratings). The controls below are ordered by how much damage their absence would
do.

---

## 1. Authentication

**Passwords.** `scrypt` (N=16384, r=8, p=1, 64-byte key) with a 16-byte random salt per user,
via Node's `crypto`. Stored as `scrypt$N$r$p$salt$hash`. Verification is constant-time
(`timingSafeEqual`). The algorithm and parameters are recorded in the hash, so they can be
upgraded with transparent rehash-on-login.

Minimum 10 characters, checked against a small list of obvious passwords. No composition rules
(they push users to `Password1!`) and no maximum length below 200.

**Sessions.** Opaque 32-byte random token, HMAC-SHA256 signed with `AUTH_SECRET`, stored in an
`httpOnly`, `secure` (production), `sameSite=lax`, `path=/` cookie with a 30-day expiry. Only the
SHA-256 hash of the token is persisted, so a database leak does not yield usable sessions.
Sessions are invalidated on sign-out, password change and account suspension.

`AUTH_SECRET` has no default. The app refuses to boot in production without it.

**Password reset.** Single-use token, hashed at rest, 60-minute expiry, invalidated on use.
Response is identical whether or not the email exists — no account enumeration.

**Sign-in responses** are also non-enumerating: "Email or password is incorrect" for both cases.

**Future providers.** Google, Apple and phone auth are accommodated by an `AuthProvider` seam;
no OAuth complexity is built into the MVP.

## 2. Authorization

Every rule lives in `src/lib/auth/permissions.ts`. Pages and components never inline role logic.

```ts
requireSession()        // throws redirect to /signin?next=…
requireRole('FARMER')   // 404s for the wrong role
can(user, 'listing:update', listing)   // ownership-aware
```

Three rules that are never relaxed:

1. **Ownership is derived from the session, never from the request.** A `sellerId` in a form body
   is ignored.
2. **Every server action re-checks authorization**, even when the UI already hid the control.
   The UI is a convenience; the action is the boundary.
3. **Admin routes 404 for non-admins.** Admin surface area is not advertised to attackers, and
   `/admin/**` is additionally gated in `middleware.ts` before any page code runs.

**V2 additions, same pattern.** Accepting/rejecting a buyer-request response re-checks
`request.buyerId === session.user.id` server-side — the responder cannot decide on their own
offer, and no other buyer can decide on a request that isn't theirs. Posting a Farm Update
re-checks both that the session user owns a `FarmProfile` and, when a listing is linked, that the
listing's `sellerId` matches the session user — never trusted from the submitted id. Blocking a
user rejects the case where the target is the acting user themselves.

## 3. Input validation

zod schemas in `src/lib/validation` are the single definition of every input shape, used by both
server actions and route handlers. Client-side validation exists only for responsiveness and is
never trusted.

Enforced: length caps on every free-text field; enums for every constrained value; numeric ranges
(price ≥ 0 and ≤ 1e9 minor units, rating 1–5, quantity > 0); slug normalization; region and
community ids checked for membership in the claimed country; currency checked against the
country's configured currency.

## 4. Output safety

React escapes by default and the app renders **no** user content through `dangerouslySetInnerHTML`.
Academy lesson bodies are authored by admins and rendered through a restricted markdown subset
(headings, paragraphs, lists, bold, italic, links) with URL scheme allow-listing — `javascript:`
and `data:` hrefs are dropped.

User-supplied links (farm website, business website) get `rel="nofollow ugc noopener noreferrer"`
and `target="_blank"`.

## 5. File uploads

* Allowed: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
* Max 5 MB per file, 8 images per listing, 6 per farm gallery, 4 per community post.
* Content type is sniffed from the magic bytes, not trusted from the multipart header.
* Stored with a generated name; the original filename is never used as a path.
* Served from a path that cannot execute, with `Content-Disposition` and a fixed content type.
* SVG is rejected outright (it is an XSS vector).

All of this sits in `StorageService`, so the rules survive a provider change.

## 6. Rate limiting and abuse

Limits are listed in [API_ARCHITECTURE.md §8](./API_ARCHITECTURE.md#8-rate-limiting). Beyond
them: reporting on users, listings, posts, comments, reviews and buyer requests; user blocking
that suppresses messages and conversation creation in both directions; admin suspension that
invalidates sessions immediately; review-spam prevention by anchoring reviews to completed
orders.

## 7. Transport and headers

Set in `next.config.ts` and `middleware.ts`:

| Header | Value |
| --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=()` |
| `Content-Security-Policy` | `default-src 'self'`; images from self/data/configured CDN; no `unsafe-eval` |

Server Actions provide CSRF protection through Next.js origin checks; cookies are `sameSite=lax`.

## 8. Secrets

No secret, key, credential or connection string appears in the repository. Everything comes from
the environment, documented in `.env.example` with placeholders only. `.env*` (except
`.env.example`) is git-ignored. Secrets are never logged, never sent to the client, and never
embedded in a `NEXT_PUBLIC_*` variable — that prefix is reserved for values that are genuinely
public (site URL, default country).

## 9. Privacy

* `AnalyticsEvent` stores no IP address, no user agent, no cross-site identifier, and `userId` is
  optional and omitted for anonymous traffic.
* Search terms are stored with **no** user linkage.
* Email addresses and phone numbers are never rendered on public pages. Contact happens through
  in-app messaging; a WhatsApp number is exposed only when the seller explicitly configures it
  for that purpose.
* Precise farm coordinates are optional; the map falls back to the community centroid so a
  farmer is not obliged to publish their home location.
* Account deletion sets `PENDING_DELETION`, invalidates sessions, and anonymizes authored
  content rather than orphaning threads.

## 10. Known limitations of the MVP

Stated plainly rather than glossed over:

* The in-memory data source has no durability or cross-instance consistency. It is for
  development and demos. Production requires the Prisma adapter.
* Rate limiting is per-instance in-memory; multi-instance deployments need the Redis
  implementation of the same interface.
* Email verification is modelled (`User.emailVerified`) but not enforced until `EmailService`
  has a provider.
* Verification badges are manually granted by admins. That is an operational control, not a
  cryptographic one, and the badge copy says "verified by AgriLoop", not "identity verified".
