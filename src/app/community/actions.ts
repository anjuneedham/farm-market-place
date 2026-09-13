'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { communityService } from '@/lib/services/community';
import { commentSchema, fieldErrors, postSchema } from '@/lib/validation';
import type { FormState } from '@/lib/forms';

function toObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData.entries());
}

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = postSchema.safeParse({ ...toObject(formData), tags: [], imageUrls: [] });
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await communityService.createPost(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  const category = db.community.categories().find((c) => c.id === result.data.categoryId);
  revalidatePath('/community');
  redirect(`/community/${category?.slug}/${result.data.slug}`);
}

export async function addCommentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = commentSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Write a comment.', fields: fieldErrors(parsed.error) };
  }

  const result = await communityService.addComment(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath('/community');
  return { status: 'idle' };
}

export async function toggleLikeAction(postId: string): Promise<{ liked: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Sign in to like posts.' };

  const result = communityService.toggleLike(user, postId);
  if (!result.ok) return { error: result.error.message };

  revalidatePath('/community');
  return { liked: result.data };
}
