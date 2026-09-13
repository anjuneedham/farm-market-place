'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { notificationService, paymentService } from '@/lib/integrations';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import type { SubscriptionPlan } from '@/lib/types';

/**
 * PayPal Express Checkout for AgriLoop Premium.
 *
 * `createPaypalOrderAction` writes {userId, planId} into the order's PayPal
 * `custom_id`; `capturePaypalOrderAction` reads that back from PayPal's own
 * response rather than trusting whatever the client passes in, so a user
 * cannot grant themselves a different plan than the one actually paid for.
 */

function periodEndFor(plan: SubscriptionPlan): string {
  const start = new Date();
  if (plan.interval === 'YEARLY') start.setFullYear(start.getFullYear() + 1);
  else start.setMonth(start.getMonth() + 1);
  return start.toISOString();
}

export async function createPaypalOrderAction(planId: string): Promise<ServiceResult<{ orderId: string }>> {
  const { user } = await requireSession();

  const plan = db.premium.planById(planId);
  if (!plan || !plan.isActive) return fail('not_found', 'That plan is not available.');

  if (!plan.paypalPriceMinor || !plan.paypalCurrency) {
    return fail(
      'not_configured',
      'This plan does not have a PayPal price set up yet. An admin needs to add one in /admin/premium.',
    );
  }

  const result = await paymentService.createCheckout({
    metadata: { userId: user.id, planId: plan.id },
    currency: plan.paypalCurrency,
    amountMinor: plan.paypalPriceMinor,
    description: `${plan.name} — AgriLoop Premium`,
    buyerEmail: user.email,
  });

  if (!result.ok) return result;
  return ok({ orderId: result.data.id });
}

export async function capturePaypalOrderAction(orderId: string): Promise<ServiceResult<null>> {
  const { user } = await requireSession();

  const result = await paymentService.capture(orderId);
  if (!result.ok) return result;

  // Authorization comes from PayPal's own response, never from the client.
  const { userId, planId } = result.data.metadata ?? {};
  if (!userId || !planId || userId !== user.id) {
    console.error('[agriloop:premium] captured PayPal order metadata mismatch', {
      orderId,
      expectedUser: user.id,
      metadata: result.data.metadata,
    });
    return fail('conflict', 'This payment could not be matched to your account. Contact AgriLoop support.');
  }

  const plan = db.premium.planById(planId);
  if (!plan) return fail('not_found', 'That plan no longer exists. Contact AgriLoop support with your receipt.');

  db.premium.grantSubscription(user.id, plan.id, periodEndFor(plan), 'paypal', result.data.reference);

  await notificationService.notify({
    userId: user.id,
    type: 'SUBSCRIPTION',
    title: 'AgriLoop Premium is active',
    body: `Your ${plan.name} subscription is now active.`,
    href: '/premium',
  });

  revalidatePath('/premium');
  revalidatePath('/premium/start');
  return ok(null);
}
