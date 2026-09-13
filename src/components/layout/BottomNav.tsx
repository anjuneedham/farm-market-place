'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, Users, GraduationCap, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Exactly five destinations, never more (docs/DESIGN_SYSTEM.md §7). Secondary
 * destinations are reached from context, not from here.
 */
const ITEMS = [
  { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { href: '/market', label: 'Market', icon: Sprout, match: (p: string) => p.startsWith('/market') },
  { href: '/community', label: 'Community', icon: Users, match: (p: string) => p.startsWith('/community') },
  { href: '/academy', label: 'Learn', icon: GraduationCap, match: (p: string) => p.startsWith('/academy') },
  { href: '/account', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/account') || p.startsWith('/dashboard') },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium',
                  active ? 'text-brand-600' : 'text-ink-400',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
