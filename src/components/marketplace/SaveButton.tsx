'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toggleFavoriteAction } from '@/app/market/actions';
import type { FavoriteKind } from '@/lib/types';

export function SaveButton({
  listingId,
  initiallySaved,
  signedIn,
  kind = 'LISTING',
  className,
}: {
  listingId: string;
  initiallySaved: boolean;
  signedIn: boolean;
  kind?: FavoriteKind;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!signedIn) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    startTransition(async () => {
      const result = await toggleFavoriteAction(kind, listingId);
      if ('saved' in result) setSaved(result.saved);
    });
  }

  return (
    <IconButton
      label={saved ? 'Remove from saved' : 'Save listing'}
      onClick={handleClick}
      disabled={pending}
      className={cn(
        'border border-line-strong',
        saved && 'border-danger/30 bg-danger-soft text-danger',
        className,
      )}
    >
      <Heart className={cn('h-5 w-5', saved && 'fill-current')} aria-hidden />
    </IconButton>
  );
}
