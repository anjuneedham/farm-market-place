'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleLikeAction } from '@/app/community/actions';

export function LikeButton({
  postId,
  initialCount,
  initiallyLiked,
  signedIn,
}: {
  postId: string;
  initialCount: number;
  initiallyLiked: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!signedIn) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    startTransition(async () => {
      const result = await toggleLikeAction(postId);
      if ('liked' in result) {
        setLiked(result.liked);
        setCount((c) => c + (result.liked ? 1 : -1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        liked ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line-strong text-ink-600 hover:bg-brand-50',
      )}
    >
      <ThumbsUp className={cn('h-4 w-4', liked && 'fill-current')} aria-hidden />
      {count}
    </button>
  );
}
