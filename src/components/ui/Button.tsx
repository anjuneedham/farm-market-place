import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'accent'
  | 'premium'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700',
  secondary: 'bg-surface text-ink-900 border border-line-strong hover:bg-brand-50 hover:border-brand-300',
  ghost: 'text-ink-600 hover:bg-brand-50 hover:text-brand-700',
  accent: 'bg-accent-600 text-white hover:bg-accent-500',
  premium: 'bg-sun-500 text-ink-900 hover:bg-sun-300 font-semibold',
  danger: 'bg-danger text-white hover:opacity-90',
};

// md is 44px tall — the minimum touch target. sm is for desktop tables only.
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-[0.9375rem] gap-2',
  lg: 'h-13 px-6 text-base gap-2',
};

const BASE =
  'inline-flex items-center justify-center rounded-[10px] font-medium transition-colors ' +
  'disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: { label: string } & ComponentProps<'button'>) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-600',
        'transition-colors hover:bg-brand-50 hover:text-brand-700',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
