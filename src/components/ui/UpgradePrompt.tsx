import { Star } from 'lucide-react';
import { ButtonLink } from './Button';
import { cn } from '@/lib/utils';

/**
 * For features that are fully built but gated behind Premium — distinct from
 * `FeatureStatus`, which is for capabilities that are architected but not yet
 * implemented. Never conflate the two: this is "pay to unlock", that is
 * "not built yet".
 */
export function UpgradePrompt({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-sun-300 bg-sun-50 p-5', className)}>
      <div className="flex items-start gap-3">
        <Star className="mt-0.5 h-5 w-5 shrink-0 fill-sun-500 text-sun-500" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <p className="mt-1.5 text-sm text-ink-600">{description}</p>
          <ButtonLink href="/premium" variant="premium" size="sm" className="mt-3">
            See Premium plans
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
