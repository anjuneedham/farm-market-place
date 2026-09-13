import { AlertCircle, BadgeCheck, FlaskConical, Star, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Availability } from '@/lib/types';

type Tone = 'neutral' | 'brand' | 'positive' | 'warning' | 'danger' | 'premium' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-600 border-line',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  positive: 'bg-positive-soft text-positive border-positive/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  premium: 'bg-sun-100 text-sun-700 border-sun-300',
  info: 'bg-info-soft text-info border-info/20',
};

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Verification is never conveyed by colour alone — the badge always carries an
 * icon and the word "Verified" (docs/DESIGN_SYSTEM.md §10).
 */
export function VerifiedBadge({ kind = 'Farmer' }: { kind?: string }) {
  return (
    <Badge tone="positive" icon={<BadgeCheck className="h-3.5 w-3.5" aria-hidden />}>
      Verified {kind}
    </Badge>
  );
}

export function PremiumBadge() {
  return (
    <Badge tone="premium" icon={<Star className="h-3.5 w-3.5 fill-current" aria-hidden />}>
      Premium
    </Badge>
  );
}

export function FeaturedBadge() {
  return (
    <Badge tone="premium" icon={<Zap className="h-3.5 w-3.5" aria-hidden />}>
      Featured
    </Badge>
  );
}

/** Marks seeded content so demo data is never mistaken for a real business. */
export function DemoBadge() {
  return (
    <Badge tone="info" icon={<FlaskConical className="h-3.5 w-3.5" aria-hidden />}>
      Demo
    </Badge>
  );
}

const AVAILABILITY_LABELS: Record<Availability, { label: string; tone: Tone }> = {
  IN_STOCK: { label: 'In stock', tone: 'positive' },
  LIMITED: { label: 'Limited', tone: 'warning' },
  PRE_ORDER: { label: 'Pre-order', tone: 'info' },
  SEASONAL: { label: 'Seasonal', tone: 'warning' },
  OUT_OF_STOCK: { label: 'Out of stock', tone: 'neutral' },
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const { label, tone } = AVAILABILITY_LABELS[availability];
  return (
    <Badge tone={tone}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'positive' && 'bg-positive',
          tone === 'warning' && 'bg-warning',
          tone === 'info' && 'bg-info',
          tone === 'neutral' && 'bg-ink-300',
        )}
        aria-hidden
      />
      {label}
    </Badge>
  );
}

export function WholesaleBadge() {
  return <Badge tone="brand">Wholesale available</Badge>;
}

export function WarningBadge({ children }: { children: ReactNode }) {
  return (
    <Badge tone="warning" icon={<AlertCircle className="h-3.5 w-3.5" aria-hidden />}>
      {children}
    </Badge>
  );
}
