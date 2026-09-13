import type { Comment, CommunityCategory, CommunityPost, PostLike } from '@/lib/types';
import { daysAgo, slugify } from './helpers';

const CATEGORIES: Array<[name: string, icon: string, description: string]> = [
  ['Ask the Community', 'message-circle-question', 'Any farming question. Somebody here has faced it before.'],
  ['Farming Tips', 'lightbulb', 'Practical things that worked on real Jamaican farms.'],
  ['Pest & Disease Help', 'bug', 'Identify what is attacking your crop and what to do about it.'],
  ['New Farmers', 'sprout', 'Starting out? Ask the questions you think are too basic. They are not.'],
  ['Farm Business', 'line-chart', 'Pricing, record keeping, customers and getting paid.'],
  ['Equipment', 'wrench', 'Tools, machinery, repairs and who to call.'],
  ['Weather & Conditions', 'cloud-rain', 'Rain, drought and what it is doing to your parish right now.'],
  ['Buyers & Markets', 'store', 'Where produce is moving and who is buying.'],
  ['Community Events', 'calendar', 'Field days, training, farm store openings and meetings.'],
];

type PostSeed = {
  category: string;
  author: string;
  title: string;
  body: string;
  tags: string[];
  daysAgo: number;
  likes: number;
  pinned?: boolean;
  comments: Array<{ author: string; body: string; hoursAfter: number }>;
};

const POSTS: PostSeed[] = [
  {
    category: 'pest-and-disease-help',
    author: 'user_farmer_green-valley-farm',
    title: 'Leaves curling and yellowing on young tomato — what am I looking at?',
    body: `Three weeks after transplant a section of the field started curling at the growing point. Leaves are cupping upward and going pale along the veins. Whitefly is present, I can shake the plants and see them come up.\n\nThe curl is worst on the row nearest the old crop I left standing too long. I am fairly sure that is my mistake.\n\nWhat I am doing now:\n\n- Pulled and burned the worst plants rather than leaving them in the field\n- Yellow sticky traps through the rows\n- Cleared the volunteer tomato and the weed along the edge\n\nIs there anything worth trying on the plants already showing it, or is roguing the only answer?`,
    tags: ['tomato', 'whitefly', 'virus'],
    daysAgo: 2,
    likes: 14,
    comments: [
      {
        author: 'user_farmer_spaldings-greenhouse-co-op',
        body: 'Once curl is showing, the affected plant does not come back. Roguing and burning is right. The thing that saves next crop is the gap — do not plant straight back into that block, and get the volunteers out of the whole area first.',
        hoursAfter: 3,
      },
      {
        author: 'user_farmer_mavis-bank-hill-farm',
        body: 'Sticky traps tell you the pressure but they will not control it. If you are transplanting again soon, raise the seedlings under fine mesh so they go into the field clean.',
        hoursAfter: 9,
      },
      {
        author: 'user_business_cornwall-veterinary-group',
        body: 'Worth having RADA look at it before you spend on chemicals — the extension officer for Manchester can confirm what it is, free.',
        hoursAfter: 26,
      },
    ],
  },
  {
    category: 'farm-business',
    author: 'user_farmer_santa-cruz-provision-grounds',
    title: 'How I finally worked out what my yam actually costs me to produce',
    body: `For years I priced yam by what the next man was asking. Last season I sat down and counted properly, and I was shocked at how close some of my sales were to break-even.\n\nWhat I counted per acre:\n\n- Planting material\n- Land preparation\n- Sticks and labour for sticking\n- Weeding rounds\n- Fertiliser\n- Digging labour\n- Transport to the buyer\n\nDividing that by the pounds I actually reaped — not what I hoped to reap — gave me a real cost per pound. It was 40% higher than I assumed, because I had never counted my own labour or the transport.\n\nSince then I do not go below that number. I lost one buyer. I kept the rest and I am making money on every load now.\n\nIf you have never done this, do it once. It changes what you are willing to accept.`,
    tags: ['pricing', 'record-keeping', 'yam'],
    daysAgo: 5,
    likes: 41,
    pinned: true,
    comments: [
      {
        author: 'user_farmer_trelawny-yam-grounds',
        body: 'The transport is what catches people. By the time you pay a truck to May Pen and back, a lot of the margin is gone and you never see it because it comes out of a different pocket.',
        hoursAfter: 5,
      },
      {
        author: 'user_farmer_portland-rain-farm',
        body: 'I have been meaning to do this for two seasons. Going to sit down this weekend with the receipts I have kept.',
        hoursAfter: 20,
      },
      {
        author: 'user_buyer_may-pen-wholesale-produce',
        body: 'Speaking as a buyer — a farmer who knows their cost and holds a firm price is easier to work with than one who guesses. We plan better when the price does not swing every week.',
        hoursAfter: 30,
      },
    ],
  },
  {
    category: 'buyers-and-markets',
    author: 'user_buyer_sunrise-fresh-market',
    title: 'What supermarkets actually need from a farmer (from the buying side)',
    body: `I buy for two supermarkets in St. Andrew. Farmers ask me all the time why I did not take their produce, so here it is plainly.\n\nIt is almost never about price. It is:\n\n1. **Consistency.** If you can only supply me in a good week, I cannot build a shelf around you.\n2. **Grading.** Put the same size in the same box. I cannot sell a box where half is one thing and half is another.\n3. **Answering the phone.** If I call Monday about Wednesday and hear nothing back until Thursday, I have already bought elsewhere.\n4. **Telling me early when you cannot supply.** I will not be upset. I will be upset if I find out when the truck does not arrive.\n\nDo those four things and you will get more business from me than the farmer who is $20 cheaper.`,
    tags: ['supermarket', 'selling', 'buyers'],
    daysAgo: 7,
    likes: 68,
    pinned: true,
    comments: [
      {
        author: 'user_farmer_bluefields-ridge-growers',
        body: 'Point 4 is the one farmers get wrong most. We tell our hotel buyers the moment we know we are short. Nobody has ever dropped us for it.',
        hoursAfter: 4,
      },
      {
        author: 'user_farmer_bog-walk-ground-and-citrus',
        body: 'Grading honestly took me longest to learn. Putting the small ones in with the big ones felt like getting more for them. It just made the buyer stop calling.',
        hoursAfter: 14,
      },
    ],
  },
  {
    category: 'new-farmers',
    author: 'user_farmer_portland-rain-farm',
    title: 'Starting on a half acre in Portland — what should I plant first?',
    body: `I have half an acre of family land above Fellowship that has been idle for years. Good rainfall, slope is moderate, soil looks decent.\n\nI can work it weekends and two evenings. I would rather start with something forgiving that I can actually sell than something that needs perfect management.\n\nWhat would you plant on a first half acre in that kind of rainfall?`,
    tags: ['getting-started', 'portland', 'crop-choice'],
    daysAgo: 4,
    likes: 22,
    comments: [
      {
        author: 'user_farmer_highgate-spice-gardens',
        body: 'With that rainfall and a slope, plantain and dasheen will forgive a lot. They are not the highest value but they will not punish you for missing a weekend.',
        hoursAfter: 6,
      },
      {
        author: 'user_farmer_santa-cruz-provision-grounds',
        body: 'Before you plant anything, find out who is buying in your area and what they are short of. Easier to grow into a buyer than to find one after.',
        hoursAfter: 11,
      },
      {
        author: 'user_farmer_mavis-bank-hill-farm',
        body: 'Start with a quarter of it. Everybody overestimates what they can manage on weekends, myself included.',
        hoursAfter: 28,
      },
    ],
  },
  {
    category: 'weather-and-conditions',
    author: 'user_farmer_bluefields-ridge-growers',
    title: 'Dry spell in south Westmoreland — how is everyone holding up?',
    body: `Three weeks with almost nothing here around Darliston. The young cabbage is holding but the beans are showing stress in the afternoons.\n\nWe are irrigating from the tank in the evening only, to cut the loss. Anybody in St. Elizabeth or Manchester seeing the same?`,
    tags: ['drought', 'westmoreland', 'irrigation'],
    daysAgo: 3,
    likes: 17,
    comments: [
      {
        author: 'user_farmer_santa-cruz-provision-grounds',
        body: 'Same here in Santa Cruz. We are mulching heavily with what we have and it is making a visible difference on the sweet potato.',
        hoursAfter: 2,
      },
      {
        author: 'user_business_aquaflow-irrigation-jamaica',
        body: 'Evening irrigation is the right call. If you are running hose, that is where most of the water is going — drip pays for itself fastest in exactly this kind of spell.',
        hoursAfter: 8,
      },
    ],
  },
  {
    category: 'equipment',
    author: 'user_farmer_clarendon-plains-poultry',
    title: 'Standby generator sizing for four poultry houses',
    body: `Power goes at least twice a month here and the fans stopping is the thing that frightens me most. Looking at a standby generator.\n\nFour houses, fans and lights only, no cold room. What size have people found adequate, and is it worth the extra for auto-changeover?`,
    tags: ['poultry', 'generator', 'power'],
    daysAgo: 9,
    likes: 11,
    comments: [
      {
        author: 'user_business_islandwide-agri-supplies',
        body: 'Auto-changeover is the part worth paying for. A generator you have to walk out and start at 2am is a generator that does not save the birds.',
        hoursAfter: 7,
      },
    ],
  },
  {
    category: 'farming-tips',
    author: 'user_farmer_spaldings-greenhouse-co-op',
    title: 'Getting through the wet season in a greenhouse without losing the crop',
    body: `Four seasons of protected cultivation in Spaldings, and the wet season is still where houses are won or lost. What has worked for our co-op:\n\n**Airflow beats everything.** Open the sides earlier in the morning than feels right. Trapped humidity at first light is where the disease starts.\n\n**Keep water off leaves.** If you are still overhead watering in a house, that is the first change to make.\n\n**Space the plants further than the book says.** We lost a whole house to crowding in our second year.\n\n**Walk the house daily.** Not to work — to look. You will catch things a week earlier.\n\nNone of this is expensive. It is mostly habit.`,
    tags: ['greenhouse', 'wet-season', 'disease'],
    daysAgo: 12,
    likes: 35,
    comments: [
      {
        author: 'user_farmer_green-valley-farm',
        body: 'The daily walk is the one. I started doing a slow round before breakfast and I catch things far earlier than I used to.',
        hoursAfter: 12,
      },
      {
        author: 'user_farmer_mavis-bank-hill-farm',
        body: 'Spacing — yes. It feels like wasting house but the yield per house went up when we spread out.',
        hoursAfter: 22,
      },
    ],
  },
  {
    category: 'ask-the-community',
    author: 'user_farmer_yallahs-goat-farm',
    title: 'Best age to sell goats — live weight or wait?',
    body: `I have been selling at around nine months because that is when the cash is needed. A neighbour says I am leaving money on the table holding them past that.\n\nFor those selling live weight, where do you find the break-even between feed cost and the price you get?`,
    tags: ['goats', 'livestock', 'selling'],
    daysAgo: 6,
    likes: 9,
    comments: [
      {
        author: 'user_business_cornwall-veterinary-group',
        body: 'It depends on your pasture. On good pasture, holding is nearly free and usually pays. If you are buying feed to hold them, the maths turns against you quickly.',
        hoursAfter: 9,
      },
    ],
  },
  {
    category: 'community-events',
    author: 'user_admin',
    title: 'Field day at Bodles — open to all farmers',
    body: `Posting this for anyone who has not seen it: there is an open field day at Bodles Research Station later this month covering protected cultivation and irrigation.\n\nFree to attend. If you have been thinking about greenhouse or drip, it is worth the trip.\n\nIf you go, come back and post what you learned — plenty of farmers here cannot make the trip.`,
    tags: ['events', 'training'],
    daysAgo: 8,
    likes: 26,
    comments: [
      {
        author: 'user_farmer_bog-walk-ground-and-citrus',
        body: 'Bog Walk to Bodles is close enough. I will go and report back.',
        hoursAfter: 16,
      },
    ],
  },
  {
    category: 'farm-business',
    author: 'user_farmer_anchovy-apiary',
    title: 'Selling to hotels: what changed when I stopped selling by the roadside',
    body: `I sold honey at the roadside for four years. Good weeks and bad weeks, and no way to plan.\n\nWhat changed it was one hotel that wanted 40 bottles a month, every month. That single account is steadier than everything the roadside ever gave me.\n\nWhat I had to fix first:\n\n- Consistent bottles and labels, every time\n- Being able to say yes to the same amount every month\n- An invoice that looked like an invoice\n\nThe honey did not change at all. The presentation and the reliability did.`,
    tags: ['hotels', 'selling', 'honey'],
    daysAgo: 14,
    likes: 52,
    comments: [
      {
        author: 'user_buyer_rose-hall-bay-hotel',
        body: 'From the hotel side — the invoice point is real. Small suppliers often lose the account over paperwork, not product.',
        hoursAfter: 10,
      },
      {
        author: 'user_farmer_highgate-spice-gardens',
        body: 'This is encouraging. We have been trying to move our pimento the same direction.',
        hoursAfter: 30,
      },
    ],
  },
  {
    category: 'farming-tips',
    author: 'user_farmer_bog-walk-ground-and-citrus',
    title: 'Callaloo: cutting for regrowth instead of pulling',
    body: `Small thing that doubled what I get off a callaloo bed.\n\nInstead of pulling the whole plant, cut about six inches above the ground and leave the base. It shoots again within two weeks and you get three or four cuts off one planting.\n\nFeed it lightly after each cut. That is the part people skip and then wonder why the third cut is poor.`,
    tags: ['callaloo', 'harvesting'],
    daysAgo: 16,
    likes: 31,
    comments: [
      {
        author: 'user_farmer_portland-rain-farm',
        body: 'Been doing this a while — the feeding after each cut is definitely what makes the difference.',
        hoursAfter: 18,
      },
    ],
  },
  {
    category: 'buyers-and-markets',
    author: 'user_buyer_harbour-street-kitchen',
    title: 'Restaurant buyer here — ask me anything about supplying kitchens',
    body: `I run a 90-seat kitchen in downtown Kingston and I buy produce every week. There seems to be a lot of guessing on the farm side about what restaurants want, so ask me directly.\n\nThings I will answer honestly: what I pay, how I decide who to buy from, why I stop buying from someone, what would make me switch supplier.`,
    tags: ['restaurants', 'buyers', 'ama'],
    daysAgo: 10,
    likes: 47,
    comments: [
      {
        author: 'user_farmer_mavis-bank-hill-farm',
        body: 'How much notice do you need if we cannot fill an order that week?',
        hoursAfter: 3,
      },
      {
        author: 'user_buyer_harbour-street-kitchen',
        body: 'Honestly, any notice at all is fine. 24 hours and I can re-plan the menu. The problem is only ever silence.',
        hoursAfter: 5,
      },
      {
        author: 'user_farmer_black-river-fish-ponds',
        body: 'Do you prefer one supplier for everything or several specialists?',
        hoursAfter: 26,
      },
    ],
  },
  {
    category: 'new-farmers',
    author: 'user_buyer_lorna-bennett',
    title: 'Not a farmer — is this community still for me?',
    body: `I buy for my household and my mother's, mostly around Mandeville. I joined to find farmers directly.\n\nIs it alright for buyers to be in here, or is this space meant for farmers only?`,
    tags: ['community'],
    daysAgo: 18,
    likes: 19,
    comments: [
      {
        author: 'user_farmer_green-valley-farm',
        body: 'Very much so. Half the value of this place for me is hearing what buyers actually want instead of guessing.',
        hoursAfter: 2,
      },
      {
        author: 'user_admin',
        body: 'AgriLoop Community is open to everyone — farmers, buyers, businesses. It stays free for all of them.',
        hoursAfter: 4,
      },
    ],
  },
  {
    category: 'equipment',
    author: 'user_farmer_bluefields-ridge-growers',
    title: 'Sharing a tractor across nine farms — how we split the cost',
    body: `Nine farms in our group, none of us could justify a tractor alone. Here is the arrangement that has held for three years:\n\n- One member owns and maintains the machine\n- The group pays a per-acre rate that covers fuel, maintenance and a margin for the owner\n- A written rota during planting season, first-come outside it\n- Anyone who breaks it pays for it — agreed in writing before we started\n\nThe written part is what makes it survive. The first year we did it on a handshake and it nearly split the group.`,
    tags: ['tractor', 'cooperative', 'equipment'],
    daysAgo: 20,
    likes: 38,
    comments: [
      {
        author: 'user_business_clarendon-tractor-services',
        body: 'Sensible arrangement. For groups not ready to buy, hiring by the acre works out cheaper than people expect once you count maintenance.',
        hoursAfter: 15,
      },
    ],
  },
];

export type SeededCommunity = {
  communityCategories: CommunityCategory[];
  posts: CommunityPost[];
  comments: Comment[];
  postLikes: PostLike[];
};

export function seedCommunity(): SeededCommunity {
  const communityCategories: CommunityCategory[] = CATEGORIES.map(
    ([name, icon, description], index) => ({
      id: `ccat_${slugify(name)}`,
      name,
      slug: slugify(name),
      description,
      icon,
      sortOrder: index,
      isActive: true,
    }),
  );

  const posts: CommunityPost[] = [];
  const comments: Comment[] = [];
  const postLikes: PostLike[] = [];

  POSTS.forEach((seed, index) => {
    const id = `post_${index + 1}`;
    const lastComment = seed.comments.at(-1);
    const lastActivityHours = lastComment ? lastComment.hoursAfter : 0;

    posts.push({
      id,
      categoryId: `ccat_${seed.category}`,
      authorId: seed.author,
      title: seed.title,
      slug: `${slugify(seed.title)}`.slice(0, 70),
      body: seed.body,
      imageUrls: [],
      tags: seed.tags,
      status: 'PUBLISHED',
      isPinned: seed.pinned ?? false,
      commentCount: seed.comments.length,
      likeCount: seed.likes,
      lastActivityAt: daysAgo(seed.daysAgo, -lastActivityHours),
      isDemoData: true,
      createdAt: daysAgo(seed.daysAgo),
      updatedAt: daysAgo(seed.daysAgo),
    });

    seed.comments.forEach((comment, commentIndex) => {
      comments.push({
        id: `comment_${index + 1}_${commentIndex + 1}`,
        postId: id,
        authorId: comment.author,
        body: comment.body,
        status: 'PUBLISHED',
        isDemoData: true,
        createdAt: daysAgo(seed.daysAgo, -comment.hoursAfter),
      });
    });
  });

  return { communityCategories, posts, comments, postLikes };
}
