import type { Discount, PremiumBenefit, SubscriptionPlan } from '@/lib/types';
import { daysAhead } from './helpers';

/**
 * Premium plans and benefits.
 *
 * Prices live here as SEED DATA ONLY — they are admin-editable rows, and no
 * application code reads a hardcoded subscription price. Adding a market means
 * adding plan rows in that country's currency; nothing else changes.
 * See docs/PREMIUM_STRATEGY.md §4.
 */

export function seedPlans(): SubscriptionPlan[] {
  return [
    {
      id: 'plan_jm_farmer_monthly',
      countryCode: 'JM',
      name: 'AgriLoop Premium — Farmer',
      slug: 'farmer',
      audience: 'FARMER',
      interval: 'MONTHLY',
      priceMinor: 190000,
      currency: 'JMD',
      trialDays: 14,
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'plan_jm_farmer_yearly',
      countryCode: 'JM',
      name: 'AgriLoop Premium — Farmer (Yearly)',
      slug: 'farmer',
      audience: 'FARMER',
      interval: 'YEARLY',
      priceMinor: 1900000,
      currency: 'JMD',
      trialDays: 14,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'plan_jm_buyer_monthly',
      countryCode: 'JM',
      name: 'AgriLoop Premium — Buyer',
      slug: 'buyer',
      audience: 'BUYER',
      interval: 'MONTHLY',
      priceMinor: 145000,
      currency: 'JMD',
      trialDays: 14,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'plan_jm_buyer_yearly',
      countryCode: 'JM',
      name: 'AgriLoop Premium — Buyer (Yearly)',
      slug: 'buyer',
      audience: 'BUYER',
      interval: 'YEARLY',
      priceMinor: 1450000,
      currency: 'JMD',
      trialDays: 14,
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'plan_jm_business_monthly',
      countryCode: 'JM',
      name: 'AgriLoop Premium — Business',
      slug: 'business',
      audience: 'BUSINESS',
      interval: 'MONTHLY',
      priceMinor: 320000,
      currency: 'JMD',
      trialDays: 14,
      isActive: true,
      sortOrder: 4,
    },
  ];
}

type BenefitSeed = [
  audience: PremiumBenefit['audience'],
  category: PremiumBenefit['category'],
  featureKey: string,
  title: string,
  description: string,
  alwaysFree?: boolean,
];

const BENEFITS: BenefitSeed[] = [
  // Farmer — make money
  [
    'FARMER',
    'MAKE_MONEY',
    'featured_listings',
    'Featured listings',
    'Your listings appear in the featured rail on the marketplace and at the top of your parish, clearly labelled as featured.',
  ],
  [
    'FARMER',
    'MAKE_MONEY',
    'buyer_request_alerts',
    'Buyer request alerts',
    'Get notified the moment a buyer posts a request matching what you grow, in your parish. Most requests are answered within a day.',
  ],
  [
    'FARMER',
    'MAKE_MONEY',
    'advanced_analytics',
    'Sales and demand analytics',
    'See which listings are viewed, saved and messaged, which products buyers are asking about, and where your interest is coming from.',
  ],
  [
    'FARMER',
    'MAKE_MONEY',
    'marketing_tools',
    'Marketing tools',
    'Share cards for your listings and farm page, built for WhatsApp and social.',
  ],
  // Farmer — better access
  [
    'FARMER',
    'BETTER_ACCESS',
    'premium_badge',
    'Premium badge',
    'A Premium badge on your farm page and every listing.',
  ],
  [
    'FARMER',
    'BETTER_ACCESS',
    'inventory_tools',
    'Inventory tools',
    'Track quantity across listings so availability stays accurate without manual editing.',
  ],
  [
    'FARMER',
    'BETTER_ACCESS',
    'market_intelligence',
    'Market intelligence',
    'Demand and price signals for your products and parish, shown only once there is enough real data to be meaningful.',
  ],
  // Buyer — save money
  [
    'BUYER',
    'SAVE_MONEY',
    'member_pricing',
    'Member pricing',
    'Member-only prices on eligible listings from participating sellers.',
  ],
  [
    'BUYER',
    'SAVE_MONEY',
    'bulk_discounts',
    'Extra bulk tier',
    'An additional bulk price tier on top of the seller’s published wholesale pricing.',
  ],
  [
    'BUYER',
    'SAVE_MONEY',
    'savings_dashboard',
    'Premium Savings dashboard',
    'Month-to-date and lifetime savings, calculated from your completed AgriLoop purchases.',
  ],
  // Buyer — better access
  [
    'BUYER',
    'BETTER_ACCESS',
    'early_access_deals',
    'Early access to deals',
    'See new deals and new supply before free members.',
  ],
  [
    'BUYER',
    'BETTER_ACCESS',
    'advanced_requests',
    'Advanced buyer requests',
    'Post more open requests at once, keep them visible for longer, and get priority placement in the request feed.',
  ],
  [
    'BUYER',
    'BETTER_ACCESS',
    'saved_lists',
    'Unlimited shopping lists',
    'Reusable purchasing lists for recurring orders. Free members get one list.',
  ],
  // Education
  [
    'ALL',
    'EDUCATION',
    'premium_education',
    'Advanced courses and templates',
    'Business templates, farm calculators, advanced guides and expert sessions.',
  ],
  [
    'ALL',
    'EDUCATION',
    'academy_core',
    'The core Academy stays free',
    'Getting Started, Crop Production, Livestock and Farm Business fundamentals are free for everyone, forever.',
    true,
  ],
  [
    'ALL',
    'EDUCATION',
    'community_access',
    'AgriLoop Community stays free',
    'Every community category, reading and posting, free for everyone, forever.',
    true,
  ],
  // Support
  [
    'ALL',
    'SUPPORT',
    'priority_support',
    'Priority support',
    'Your questions to the AgriLoop team go to the front of the queue.',
  ],
];

export function seedBenefits(): PremiumBenefit[] {
  return BENEFITS.map(([audience, category, featureKey, title, description, alwaysFree], index) => ({
    id: `benefit_${featureKey}`,
    audience,
    category,
    title,
    description,
    featureKey,
    alwaysFree: alwaysFree ?? false,
    isActive: true,
    sortOrder: index,
  }));
}

export function seedDiscounts(): Discount[] {
  return [
    {
      id: 'discount_bulk_provisions',
      code: 'PROVISIONS10',
      label: '10% off ground provisions above 200 lbs',
      kind: 'PERCENT',
      value: 10,
      premiumOnly: true,
      categoryId: 'cat_root-crops',
      countryCode: 'JM',
      redemptions: 0,
      startsAt: new Date().toISOString(),
      endsAt: daysAhead(60),
      isActive: true,
    },
    {
      id: 'discount_inputs',
      code: 'INPUTS5',
      label: '5% off agricultural supplies',
      kind: 'PERCENT',
      value: 5,
      premiumOnly: true,
      categoryId: 'cat_agricultural-supplies',
      countryCode: 'JM',
      redemptions: 0,
      startsAt: new Date().toISOString(),
      endsAt: daysAhead(90),
      isActive: true,
    },
  ];
}
