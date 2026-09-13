'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { MoreVertical } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { setListingStatusAction } from '../actions';
import type { ListingStatus } from '@/lib/types';

const OPTIONS: Array<{ status: ListingStatus; label: string }> = [
  { status: 'ACTIVE', label: 'Activate' },
  { status: 'PAUSED', label: 'Pause' },
  { status: 'SOLD_OUT', label: 'Mark sold out' },
  { status: 'ARCHIVED', label: 'Archive' },
];

export function ListingStatusMenu({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: ListingStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <IconButton label="Listing actions" onClick={() => setOpen((v) => !v)} className="border border-line-strong">
        <MoreVertical className="h-4 w-4" />
      </IconButton>
      {open ? (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-line bg-surface p-1 shadow-float">
          {OPTIONS.filter((option) => option.status !== currentStatus).map((option) => (
            <button
              key={option.status}
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setListingStatusAction(listingId, option.status);
                  setOpen(false);
                  router.refresh();
                })
              }
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink-700 hover:bg-brand-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
