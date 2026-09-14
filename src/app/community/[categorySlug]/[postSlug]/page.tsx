import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { Avatar } from '@/components/ui/Avatar';
import { LikeButton } from '@/components/community/LikeButton';
import { CommentThread } from '@/components/community/CommentThread';
import { CommentForm } from '@/components/community/CommentForm';
import { ReportButton } from '@/components/marketplace/ReportButton';
import { RelatedOnAgriLoop } from '@/components/shared/RelatedOnAgriLoop';
import { resolveRelatedRef } from '@/lib/related';
import { timeAgo } from '@/lib/utils';

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { postSlug } = await params;
  const post = db.community.postBySlug(postSlug);
  if (!post) return {};
  return { title: post.title, description: post.body.slice(0, 160) };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ categorySlug: string; postSlug: string }>;
}) {
  const { categorySlug, postSlug } = await params;
  const user = await getCurrentUser();
  const post = db.community.postBySlug(postSlug, user?.id);
  if (!post || post.category.slug !== categorySlug) notFound();

  const comments = db.community.commentsFor(post.id);
  const related = post.relatedType && post.relatedId ? resolveRelatedRef(post.relatedType, post.relatedId) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-ink-500">
        <Link href="/community" className="hover:text-brand-600">Community</Link>
        <span className="mx-1.5" aria-hidden>/</span>
        <Link href={`/community/${post.category.slug}`} className="hover:text-brand-600">{post.category.name}</Link>
      </nav>

      <h1 className="text-h1">{post.title}</h1>

      <div className="mt-3 flex items-center gap-3">
        <Avatar name={post.authorLabel} size={36} />
        <div>
          {post.authorHref ? (
            <Link href={post.authorHref} className="text-sm font-medium text-ink-900 hover:text-brand-600">
              {post.authorLabel}
            </Link>
          ) : (
            <p className="text-sm font-medium text-ink-900">{post.authorLabel}</p>
          )}
          <p className="text-xs text-ink-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      <div className="prose-agriloop mt-6">
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
      </div>

      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {related ? (
        <div className="mt-5">
          <RelatedOnAgriLoop related={related} />
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-y border-line py-3">
        <LikeButton
          postId={post.id}
          initialCount={post.likeCount}
          initiallyLiked={post.likedByMe}
          signedIn={Boolean(user)}
        />
        <ReportButton targetType="POST" targetId={post.id} signedIn={Boolean(user)} />
      </div>

      <div className="mt-8">
        <h2 className="text-h2 mb-4">
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </h2>
        <div className="mb-6">
          <CommentForm postId={post.id} signedIn={Boolean(user)} />
        </div>
        <CommentThread comments={comments} />
      </div>
    </div>
  );
}
