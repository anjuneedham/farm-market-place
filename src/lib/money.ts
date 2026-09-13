/**
 * Money handling.
 *
 * Amounts are ALWAYS integers of minor units (cents) paired with an ISO 4217
 * code. Floats are never used for money anywhere in this codebase.
 *
 * There is deliberately no currency conversion: AgriLoop does not invent
 * exchange rates. A listing priced in JMD is displayed in JMD everywhere.
 */

import { getCountry } from '@/lib/location/countries';

/** Currencies whose minor unit is not 1/100. */
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'CLP', 'VND']);

export function minorUnitFactor(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100;
}

export function toMinor(amount: number, currency: string): number {
  return Math.round(amount * minorUnitFactor(currency));
}

export function fromMinor(minor: number, currency: string): number {
  return minor / minorUnitFactor(currency);
}

export type MoneyFormatOptions = {
  /** Append the currency code, e.g. "$850.00 JMD". Default true. */
  withCode?: boolean;
  /** Drop ".00" on whole amounts. Default true. */
  compactDecimals?: boolean;
  locale?: string;
};

/**
 * Format minor units for display. Prices are always rendered with their
 * currency code, because "$850" is ambiguous across Caribbean markets that all
 * use a dollar sign.
 */
export function formatMoney(
  minor: number | null | undefined,
  currency: string,
  options: MoneyFormatOptions = {},
): string {
  if (minor === null || minor === undefined) return '—';
  const { withCode = true, compactDecimals = true, locale } = options;
  const code = currency.toUpperCase();
  const value = fromMinor(minor, code);
  const isWhole = Number.isInteger(value);
  const fractionDigits = compactDecimals && isWhole ? 0 : ZERO_DECIMAL.has(code) ? 0 : 2;

  const formatted = new Intl.NumberFormat(locale ?? 'en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return withCode ? `${formatted} ${code}` : formatted;
}

/** "$850 JMD / lb" */
export function formatUnitPrice(
  minor: number | null | undefined,
  currency: string,
  unit: string,
  options: MoneyFormatOptions = {},
): string {
  const price = formatMoney(minor, currency, options);
  if (price === '—') return price;
  return `${price} / ${unit}`;
}

export function currencyForCountry(countryCode: string): string {
  return getCountry(countryCode)?.currency ?? 'USD';
}

export function localeForCountry(countryCode: string): string {
  return getCountry(countryCode)?.locale ?? 'en-US';
}

/** Savings between a regular and a member price, or null when there are none. */
export function savings(regularMinor: number, memberMinor: number): number | null {
  const diff = regularMinor - memberMinor;
  return diff > 0 ? diff : null;
}
