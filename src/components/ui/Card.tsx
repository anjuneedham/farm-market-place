import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cards are defined by their 1px border, not by shadow. Shadow is reserved for
 * things that genuinely float (docs/DESIGN_SYSTEM.md §4).
 */
export function Card({
  className,
  children,
  ...props
}: { children: ReactNode } & ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-lg border border-line bg-surface', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardLink({
  className,
  children,
  ...props
}: { children: ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'block rounded-lg border border-line bg-surface transition-colors',
        'hover:border-brand-300 hover:bg-brand-50/40',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4 sm:p-5', className)}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-micro mb-2 text-brand-600">{eyebrow}</p> : null}
        <h2 className="text-h2">{title}</h2>
        {description ? <p className="mt-2 text-ink-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
