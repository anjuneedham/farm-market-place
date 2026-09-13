import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

export function Stat({
  label,
  value,
  icon,
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: 'neutral' | 'premium';
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-micro text-ink-500">{label}</p>
        {icon ? (
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              tone === 'premium' ? 'bg-sun-100 text-sun-700' : 'bg-brand-50 text-brand-600',
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tabular text-ink-900">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{children}</div>;
}
