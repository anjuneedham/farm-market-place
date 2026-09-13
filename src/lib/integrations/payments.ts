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
 * The MVP takes no payments. The marketplace flow is
 * discover → contact → negotiate → arrange payment → complete, off-platform.
 *
 * This implementation exists so that every call site is already written against
 * the interface. When a provider is added (Stripe, a local rail, escrow), it
 * implements PaymentService and is selected in index.ts — no call site changes.
 */
export class UnavailablePaymentService implements PaymentService {
  isConfigured(): boolean {
    return false;
  }

  status(): string {
    return 'Online payments are not enabled. Buyers and sellers arrange payment directly.';
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
