import type { Metadata } from 'next';
import { Check, TrendingUp, Wallet, Zap } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { premiumService } from '@/lib/services/premium';
import { formatMoney } from '@/lib/money';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { AudienceToggle } from './AudienceToggle';
import type { PlanAudience } from '@/lib/types';

export const metadata: Metadata = {
  title: 'AgriLoop Premium',
  description: 'Save money, make money, and get better access on AgriLoop. Premium accelerates the platform — it never locks away the marketplace, community or core Academy.',
};

export const revalidate = 300;

const CATEGORY_ICON = {
  SAVE_MONEY: Wallet,
  MAKE_MONEY: TrendingUp,
  BETTER_ACCESS: Zap,
  EDUCATION: Check,
  SUPPORT: Check,
} as const;

const CATEGORY_LABEL: Record<string, string> = {
  SAVE_MONEY: 'Save Money',
  MAKE_MONEY: 'Make Money',
  BETTER_ACCESS: 'Better Access',
  EDUCATION: 'Education',
  SUPPORT: 'Support',
};

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience: audienceParam } = await searchParams;
  const user = await getCurrentUser();
  const country = getDefaultCountry();

  const audience: PlanAudience =
    audienceParam === 'BUYER' || audienceParam === 'FARMER' || audienceParam === 'BUSINESS'
      ? audienceParam
      : premiumService.audienceFor(user) !== 'ALL'
        ? premiumService.audienceFor(user)
        : 'FARMER';

  const plans = premiumService.plansFor(country.code, audience);
  const benefits = premiumService.benefitsFor(audience).filter((b) => !b.alwaysFree);
  const alwaysFree = db.premium.benefits().filter((b) => b.alwaysFree);
  const isPremium = user ? premiumService.isPremium(user.id) : false;

  const grouped = benefits.reduce<Record<string, typeof benefits>>((acc, benefit) => {
    (acc[benefit.category] ??= []).push(benefit);
    return acc;
  }, {});

  return (
    <div>
      <div className="bg-ink-900 py-14 text-white">
        <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6">
          <p className="text-micro text-sun-400">AgriLoop Premium</p>
          <h1 className="text-h1 mt-3 text-white">Save money. Make money. Get better access.</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Premium accelerates what already works on AgriLoop. It never gates the marketplace,
            AgriLoop Community, or the core Academy library.
          </p>
          {isPremium ? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun-500/20 px-4 py-2 text-sm font-medium text-sun-300">
              <Check className="h-4 w-4" /> You're already Premium
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="flex justify-center">
          <AudienceToggle current={audience} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => {
              const Icon = CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] ?? Check;
              return (
                <section key={category}>
                  <h2 className="text-h2 mb-4 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                    {CATEGORY_LABEL[category] ?? category}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((benefit) => (
                      <div key={benefit.id} className="rounded-lg border border-line bg-surface p-4">
                        <p className="font-semibold text-ink-900">{benefit.title}</p>
                        <p className="mt-1 text-sm text-ink-600">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <section>
              <h2 className="text-h2 mb-4">Always free</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {alwaysFree.map((benefit) => (
                  <div key={benefit.id} className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                    <p className="font-semibold text-brand-800">{benefit.title}</p>
                    <p className="mt-1 text-sm text-brand-700">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {plans.length > 0 ? (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-line bg-surface p-5">
                    <p className="text-micro text-ink-500">{plan.interval === 'YEARLY' ? 'Yearly' : 'Monthly'}</p>
                    <p className="mt-1 text-2xl font-bold tabular text-ink-900">
                      {formatMoney(plan.priceMinor, plan.currency)}
                    </p>
                    {plan.trialDays > 0 ? (
                      <p className="mt-1 text-xs text-ink-500">{plan.trialDays}-day free trial</p>
                    ) : null}
                    <ButtonLink
                      href={user ? '/premium/start' : `/signup?role=${audience === 'BUSINESS' ? 'BUSINESS' : audience === 'BUYER' ? 'BUYER' : 'FARMER'}`}
                      variant="premium"
                      fullWidth
                      className="mt-4"
                    >
                      {user ? 'Start Premium' : 'Join AgriLoop'}
                    </ButtonLink>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Premium is not available in your market yet."
                description="Pricing for this market has not been set up. Check back soon."
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
