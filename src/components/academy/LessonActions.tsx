'use client';

import { useState, useTransition } from 'react';
import { Bookmark, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { markLessonCompleteAction, toggleBookmarkAction } from '@/app/academy/actions';

export function LessonActions({
  lessonId,
  initiallyComplete,
  initiallyBookmarked,
}: {
  lessonId: string;
  initiallyComplete: boolean;
  initiallyBookmarked: boolean;
}) {
  const [complete, setComplete] = useState(initiallyComplete);
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={complete ? 'secondary' : 'primary'}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await markLessonCompleteAction(lessonId, !complete);
            setComplete(!complete);
          })
        }
      >
        <Check className="h-4 w-4" aria-hidden />
        {complete ? 'Completed' : 'Mark complete'}
      </Button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleBookmarkAction(lessonId);
            setBookmarked(result.bookmarked);
          })
        }
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[10px] border',
          bookmarked ? 'border-sun-400 bg-sun-100 text-sun-700' : 'border-line-strong text-ink-500 hover:bg-brand-50',
        )}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
      >
        <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} aria-hidden />
      </button>
    </div>
  );
}
