import { data, mutate } from '../datasource';
import type {
  Discount,
  PlanAudience,
  PremiumBenefit,
  Subscription,
  SubscriptionPlan,
} from '@/lib/types';
import { newId, nowIso } from './common';

export const premium = {
  /**
   * Plans are data, priced per country and per currency, and edited in admin.
   * No subscription price is hardcoded anywhere in the application.
   */
  plans(countryCode: string, audience?: PlanAudience): SubscriptionPlan[] {
    return data()
      .subscriptionPlans.filter(
        (plan) =>
          plan.isActive &&
          plan.countryCode === countryCode.toUpperCase() &&
          (!audience || plan.audience === audience || plan.audience === 'ALL'),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  allPlans(): SubscriptionPlan[] {
    return [...data().subscriptionPlans].sort(
      (a, b) => a.countryCode.localeCompare(b.countryCode) || a.sortOrder - b.sortOrder,
    );
  },

  planById(id: string): SubscriptionPlan | undefined {
    return data().subscriptionPlans.find((p) => p.id === id);
  },

  updatePlan(id: string, patch: Partial<SubscriptionPlan>): SubscriptionPlan | undefined {
    return mutate((db) => {
      const plan = db.subscriptionPlans.find((p) => p.id === id);
      if (!plan) return undefined;
      Object.assign(plan, patch);
      return plan;
    });
  },

  benefits(audience?: PlanAudience): PremiumBenefit[] {
    return data()
      .premiumBenefits.filter(
        (benefit) =>
          benefit.isActive &&
          (!audience || benefit.audience === audience || benefit.audience === 'ALL'),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  benefitByFeatureKey(featureKey: string): PremiumBenefit | undefined {
    return data().premiumBenefits.find((b) => b.featureKey === featureKey);
  },

  updateBenefit(id: string, patch: Partial<PremiumBenefit>): PremiumBenefit | undefined {
    return mutate((db) => {
      const benefit = db.premiumBenefits.find((b) => b.id === id);
      if (!benefit) return undefined;
      Object.assign(benefit, patch);
      return benefit;
    });
  },

  subscriptionFor(userId: string): Subscription | undefined {
    return data().subscriptions.find((s) => s.userId === userId);
  },

  isPremium(userId: string): boolean {
    const subscription = this.subscriptionFor(userId);
    if (!subscription) return false;
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') return false;
    return Date.parse(subscription.currentPeriodEnd) > Date.now();
  },

  activeSubscriberCount(): number {
    return data().subscriptions.filter(
      (s) =>
        (s.status === 'ACTIVE' || s.status === 'TRIALING') &&
        Date.parse(s.currentPeriodEnd) > Date.now(),
    ).length;
  },

  listSubscriptions(): Subscription[] {
    return [...data().subscriptions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  },

  /**
   * Grants or renews a subscription. `provider`/`providerRef` default to a
   * manual admin grant (docs/PRODUCT_ARCHITECTURE.md §9's original MVP path,
   * still used by /admin/premium); a real payment capture — currently only
   * PayPal — passes its own provider name and the capture id so the
   * subscription's origin stays auditable.
   */
  grantSubscription(
    userId: string,
    planId: string,
    periodEnd: string,
    provider: string = 'manual',
    providerRef?: string,
  ): Subscription {
    return mutate((db) => {
      const existing = db.subscriptions.find((s) => s.userId === userId);
      if (existing) {
        existing.planId = planId;
        existing.status = 'ACTIVE';
        existing.currentPeriodEnd = periodEnd;
        existing.cancelAtPeriodEnd = false;
        existing.cancelledAt = undefined;
        existing.provider = provider;
        existing.providerRef = providerRef;
        return existing;
      }

      const subscription: Subscription = {
        id: newId('subscription'),
        userId,
        planId,
        status: 'ACTIVE',
        startedAt: nowIso(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        provider,
        providerRef,
        isDemoData: false,
      };
      db.subscriptions.push(subscription);
      return subscription;
    });
  },

  revokeSubscription(userId: string): void {
    mutate((db) => {
      const subscription = db.subscriptions.find((s) => s.userId === userId);
      if (subscription) {
        subscription.status = 'CANCELLED';
        subscription.cancelledAt = nowIso();
      }
    });
  },

  discounts(countryCode?: string): Discount[] {
    const now = Date.now();
    return data().discounts.filter(
      (discount) =>
        discount.isActive &&
        (!countryCode || !discount.countryCode || discount.countryCode === countryCode) &&
        Date.parse(discount.startsAt) <= now &&
        (!discount.endsAt || Date.parse(discount.endsAt) > now),
    );
  },

  allDiscounts(): Discount[] {
    return [...data().discounts];
  },

  createDiscount(input: Omit<Discount, 'id' | 'redemptions'>): Discount {
    return mutate((db) => {
      const discount: Discount = { ...input, id: newId('discount'), redemptions: 0 };
      db.discounts.push(discount);
      return discount;
    });
  },

  updateDiscount(id: string, patch: Partial<Discount>): Discount | undefined {
    return mutate((db) => {
      const discount = db.discounts.find((d) => d.id === id);
      if (!discount) return undefined;
      Object.assign(discount, patch);
      return discount;
    });
  },
};
