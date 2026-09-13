import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Rating is never colour-only: the numeric value and review count are always
 * printed alongside the stars (docs/DESIGN_SYSTEM.md §10).
 */
export function Rating({
  average,
  count,
  size = 'md',
  className,
}: {
  average: number;
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (count === 0) {
    return <span className={cn('text-sm text-ink-400', className)}>No reviews yet</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-ink-800', className)}>
      <Star
        className={cn('fill-sun-500 text-sun-500', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
        aria-hidden
      />
      <span className={cn('font-semibold tabular', size === 'sm' ? 'text-sm' : 'text-base')}>
        {average.toFixed(1)}
      </span>
      <span className={cn('text-ink-500', size === 'sm' ? 'text-xs' : 'text-sm')}>
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </span>
  );
}

export function StarInput({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (value: number) => void;
  name?: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          onClick={() => onChange(star)}
          className="p-1"
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              star <= value ? 'fill-sun-500 text-sun-500' : 'fill-none text-line-strong',
            )}
          />
        </button>
      ))}
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
