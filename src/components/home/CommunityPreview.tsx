import { ArrowRight, MessageCircle } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Card';
import { timeAgo } from '@/lib/utils';
import type { PostView } from '@/lib/types';

export function CommunityPreview({ posts }: { posts: PostView[] }) {
  return (
    <section className="border-y border-line bg-canvas">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <SectionHeader
          eyebrow="AgriLoop Community"
          title="Farmers, buyers and businesses, talking directly"
          description="Ask the community, share farming tips, get pest help, and find out what buyers actually want. Free for everyone."
          action={
            <ButtonLink href="/community" variant="secondary" size="sm">
              Visit the community
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <CardLink
              key={post.id}
              href={`/community/${post.category.slug}/${post.slug}`}
              className="p-5"
            >
              <p className="text-micro text-brand-600">{post.category.name}</p>
              <h3 className="mt-1.5 line-clamp-2 font-semibold text-ink-900">{post.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-ink-600">{post.body.replace(/[#*_`]/g, '')}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                <span>{post.authorLabel}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  {post.commentCount} · {timeAgo(post.lastActivityAt)}
                </span>
              </div>
            </CardLink>
          ))}
        </div>
      </div>
    </section>
  );
}
