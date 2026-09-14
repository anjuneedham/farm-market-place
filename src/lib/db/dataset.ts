import type {
  AcademyCourse,
  AcademyTrack,
  AnalyticsEvent,
  BusinessProfile,
  BuyerProfile,
  BuyerRequest,
  Category,
  Comment,
  Community,
  CommunityCategory,
  CommunityPost,
  Conversation,
  Country,
  Discount,
  FarmProfile,
  FarmUpdate,
  Favorite,
  Lesson,
  LessonProgress,
  Listing,
  Message,
  Notification,
  Order,
  OrderItem,
  PostLike,
  PremiumBenefit,
  PriceTier,
  Product,
  Referral,
  Region,
  Report,
  RequestResponse,
  Review,
  SearchQueryLog,
  SessionRecord,
  ShoppingList,
  ShoppingListItem,
  Subscription,
  SubscriptionPlan,
  User,
  UserBlock,
  Verification,
} from '@/lib/types';

/**
 * The complete shape of AgriLoop's data.
 *
 * Each key maps 1:1 to a model in prisma/schema.prisma. The in-memory data
 * source holds this whole object; the Prisma data source will satisfy the same
 * repository methods per collection.
 */
export type DataSet = {
  countries: Country[];
  regions: Region[];
  communities: Community[];

  users: User[];
  sessions: SessionRecord[];
  farms: FarmProfile[];
  farmUpdates: FarmUpdate[];
  businesses: BusinessProfile[];
  buyers: BuyerProfile[];

  categories: Category[];
  products: Product[];
  listings: Listing[];
  priceTiers: PriceTier[];

  buyerRequests: BuyerRequest[];
  requestResponses: RequestResponse[];

  orders: Order[];
  orderItems: OrderItem[];
  reviews: Review[];
  verifications: Verification[];
  reports: Report[];
  userBlocks: UserBlock[];

  conversations: Conversation[];
  messages: Message[];

  favorites: Favorite[];
  shoppingLists: ShoppingList[];
  shoppingListItems: ShoppingListItem[];

  communityCategories: CommunityCategory[];
  posts: CommunityPost[];
  comments: Comment[];
  postLikes: PostLike[];

  academyTracks: AcademyTrack[];
  academyCourses: AcademyCourse[];
  lessons: Lesson[];
  lessonProgress: LessonProgress[];

  subscriptionPlans: SubscriptionPlan[];
  premiumBenefits: PremiumBenefit[];
  subscriptions: Subscription[];
  discounts: Discount[];

  notifications: Notification[];
  referrals: Referral[];
  analyticsEvents: AnalyticsEvent[];
  searchQueries: SearchQueryLog[];
};

export function emptyDataSet(): DataSet {
  return {
    countries: [],
    regions: [],
    communities: [],
    users: [],
    sessions: [],
    farms: [],
    farmUpdates: [],
    businesses: [],
    buyers: [],
    categories: [],
    products: [],
    listings: [],
    priceTiers: [],
    buyerRequests: [],
    requestResponses: [],
    orders: [],
    orderItems: [],
    reviews: [],
    verifications: [],
    reports: [],
    userBlocks: [],
    conversations: [],
    messages: [],
    favorites: [],
    shoppingLists: [],
    shoppingListItems: [],
    communityCategories: [],
    posts: [],
    comments: [],
    postLikes: [],
    academyTracks: [],
    academyCourses: [],
    lessons: [],
    lessonProgress: [],
    subscriptionPlans: [],
    premiumBenefits: [],
    subscriptions: [],
    discounts: [],
    notifications: [],
    referrals: [],
    analyticsEvents: [],
    searchQueries: [],
  };
}
