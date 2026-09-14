# AgriLoop — API Architecture

Three interaction styles, each with a clear job.

| Style | Used for | Location |
| --- | --- | --- |
| **Server Components** | All read paths rendered by the web app | `src/app/**/page.tsx` |
| **Server Actions** | All mutations from the web app | `src/app/**/actions.ts` |
| **Route Handlers** | Machine-readable endpoints: future mobile client, webhooks, feeds | `src/app/api/**` |

---

## 1. Layering rule

```
page.tsx / actions.ts        ← no data access, no SQL, no store knowledge
        ↓ calls
src/lib/services/*.ts        ← validation (zod) · authorization · business rules
        ↓ calls
src/lib/db/repositories/*.ts ← typed, paginated data access
        ↓ calls
DataSource (memory | prisma)
```

A page that imports a repository directly, or a component that imports the data source, is a bug.
Services are the only place business rules live, which is what makes it possible to add a mobile
API later by adding route handlers that call the same services.

## 2. Result contract

Services never throw for expected failures. They return a discriminated union:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

type ServiceError = {
  code: 'unauthenticated' | 'forbidden' | 'not_found' | 'validation'
      | 'conflict' | 'rate_limited' | 'not_configured' | 'unavailable';
  message: string;            // safe to render to a user
  fields?: Record<string, string>;  // field-level validation errors
};
```

`message` is always human-readable and safe to show. Stack traces and provider errors are logged
server-side and never reach the client — see [SECURITY.md](./SECURITY.md).

Unexpected failures throw and are caught by route-level `error.tsx` boundaries, which render the
shared `ErrorState`.

## 3. Server Actions

Every action follows the same four steps, in this order:

```ts
'use server';

export async function createListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();                  // 1. authenticate
  const parsed  = listingSchema.safeParse(toObject(formData)); // 2. validate
  if (!parsed.success) return fieldErrors(parsed.error);
  const result  = await marketplace.createListing(session.user, parsed.data); // 3. authorize + act
  if (!result.ok) return { status: 'error', error: result.error };
  revalidatePath('/market');                                // 4. revalidate
  redirect(`/market/${result.data.categorySlug}/${result.data.slug}`);
}
```

Authorization is re-checked inside the service using the session user, never trusted from the
form payload. Ownership fields (`sellerId`, `authorId`, `buyerId`) are always derived from the
session and are ignored if present in the submitted data.

## 4. Route handlers

Public, cacheable reads:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/search?q=&country=&region=&category=&page=` | Marketplace search, JSON |
| `GET` | `/api/locations?country=JM` | Region/community tree for pickers |
| `GET` | `/api/categories` | Category tree |
| `GET` | `/api/listings?…` | Paginated listings |
| `GET` | `/api/health` | Build/version/data-source status |

Authenticated:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/notifications` | Current user's notifications |
| `POST` | `/api/notifications/read` | Mark read |
| `GET` | `/api/messages/:conversationId` | Thread poll (until realtime exists) |

Reserved for providers (implemented as a verified no-op until payments exist):

| Method | Path |
| --- | --- |
| `POST` | `/api/webhooks/payments` |

Webhook handlers verify signatures before parsing bodies and are idempotent on provider event id.

## 5. Pagination

Every list endpoint and repository method takes `{ page, perPage }` (default 20, max 60) and
returns:

```ts
type Paginated<T> = { items: T[]; page: number; perPage: number; total: number; hasMore: boolean };
```

No endpoint returns an unbounded collection. The marketplace grid uses page-based pagination on
desktop and "Load more" on mobile, both backed by the same contract.

## 6. Caching and revalidation

* Marketplace, farm, community and Academy reads are server-rendered with
  `revalidate = 60`; the Academy uses `revalidate = 3600`.
* Dashboards, messages, notifications and admin are `dynamic = 'force-dynamic'` — never cached.
* Mutations call `revalidatePath` / `revalidateTag` for the surfaces they affect.

## 7. Integration abstractions

`src/lib/integrations` — each is an interface, a real implementation where one exists, and a
`NotConfigured` implementation that returns `{ ok: false, code: 'not_configured' }`. Nothing in
the app imports a vendor SDK directly.

```ts
interface PaymentService {
  isConfigured(): boolean;
  createCheckout(i: CheckoutInput): Promise<ServiceResult<CheckoutSession>>;
  capture(ref: string): Promise<ServiceResult<PaymentRecord>>;
  refund(ref: string, minor?: number): Promise<ServiceResult<PaymentRecord>>;
  payout(i: PayoutInput): Promise<ServiceResult<PayoutRecord>>;
}
```

Same shape for `EmailService`, `NotificationService`, `StorageService`, `AIService`,
`WeatherService`, `MarketIntelligenceService`. Providers are selected in
`src/lib/integrations/index.ts` from environment variables; swapping Resend for SES is one file.

**The `isConfigured()` contract is what keeps the UI honest.** Components call it and render
`FeatureStatus` instead of a dead button when it returns false.

## 8. Rate limiting

`src/lib/security/rate-limit.ts` — a fixed-window limiter, in-memory in the MVP (documented as
per-instance) behind an interface a Redis implementation can satisfy.

| Action | Limit |
| --- | --- |
| Sign in | 8 / 15 min per email + IP-hash |
| Sign up | 5 / hour |
| Password reset request | 5 / hour |
| Create listing | 20 / hour |
| Send message | 60 / hour |
| Create post / comment | 20 / hour |
| Report | 10 / hour |
| Search (anonymous) | 120 / min |
| Create farm update (V2) | 10 / hour |

## 9. Errors

| Code | HTTP | User-facing message |
| --- | --- | --- |
| `unauthenticated` | 401 | "Please sign in to continue." |
| `forbidden` | 404 on admin, 403 elsewhere | "You don't have access to this." |
| `not_found` | 404 | "We couldn't find that." |
| `validation` | 422 | Field-level messages |
| `conflict` | 409 | Specific, e.g. "You've already responded to this request." |
| `rate_limited` | 429 | "Too many attempts. Try again in a few minutes." |
| `not_configured` | 503 | "This feature isn't available yet." |
