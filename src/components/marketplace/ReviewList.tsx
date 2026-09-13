import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/States';
import { cn, formatDate } from '@/lib/utils';
import type { ReviewView } from '@/lib/types';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn('h-3.5 w-3.5', star <= rating ? 'fill-sun-500 text-sun-500' : 'fill-none text-line-strong')}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, total }: { reviews: ReviewView[]; total: number }) {
  if (total === 0) {
    return (
      <EmptyState
        title="No reviews yet."
        description="Reviews appear here after a buyer and seller complete a transaction together."
      />
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3 border-b border-line pb-5 last:border-0">
          <Avatar name={review.author.name} size={36} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink-900">{review.author.name}</p>
              <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
            </div>
            <StarRow rating={review.rating} />
            {review.body ? <p className="mt-1.5 text-sm text-ink-700">{review.body}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
