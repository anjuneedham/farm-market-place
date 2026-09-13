'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { PlanAudience } from '@/lib/types';

const OPTIONS: Array<{ value: PlanAudience; label: string }> = [
  { value: 'FARMER', label: 'For Farmers' },
  { value: 'BUYER', label: 'For Buyers' },
  { value: 'BUSINESS', label: 'For Businesses' },
];

export function AudienceToggle({ current }: { current: PlanAudience }) {
  const router = useRouter();

  return (
    <div role="tablist" aria-label="Premium audience" className="inline-flex rounded-full border border-line-strong bg-surface p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={current === option.value}
          onClick={() => router.push(`/premium?audience=${option.value}`)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            current === option.value ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
