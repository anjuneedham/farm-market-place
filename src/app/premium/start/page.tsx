import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { paymentService } from '@/lib/integrations';
import { formatMoney } from '@/lib/money';
import { FeatureStatus } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { PayPalCheckoutButton } from '@/components/premium/PayPalCheckoutButton';

export const metadata: Metadata = { title: 'Start Premium' };

/**
 * PayPal Express Checkout for one plan. Falls back to an honest
 * "not available yet" panel — never a fake button — whenever any one of
 * three things isn't true: a payment provider is configured, this specific
 * provider has a client id to hand the browser, and this specific plan has
 * an admin-set PayPal price (PayPal cannot settle in most of AgriLoop's
 * local currencies — see docs/PREMIUM_STRATEGY.md § Online checkout currency).
 */
export default async function StartPremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { user } = await requireSession('/premium/start');
  const { plan: planId } = await searchParams;

  const plan = planId ? db.premium.planById(planId) : undefined;
  if (planId && !plan) notFound();

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const canCheckout =
    plan && paymentService.isConfigured() && Boolean(clientId) && Boolean(plan.paypalPriceMinor && plan.paypalCurrency);

  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
      <h1 className="text-h1">Start AgriLoop Premium</h1>

      {plan ? (
        <div className="mt-4 rounded-lg border border-line bg-surface p-4 text-left">
          <p className="font-semibold text-ink-900">{plan.name}</p>
          <p className="text-sm text-ink-500">{plan.interval === 'YEARLY' ? 'Billed yearly' : 'Billed monthly'}</p>
        </div>
      ) : null}

      {canCheckout && plan ? (
        <div className="mt-6 text-left">
          <p className="mb-3 text-sm text-ink-600">
            Pay with PayPal —{' '}
            <span className="font-semibold text-ink-900">
              {formatMoney(plan.paypalPriceMinor, plan.paypalCurrency!)}
            </span>
            {user.email ? <> to {user.email}</> : null}
          </p>
          <PayPalCheckoutButton planId={plan.id} clientId={clientId!} currency={plan.paypalCurrency!} />
          <p className="mt-3 text-xs text-ink-400">
            Charged in {plan.paypalCurrency} via PayPal — not {plan.currency}, PayPal&apos;s supported
            currency list doesn&apos;t include {plan.currency}.
          </p>
        </div>
      ) : (
        <div className="mt-6 text-left">
          <FeatureStatus
            title="Online Premium checkout"
            explanation={
              !plan
                ? 'Choose a plan from the Premium page to check out.'
                : paymentService.status()
            }
            requirement={
              plan && paymentService.isConfigured()
                ? 'An admin needs to set a PayPal price for this plan in /admin/premium — PayPal cannot charge in every currency AgriLoop lists prices in.'
                : 'A PayPal business account connected to AgriLoop (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) and a PayPal price set for this plan.'
            }
          />
          <p className="mt-4 text-sm text-ink-600">
            In the meantime, contact the AgriLoop team to activate Premium manually for your
            account.
          </p>
        </div>
      )}

      <ButtonLink href="/premium" variant="secondary" className="mt-6">
        Back to Premium
      </ButtonLink>
    </div>
  );
}
