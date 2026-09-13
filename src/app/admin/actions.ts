'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/session';
import { adminService } from '@/lib/services/admin';
import type { UserStatus } from '@/lib/types';

export async function setUserStatusAction(userId: string, status: UserStatus): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.setUserStatus(userId, status);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/users');
  return {};
}

export async function removeListingAction(listingId: string): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.removeListing(listingId);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/listings');
  return {};
}

export async function restoreListingAction(listingId: string): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.restoreListing(listingId);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/listings');
  return {};
}

export async function featureListingAction(listingId: string, days: number): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.featureListing(listingId, days);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/listings');
  revalidatePath('/market');
  return {};
}

export async function unfeatureListingAction(listingId: string): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.unfeatureListing(listingId);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/listings');
  return {};
}

export async function decideVerificationAction(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  note?: string,
): Promise<{ error?: string }> {
  const { user } = await requireRole('ADMIN');
  const result = adminService.decideVerification(id, user.id, status, note);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/verification');
  return {};
}

export async function resolveReportAction(
  id: string,
  status: 'ACTIONED' | 'DISMISSED',
  resolution?: string,
): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.resolveReport(id, status, resolution);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/reports');
  return {};
}

export async function hideCommunityPostAction(postId: string): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.hideCommunityPost(postId);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/community');
  return {};
}

export async function restoreCommunityPostAction(postId: string): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.restoreCommunityPost(postId);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/community');
  return {};
}

export async function setCoursePublishedAction(courseId: string, isPublished: boolean): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.setCoursePublished(courseId, isPublished);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  return {};
}

export async function updatePlanPriceAction(planId: string, priceMinor: number): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.updatePlanPrice(planId, priceMinor);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/premium');
  revalidatePath('/premium');
  return {};
}

export async function updatePlanPaypalPriceAction(
  planId: string,
  priceMinor: number,
  currency: string,
): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.updatePlanPaypalPrice(planId, priceMinor, currency);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/premium');
  revalidatePath('/premium');
  revalidatePath('/premium/start');
  return {};
}

export async function grantSubscriptionAction(userId: string, planId: string, days: number): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.grantSubscription(userId, planId, days);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/premium');
  return {};
}

export async function toggleCategoryActiveAction(categoryId: string, isActive: boolean): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.toggleCategoryActive(categoryId, isActive);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/market');
  return {};
}

export async function setProductStatusAction(productId: string, status: 'ACTIVE' | 'REJECTED'): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.setProductStatus(productId, status);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/categories');
  return {};
}

export async function setCountryLiveAction(countryCode: string, isLive: boolean): Promise<{ error?: string }> {
  await requireRole('ADMIN');
  const result = adminService.setCountryLive(countryCode, isLive);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/locations');
  return {};
}
