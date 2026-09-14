'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { requestService } from '@/lib/services/requests';
import { buyerRequestSchema, fieldErrors, requestResponseSchema } from '@/lib/validation';
import type { FormState } from '@/lib/forms';

function toObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData.entries());
}

export async function createRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = buyerRequestSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await requestService.create(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath('/requests');
  redirect(`/requests/${result.data.slug}`);
}

export async function respondToRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = requestResponseSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Write a message before responding.', fields: fieldErrors(parsed.error) };
  }

  const result = await requestService.respond(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath(`/requests`);
  return { status: 'idle', message: 'responded' };
}

export async function decideResponseAction(
  responseId: string,
  status: 'ACCEPTED' | 'REJECTED',
): Promise<{ error?: string }> {
  const session = await requireSession();

  const result = await requestService.decideResponse(session.user, responseId, status);
  if (!result.ok) return { error: result.error.message };

  const request = db.buyerRequests.byId(result.data.buyerRequestId);
  if (request) revalidatePath(`/requests/${request.slug}`);

  return {};
}
