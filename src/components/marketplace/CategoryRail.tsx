import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

export function CategoryRail({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const topLevel = categories.filter((c) => c.level === 0);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/market"
        className={cn(
          'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium',
          !activeSlug ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong text-ink-600 hover:bg-brand-50',
        )}
      >
        All
      </Link>
      {topLevel.map((category) => (
        <Link
          key={category.id}
          href={`/market?category=${category.slug}`}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium',
            activeSlug === category.slug
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-line-strong text-ink-600 hover:bg-brand-50',
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
