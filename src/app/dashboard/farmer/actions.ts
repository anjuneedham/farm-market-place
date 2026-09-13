'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { marketplaceService } from '@/lib/services/marketplace';
import { db } from '@/lib/db/repositories';
import { fieldErrors, listingSchema, priceTierSchema } from '@/lib/validation';
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
