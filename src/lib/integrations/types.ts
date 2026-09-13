/**
 * Provider abstractions.
 *
 * Every third-party capability sits behind one of these interfaces, with a
 * "not configured" implementation that reports honestly rather than pretending.
 * Nothing in the application imports a vendor SDK directly, so swapping a
 * provider is one file (docs/API_ARCHITECTURE.md §7).
 *
 * The isConfigured() contract is what keeps the UI honest: components call it
 * and render a FeatureStatus panel instead of a dead button when it is false.
 */

export type ServiceError = {
  code:
    | 'unauthenticated'
    | 'forbidden'
    | 'not_found'
    | 'validation'
    | 'conflict'
    | 'rate_limited'
    | 'not_configured'
    | 'unavailable';
  message: string;
  fields?: Record<string, string>;
};

export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: ServiceError['code'],
  message: string,
  fields?: Record<string, string>,
): ServiceResult<T> {
  return { ok: false, error: { code, message, fields } };
}

export function notConfigured<T = never>(feature: string): ServiceResult<T> {
  return fail('not_configured', `${feature} is not available yet.`);
}

export type Provider = {
  /** Whether a real provider is wired up. Drives every "coming soon" state. */
  isConfigured(): boolean;
  /** Short, user-facing explanation of the current status. */
  status(): string;
};

// ── Payments ─────────────────────────────────────────────────────────────────

export type CheckoutInput = {
  orderId: string;
  currency: string;
  amountMinor: number;
  description: string;
  buyerEmail?: string;
};

export type CheckoutSession = { id: string; url: string };
export type PaymentRecord = { reference: string; status: string; amountMinor: number };
export type PayoutInput = { sellerId: string; currency: string; amountMinor: number };
export type PayoutRecord = { reference: string; status: string };

export interface PaymentService extends Provider {
  createCheckout(input: CheckoutInput): Promise<ServiceResult<CheckoutSession>>;
  capture(reference: string): Promise<ServiceResult<PaymentRecord>>;
  refund(reference: string, amountMinor?: number): Promise<ServiceResult<PaymentRecord>>;
  payout(input: PayoutInput): Promise<ServiceResult<PayoutRecord>>;
}

// ── Email ────────────────────────────────────────────────────────────────────

export type EmailMessage = { to: string; subject: string; text: string; html?: string };

export interface EmailService extends Provider {
  send(message: EmailMessage): Promise<ServiceResult<{ id: string }>>;
}

// ── Notifications ────────────────────────────────────────────────────────────

export type NotificationChannel = 'in_app' | 'email' | 'push';

export type NotificationPayload = {
  userId: string;
  type: import('@/lib/types').NotificationType;
  title: string;
  body?: string;
  href?: string;
};

export interface NotificationService {
  channels(): NotificationChannel[];
  notify(payload: NotificationPayload): Promise<ServiceResult<{ delivered: NotificationChannel[] }>>;
}

// ── Storage ──────────────────────────────────────────────────────────────────

export type StoredFile = { url: string; key: string; size: number; contentType: string };

export interface StorageService extends Provider {
  readonly maxBytes: number;
  readonly allowedTypes: readonly string[];
  put(file: File, prefix: string): Promise<ServiceResult<StoredFile>>;
  remove(key: string): Promise<ServiceResult<null>>;
}

// ── AI ───────────────────────────────────────────────────────────────────────

export type AIContext = {
  farmId?: string;
  crops?: string[];
  regionId?: string;
  countryCode?: string;
};

export interface AIService extends Provider {
  ask(question: string, context: AIContext): Promise<ServiceResult<{ answer: string }>>;
}

// ── Weather ──────────────────────────────────────────────────────────────────

export type WeatherSnapshot = {
  regionId: string;
  summary: string;
  observedAt: string;
};

export interface WeatherService extends Provider {
  forRegion(regionId: string): Promise<ServiceResult<WeatherSnapshot>>;
}

// ── Market intelligence ──────────────────────────────────────────────────────

export type MarketSignal = {
  productId: string;
  regionId?: string;
  averagePriceMinor: number;
  currency: string;
  listingCount: number;
  requestCount: number;
  observedAt: string;
};

export interface MarketIntelligenceService extends Provider {
  /** Minimum observations before any figure is shown. */
  readonly minimumSampleSize: number;
  signalFor(productId: string, regionId?: string): Promise<ServiceResult<MarketSignal>>;
}
