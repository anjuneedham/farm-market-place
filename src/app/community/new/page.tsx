import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { NewPostForm } from './NewPostForm';

export const metadata: Metadata = { title: 'New Post' };

export default async function NewCommunityPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireSession('/community/new');
  const { category } = await searchParams;
  const categories = db.community.categories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-h1">Start a conversation</h1>
      <p className="mt-2 text-ink-600">AgriLoop Community is free for everyone — ask, share, and connect.</p>
      <div className="mt-8">
        <NewPostForm categories={categories} defaultCategory={category} />
      </div>
    </div>
  );
}
