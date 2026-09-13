import {
  type CheckoutInput,
  type CheckoutSession,
  type PaymentRecord,
  type PaymentService,
  type PayoutInput,
  type PayoutRecord,
  type ServiceResult,
  fail,
  notConfigured,
  ok,
} from './types';

/**
 * PayPal Express Checkout, via the REST Orders API v2 — no SDK dependency,
 * plain fetch. This is the one real PaymentService implementation in
 * AgriLoop today; it powers the Premium checkout button and nothing else
 * (marketplace transactions stay off-platform, per docs/PRODUCT_ARCHITECTURE.md §9).
 *
 * ── Currency ─────────────────────────────────────────────────────────────
 * PayPal settles in a fixed list of currencies that does NOT include any
 * Caribbean currency AgriLoop uses — not JMD, not TTD, not XCD, not GYD, not
 * HTG, not DOP. A Jamaican farmer's JMD-priced plan cannot be charged through
 * PayPal directly. `supportedCurrencies()` is the enforcement point: callers
 * must check a plan's PayPal-specific price/currency (SubscriptionPlan.
 * paypalPriceMinor / paypalCurrency) rather than assuming the plan's listed
 * price works here. See docs/PREMIUM_STRATEGY.md § Online checkout currency.
 *
 * ── Security ─────────────────────────────────────────────────────────────
 * `metadata` is written into the order's `custom_id` at creation and read
 * back — never re-accepted from the client — at capture, which is what lets
 * `capturePaypalOrderAction` grant the correct plan to the correct user
 * without trusting anything the browser sends on the capture call.
 */

// PayPal's supported currency list (REST API, 2026). Zero-decimal currencies
// (JPY, HUF, TWD) are intentionally excluded here since AgriLoop's minor-unit
// math assumes 100 minor units per major unit; add support deliberately if
// one of those is ever needed for a plan's PayPal price.
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CZK', 'DKK', 'HKD', 'ILS',
  'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'SEK', 'SGD', 'THB',
] as const;

type PayPalEnv = 'sandbox' | 'live';

function apiBase(env: PayPalEnv): string {
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function encodeMetadata(metadata: Record<string, string>): string {
  // PayPal's custom_id caps at 127 characters — keep metadata terse.
  return JSON.stringify(metadata);
}

function decodeMetadata(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string>;
    return {};
  } catch {
    return {};
  }
}

export class PayPalPaymentService implements PaymentService {
  private readonly clientId?: string;
  private readonly clientSecret?: string;
  private readonly env: PayPalEnv;
  private tokenCache?: { token: string; expiresAt: number };

  constructor() {
    // The client id is not a secret — PayPal's JS SDK requires it in the
    // browser, so it's read from the same NEXT_PUBLIC_ variable server- and
    // client-side rather than duplicated under two names.
    this.clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.env = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  status(): string {
    if (!this.isConfigured()) {
      return 'PayPal is not connected. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable Premium checkout.';
    }
    return `PayPal checkout is live (${this.env}).`;
  }

  supportedCurrencies(): readonly string[] {
    return SUPPORTED_CURRENCIES;
  }

  private async getAccessToken(): Promise<ServiceResult<string>> {
    if (!this.clientId || !this.clientSecret) return notConfigured('PayPal');

    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return ok(this.tokenCache.token);
    }

    try {
      const response = await fetch(`${apiBase(this.env)}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        console.error('[agriloop:paypal] token request failed', response.status, await response.text());
        return fail('unavailable', 'PayPal is not responding right now. Try again shortly.');
      }

      const data = (await response.json()) as { access_token: string; expires_in: number };
      this.tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
      return ok(data.access_token);
    } catch (error) {
      console.error('[agriloop:paypal] token request threw', error);
      return fail('unavailable', 'PayPal is not responding right now. Try again shortly.');
    }
  }

  private async request<T>(
    token: string,
    path: string,
    init: RequestInit,
  ): Promise<ServiceResult<T>> {
    try {
      const response = await fetch(`${apiBase(this.env)}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const body: unknown = await response.json().catch(() => undefined);

      if (!response.ok) {
        console.error('[agriloop:paypal] request failed', path, response.status, body);
        return fail(
          'unavailable',
          'PayPal could not process that just now. Please try again, or use a different payment method.',
        );
      }

      return ok(body as T);
    } catch (error) {
      console.error('[agriloop:paypal] request threw', path, error);
      return fail('unavailable', 'PayPal is not responding right now. Try again shortly.');
    }
  }

  async createCheckout(input: CheckoutInput): Promise<ServiceResult<CheckoutSession>> {
    if (!this.isConfigured()) return notConfigured('PayPal checkout');

    const currency = input.currency.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(currency as (typeof SUPPORTED_CURRENCIES)[number])) {
      return fail(
        'validation',
        `PayPal cannot settle in ${currency}. Set a PayPal-specific price in a supported currency for this plan.`,
      );
    }

    const tokenResult = await this.getAccessToken();
    if (!tokenResult.ok) return tokenResult;

    const value = (input.amountMinor / 100).toFixed(2);

    return this.request<{ id: string; links: Array<{ rel: string; href: string }> }>(
      tokenResult.data,
      '/v2/checkout/orders',
      {
        method: 'POST',
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: encodeMetadata(input.metadata),
              description: input.description.slice(0, 127),
              amount: { currency_code: currency, value },
            },
          ],
          payer: input.buyerEmail ? { email_address: input.buyerEmail } : undefined,
        }),
      },
    ).then((result) => (result.ok ? ok({ id: result.data.id }) : result));
  }

  async capture(reference: string): Promise<ServiceResult<PaymentRecord>> {
    if (!this.isConfigured()) return notConfigured('PayPal checkout');

    const tokenResult = await this.getAccessToken();
    if (!tokenResult.ok) return tokenResult;

    const result = await this.request<{
      status: string;
      purchase_units: Array<{
        custom_id?: string;
        payments?: { captures?: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }> };
      }>;
    }>(tokenResult.data, `/v2/checkout/orders/${encodeURIComponent(reference)}/capture`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (!result.ok) return result;

    const unit = result.data.purchase_units[0];
    const capture = unit?.payments?.captures?.[0];

    if (!capture || capture.status !== 'COMPLETED') {
      return fail('conflict', 'PayPal did not confirm this payment. No charge was completed.');
    }

    return ok({
      reference: capture.id,
      status: capture.status,
      amountMinor: Math.round(Number(capture.amount.value) * 100),
      currency: capture.amount.currency_code,
      metadata: decodeMetadata(unit.custom_id),
    });
  }

  async refund(reference: string, amountMinor?: number): Promise<ServiceResult<PaymentRecord>> {
    if (!this.isConfigured()) return notConfigured('PayPal refunds');

    const tokenResult = await this.getAccessToken();
    if (!tokenResult.ok) return tokenResult;

    const result = await this.request<{
      id: string;
      status: string;
      amount?: { value: string; currency_code: string };
    }>(tokenResult.data, `/v2/payments/captures/${encodeURIComponent(reference)}/refund`, {
      method: 'POST',
      body: amountMinor
        ? JSON.stringify({ amount: { value: (amountMinor / 100).toFixed(2), currency_code: 'USD' } })
        : JSON.stringify({}),
    });

    if (!result.ok) return result;

    return ok({
      reference: result.data.id,
      status: result.data.status,
      amountMinor: result.data.amount ? Math.round(Number(result.data.amount.value) * 100) : amountMinor ?? 0,
      currency: result.data.amount?.currency_code,
    });
  }

  async payout(_input: PayoutInput): Promise<ServiceResult<PayoutRecord>> {
    // PayPal Payouts is a distinct API/product from Checkout and is not wired
    // up — AgriLoop has no seller-payout flow yet (docs/MVP_ROADMAP.md).
    return notConfigured('Seller payouts');
  }
}
