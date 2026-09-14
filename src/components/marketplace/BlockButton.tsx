'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Ban, ShieldOff } from 'lucide-react';
import { toggleBlockAction } from '@/app/market/actions';

export function BlockButton({
  targetUserId,
  initiallyBlocked,
  signedIn,
}: {
  targetUserId: string;
  initiallyBlocked: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!signedIn) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    startTransition(async () => {
      const result = await toggleBlockAction(targetUserId);
      if ('blocked' in result) setBlocked(result.blocked);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-danger disabled:opacity-50"
    >
      {blocked ? <ShieldOff className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
      {blocked ? 'Unblock' : 'Block'}
    </button>
  );
}
