import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import type { FarmUpdateView } from '@/lib/types';

export function FarmUpdatesFeed({ updates }: { updates: FarmUpdateView[] }) {
  return (
    <div className="space-y-3">
      {updates.map((update) => (
        <div key={update.id} className="rounded-lg border border-line bg-surface p-4">
          <p className="whitespace-pre-wrap text-sm text-ink-800">{update.body}</p>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-ink-400">
            <span>{timeAgo(update.createdAt)}</span>
            {update.listing ? (
              <Link
                href={`/market/listing/${update.listing.slug}`}
                className="font-medium text-brand-600 hover:underline"
              >
                View listing →
              </Link>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
