import type { BuyerRequest, RequestResponse } from '@/lib/types';
import { communityId, daysAgo, daysAhead, regionId, slugify } from './helpers';

type RequestSeed = {
  buyer: string;
  title: string;
  description: string;
  categorySlug?: string;
  quantity?: number;
  unit?: string;
  frequency: BuyerRequest['frequency'];
  budget?: number;
  negotiable?: boolean;
  parish: string;
  community?: string;
  postedDaysAgo: number;
  neededInDays?: number;
  responses: Array<{ farm: string; message: string; price?: number; quantity?: number }>;
};

/**
 * Buyer requests are the demand-first half of the marketplace: they work with
 * zero listings in the catalogue, which is how AgriLoop answers the cold-start
 * problem. See docs/PRODUCT_ARCHITECTURE.md §1.
 */
const REQUESTS: RequestSeed[] = [
  {
    buyer: 'harbour-street-kitchen',
    title: '200 lbs tomato every week',
    description:
      'We need a standing weekly supply of 200 lbs of tomato for our Kingston kitchen. Consistency matters more to us than the lowest price — we would rather pay fairly and know the delivery is coming every Tuesday. Payment on delivery.',
    categorySlug: 'vegetables',
    quantity: 200,
    unit: 'lb',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'kingston',
    community: 'Downtown Kingston',
    postedDaysAgo: 2,
    neededInDays: 7,
    responses: [
      {
        farm: 'spaldings-greenhouse-co-op',
        message:
          'We can hold 200 lbs a week from our greenhouses year round, including through the wet season. Happy to start with a trial delivery this Tuesday.',
        price: 55000,
        quantity: 200,
      },
      {
        farm: 'green-valley-farm',
        message:
          'We reap Tuesday and Friday and can cover 200 lbs weekly. Field-grown plum tomato. We deliver into Kingston already.',
        price: 42000,
        quantity: 200,
      },
    ],
  },
  {
    buyer: 'rose-hall-bay-hotel',
    title: 'Weekly produce basket for 210-room hotel',
    description:
      'Looking for one or two farms who can supply a weekly mixed produce order: lettuce, sweet pepper, cucumber, string beans and callaloo. We need reliable grading and delivery to Rose Hall on Wednesday mornings.',
    categorySlug: 'vegetables',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'st-james',
    community: 'Montego Bay',
    postedDaysAgo: 4,
    neededInDays: 10,
    responses: [
      {
        farm: 'bluefields-ridge-growers',
        message:
          'Our grower group already supplies hotels along the west coast. We can cover string beans, cabbage and carrot weekly and coordinate the rest.',
        quantity: 1,
      },
    ],
  },
  {
    buyer: 'kingston-spice-works',
    title: 'Scotch bonnet pepper — 500 lbs monthly',
    description:
      'We produce pepper sauce for local retail and need 500 lbs of scotch bonnet per month, consistently. Firm, well-coloured pepper. Open to working with two or three farms to secure the volume.',
    categorySlug: 'vegetables',
    quantity: 500,
    unit: 'lb',
    frequency: 'MONTHLY',
    budget: 72000,
    negotiable: true,
    parish: 'kingston',
    postedDaysAgo: 6,
    neededInDays: 21,
    responses: [
      {
        farm: 'green-valley-farm',
        message:
          'We have 75 lbs ready now and can build to 200 lbs a month within the next planting. Bulk price of $720/lb works at that volume.',
        price: 72000,
        quantity: 200,
      },
    ],
  },
  {
    buyer: 'may-pen-wholesale-produce',
    title: 'Yellow yam — bulk, weekly loads',
    description:
      'We are buying yellow yam in 500 lb loads weekly for distribution islandwide. We collect from the farm gate with our own transport.',
    categorySlug: 'root-crops',
    quantity: 500,
    unit: 'lb',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'clarendon',
    community: 'May Pen',
    postedDaysAgo: 3,
    responses: [
      {
        farm: 'santa-cruz-provision-grounds',
        message: 'We can load 500 lbs weekly through the season. Bulk rate $340/lb at that volume.',
        price: 34000,
        quantity: 500,
      },
      {
        farm: 'trelawny-yam-grounds',
        message:
          'Albert Town yam, dug to order. We can supply 500 lbs weekly October through June.',
        price: 36000,
        quantity: 500,
      },
    ],
  },
  {
    buyer: 'portmore-community-kitchen',
    title: 'Ground provisions for 600 meals a day',
    description:
      'We prepare meals for schools and elderly programmes in Portmore. We need sweet potato, dasheen and pumpkin weekly. Institutional buyer, we pay by invoice on 14 days.',
    categorySlug: 'root-crops',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'st-catherine',
    community: 'Portmore',
    postedDaysAgo: 8,
    responses: [],
  },
  {
    buyer: 'sunrise-fresh-market',
    title: 'Looking for egg suppliers — two stores',
    description:
      'We need a consistent egg supply for two supermarkets in St. Andrew. Roughly 40 dozen a day across both stores. Looking for a farm that can commit to daily or three-times-weekly delivery.',
    categorySlug: 'eggs',
    quantity: 40,
    unit: 'dozen',
    frequency: 'ONGOING',
    negotiable: true,
    parish: 'st-andrew',
    community: 'Half Way Tree',
    postedDaysAgo: 1,
    responses: [
      {
        farm: 'clarendon-plains-poultry',
        message:
          'We collect daily and already run a Kingston route. 40 dozen a day is comfortable for us — crate price $660/dozen.',
        price: 66000,
        quantity: 40,
      },
    ],
  },
  {
    buyer: 'island-catering-collective',
    title: 'Short-notice bulk vegetables for events',
    description:
      'Our volumes spike around events, usually with a week of notice. Looking for farms willing to be on call for bulk vegetable orders rather than a fixed weekly amount.',
    categorySlug: 'vegetables',
    frequency: 'ONGOING',
    negotiable: true,
    parish: 'st-catherine',
    community: 'Spanish Town',
    postedDaysAgo: 11,
    responses: [],
  },
  {
    buyer: 'harbour-street-kitchen',
    title: 'Fresh fish — snapper or tilapia, weekly',
    description:
      'Looking for 60–80 lbs of fish weekly. Tilapia or snapper. Must be delivered iced on the morning of service.',
    categorySlug: 'fish',
    quantity: 70,
    unit: 'lb',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'kingston',
    postedDaysAgo: 5,
    responses: [
      {
        farm: 'black-river-fish-ponds',
        message:
          'We harvest to order and can hold 80 lbs weekly. Black River to Kingston is a long run, so we would need to agree a delivery day.',
        price: 68000,
        quantity: 80,
      },
    ],
  },
  {
    buyer: 'rose-hall-bay-hotel',
    title: 'Raw honey for guest amenities',
    description:
      'We are moving our breakfast service to local honey. Looking for a supplier who can provide 40 bottles a month with consistent labelling.',
    categorySlug: 'honey',
    quantity: 40,
    unit: 'bottle',
    frequency: 'MONTHLY',
    budget: 215000,
    negotiable: true,
    parish: 'st-james',
    postedDaysAgo: 9,
    responses: [
      {
        farm: 'anchovy-apiary',
        message:
          'We are twenty minutes from Rose Hall. 40 bottles a month is within our capacity at the case rate of $2,150 each.',
        price: 215000,
        quantity: 40,
      },
    ],
  },
  {
    buyer: 'lorna-bennett',
    title: 'Weekly vegetable box around Mandeville',
    description:
      'Looking for a farm near Mandeville who would put together a weekly box of vegetables for two households. Happy to collect.',
    frequency: 'WEEKLY',
    negotiable: true,
    parish: 'manchester',
    community: 'Mandeville',
    postedDaysAgo: 13,
    responses: [],
  },
];

export type SeededRequests = {
  buyerRequests: BuyerRequest[];
  requestResponses: RequestResponse[];
};

export function seedBuyerRequests(): SeededRequests {
  const buyerRequests: BuyerRequest[] = [];
  const requestResponses: RequestResponse[] = [];

  REQUESTS.forEach((seed, index) => {
    const id = `request_${index + 1}`;
    buyerRequests.push({
      id,
      buyerId: `user_buyer_${seed.buyer}`,
      categoryId: seed.categorySlug ? `cat_${seed.categorySlug}` : undefined,
      title: seed.title,
      slug: `${slugify(seed.title)}-${index + 1}`,
      description: seed.description,
      quantity: seed.quantity,
      unit: seed.unit,
      frequency: seed.frequency,
      budgetMinor: seed.budget,
      budgetIsNegotiable: seed.negotiable ?? true,
      currency: 'JMD',
      countryCode: 'JM',
      regionId: regionId(seed.parish),
      communityId: seed.community ? communityId(seed.parish, seed.community) : undefined,
      neededBy: seed.neededInDays ? daysAhead(seed.neededInDays) : undefined,
      status: 'OPEN',
      responseCount: seed.responses.length,
      isDemoData: true,
      createdAt: daysAgo(seed.postedDaysAgo),
      updatedAt: daysAgo(seed.postedDaysAgo),
    });

    seed.responses.forEach((response, responseIndex) => {
      requestResponses.push({
        id: `response_${index + 1}_${responseIndex + 1}`,
        buyerRequestId: id,
        responderId: `user_farmer_${response.farm}`,
        message: response.message,
        quotedPriceMinor: response.price,
        currency: response.price ? 'JMD' : undefined,
        quotedQuantity: response.quantity,
        createdAt: daysAgo(Math.max(0, seed.postedDaysAgo - responseIndex - 1)),
      });
    });
  });

  return { buyerRequests, requestResponses };
}
