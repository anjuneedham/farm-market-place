import { can } from '@/lib/auth/permissions';
import { db } from '@/lib/db/repositories';
import { notificationService } from '@/lib/integrations';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import { checkRateLimit } from '@/lib/security/rate-limit';
import type { Comment, CommunityPost, RelatedRefType, User } from '@/lib/types';
import type { z } from 'zod';
import type { commentSchema, postSchema, reportSchema } from '@/lib/validation';

type PostInput = z.infer<typeof postSchema>;
type CommentInput = z.infer<typeof commentSchema>;
type ReportInput = z.infer<typeof reportSchema>;

/** Resolves the slug a post author pasted into a real id, or undefined if nothing matches. */
function resolveRelatedSlug(type: RelatedRefType, slug: string): string | undefined {
  switch (type) {
    case 'LISTING':
      return db.listings.bySlug(slug)?.id;
    case 'FARM':
      return db.profiles.farmBySlug(slug)?.id;
    case 'BUSINESS':
      return db.profiles.businessBySlug(slug)?.id;
    case 'BUYER_REQUEST':
      return db.buyerRequests.bySlug(slug)?.id;
    default:
      return undefined;
  }
}

/**
 * AgriLoop Community is free for everyone, forever — there is no premium check
 * anywhere in this service, and adding one would contradict the commitment in
 * docs/PREMIUM_STRATEGY.md §1.
 */
export const communityService = {
  categories: db.community.categories.bind(db.community),
  posts: db.community.posts.bind(db.community),

  postBySlug(slug: string, viewerId?: string) {
    return db.community.postBySlug(slug, viewerId);
  },

  commentsFor(postId: string) {
    return db.community.commentsFor(postId);
  },

  async createPost(user: User, input: PostInput): Promise<ServiceResult<CommunityPost>> {
    if (!can(user, 'post:create')) return fail('forbidden', 'Sign in to post.');

    const limit = checkRateLimit('createPost', user.id);
    if (!limit.allowed) {
      return fail('rate_limited', 'You have posted a lot recently. Try again in a little while.');
    }

    const category = db.community.categoryBySlug(input.categoryId) ?? undefined;
    const categoryId = category?.id ?? input.categoryId;
    if (!db.community.categories().some((c) => c.id === categoryId)) {
      return fail('validation', 'Choose a category.', { categoryId: 'Choose a category.' });
    }

    let relatedId: string | undefined;
    if (input.relatedType && input.relatedSlug) {
      relatedId = resolveRelatedSlug(input.relatedType, input.relatedSlug);
      if (!relatedId) {
        return fail('validation', 'We could not find anything matching that link — check the slug and try again.', {
          relatedSlug: 'We could not find anything matching that link.',
        });
      }
    }

    const post = db.community.createPost({
      categoryId,
      authorId: user.id,
      title: input.title,
      body: input.body,
      imageUrls: input.imageUrls,
      tags: input.tags,
      relatedType: relatedId ? input.relatedType : undefined,
      relatedId,
    });

    db.analytics.record({
      type: 'post_created',
      entityType: 'post',
      entityId: post.id,
      userId: user.id,
    });

    return ok(post);
  },

  async addComment(user: User, input: CommentInput): Promise<ServiceResult<Comment>> {
    if (!can(user, 'comment:create')) return fail('forbidden', 'Sign in to comment.');

    const limit = checkRateLimit('createPost', user.id);
    if (!limit.allowed) {
      return fail('rate_limited', 'You have posted a lot recently. Try again in a little while.');
    }

    const post = db.community.postById(input.postId);
    if (!post || post.status !== 'PUBLISHED') {
      return fail('not_found', 'We could not find that post.');
    }
    if (db.moderation.isBlockedEitherWay(user.id, post.authorId)) {
      return fail('forbidden', 'You cannot comment on this post.');
    }

    const comment = db.community.addComment(post.id, user.id, input.body, input.parentId);

    if (post.authorId !== user.id) {
      await notificationService.notify({
        userId: post.authorId,
        type: 'COMMUNITY_REPLY',
        title: `${db.profiles.displayFor(user.id).label} replied to your post`,
        body: post.title,
        href: `/community/${db.community.categories().find((c) => c.id === post.categoryId)?.slug ?? ''}/${post.slug}`,
      });
    }

    return ok(comment);
  },

  toggleLike(user: User, postId: string): ServiceResult<boolean> {
    const post = db.community.postById(postId);
    if (!post) return fail('not_found', 'We could not find that post.');
    return ok(db.community.toggleLike(postId, user.id));
  },

  async report(user: User, input: ReportInput): Promise<ServiceResult<null>> {
    const limit = checkRateLimit('report', user.id);
    if (!limit.allowed) {
      return fail('rate_limited', 'You have submitted several reports recently.');
    }

    db.moderation.createReport({
      reporterId: user.id,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      details: input.details,
    });

    return ok(null);
  },

  block(user: User, targetId: string): ServiceResult<null> {
    if (user.id === targetId) return fail('validation', 'You cannot block yourself.');
    db.moderation.block(user.id, targetId);
    return ok(null);
  },

  unblock(user: User, targetId: string): ServiceResult<null> {
    db.moderation.unblock(user.id, targetId);
    return ok(null);
  },

  isBlockedByViewer(user: User, targetId: string): boolean {
    return db.moderation.blocks(user.id).some((b) => b.targetId === targetId);
  },
};
