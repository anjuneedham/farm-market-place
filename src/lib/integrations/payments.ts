import {
  type CheckoutInput,
  type PaymentRecord,
  type PaymentService,
  type PayoutInput,
  type PayoutRecord,
  type ServiceResult,
  notConfigured,
} from './types';

/**
 * The marketplace flow is still discover → contact → negotiate → arrange
 * payment → complete, off-platform — this class is what call sites fall back
 * to when no payment provider is configured (see PayPalPaymentService for the
 * one provider that is actually wired up, used for Premium checkout).
 *
 * This implementation exists so that every call site is already written against
 * the interface. Adding a second provider (Stripe, a local rail, escrow) means
 * implementing PaymentService and selecting it in index.ts — no call site changes.
 */
export class UnavailablePaymentService implements PaymentService {
  isConfigured(): boolean {
    return false;
  }

  status(): string {
    return 'Online payments are not enabled. Buyers and sellers arrange payment directly.';
  }

  supportedCurrencies(): readonly string[] {
    return [];
  }

  async createCheckout(_input: CheckoutInput): Promise<ServiceResult<never>> {
    return notConfigured('Online payment');
  }

  async capture(_reference: string): Promise<ServiceResult<PaymentRecord>> {
    return notConfigured('Online payment');
  }

  async refund(_reference: string, _amountMinor?: number): Promise<ServiceResult<PaymentRecord>> {
    return notConfigured('Online payment');
  }

  async payout(_input: PayoutInput): Promise<ServiceResult<PayoutRecord>> {
    return notConfigured('Seller payouts');
  }
}
