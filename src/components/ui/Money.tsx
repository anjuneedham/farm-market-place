import { formatMoney, formatUnitPrice } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { PricingMode } from '@/lib/types';

const MODE_LABEL: Record<PricingMode, string | null> = {
  FIXED: null,
  NEGOTIABLE: 'Negotiable',
  CONTACT_FOR_PRICE: null,
  WHOLESALE: 'Wholesale',
  BULK_TIERED: 'From',
};

/** Prices use tabular numerals so columns of money align. */
export function Money({
  minor,
  currency,
  unit,
  className,
}: {
  minor?: number;
  currency: string;
  unit?: string;
  className?: string;
}) {
  const formatted = unit ? formatUnitPrice(minor, currency, unit) : formatMoney(minor, currency);
  return <span className={cn('tabular', className)}>{formatted}</span>;
}

export function ListingPrice({
  pricingMode,
  priceMinor,
  currency,
  unit,
  className,
}: {
  pricingMode: PricingMode;
  priceMinor?: number;
  currency: string;
  unit: string;
  className?: string;
}) {
  if (pricingMode === 'CONTACT_FOR_PRICE') {
    return <span className={cn('font-semibold text-ink-900', className)}>Contact for price</span>;
  }

  const prefix = MODE_LABEL[pricingMode];

  return (
    <span className={cn('font-semibold text-ink-900', className)}>
      {prefix ? <span className="mr-1 font-normal text-ink-500">{prefix}</span> : null}
      <Money minor={priceMinor} currency={currency} unit={unit} />
    </span>
  );
}
