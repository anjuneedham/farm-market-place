import type {
  Conversation,
  Favorite,
  Message,
  Notification,
  Order,
  OrderItem,
  Review,
  ShoppingList,
  ShoppingListItem,
  Subscription,
  Verification,
} from '@/lib/types';
import { daysAgo, daysAhead } from './helpers';

type OrderSeed = {
  buyer: string;
  seller: string;
  items: Array<[title: string, unit: string, quantity: number, unitPriceMinor: number]>;
  status: Order['status'];
  fulfilment: Order['fulfilment'];
  daysAgo: number;
  /** Premium savings realised on this order, in minor units. */
  savedMinor?: number;
  review?: { rating: number; body: string };
};

const ORDERS: OrderSeed[] = [
  {
    buyer: 'harbour-street-kitchen',
    seller: 'green-valley-farm',
    items: [['Plum Tomato — Field Grown', 'lb', 200, 42000]],
    status: 'COMPLETED',
    fulfilment: 'DELIVERY',
    daysAgo: 6,
    savedMinor: 80000,
    review: {
      rating: 5,
      body: 'Delivered on time, graded properly, and told us the day before that one crate would be slightly short. That is all we ask for.',
    },
  },
  {
    buyer: 'kingston-spice-works',
    seller: 'green-valley-farm',
    items: [['Fresh Scotch Bonnet Pepper', 'lb', 150, 72000]],
    status: 'COMPLETED',
    fulfilment: 'PICKUP',
    daysAgo: 12,
    savedMinor: 195000,
    review: {
      rating: 5,
      body: 'Firm, well-coloured pepper and consistent between loads. We have moved to a standing monthly order.',
    },
  },
  {
    buyer: 'sunrise-fresh-market',
    seller: 'clarendon-plains-poultry',
    items: [['Fresh Brown Eggs — Daily', 'dozen', 120, 66000]],
    status: 'COMPLETED',
    fulfilment: 'DELIVERY',
    daysAgo: 4,
    savedMinor: 72000,
    review: {
      rating: 5,
      body: 'Daily delivery has not missed once in six weeks. Eggs arrive clean and properly crated.',
    },
  },
  {
    buyer: 'may-pen-wholesale-produce',
    seller: 'santa-cruz-provision-grounds',
    items: [['Yellow Yam — Bulk Supply', 'lb', 500, 34000]],
    status: 'COMPLETED',
    fulfilment: 'PICKUP',
    daysAgo: 9,
    savedMinor: 200000,
    review: {
      rating: 4,
      body: 'Good yam and fair bulk price. Loading took longer than agreed but the quality was there.',
    },
  },
  {
    buyer: 'rose-hall-bay-hotel',
    seller: 'anchovy-apiary',
    items: [['Raw Honey — 750ml Bottle', 'bottle', 40, 215000]],
    status: 'COMPLETED',
    fulfilment: 'DELIVERY',
    daysAgo: 15,
    savedMinor: 100000,
    review: {
      rating: 5,
      body: 'Consistent bottling and labelling, delivered to the property. Our guests notice the difference.',
    },
  },
  {
    buyer: 'rose-hall-bay-hotel',
    seller: 'bluefields-ridge-growers',
    items: [
      ['String Beans — Hotel Grade', 'lb', 80, 44000],
      ['Cabbage — Heads', 'lb', 120, 21000],
    ],
    status: 'CONFIRMED',
    fulfilment: 'DELIVERY',
    daysAgo: 1,
  },
  {
    buyer: 'harbour-street-kitchen',
    seller: 'mavis-bank-hill-farm',
    items: [
      ['Hill-Grown Lettuce', 'lb', 30, 52000],
      ['Fresh Thyme — Bundles', 'bundle', 20, 16000],
    ],
    status: 'READY',
    fulfilment: 'DELIVERY',
    daysAgo: 0,
  },
  {
    buyer: 'island-catering-collective',
    seller: 'bog-walk-ground-and-citrus',
    items: [['Callaloo — Bundled Fresh', 'bundle', 60, 18000]],
    status: 'PROCESSING',
    fulfilment: 'PICKUP',
    daysAgo: 2,
  },
  {
    buyer: 'portmore-community-kitchen',
    seller: 'santa-cruz-provision-grounds',
    items: [['Sweet Potato — Red Skin', 'lb', 300, 30000]],
    status: 'REQUESTED',
    fulfilment: 'DELIVERY',
    daysAgo: 1,
  },
  {
    buyer: 'harbour-street-kitchen',
    seller: 'black-river-fish-ponds',
    items: [['Pond-Raised Tilapia — Harvested to Order', 'lb', 80, 68000]],
    status: 'COMPLETED',
    fulfilment: 'DELIVERY',
    daysAgo: 20,
    review: {
      rating: 4,
      body: 'Fish arrived properly iced. The run from Black River means an early start, but they made the delivery window.',
    },
  },
];

export type SeededActivity = {
  orders: Order[];
  orderItems: OrderItem[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  favorites: Favorite[];
  shoppingLists: ShoppingList[];
  shoppingListItems: ShoppingListItem[];
  notifications: Notification[];
  verifications: Verification[];
  subscriptions: Subscription[];
};

export function seedActivity(): SeededActivity {
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const reviews: Review[] = [];

  ORDERS.forEach((seed, index) => {
    const id = `order_${index + 1}`;
    const buyerId = `user_buyer_${seed.buyer}`;
    const sellerId = `user_farmer_${seed.seller}`;
    const subtotal = seed.items.reduce((sum, [, , quantity, price]) => sum + quantity * price, 0);
    const saved = seed.savedMinor ?? 0;

    orders.push({
      id,
      reference: `AL-${String(1000 + index)}`,
      buyerId,
      sellerId,
      status: seed.status,
      // The MVP does not process payments; deals are arranged off-platform.
      paymentStatus: 'OFF_PLATFORM',
      fulfilment: seed.fulfilment,
      currency: 'JMD',
      subtotalMinor: subtotal,
      savedMinor: saved,
      totalMinor: subtotal - saved,
      completedAt: seed.status === 'COMPLETED' ? daysAgo(seed.daysAgo) : undefined,
      isDemoData: true,
      createdAt: daysAgo(seed.daysAgo + 2),
      updatedAt: daysAgo(seed.daysAgo),
    });

    seed.items.forEach(([title, unit, quantity, unitPrice], itemIndex) => {
      orderItems.push({
        id: `orderitem_${index + 1}_${itemIndex + 1}`,
        orderId: id,
        titleSnapshot: title,
        unit,
        quantity,
        unitPriceMinor: unitPrice,
        lineTotalMinor: quantity * unitPrice,
      });
    });

    // Reviews are only ever anchored to a COMPLETED order. See docs/USER_FLOWS.md §5.
    if (seed.review && seed.status === 'COMPLETED') {
      reviews.push({
        id: `review_${index + 1}`,
        orderId: id,
        authorId: buyerId,
        subjectUserId: sellerId,
        rating: seed.review.rating,
        body: seed.review.body,
        isHidden: false,
        isDemoData: true,
        createdAt: daysAgo(Math.max(0, seed.daysAgo - 1)),
      });
    }
  });

  const conversations: Conversation[] = [];
  const messages: Message[] = [];

  const thread = (
    index: number,
    a: string,
    b: string,
    listingId: string | undefined,
    lines: Array<[sender: 'a' | 'b', body: string, hoursAgo: number]>,
  ) => {
    const [participantAId, participantBId] = a < b ? [a, b] : [b, a];
    const id = `conversation_${index}`;
    const last = lines.at(-1);

    conversations.push({
      id,
      participantAId,
      participantBId,
      listingId,
      lastMessageAt: daysAgo(0, last ? last[2] : 0),
      lastMessagePreview: last?.[1].slice(0, 120),
      unreadForA: 0,
      unreadForB: 0,
      isDemoData: true,
      createdAt: daysAgo(0, lines[0]?.[2] ?? 24),
    });

    lines.forEach(([sender, body, hoursAgo], lineIndex) => {
      messages.push({
        id: `message_${index}_${lineIndex + 1}`,
        conversationId: id,
        senderId: sender === 'a' ? a : b,
        kind: 'TEXT',
        body,
        readAt: daysAgo(0, hoursAgo - 1),
        createdAt: daysAgo(0, hoursAgo),
      });
    });
  };

  thread(
    1,
    'user_buyer_harbour-street-kitchen',
    'user_farmer_green-valley-farm',
    'listing_2_plum-tomato-field-grown',
    [
      ['a', 'Good morning. Do you have 200 lbs of the plum tomato available for Tuesday?', 30],
      ['b', 'Morning. Yes — we reap Tuesday morning, so 200 lbs for Tuesday delivery is fine.', 28],
      ['a', 'What is the price at that quantity, and can you deliver to downtown Kingston?', 27],
      [
        'b',
        'At 200 lbs it is $420/lb, and yes, we deliver into Kingston. We can be there before 10am.',
        26,
      ],
      ['a', 'That works. Let us start this Tuesday and see how it goes.', 25],
    ],
  );

  thread(
    2,
    'user_buyer_sunrise-fresh-market',
    'user_farmer_clarendon-plains-poultry',
    'listing_8_fresh-brown-eggs-daily',
    [
      ['a', 'We need about 40 dozen a day across two stores in St. Andrew. Can you commit to that?', 20],
      [
        'b',
        'Yes. We already run a Kingston route so St. Andrew is no problem. At crate volume the price is $660/dozen.',
        18,
      ],
      ['a', 'Agreed. Start Monday and invoice us weekly.', 17],
    ],
  );

  thread(
    3,
    'user_buyer_rose-hall-bay-hotel',
    'user_farmer_anchovy-apiary',
    'listing_23_raw-honey-750ml-bottle',
    [
      ['a', 'Are you able to hold 40 bottles a month with consistent labelling?', 50],
      ['b', 'Yes — at 40 a month the case rate applies, $2,150 each. Labels are the same every batch.', 48],
      ['a', 'Perfect. We will take the first 40 this month.', 47],
    ],
  );

  const favorites: Favorite[] = [
    {
      id: 'favorite_1',
      userId: 'user_buyer_harbour-street-kitchen',
      kind: 'LISTING',
      targetId: 'listing_1_fresh-scotch-bonnet-pepper',
      createdAt: daysAgo(3),
    },
    {
      id: 'favorite_2',
      userId: 'user_buyer_harbour-street-kitchen',
      kind: 'FARM',
      targetId: 'farm_green-valley-farm',
      createdAt: daysAgo(5),
    },
    {
      id: 'favorite_3',
      userId: 'user_buyer_harbour-street-kitchen',
      kind: 'FARM',
      targetId: 'farm_mavis-bank-hill-farm',
      createdAt: daysAgo(2),
    },
    {
      id: 'favorite_4',
      userId: 'user_buyer_rose-hall-bay-hotel',
      kind: 'FARM',
      targetId: 'farm_bluefields-ridge-growers',
      createdAt: daysAgo(7),
    },
  ];

  const shoppingLists: ShoppingList[] = [
    {
      id: 'list_1',
      ownerId: 'user_buyer_harbour-street-kitchen',
      name: 'Weekly Restaurant Supply',
      notes: 'Standing order, delivered Tuesday morning.',
      isDemoData: true,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
    },
    {
      id: 'list_2',
      ownerId: 'user_buyer_rose-hall-bay-hotel',
      name: 'Wednesday Hotel Delivery',
      isDemoData: true,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(4),
    },
  ];

  const shoppingListItems: ShoppingListItem[] = [
    { id: 'li_1', listId: 'list_1', label: 'Tomato', quantity: 50, unit: 'lb', sortOrder: 0 },
    { id: 'li_2', listId: 'list_1', label: 'Onion', quantity: 30, unit: 'lb', sortOrder: 1 },
    { id: 'li_3', listId: 'list_1', label: 'Sweet pepper', quantity: 20, unit: 'lb', sortOrder: 2 },
    { id: 'li_4', listId: 'list_1', label: 'Eggs', quantity: 10, unit: 'crate', sortOrder: 3 },
    { id: 'li_5', listId: 'list_1', label: 'Callaloo', quantity: 15, unit: 'bundle', sortOrder: 4 },
    { id: 'li_6', listId: 'list_2', label: 'String beans', quantity: 80, unit: 'lb', sortOrder: 0 },
    { id: 'li_7', listId: 'list_2', label: 'Lettuce', quantity: 40, unit: 'lb', sortOrder: 1 },
    { id: 'li_8', listId: 'list_2', label: 'Cucumber', quantity: 50, unit: 'lb', sortOrder: 2 },
  ];

  const notifications: Notification[] = [
    {
      id: 'notification_1',
      userId: 'user_farmer_green-valley-farm',
      type: 'BUYER_REQUEST',
      title: 'New buyer request in Kingston',
      body: 'Harbour Street Kitchen is looking for 200 lbs tomato every week.',
      href: '/requests/200-lbs-tomato-every-week-1',
      createdAt: daysAgo(2),
    },
    {
      id: 'notification_2',
      userId: 'user_farmer_green-valley-farm',
      type: 'REVIEW',
      title: 'Kingston Spice Works left you a 5-star review',
      href: '/farmers/green-valley-farm',
      readAt: daysAgo(10),
      createdAt: daysAgo(11),
    },
    {
      id: 'notification_3',
      userId: 'user_buyer_harbour-street-kitchen',
      type: 'REQUEST_RESPONSE',
      title: '2 farmers responded to your tomato request',
      href: '/requests/200-lbs-tomato-every-week-1',
      createdAt: daysAgo(1),
    },
  ];

  const verifications: Verification[] = [
    {
      id: 'verification_1',
      subjectId: 'user_farmer_portland-rain-farm',
      kind: 'FARMER',
      status: 'PENDING',
      note: 'Requested verification after third completed order.',
      evidenceUrls: [],
      requestedAt: daysAgo(3),
    },
    {
      id: 'verification_2',
      subjectId: 'user_farmer_highgate-spice-gardens',
      kind: 'FARMER',
      status: 'PENDING',
      evidenceUrls: [],
      requestedAt: daysAgo(6),
    },
    {
      id: 'verification_3',
      subjectId: 'user_business_highway-produce-haulage',
      kind: 'BUSINESS',
      status: 'PENDING',
      evidenceUrls: [],
      requestedAt: daysAgo(8),
    },
  ];

  // Manually activated demo subscriptions — the MVP does not charge cards.
  const subscriptions: Subscription[] = [
    {
      id: 'subscription_1',
      userId: 'user_farmer_green-valley-farm',
      planId: 'plan_jm_farmer_monthly',
      status: 'ACTIVE',
      startedAt: daysAgo(60),
      currentPeriodEnd: daysAhead(12),
      cancelAtPeriodEnd: false,
      provider: 'manual',
      isDemoData: true,
    },
    {
      id: 'subscription_2',
      userId: 'user_farmer_spaldings-greenhouse-co-op',
      planId: 'plan_jm_farmer_monthly',
      status: 'ACTIVE',
      startedAt: daysAgo(40),
      currentPeriodEnd: daysAhead(20),
      cancelAtPeriodEnd: false,
      provider: 'manual',
      isDemoData: true,
    },
    {
      id: 'subscription_3',
      userId: 'user_buyer_harbour-street-kitchen',
      planId: 'plan_jm_buyer_monthly',
      status: 'ACTIVE',
      startedAt: daysAgo(90),
      currentPeriodEnd: daysAhead(8),
      cancelAtPeriodEnd: false,
      provider: 'manual',
      isDemoData: true,
    },
    {
      id: 'subscription_4',
      userId: 'user_buyer_rose-hall-bay-hotel',
      planId: 'plan_jm_buyer_monthly',
      status: 'ACTIVE',
      startedAt: daysAgo(75),
      currentPeriodEnd: daysAhead(16),
      cancelAtPeriodEnd: false,
      provider: 'manual',
      isDemoData: true,
    },
    {
      id: 'subscription_5',
      userId: 'user_farmer_anchovy-apiary',
      planId: 'plan_jm_farmer_yearly',
      status: 'ACTIVE',
      startedAt: daysAgo(120),
      currentPeriodEnd: daysAhead(245),
      cancelAtPeriodEnd: false,
      provider: 'manual',
      isDemoData: true,
    },
  ];

  return {
    orders,
    orderItems,
    reviews,
    conversations,
    messages,
    favorites,
    shoppingLists,
    shoppingListItems,
    notifications,
    verifications,
    subscriptions,
  };
}
