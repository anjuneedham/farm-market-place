import { ArrowRight, Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

const BENEFITS = [
  'Featured listings and higher visibility for farmers',
  'Member pricing and bulk discounts for buyers',
  'Buyer request alerts the moment demand matches your parish',
  'Advanced analytics, savings dashboard, and priority support',
];

export function PremiumPreview() {
  return (
    <section className="bg-ink-900">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-micro text-sun-400">AgriLoop Premium</p>
            <h2 className="text-h1 mt-3 text-white">Save money. Make money. Get better access.</h2>
            <p className="mt-4 text-ink-300">
              Premium accelerates what already works on AgriLoop — it never locks away the
              marketplace, community or core Academy.
            </p>
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
            <ButtonLink href="/premium" variant="premium" size="lg" className="mt-7">
              See Premium plans
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-micro text-ink-400">Your Premium Savings</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-400">This month</p>
                <p className="mt-1 text-2xl font-bold tabular text-white">$4,850 JMD</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Lifetime</p>
                <p className="mt-1 text-2xl font-bold tabular text-white">$18,700 JMD</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-white/5 p-4">
              <p className="text-sm text-ink-300">Fresh Scotch Bonnet Pepper (50 lb)</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-500 line-through">$5,000 JMD</span>
                <span className="font-semibold text-white">$4,400 JMD</span>
                <span className="rounded-full bg-sun-500/20 px-2 py-0.5 text-xs font-semibold text-sun-300">
                  Save $600
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-500">
              Illustrative example. Your dashboard shows savings from your own completed purchases.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
