import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, queryString } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | number | boolean | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => `${basePath}${queryString({ ...params, page: target })}`;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border border-line-strong',
          page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-brand-50',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Link>
      <span className="px-3 text-sm text-ink-600 tabular">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border border-line-strong',
          page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-brand-50',
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
