import { AlertTriangle, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty states are never blank screens. Each has a specific sentence and one
 * action that advances the core loop (docs/DESIGN_SYSTEM.md §8).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg border border-dashed border-line-strong',
        'bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-ink-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this right now. Please try again.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-danger/20 bg-danger-soft px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-danger" aria-hidden />
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-line', className)} aria-hidden />;
}

/** Skeletons match the final layout rather than being a lone spinner. */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-line bg-surface">
          <Skeleton className="aspect-[4/3] rounded-b-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The honest "not built yet" panel.
 *
 * Used wherever a capability is architected but has no implementation. It
 * replaces the control entirely — AgriLoop does not render buttons that
 * pretend to work.
 */
export function FeatureStatus({
  title,
  explanation,
  requirement,
  className,
}: {
  title: string;
  explanation: string;
  requirement?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-line-strong bg-canvas p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {title} <span className="font-normal text-ink-400">— not available yet</span>
          </p>
          <p className="mt-1.5 text-sm text-ink-600">{explanation}</p>
          {requirement ? (
            <p className="mt-2 text-sm text-ink-400">
              <span className="font-medium">What has to happen first:</span> {requirement}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
