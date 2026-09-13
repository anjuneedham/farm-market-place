import { hashPassword } from '@/lib/auth/password';
import type {
  BusinessProfile,
  BuyerProfile,
  FarmProfile,
  User,
} from '@/lib/types';
import { communityId, daysAgo, regionId, slugify } from './helpers';

/**
 * Demo accounts. Every name here is fictional. All records carry
 * isDemoData: true and are badged in the UI, so no seeded farm, business or
 * buyer is ever presented as a real Jamaican enterprise.
 *
 * The shared demo password is documented in the README. It is only ever used
 * for seeded accounts and is rejected for real signups by length/obviousness
 * checks being irrelevant here — real users choose their own.
 */
export const DEMO_PASSWORD = 'agriloop-demo-2026';

type FarmerSeed = {
  person: string;
  farm: string;
  parish: string;
  community: string;
  tagline: string;
  story: string;
  specialties: string[];
  methods: FarmProfile['methods'];
  years: number;
  acres: number;
  verified: boolean;
  delivery: boolean;
  rating: [average: number, count: number];
};

const FARMERS: FarmerSeed[] = [
  {
    person: 'Deveon Grant',
    farm: 'Green Valley Farm',
    parish: 'manchester',
    community: 'Christiana',
    tagline: 'Hillside vegetables from Christiana, reaped to order.',
    story:
      'Green Valley has worked the same six acres above Christiana for three generations. We reap to order twice a week so produce leaves the field the morning it travels, and we sell to hotels, restaurants and households across Manchester and Kingston.',
    specialties: ['Tomato', 'Scotch Bonnet Pepper', 'Sweet Pepper', 'Cucumber'],
    methods: ['CONVENTIONAL', 'GREENHOUSE'],
    years: 18,
    acres: 6,
    verified: true,
    delivery: true,
    rating: [4.9, 127],
  },
  {
    person: 'Marsha Bewley',
    farm: 'Santa Cruz Provision Grounds',
    parish: 'st-elizabeth',
    community: 'Santa Cruz',
    tagline: 'Ground provisions from the breadbasket parish.',
    story:
      'We grow yellow yam, sweet potato and dasheen on the red earth around Santa Cruz. Most of our crop moves in bulk to market vendors and wholesalers, and we hold back a portion each week for direct buyers.',
    specialties: ['Yellow Yam', 'Sweet Potato', 'Dasheen', 'Pumpkin'],
    methods: ['CONVENTIONAL'],
    years: 22,
    acres: 14,
    verified: true,
    delivery: false,
    rating: [4.7, 64],
  },
  {
    person: 'Everton Sinclair',
    farm: 'Clarendon Plains Poultry',
    parish: 'clarendon',
    community: 'May Pen',
    tagline: 'Broilers and layers, batched weekly.',
    story:
      'A family poultry operation running four houses outside May Pen. We batch broilers every week and supply fresh eggs daily to shops, caterers and households.',
    specialties: ['Live Chicken', 'Dressed Chicken', 'Eggs'],
    methods: ['CONVENTIONAL'],
    years: 11,
    acres: 3,
    verified: true,
    delivery: true,
    rating: [4.8, 92],
  },
  {
    person: 'Anika Reid',
    farm: 'Spaldings Greenhouse Co-op',
    parish: 'manchester',
    community: 'Spaldings',
    tagline: 'Protected cultivation, consistent supply, year round.',
    story:
      'Eleven small farmers pooling four greenhouses in Spaldings. Protected cultivation lets us hold quality and quantity through the wet season, which is when restaurant buyers struggle most to source.',
    specialties: ['Tomato', 'Lettuce', 'Sweet Pepper', 'Pak Choi'],
    methods: ['GREENHOUSE', 'HYDROPONIC'],
    years: 7,
    acres: 2,
    verified: true,
    delivery: true,
    rating: [4.9, 41],
  },
  {
    person: 'Colin Whyte',
    farm: 'Trelawny Yam Grounds',
    parish: 'trelawny',
    community: 'Albert Town',
    tagline: 'Yellow yam from the yam capital.',
    story:
      'Albert Town is yam country and we have farmed it for 30 years. We dig to order for wholesalers and exporters and can supply consistently from October through to June.',
    specialties: ['Yellow Yam', 'Dasheen', 'Cassava'],
    methods: ['CONVENTIONAL'],
    years: 30,
    acres: 20,
    verified: true,
    delivery: false,
    rating: [4.6, 38],
  },
  {
    person: 'Shanice Palmer',
    farm: 'Portland Rain Farm',
    parish: 'portland',
    community: 'Fellowship',
    tagline: 'Banana, plantain and breadfruit from the wet side.',
    story:
      'Portland rain does the watering for us. We farm banana, plantain and breadfruit on the slopes above Fellowship and supply buyers across the north east.',
    specialties: ['Banana', 'Plantain', 'Breadfruit', 'Ackee'],
    methods: ['ORGANIC_PRACTICES'],
    years: 9,
    acres: 8,
    verified: false,
    delivery: false,
    rating: [4.5, 19],
  },
  {
    person: 'Milton Gayle',
    farm: 'Yallahs Goat Farm',
    parish: 'st-thomas',
    community: 'Yallahs',
    tagline: 'Pasture-raised goats and sheep.',
    story:
      'We raise Boer-cross goats and sheep on open pasture in St. Thomas. Animals are sold live, and we work with a licensed butcher for buyers who need them dressed.',
    specialties: ['Goat', 'Sheep'],
    methods: ['PASTURE_RAISED'],
    years: 15,
    acres: 26,
    verified: true,
    delivery: true,
    rating: [4.8, 33],
  },
  {
    person: 'Raheem Douglas',
    farm: 'Black River Fish Ponds',
    parish: 'st-elizabeth',
    community: 'Black River',
    tagline: 'Pond-raised tilapia, harvested to order.',
    story:
      'Six ponds on the Black River morass producing tilapia year round. We harvest to order so fish reach the buyer the same day they leave the water.',
    specialties: ['Tilapia'],
    methods: ['CONVENTIONAL'],
    years: 12,
    acres: 5,
    verified: false,
    delivery: true,
    rating: [4.4, 22],
  },
  {
    person: 'Patrice Morgan',
    farm: 'Anchovy Apiary',
    parish: 'st-james',
    community: 'Anchovy',
    tagline: 'Raw logwood and mixed-flora honey.',
    story:
      'Forty hives in the hills behind Anchovy. We bottle raw, unheated honey and sell wax to small producers. Logwood honey is available in the first half of the year.',
    specialties: ['Honey'],
    methods: ['ORGANIC_PRACTICES'],
    years: 6,
    acres: 1,
    verified: true,
    delivery: true,
    rating: [5.0, 27],
  },
  {
    person: 'Carlene Barrett',
    farm: 'Highgate Spice Gardens',
    parish: 'st-mary',
    community: 'Highgate',
    tagline: 'Pimento, ginger and turmeric from St. Mary.',
    story:
      'We grow and dry pimento, ginger and turmeric on family land near Highgate, supplying small processors and the export trade.',
    specialties: ['Pimento', 'Ginger', 'Turmeric'],
    methods: ['ORGANIC_PRACTICES', 'MIXED'],
    years: 13,
    acres: 11,
    verified: false,
    delivery: false,
    rating: [4.6, 15],
  },
  {
    person: 'Delroy Ennis',
    farm: 'Bog Walk Ground & Citrus',
    parish: 'st-catherine',
    community: 'Bog Walk',
    tagline: 'Citrus and ground provisions, twenty minutes from Spanish Town.',
    story:
      'Mixed farming in the Bog Walk gorge: citrus, callaloo, cassava and escallion. Our location makes us a reliable supplier for buyers in Spanish Town and Portmore.',
    specialties: ['Callaloo', 'Cassava', 'Escallion', 'Papaya'],
    methods: ['CONVENTIONAL'],
    years: 16,
    acres: 9,
    verified: false,
    delivery: true,
    rating: [4.3, 12],
  },
  {
    person: 'Nadine Clarke',
    farm: 'Mavis Bank Hill Farm',
    parish: 'st-andrew',
    community: 'Mavis Bank',
    tagline: 'Cool-climate greens above Kingston.',
    story:
      'At 900 metres the nights are cool enough for lettuce, pak choi and herbs that struggle on the plains. We deliver into Kingston three mornings a week.',
    specialties: ['Lettuce', 'Pak Choi', 'Thyme', 'Mint'],
    methods: ['ORGANIC_PRACTICES', 'GREENHOUSE'],
    years: 5,
    acres: 3,
    verified: true,
    delivery: true,
    rating: [4.9, 48],
  },
  {
    person: 'Fitzroy Wint',
    farm: 'Bluefields Ridge Growers',
    parish: 'westmoreland',
    community: 'Darliston',
    tagline: 'Vegetables and legumes from the Westmoreland hills.',
    story:
      'A grower group of nine farms around Darliston. Pooling our reaping lets us fill orders none of us could fill alone, which is how we supply hotels along the west coast.',
    specialties: ['String Bean', 'Gungo Peas', 'Cabbage', 'Carrot'],
    methods: ['CONVENTIONAL', 'MIXED'],
    years: 20,
    acres: 34,
    verified: true,
    delivery: true,
    rating: [4.7, 56],
  },
  {
    person: 'Simone Blake',
    farm: 'Moneague Highland Cattle',
    parish: 'st-ann',
    community: 'Moneague',
    tagline: 'Pasture cattle on St. Ann limestone.',
    story:
      'We run a small commercial herd on limestone pasture near Moneague, selling weaners and finished animals to butchers and farmers building their own herds.',
    specialties: ['Cattle'],
    methods: ['PASTURE_RAISED'],
    years: 24,
    acres: 62,
    verified: false,
    delivery: false,
    rating: [4.5, 9],
  },
];

type BuyerSeed = {
  person: string;
  display: string;
  type: BuyerProfile['type'];
  organisation?: string;
  parish: string;
  description: string;
  verified: boolean;
};

const BUYERS: BuyerSeed[] = [
  {
    person: 'Chef Andre Malcolm',
    display: 'Harbour Street Kitchen',
    type: 'RESTAURANT',
    organisation: 'Harbour Street Kitchen',
    parish: 'kingston',
    description:
      'A 90-seat restaurant in downtown Kingston sourcing produce weekly. We pay on delivery and prefer consistent suppliers over the lowest price.',
    verified: true,
  },
  {
    person: 'Kerri-Ann Foster',
    display: 'Rose Hall Bay Hotel',
    type: 'HOTEL',
    organisation: 'Rose Hall Bay Hotel',
    parish: 'st-james',
    description:
      'A 210-room property on the north coast. We buy produce, eggs and fish on standing weekly orders and welcome new suppliers who can hold quality.',
    verified: true,
  },
  {
    person: 'Trevor Salmon',
    display: 'Sunrise Fresh Market',
    type: 'SUPERMARKET',
    organisation: 'Sunrise Fresh Market',
    parish: 'st-andrew',
    description:
      'Two neighbourhood supermarkets in St. Andrew. We are actively looking for farmers who can supply consistently rather than once.',
    verified: true,
  },
  {
    person: 'Michelle Grant-Bailey',
    display: 'Island Catering Collective',
    type: 'CATERER',
    organisation: 'Island Catering Collective',
    parish: 'st-catherine',
    description:
      'Event catering across the corporate area. Our volumes spike around events, so we look for farmers who can handle short-notice bulk orders.',
    verified: false,
  },
  {
    person: 'Owen Ricketts',
    display: 'May Pen Wholesale Produce',
    type: 'WHOLESALER',
    organisation: 'May Pen Wholesale Produce',
    parish: 'clarendon',
    description:
      'We buy in bulk from farms across Clarendon and St. Elizabeth and distribute to vendors and shops across the island.',
    verified: true,
  },
  {
    person: 'Sister Joan Wilks',
    display: 'Portmore Community Kitchen',
    type: 'INSTITUTION',
    organisation: 'Portmore Community Kitchen',
    parish: 'st-catherine',
    description:
      'We prepare 600 meals a day for schools and elderly programmes in Portmore and buy ground provisions and vegetables weekly.',
    verified: false,
  },
  {
    person: 'Damion Hyatt',
    display: 'Kingston Spice Works',
    type: 'FOOD_MANUFACTURER',
    organisation: 'Kingston Spice Works',
    parish: 'kingston',
    description:
      'We make pepper sauces and seasonings for local retail. Scotch bonnet, pimento and escallion are our standing inputs.',
    verified: true,
  },
  {
    person: 'Lorna Bennett',
    display: 'Lorna Bennett',
    type: 'HOUSEHOLD',
    parish: 'manchester',
    description: 'Buying fresh for my household and my mother’s, mostly around Mandeville.',
    verified: false,
  },
];

type BusinessSeed = {
  person: string;
  business: string;
  type: BusinessProfile['type'];
  parish: string;
  community: string;
  tagline: string;
  description: string;
  services: string[];
  verified: boolean;
  rating: [number, number];
};

const BUSINESSES: BusinessSeed[] = [
  {
    person: 'Ryan Chung',
    business: 'Islandwide Agri Supplies',
    type: 'INPUT_SUPPLIER',
    parish: 'st-catherine',
    community: 'Spanish Town',
    tagline: 'Seeds, fertiliser and feed, islandwide delivery.',
    description:
      'We stock vegetable seed, fertiliser, poultry feed and crop protection, with delivery to every parish. Volume pricing for farmer groups.',
    services: ['Seed supply', 'Fertiliser', 'Poultry feed', 'Islandwide delivery'],
    verified: true,
    rating: [4.6, 74],
  },
  {
    person: 'Hopeton Barnes',
    business: 'Clarendon Tractor Services',
    type: 'SERVICES',
    parish: 'clarendon',
    community: 'May Pen',
    tagline: 'Ploughing, harrowing and land preparation by the acre.',
    description:
      'Four tractors covering Clarendon, St. Catherine and south Manchester. Booked by the acre, with a minimum of two acres per visit.',
    services: ['Ploughing', 'Harrowing', 'Ridging', 'Bush clearing'],
    verified: true,
    rating: [4.7, 51],
  },
  {
    person: 'Tashana Hall',
    business: 'AquaFlow Irrigation Jamaica',
    type: 'TECHNOLOGY',
    parish: 'manchester',
    community: 'Mandeville',
    tagline: 'Drip irrigation design, supply and installation.',
    description:
      'We design and install drip and micro-sprinkler systems for farms from a quarter acre upward, and service what we install.',
    services: ['System design', 'Drip supply', 'Installation', 'Servicing'],
    verified: true,
    rating: [4.8, 29],
  },
  {
    person: 'Dr. Kemar Levy',
    business: 'Cornwall Veterinary Group',
    type: 'SERVICES',
    parish: 'st-james',
    community: 'Montego Bay',
    tagline: 'Large and small animal veterinary care in the west.',
    description:
      'Farm visits across St. James, Hanover, Westmoreland and Trelawny. Herd health, vaccination programmes and emergency call-out.',
    services: ['Farm visits', 'Herd health', 'Vaccination', 'Emergency call-out'],
    verified: true,
    rating: [4.9, 36],
  },
  {
    person: 'Andre Foster',
    business: 'Highway Produce Haulage',
    type: 'TRANSPORT',
    parish: 'clarendon',
    community: 'May Pen',
    tagline: 'Refrigerated and open-tray produce transport.',
    description:
      'Moving produce from farm gate to market, hotel and port. Refrigerated and open-tray trucks, priced by trip and distance.',
    services: ['Refrigerated transport', 'Open-tray transport', 'Market runs', 'Port delivery'],
    verified: false,
    rating: [4.2, 18],
  },
];

export type SeededPeople = {
  users: User[];
  farms: FarmProfile[];
  businesses: BusinessProfile[];
  buyers: BuyerProfile[];
};

export function seedPeople(): SeededPeople {
  const passwordHash = hashPassword(DEMO_PASSWORD);
  const users: User[] = [];
  const farms: FarmProfile[] = [];
  const businesses: BusinessProfile[] = [];
  const buyers: BuyerProfile[] = [];

  const baseUser = (
    id: string,
    name: string,
    email: string,
    role: User['role'],
    createdDaysAgo: number,
    extra: Partial<User> = {},
  ): User => ({
    id,
    email,
    passwordHash,
    name,
    role,
    status: 'ACTIVE',
    isDemoData: true,
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(createdDaysAgo),
    lastSeenAt: daysAgo(Math.min(createdDaysAgo, 3)),
    ...extra,
  });

  users.push(
    baseUser('user_admin', 'AgriLoop Operations', 'admin@agriloop.demo', 'ADMIN', 200, {
      lastSeenAt: daysAgo(0),
    }),
  );

  FARMERS.forEach((seed, index) => {
    const farmSlug = slugify(seed.farm);
    const userId = `user_farmer_${farmSlug}`;
    const createdDaysAgo = 150 - index * 7;

    users.push(
      baseUser(userId, seed.person, `${farmSlug}@agriloop.demo`, 'FARMER', createdDaysAgo, {
        phone: '+1876-000-0000',
        whatsapp: index % 3 === 0 ? '+1876-000-0000' : undefined,
      }),
    );

    farms.push({
      id: `farm_${farmSlug}`,
      userId,
      name: seed.farm,
      slug: farmSlug,
      tagline: seed.tagline,
      story: seed.story,
      countryCode: 'JM',
      regionId: regionId(seed.parish),
      communityId: communityId(seed.parish, seed.community),
      yearsFarming: seed.years,
      farmSizeAcres: seed.acres,
      methods: seed.methods,
      specialties: seed.specialties,
      galleryUrls: [],
      acceptsPickup: true,
      acceptsDelivery: seed.delivery,
      deliveryNotes: seed.delivery ? 'Delivery available for orders above the minimum.' : undefined,
      isVerified: seed.verified,
      verifiedAt: seed.verified ? daysAgo(createdDaysAgo - 10) : undefined,
      ratingAverage: seed.rating[0],
      ratingCount: seed.rating[1],
      followerCount: 4 + index * 3,
      isDemoData: true,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(index),
    });
  });

  BUSINESSES.forEach((seed, index) => {
    const bizSlug = slugify(seed.business);
    const userId = `user_business_${bizSlug}`;
    const createdDaysAgo = 120 - index * 9;

    users.push(
      baseUser(userId, seed.person, `${bizSlug}@agriloop.demo`, 'BUSINESS', createdDaysAgo, {
        phone: '+1876-000-0000',
      }),
    );

    businesses.push({
      id: `business_${bizSlug}`,
      userId,
      name: seed.business,
      slug: bizSlug,
      type: seed.type,
      tagline: seed.tagline,
      description: seed.description,
      countryCode: 'JM',
      regionId: regionId(seed.parish),
      communityId: communityId(seed.parish, seed.community),
      servicesOffered: seed.services,
      isVerified: seed.verified,
      verifiedAt: seed.verified ? daysAgo(createdDaysAgo - 5) : undefined,
      ratingAverage: seed.rating[0],
      ratingCount: seed.rating[1],
      isDemoData: true,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(index),
    });
  });

  BUYERS.forEach((seed, index) => {
    const buyerSlug = slugify(seed.display);
    const userId = `user_buyer_${buyerSlug}`;
    const createdDaysAgo = 100 - index * 6;

    users.push(
      baseUser(userId, seed.person, `${buyerSlug}@agriloop.demo`, 'BUYER', createdDaysAgo),
    );

    buyers.push({
      id: `buyer_${buyerSlug}`,
      userId,
      displayName: seed.display,
      slug: buyerSlug,
      type: seed.type,
      organisation: seed.organisation,
      description: seed.description,
      countryCode: 'JM',
      regionId: regionId(seed.parish),
      isVerified: seed.verified,
      verifiedAt: seed.verified ? daysAgo(createdDaysAgo - 4) : undefined,
      ratingAverage: seed.verified ? 4.8 : 0,
      ratingCount: seed.verified ? 12 + index : 0,
      isDemoData: true,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(index),
    });
  });

  return { users, farms, businesses, buyers };
}
