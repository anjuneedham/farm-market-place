/**
 * AgriLoop domain types.
 *
 * These mirror prisma/schema.prisma. The repository layer returns these shapes
 * regardless of which data source is bound, so nothing above the repository
 * layer knows whether it is talking to Postgres or to the in-memory adapter.
 */

// ── Geography ────────────────────────────────────────────────────────────────

export type Country = {
  code: string;
  name: string;
  currency: string;
  locale: string;
  dialCode: string;
  flagEmoji: string;
  /** "Parish" in Jamaica, "County" in Trinidad & Tobago. Drives all UI copy. */
  regionLabel: string;
  communityLabel: string;
  isLive: boolean;
  sortOrder: number;
};

export type Region = {
  id: string;
  countryCode: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  sortOrder: number;
  isActive: boolean;
};

export type Community = {
  id: string;
  regionId: string;
  name: string;
  slug: string;
  isActive: boolean;
};

// ── Identity ─────────────────────────────────────────────────────────────────

export const USER_ROLES = ['FARMER', 'BUYER', 'BUSINESS', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_DELETION';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  emailVerified?: string;
  lastSeenAt?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A user as exposed to the client. Never contains passwordHash or email. */
export type PublicUser = {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
};

// ── Profiles ─────────────────────────────────────────────────────────────────

export const FARMING_METHODS = [
  'CONVENTIONAL',
  'ORGANIC_PRACTICES',
  'GREENHOUSE',
  'HYDROPONIC',
  'MIXED',
  'PASTURE_RAISED',
] as const;
export type FarmingMethod = (typeof FARMING_METHODS)[number];

export type FarmProfile = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  tagline?: string;
  story?: string;
  countryCode: string;
  regionId: string;
  communityId?: string;
  latitude?: number;
  longitude?: number;
  yearsFarming?: number;
  farmSizeAcres?: number;
  methods: FarmingMethod[];
  specialties: string[];
  coverImageUrl?: string;
  logoUrl?: string;
  galleryUrls: string[];
  acceptsPickup: boolean;
  acceptsDelivery: boolean;
  deliveryNotes?: string;
  isVerified: boolean;
  verifiedAt?: string;
  ratingAverage: number;
  ratingCount: number;
  followerCount: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * A short storefront post from a farm — "First tomato harvest of the
 * season" — optionally pointing at one of the farm's own listings or a
 * buyer request it can fulfil. Deliberately not a CommunityPost: it belongs
 * to one farm's profile, has no comments/likes, and never appears in the
 * Community feed uninvited (docs/PRODUCT_ARCHITECTURE.md §2).
 */
export type FarmUpdate = {
  id: string;
  farmId: string;
  authorId: string;
  body: string;
  imageUrls: string[];
  listingId?: string;
  buyerRequestId?: string;
  isDemoData: boolean;
  createdAt: string;
};

export type FarmUpdateView = FarmUpdate & {
  listing?: Pick<ListingView, 'id' | 'slug' | 'title'>;
  buyerRequest?: Pick<BuyerRequestView, 'id' | 'slug' | 'title'>;
};

export const BUSINESS_TYPES = [
  'INPUT_SUPPLIER',
  'EQUIPMENT',
  'SERVICES',
  'TRANSPORT',
  'CONSULTING',
  'TECHNOLOGY',
  'PROCESSING',
  'OTHER',
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type BusinessProfile = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type: BusinessType;
  tagline?: string;
  description?: string;
  countryCode: string;
  regionId: string;
  communityId?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  servicesOffered: string[];
  coverImageUrl?: string;
  logoUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  ratingAverage: number;
  ratingCount: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

export const BUYER_TYPES = [
  'HOUSEHOLD',
  'RESTAURANT',
  'HOTEL',
  'SUPERMARKET',
  'WHOLESALER',
  'CATERER',
  'FOOD_MANUFACTURER',
  'INSTITUTION',
  'EXPORTER',
  'OTHER',
] as const;
export type BuyerType = (typeof BUYER_TYPES)[number];

export type BuyerProfile = {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  type: BuyerType;
  organisation?: string;
  description?: string;
  countryCode: string;
  regionId: string;
  logoUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  ratingAverage: number;
  ratingCount: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

// ── Catalogue ────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  synonyms: string[];
  description?: string;
  imageUrl?: string;
  defaultUnit: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
};

// ── Listings ─────────────────────────────────────────────────────────────────

export const LISTING_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'SOLD_OUT',
  'ARCHIVED',
  'REMOVED_BY_ADMIN',
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const PRICING_MODES = [
  'FIXED',
  'NEGOTIABLE',
  'CONTACT_FOR_PRICE',
  'WHOLESALE',
  'BULK_TIERED',
] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

export const AVAILABILITIES = [
  'IN_STOCK',
  'LIMITED',
  'PRE_ORDER',
  'SEASONAL',
  'OUT_OF_STOCK',
] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export type PriceTier = {
  id: string;
  listingId: string;
  minQuantity: number;
  /** Minor units. */
  unitPrice: number;
  label?: string;
};

export type Listing = {
  id: string;
  sellerId: string;
  productId?: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  imageUrls: string[];
  countryCode: string;
  regionId: string;
  communityId?: string;
  latitude?: number;
  longitude?: number;
  pricingMode: PricingMode;
  /** Minor units. Null when pricingMode is CONTACT_FOR_PRICE. */
  priceMinor?: number;
  currency: string;
  unit: string;
  quantity?: number;
  minOrder?: number;
  availability: Availability;
  availableFrom?: string;
  availableUntil?: string;
  wholesaleAvailable: boolean;
  status: ListingStatus;
  featuredUntil?: string;
  viewCount: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A listing joined with everything a card or detail page needs. */
export type ListingView = Listing & {
  seller: PublicUser;
  sellerKind: 'FARM' | 'BUSINESS' | 'OTHER';
  sellerName: string;
  sellerSlug?: string;
  sellerVerified: boolean;
  sellerRating: number;
  sellerRatingCount: number;
  sellerIsPremium: boolean;
  category: Category;
  parentCategory?: Category;
  region: Region;
  community?: Community;
  country: Country;
  priceTiers: PriceTier[];
  isFeatured: boolean;
};

// ── Buyer requests ───────────────────────────────────────────────────────────

export const REQUEST_FREQUENCIES = [
  'ONE_TIME',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'ONGOING',
] as const;
export type RequestFrequency = (typeof REQUEST_FREQUENCIES)[number];

export type RequestStatus = 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED' | 'REMOVED_BY_ADMIN';

export type BuyerRequest = {
  id: string;
  buyerId: string;
  categoryId?: string;
  title: string;
  slug: string;
  description: string;
  quantity?: number;
  unit?: string;
  frequency: RequestFrequency;
  budgetMinor?: number;
  budgetIsNegotiable: boolean;
  currency: string;
  countryCode: string;
  regionId: string;
  communityId?: string;
  neededBy?: string;
  status: RequestStatus;
  responseCount: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BuyerRequestView = BuyerRequest & {
  buyer: PublicUser;
  buyerName: string;
  buyerType: BuyerType;
  buyerVerified: boolean;
  region: Region;
  community?: Community;
  country: Country;
  category?: Category;
};

export type RequestResponse = {
  id: string;
  buyerRequestId: string;
  responderId: string;
  message: string;
  quotedPriceMinor?: number;
  currency?: string;
  quotedQuantity?: number;
  createdAt: string;
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'REQUESTED',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentStatus = 'OFF_PLATFORM' | 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type FulfilmentMethod = 'PICKUP' | 'DELIVERY' | 'MEET_AT_MARKET';

export type OrderItem = {
  id: string;
  orderId: string;
  listingId?: string;
  titleSnapshot: string;
  unit: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
};

export type Order = {
  id: string;
  reference: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfilment: FulfilmentMethod;
  currency: string;
  subtotalMinor: number;
  /** Premium savings realised on this order. Drives the savings dashboard. */
  savedMinor: number;
  totalMinor: number;
  notes?: string;
  scheduledFor?: string;
  completedAt?: string;
  cancelledReason?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderView = Order & {
  items: OrderItem[];
  buyerName: string;
  sellerName: string;
};

// ── Trust ────────────────────────────────────────────────────────────────────

export type Review = {
  id: string;
  orderId: string;
  authorId: string;
  subjectUserId: string;
  rating: number;
  body?: string;
  isHidden: boolean;
  isDemoData: boolean;
  createdAt: string;
};

export type ReviewView = Review & { author: PublicUser };

export type VerificationKind = 'FARMER' | 'BUSINESS' | 'BUYER';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export type Verification = {
  id: string;
  subjectId: string;
  kind: VerificationKind;
  status: VerificationStatus;
  reviewerId?: string;
  note?: string;
  evidenceUrls: string[];
  requestedAt: string;
  decidedAt?: string;
};

export const REPORT_TARGET_TYPES = [
  'USER',
  'LISTING',
  'POST',
  'COMMENT',
  'REVIEW',
  'BUYER_REQUEST',
] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'ACTIONED' | 'DISMISSED';

export type Report = {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type UserBlock = {
  id: string;
  actorId: string;
  targetId: string;
  createdAt: string;
};

// ── Messaging ────────────────────────────────────────────────────────────────

export type MessageKind = 'TEXT' | 'IMAGE' | 'LISTING_REF' | 'QUOTE' | 'SYSTEM';

export type Conversation = {
  id: string;
  participantAId: string;
  participantBId: string;
  listingId?: string;
  buyerRequestId?: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadForA: number;
  unreadForB: number;
  isDemoData: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  body: string;
  payload?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
};

export type ConversationView = Conversation & {
  other: PublicUser;
  otherDisplayName: string;
  unread: number;
  contextLabel?: string;
  contextHref?: string;
};

// ── Saving and lists ─────────────────────────────────────────────────────────

export type FavoriteKind = 'LISTING' | 'FARM' | 'BUSINESS' | 'BUYER_REQUEST' | 'POST';

export type Favorite = {
  id: string;
  userId: string;
  kind: FavoriteKind;
  targetId: string;
  createdAt: string;
};

export type ShoppingListItem = {
  id: string;
  listId: string;
  label: string;
  quantity?: number;
  unit?: string;
  listingId?: string;
  sortOrder: number;
};

export type ShoppingList = {
  id: string;
  ownerId: string;
  name: string;
  notes?: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShoppingListView = ShoppingList & { items: ShoppingListItem[] };

// ── Community ────────────────────────────────────────────────────────────────

export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'REMOVED_BY_ADMIN';

export type CommunityCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
};

export type CommunityPost = {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  slug: string;
  body: string;
  imageUrls: string[];
  tags: string[];
  status: PostStatus;
  isPinned: boolean;
  commentCount: number;
  likeCount: number;
  lastActivityAt: string;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostView = CommunityPost & {
  author: PublicUser;
  authorLabel: string;
  authorHref?: string;
  category: CommunityCategory;
  likedByMe: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  body: string;
  status: PostStatus;
  isDemoData: boolean;
  createdAt: string;
};

export type CommentView = Comment & {
  author: PublicUser;
  authorLabel: string;
  replies: CommentView[];
};

export type PostLike = { id: string; postId: string; userId: string; createdAt: string };

// ── Academy ──────────────────────────────────────────────────────────────────

export type ContentAccess = 'FREE' | 'PREMIUM';
export type LessonKind = 'ARTICLE' | 'VIDEO' | 'GUIDE' | 'DOWNLOAD';

export type AcademyTrack = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
};

export type AcademyCourse = {
  id: string;
  trackId: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl?: string;
  access: ContentAccess;
  level: string;
  estimatedMinutes: number;
  countryCode?: string;
  isPublished: boolean;
  sortOrder: number;
  isDemoData: boolean;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  kind: LessonKind;
  access: ContentAccess;
  body: string;
  mediaUrl?: string;
  resourceUrls: string[];
  minutes: number;
  sortOrder: number;
  isDemoData: boolean;
};

export type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  completedAt?: string;
  bookmarked: boolean;
  updatedAt: string;
};

// ── Premium ──────────────────────────────────────────────────────────────────

export type PlanAudience = 'FARMER' | 'BUYER' | 'BUSINESS' | 'ALL';
export type BillingInterval = 'MONTHLY' | 'YEARLY';

export type SubscriptionPlan = {
  id: string;
  countryCode: string;
  name: string;
  slug: string;
  audience: PlanAudience;
  interval: BillingInterval;
  /** Minor units, in `currency`. Admin-editable. Never hardcoded in application code. */
  priceMinor: number;
  currency: string;
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
  /**
   * Online checkout price, separate from `priceMinor`/`currency` because
   * PayPal cannot settle in most of AgriLoop's local currencies (JMD, TTD,
   * XCD, GYD, HTG, DOP are all unsupported). Null until an admin sets one —
   * the checkout button stays honestly unavailable for that plan until then.
   * See docs/PREMIUM_STRATEGY.md § Online checkout currency.
   */
  paypalPriceMinor?: number;
  paypalCurrency?: string;
};

export type BenefitCategory =
  | 'SAVE_MONEY'
  | 'MAKE_MONEY'
  | 'BETTER_ACCESS'
  | 'EDUCATION'
  | 'SUPPORT';

export type PremiumBenefit = {
  id: string;
  planId?: string;
  audience: PlanAudience;
  category: BenefitCategory;
  title: string;
  description: string;
  featureKey: string;
  /** Guarantees a resource can never be gated. See docs/PREMIUM_STRATEGY.md. */
  alwaysFree: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  provider: string;
  providerRef?: string;
  isDemoData: boolean;
};

export type Discount = {
  id: string;
  code: string;
  label: string;
  kind: 'PERCENT' | 'FIXED';
  value: number;
  currency?: string;
  premiumOnly: boolean;
  categoryId?: string;
  sellerId?: string;
  countryCode?: string;
  maxRedemptions?: number;
  redemptions: number;
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
};

// ── Notifications, growth, analytics ─────────────────────────────────────────

export const NOTIFICATION_TYPES = [
  'MESSAGE',
  'BUYER_REQUEST',
  'REQUEST_RESPONSE',
  'LISTING_ACTIVITY',
  'ORDER',
  'REVIEW',
  'COMMUNITY_REPLY',
  'ACADEMY_UPDATE',
  'PREMIUM_DEAL',
  'VERIFICATION',
  'SUBSCRIPTION',
  'SYSTEM',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  readAt?: string;
  createdAt: string;
};

export type Referral = {
  id: string;
  inviterId: string;
  inviteeId?: string;
  code: string;
  inviteeRole?: UserRole;
  status: 'PENDING' | 'JOINED' | 'QUALIFIED' | 'REWARDED';
  rewardNote?: string;
  createdAt: string;
  joinedAt?: string;
};

export type AnalyticsEvent = {
  id: string;
  type: string;
  entityType?: string;
  entityId?: string;
  countryCode?: string;
  userId?: string;
  occurredAt: string;
};

export type SearchQueryLog = {
  id: string;
  term: string;
  countryCode?: string;
  resultCount: number;
  occurredAt: string;
};

// ── Shared contracts ─────────────────────────────────────────────────────────

export type Paginated<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
};

export type PageParams = { page?: number; perPage?: number };
