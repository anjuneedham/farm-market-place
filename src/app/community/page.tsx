import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'AgriLoop Community — ask questions, share farming tips, get pest help, and connect with farmers, buyers and businesses across Jamaica. Free for everyone.',
};

export const revalidate = 60;

export default async function CommunityPage() {
  const categories = db.community.categories();
  const recent = db.community.posts({ perPage: 6 }).items;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">AgriLoop Community</h1>
          <p className="mt-1 max-w-xl text-ink-600">
            Free for everyone. Ask questions, share what works, and find your parish&apos;s farmers,
            buyers and businesses.
          </p>
        </div>
        <ButtonLink href="/community/new">New Post</ButtonLink>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CardLink key={category.id} href={`/community/${category.slug}`} className="p-5">
            <h3 className="font-semibold text-ink-900">{category.name}</h3>
            {category.description ? <p className="mt-1.5 text-sm text-ink-600">{category.description}</p> : null}
            <p className="mt-3 text-xs text-ink-400">
              {db.community.postCountFor(category.id)} post{db.community.postCountFor(category.id) === 1 ? '' : 's'}
            </p>
          </CardLink>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-h2 mb-4">Recent activity</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {recent.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.category.slug}/${post.slug}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-50/40"
            >
              <div className="min-w-0">
                <p className="text-micro text-brand-600">{post.category.name}</p>
                <p className="truncate font-medium text-ink-900">{post.title}</p>
                <p className="text-xs text-ink-400">{post.authorLabel} · {timeAgo(post.lastActivityAt)}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm text-ink-400">
                <MessageCircle className="h-4 w-4" aria-hidden />
                {post.commentCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
