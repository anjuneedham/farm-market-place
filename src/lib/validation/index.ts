import { z } from 'zod';
import {
  AVAILABILITIES,
  BUSINESS_TYPES,
  BUYER_TYPES,
  FARMING_METHODS,
  PRICING_MODES,
  REPORT_TARGET_TYPES,
  REQUEST_FREQUENCIES,
} from '@/lib/types';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@/lib/auth/password';

/**
 * The single definition of every input shape, used by server actions and route
 * handlers alike. Client-side validation exists only for responsiveness and is
 * never trusted (docs/SECURITY.md §3).
 */

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Enter your email address.')
  .max(254)
  .email('Enter a valid email address.');

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(MAX_PASSWORD_LENGTH);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(MAX_PASSWORD_LENGTH),
});

export const signUpSchema = z.object({
  name: trimmed(80).min(2, 'Enter your name.'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['FARMER', 'BUYER', 'BUSINESS']),
  countryCode: z.string().trim().length(2).toUpperCase(),
  regionId: z.string().trim().min(1, 'Choose your parish.'),
  // Role-specific, validated conditionally by the auth service.
  farmName: trimmed(80).optional(),
  communityId: z.string().trim().optional(),
  businessName: trimmed(80).optional(),
  businessType: z.enum(BUSINESS_TYPES).optional(),
  buyerType: z.enum(BUYER_TYPES).optional(),
  organisation: trimmed(80).optional(),
});

export const farmProfileSchema = z.object({
  name: trimmed(80).min(2, 'Enter your farm name.'),
  tagline: trimmed(140).optional(),
  story: trimmed(4000).optional(),
  regionId: z.string().trim().min(1, 'Choose your parish.'),
  communityId: z.string().trim().optional(),
  yearsFarming: z.coerce.number().int().min(0).max(100).optional(),
  farmSizeAcres: z.coerce.number().min(0).max(100_000).optional(),
  methods: z.array(z.enum(FARMING_METHODS)).max(6).default([]),
  specialties: z.array(trimmed(40)).max(12).default([]),
  acceptsPickup: z.coerce.boolean().default(true),
  acceptsDelivery: z.coerce.boolean().default(false),
  deliveryNotes: trimmed(280).optional(),
  whatsapp: trimmed(24).optional(),
});

export const buyerProfileSchema = z.object({
  displayName: trimmed(80).min(2, 'Enter a display name.'),
  type: z.enum(BUYER_TYPES),
  organisation: trimmed(80).optional(),
  description: trimmed(2000).optional(),
  regionId: z.string().trim().min(1, 'Choose your parish.'),
});

export const businessProfileSchema = z.object({
  name: trimmed(80).min(2, 'Enter your business name.'),
  type: z.enum(BUSINESS_TYPES),
  tagline: trimmed(140).optional(),
  description: trimmed(4000).optional(),
  regionId: z.string().trim().min(1, 'Choose your parish.'),
  communityId: z.string().trim().optional(),
  website: z.string().trim().url('Enter a valid web address.').max(200).optional().or(z.literal('')),
  servicesOffered: z.array(trimmed(40)).max(12).default([]),
});

/** Prices are minor units. Capped to catch a misplaced decimal before it ships. */
const priceMinorSchema = z.coerce.number().int().min(0).max(1_000_000_000);

export const listingSchema = z
  .object({
    title: trimmed(90).min(3, 'Give your listing a title.'),
    description: trimmed(4000).min(20, 'Describe what you are selling in a little more detail.'),
    categoryId: z.string().trim().min(1, 'Choose a category.'),
    productId: z.string().trim().optional(),
    regionId: z.string().trim().min(1, 'Choose a parish.'),
    communityId: z.string().trim().optional(),
    pricingMode: z.enum(PRICING_MODES),
    priceMinor: priceMinorSchema.optional(),
    unit: trimmed(20).min(1, 'Choose a unit.'),
    quantity: z.coerce.number().min(0).max(10_000_000).optional(),
    minOrder: z.coerce.number().min(0).max(10_000_000).optional(),
    availability: z.enum(AVAILABILITIES),
    wholesaleAvailable: z.coerce.boolean().default(false),
    imageUrls: z.array(z.string().trim().max(400)).max(8).default([]),
  })
  .refine(
    (value) => value.pricingMode === 'CONTACT_FOR_PRICE' || value.priceMinor !== undefined,
    { message: 'Enter a price, or choose "Contact for price".', path: ['priceMinor'] },
  );

export const priceTierSchema = z.object({
  minQuantity: z.coerce.number().min(0),
  unitPrice: priceMinorSchema,
  label: trimmed(40).optional(),
});

export const buyerRequestSchema = z.object({
  title: trimmed(90).min(5, 'Say what you need.'),
  description: trimmed(3000).min(20, 'Give farmers enough detail to respond usefully.'),
  categoryId: z.string().trim().optional(),
  quantity: z.coerce.number().min(0).max(10_000_000).optional(),
  unit: trimmed(20).optional(),
  frequency: z.enum(REQUEST_FREQUENCIES),
  budgetMinor: priceMinorSchema.optional(),
  budgetIsNegotiable: z.coerce.boolean().default(true),
  regionId: z.string().trim().min(1, 'Choose a parish.'),
  communityId: z.string().trim().optional(),
  neededBy: z.string().trim().optional(),
});

export const requestResponseSchema = z.object({
  buyerRequestId: z.string().trim().min(1),
  message: trimmed(2000).min(10, 'Tell the buyer what you can supply.'),
  quotedPriceMinor: priceMinorSchema.optional(),
  quotedQuantity: z.coerce.number().min(0).max(10_000_000).optional(),
});

export const postSchema = z.object({
  categoryId: z.string().trim().min(1, 'Choose a category.'),
  title: trimmed(140).min(5, 'Give your post a title.'),
  body: trimmed(10_000).min(20, 'Add a little more detail so people can help.'),
  tags: z.array(trimmed(24)).max(6).default([]),
  imageUrls: z.array(z.string().trim().max(400)).max(4).default([]),
});

export const commentSchema = z.object({
  postId: z.string().trim().min(1),
  parentId: z.string().trim().optional(),
  body: trimmed(4000).min(2, 'Write a comment.'),
});

export const messageSchema = z.object({
  conversationId: z.string().trim().min(1),
  body: trimmed(4000).min(1, 'Write a message.'),
});

export const startConversationSchema = z.object({
  recipientId: z.string().trim().min(1),
  listingId: z.string().trim().optional(),
  buyerRequestId: z.string().trim().optional(),
  body: trimmed(4000).min(1, 'Write a message.'),
});

export const reviewSchema = z.object({
  orderId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1, 'Choose a rating.').max(5),
  body: trimmed(2000).optional(),
});

export const reportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetId: z.string().trim().min(1),
  reason: trimmed(80).min(3, 'Choose a reason.'),
  details: trimmed(2000).optional(),
});

export const shoppingListSchema = z.object({
  name: trimmed(80).min(2, 'Name your list.'),
  notes: trimmed(500).optional(),
});

export const shoppingListItemSchema = z.object({
  listId: z.string().trim().min(1),
  label: trimmed(80).min(1, 'Add an item.'),
  quantity: z.coerce.number().min(0).max(1_000_000).optional(),
  unit: trimmed(20).optional(),
});

export const orderSchema = z.object({
  buyerId: z.string().trim().min(1, 'Choose a buyer.'),
  listingId: z.string().trim().min(1, 'Choose a listing.'),
  quantity: z.coerce.number().min(0.01, 'Enter a quantity.').max(10_000_000),
  fulfilment: z.enum(['PICKUP', 'DELIVERY', 'MEET_AT_MARKET']),
  notes: trimmed(1000).optional(),
});

export const searchParamsSchema = z.object({
  q: trimmed(120).optional(),
  country: z.string().trim().length(2).toUpperCase().optional(),
  region: z.string().trim().optional(),
  community: z.string().trim().optional(),
  category: z.string().trim().optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  availability: z.enum(AVAILABILITIES).optional(),
  wholesale: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'rating']).optional(),
  page: z.coerce.number().int().min(1).max(500).optional(),
});

/** Flattens a zod error into the field map the form components render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    fields[key] ??= issue.message;
  }
  return fields;
}
