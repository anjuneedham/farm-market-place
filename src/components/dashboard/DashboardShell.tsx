import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DashboardNavItem = { href: string; label: string; icon: ReactNode };

/**
 * Desktop: persistent left nav. Mobile: horizontal scroll tabs — a select
 * would hide too much; dashboards are used often enough to earn a tab strip.
 */
export function DashboardShell({
  title,
  subtitle,
  nav,
  activeHref,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  activeHref: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{title}</h1>
          {subtitle ? <p className="mt-1 text-ink-600">{subtitle}</p> : null}
        </div>
        {action}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Dashboard" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {nav.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium',
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-canvas',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
