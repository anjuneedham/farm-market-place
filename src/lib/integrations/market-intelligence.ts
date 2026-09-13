import { db } from '@/lib/db/repositories';
import {
  type MarketIntelligenceService,
  type MarketSignal,
  type ServiceResult,
  fail,
  ok,
} from './types';

/**
 * Market intelligence, computed only from real platform data.
 *
 * The rule is absolute: no figure is shown until there are enough real
 * observations for it to mean something. "Sweet pepper demand is increasing in
 * Kingston" is a claim about the world, and inventing it would destroy the
 * credibility the rest of the product depends on.
 *
 * Below the threshold this returns `unavailable` and the UI says how many more
 * observations are needed.
 */
export class DataBackedMarketIntelligenceService implements MarketIntelligenceService {
  readonly minimumSampleSize = 12;

  isConfigured(): boolean {
    return true;
  }

  status(): string {
    return `Signals appear once a product has at least ${this.minimumSampleSize} active listings in the selected area.`;
  }

  async signalFor(productId: string, regionId?: string): Promise<ServiceResult<MarketSignal>> {
    const { items } = db.listings.search({ productId, regionId, perPage: 60 });
    const priced = items.filter((listing) => listing.priceMinor !== undefined);

    if (priced.length < this.minimumSampleSize) {
      return fail(
        'unavailable',
        `Not enough data yet — ${priced.length} of ${this.minimumSampleSize} listings needed before a price signal is meaningful.`,
      );
    }

    const currency = priced[0]?.currency ?? 'JMD';
    const total = priced.reduce((sum, listing) => sum + (listing.priceMinor ?? 0), 0);

    return ok({
      productId,
      regionId,
      averagePriceMinor: Math.round(total / priced.length),
      currency,
      listingCount: priced.length,
      requestCount: db.buyerRequests.search({ regionId, perPage: 60 }).total,
      observedAt: new Date().toISOString(),
    });
  }
}
