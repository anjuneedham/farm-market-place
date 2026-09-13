import { data, mutate } from '../datasource';
import type {
  Comment,
  CommentView,
  CommunityCategory,
  CommunityPost,
  Paginated,
  PageParams,
  PostView,
} from '@/lib/types';
import { matches, newId, nowIso, paginate, uniqueSlug } from './common';
import { profiles, toPublicUser, users } from './users';

function toPostView(post: CommunityPost, viewerId?: string): PostView | undefined {
  const author = users.byId(post.authorId);
  const category = data().communityCategories.find((c) => c.id === post.categoryId);
  if (!author || !category) return undefined;

  const display = profiles.displayFor(author.id);

  return {
    ...post,
    author: toPublicUser(author),
    authorLabel: display.label,
    authorHref: display.href,
    category,
    likedByMe: viewerId
      ? data().postLikes.some((like) => like.postId === post.id && like.userId === viewerId)
      : false,
  };
}

function toCommentView(comment: Comment, all: Comment[]): CommentView {
  const author = users.byId(comment.authorId);
  const display = profiles.displayFor(comment.authorId);

  return {
    ...comment,
    author: author
      ? toPublicUser(author)
      : { id: comment.authorId, name: 'Former member', role: 'BUYER', createdAt: comment.createdAt },
    authorLabel: display.label,
    replies: all
      .filter((c) => c.parentId === comment.id && c.status === 'PUBLISHED')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((reply) => toCommentView(reply, all)),
  };
}

export const community = {
  categories(): CommunityCategory[] {
    return [...data().communityCategories]
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  categoryBySlug(slug: string): CommunityCategory | undefined {
    return data().communityCategories.find((c) => c.slug === slug);
  },

  postCountFor(categoryId: string): number {
    return data().posts.filter((p) => p.categoryId === categoryId && p.status === 'PUBLISHED')
      .length;
  },

  posts(
    filters: { categoryId?: string; authorId?: string; search?: string; tag?: string } & PageParams,
    viewerId?: string,
  ): Paginated<PostView> {
    let items = data().posts.filter((p) => p.status === 'PUBLISHED');

    if (filters.categoryId) items = items.filter((p) => p.categoryId === filters.categoryId);
    if (filters.authorId) items = items.filter((p) => p.authorId === filters.authorId);
    if (filters.tag) items = items.filter((p) => p.tags.includes(filters.tag!));
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      items = items.filter((p) => matches(p.title, term) || matches(p.body, term));
    }

    items = [...items].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.lastActivityAt.localeCompare(a.lastActivityAt);
    });

    const views = items
      .map((post) => toPostView(post, viewerId))
      .filter((view): view is PostView => view !== undefined);

    return paginate(views, filters);
  },

  postBySlug(slug: string, viewerId?: string): PostView | undefined {
    const post = data().posts.find((p) => p.slug === slug);
    return post ? toPostView(post, viewerId) : undefined;
  },

  postById(id: string): CommunityPost | undefined {
    return data().posts.find((p) => p.id === id);
  },

  commentsFor(postId: string): CommentView[] {
    const all = data().comments.filter((c) => c.postId === postId);
    return all
      .filter((c) => !c.parentId && c.status === 'PUBLISHED')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((comment) => toCommentView(comment, all));
  },

  totalPosts(): number {
    return data().posts.filter((p) => p.status === 'PUBLISHED').length;
  },

  createPost(
    input: Omit<
      CommunityPost,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'updatedAt'
      | 'lastActivityAt'
      | 'commentCount'
      | 'likeCount'
      | 'status'
      | 'isPinned'
      | 'isDemoData'
    >,
  ): CommunityPost {
    return mutate((db) => {
      const post: CommunityPost = {
        ...input,
        id: newId('post'),
        slug: uniqueSlug(
          input.title,
          db.posts.map((p) => p.slug),
        ),
        status: 'PUBLISHED',
        isPinned: false,
        commentCount: 0,
        likeCount: 0,
        lastActivityAt: nowIso(),
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.posts.push(post);
      return post;
    });
  },

  updatePost(id: string, patch: Partial<CommunityPost>): CommunityPost | undefined {
    return mutate((db) => {
      const post = db.posts.find((p) => p.id === id);
      if (!post) return undefined;
      Object.assign(post, patch, { updatedAt: nowIso() });
      return post;
    });
  },

  addComment(postId: string, authorId: string, body: string, parentId?: string): Comment {
    return mutate((db) => {
      const comment: Comment = {
        id: newId('comment'),
        postId,
        authorId,
        parentId,
        body,
        status: 'PUBLISHED',
        isDemoData: false,
        createdAt: nowIso(),
      };
      db.comments.push(comment);

      const post = db.posts.find((p) => p.id === postId);
      if (post) {
        post.commentCount += 1;
        post.lastActivityAt = comment.createdAt;
      }

      return comment;
    });
  },

  commentById(id: string): Comment | undefined {
    return data().comments.find((c) => c.id === id);
  },

  setCommentStatus(id: string, status: Comment['status']): void {
    mutate((db) => {
      const comment = db.comments.find((c) => c.id === id);
      if (comment) comment.status = status;
    });
  },

  /** Returns the new like state so the caller can render without a re-read. */
  toggleLike(postId: string, userId: string): boolean {
    return mutate((db) => {
      const index = db.postLikes.findIndex((l) => l.postId === postId && l.userId === userId);
      const post = db.posts.find((p) => p.id === postId);

      if (index >= 0) {
        db.postLikes.splice(index, 1);
        if (post) post.likeCount = Math.max(0, post.likeCount - 1);
        return false;
      }

      db.postLikes.push({ id: newId('like'), postId, userId, createdAt: nowIso() });
      if (post) post.likeCount += 1;
      return true;
    });
  },
};
