import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RelatedResolved } from '@/lib/related';

/**
 * The one reusable seam connecting Community and Academy back to the
 * marketplace. Deliberately a single small card, not a feed of suggestions —
 * Community must stay useful, not become an advertising surface
 * (docs/PRODUCT_ARCHITECTURE.md §1).
 */
export function RelatedOnAgriLoop({ related }: { related: RelatedResolved }) {
  return (
    <Link
      href={related.href}
      className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4 transition-colors hover:border-brand-300"
    >
      <div className="min-w-0">
        <p className="text-micro text-brand-600">Related on AgriLoop · {related.kind}</p>
        <p className="mt-0.5 truncate font-medium text-ink-900">{related.label}</p>
        {related.sublabel ? <p className="truncate text-sm text-ink-500">{related.sublabel}</p> : null}
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
    </Link>
  );
}
