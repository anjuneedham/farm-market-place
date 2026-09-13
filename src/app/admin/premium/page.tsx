import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { Money } from '@/components/ui/Money';
import { Badge } from '@/components/ui/Badge';
import { humanise } from '@/lib/utils';
import { PlanPriceEditor } from './PlanPriceEditor';

export const metadata: Metadata = { title: 'Premium — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPremiumPage() {
  const plans = db.premium.allPlans();
  const subscriptions = db.premium.listSubscriptions();

  return (
    <div>
      <h1 className="text-h1 mb-1">Premium</h1>
      <p className="mb-6 text-ink-600">
        Plan prices are configured here, per country and per currency. No price is hardcoded in
        application code.
      </p>

      <section className="mb-10">
        <h2 className="text-h2 mb-4">Plans</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-medium text-ink-900">
                  {plan.name} <span className="text-xs text-ink-400">({plan.countryCode} · {humanise(plan.interval)})</span>
                </p>
                <p className="text-sm text-ink-500">
                  Current price: <Money minor={plan.priceMinor} currency={plan.currency} className="font-semibold" />
                </p>
              </div>
              <PlanPriceEditor planId={plan.id} currentMinor={plan.priceMinor} currency={plan.currency} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-h2 mb-4">Subscribers ({subscriptions.length})</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {subscriptions.map((subscription) => {
            const plan = db.premium.planById(subscription.planId);
            const display = db.profiles.displayFor(subscription.userId);
            return (
              <div key={subscription.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{display.label}</p>
                  <p className="text-xs text-ink-400">{plan?.name}</p>
                </div>
                <Badge tone={subscription.status === 'ACTIVE' ? 'positive' : 'neutral'}>{humanise(subscription.status)}</Badge>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
