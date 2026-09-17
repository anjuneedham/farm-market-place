'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { marketplaceService } from '@/lib/services/marketplace';
import { db } from '@/lib/db/repositories';
import { createFarmProfile, getFarmProfile, updateFarmProfile, updateUserRow } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { fieldErrors, farmProfileSchema, listingSchema, priceTierSchema } from '@/lib/validation';
import { getDefaultCountry } from '@/lib/location';
import type { FormState } from '@/lib/forms';
import type { ListingStatus } from '@/lib/types';

function toObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'imageUrls') continue;
    object[key] = value;
  }
  return object;
}

function parseTiers(formData: FormData) {
  const minQuantities = formData.getAll('tierMinQuantity');
  const unitPrices = formData.getAll('tierUnitPrice');
  const labels = formData.getAll('tierLabel');

  const tiers = [];
  for (let i = 0; i < minQuantities.length; i += 1) {
    const minQuantity = minQuantities[i];
    const unitPrice = unitPrices[i];
    if (!minQuantity || !unitPrice) continue;
    const parsed = priceTierSchema.safeParse({
      minQuantity,
      unitPrice,
      label: labels[i] || undefined,
    });
    if (parsed.success) tiers.push(parsed.data);
  }
  return tiers;
}

export async function createListingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireRole(['FARMER', 'BUSINESS']);

  const parsed = listingSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await marketplaceService.create(user, parsed.data, parseTiers(formData));
  if (!result.ok) return { status: 'error', message: result.error.message, fields: result.error.fields };

  revalidatePath('/dashboard/farmer/listings');
  redirect(`/dashboard/farmer/listings`);
}

export async function updateListingAction(
  listingId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { user } = await requireRole(['FARMER', 'BUSINESS']);

  const parsed = listingSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await marketplaceService.update(user, listingId, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message, fields: result.error.fields };

  db.listings.replaceTiers(listingId, parseTiers(formData));

  revalidatePath('/dashboard/farmer/listings');
  redirect(`/dashboard/farmer/listings`);
}

export async function setListingStatusAction(listingId: string, status: ListingStatus): Promise<{ error?: string }> {
  const { user } = await requireRole(['FARMER', 'BUSINESS']);
  const result = await marketplaceService.setStatus(user, listingId, status);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/dashboard/farmer/listings');
  return {};
}

function toFarmProfileObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'methods') {
      const list = (object[key] as string[] | undefined) ?? [];
      if (typeof value === 'string' && value) list.push(value);
      object[key] = list;
      continue;
    }
    if (key === 'specialties') {
      object[key] = typeof value === 'string' ? value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean) : [];
      continue;
    }
    object[key] = value;
  }
  return object;
}

/**
 * "Complete Your Farmer Profile" — the only farm identity fields required at
 * signup are name/region (see the handle_new_user() trigger); everything
 * else here is genuinely optional and can be filled in whenever the farmer
 * gets to it, per the brief's "don't force every field during signup" rule.
 */
export async function updateFarmProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireRole('FARMER');

  const parsed = farmProfileSchema.safeParse(toFarmProfileObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }
  const { whatsapp, ...profileFields } = parsed.data;

  if (!db.locations.regionBelongsToCountry(profileFields.regionId, getDefaultCountry().code)) {
    return { status: 'error', message: 'Choose a valid parish.', fields: { regionId: 'Choose a valid parish.' } };
  }
  const communityId =
    profileFields.communityId &&
    db.locations.communityBelongsToRegion(profileFields.communityId, profileFields.regionId)
      ? profileFields.communityId
      : undefined;

  const supabase = await createClient();
  const existing = await getFarmProfile(supabase, user.id);

  if (existing) {
    await updateFarmProfile(supabase, user.id, { ...profileFields, communityId });
  } else {
    await createFarmProfile(supabase, {
      userId: user.id,
      name: profileFields.name,
      countryCode: getDefaultCountry().code,
      regionId: profileFields.regionId,
      communityId,
    });
    await updateFarmProfile(supabase, user.id, {
      tagline: profileFields.tagline,
      story: profileFields.story,
      yearsFarming: profileFields.yearsFarming,
      farmSizeAcres: profileFields.farmSizeAcres,
      methods: profileFields.methods,
      specialties: profileFields.specialties,
      acceptsPickup: profileFields.acceptsPickup,
      acceptsDelivery: profileFields.acceptsDelivery,
      deliveryNotes: profileFields.deliveryNotes,
    });
  }

  if (whatsapp !== undefined) {
    await updateUserRow(supabase, user.id, { whatsapp });
  }

  revalidatePath('/dashboard/farmer/profile');
  revalidatePath('/dashboard/farmer');
  return { status: 'idle', message: 'saved' };
}
