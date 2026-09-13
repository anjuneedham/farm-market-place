import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MessageCircle, Pin } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { db } from '@/lib/db/repositories';
import { timeAgo } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = db.community.categoryBySlug(categorySlug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CommunityCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  const category = db.community.categoryBySlug(categorySlug);
  if (!category) notFound();

  const results = db.community.posts({ categoryId: category.id, page: page ? Number(page) : 1 });
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-micro text-brand-600">Community</p>
          <h1 className="text-h1">{category.name}</h1>
          {category.description ? <p className="mt-1 text-ink-600">{category.description}</p> : null}
        </div>
        <ButtonLink href={`/community/new?category=${category.slug}`}>New Post</ButtonLink>
      </div>

      <div className="mt-8">
        {results.items.length > 0 ? (
          <div className="divide-y divide-line rounded-lg border border-line bg-surface">
            {results.items.map((post) => (
              <CardLink
                key={post.id}
                href={`/community/${category.slug}/${post.slug}`}
                className="flex items-start justify-between gap-4 border-0 px-5 py-4 rounded-none first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {post.isPinned ? <Pin className="h-3.5 w-3.5 text-accent-600" aria-hidden /> : null}
                    <p className="truncate font-medium text-ink-900">{post.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    {post.authorLabel} · {timeAgo(post.lastActivityAt)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm text-ink-400">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {post.commentCount}
                </span>
              </CardLink>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Start the conversation."
            description="Nobody has posted in this category yet. Be the first."
            action={<ButtonLink href={`/community/new?category=${category.slug}`}>New Post</ButtonLink>}
          />
        )}
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath={`/community/${category.slug}`} />
    </div>
  );
}
