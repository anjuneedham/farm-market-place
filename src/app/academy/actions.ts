'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';

export async function markLessonCompleteAction(lessonId: string, completed: boolean): Promise<void> {
  const { user } = await requireSession();
  db.academy.setProgress(user.id, lessonId, { completed });
  revalidatePath('/academy');
}

export async function toggleBookmarkAction(lessonId: string): Promise<{ bookmarked: boolean }> {
  const { user } = await requireSession();
  const existing = db.academy.progressForLesson(user.id, lessonId);
  const progress = db.academy.setProgress(user.id, lessonId, { bookmarked: !existing?.bookmarked });
  revalidatePath('/academy');
  return { bookmarked: progress.bookmarked };
}
