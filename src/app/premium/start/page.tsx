import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { paymentService } from '@/lib/integrations';
import { FeatureStatus } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Start Premium' };

/**
 * The MVP takes no payments (docs/PRODUCT_ARCHITECTURE.md §9). This page is
 * deliberately honest about that rather than simulating a checkout — the
 * button never pretends to work.
 */
export default async function StartPremiumPage() {
  await requireSession('/premium/start');
  const configured = paymentService.isConfigured();

  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
      <h1 className="text-h1">Start AgriLoop Premium</h1>
      {configured ? (
        <p className="mt-3 text-ink-600">Checkout is being set up. Check back shortly.</p>
      ) : (
        <div className="mt-6 text-left">
          <FeatureStatus
            title="Online Premium checkout"
            explanation={paymentService.status()}
            requirement="A payment provider connected to AgriLoop (Stripe or a local payment rail)."
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
