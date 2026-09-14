'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

/**
 * The mobile "+ Sell" entry point the audit found missing: a farmer or
 * business browsing on a phone had no obvious way to start a listing short
 * of finding the dashboard. Reuses the existing listing form entirely — this
 * is a new entry point, not a new flow. `requireRole` on the destination
 * already handles a buyer or signed-out visitor landing here.
 */
export function SellFab() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/farmer/listings/new')) return null;

  return (
    <Link
      href="/dashboard/farmer/listings/new"
      className="fixed right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-brand-600 px-5 font-semibold text-white shadow-lg transition-colors hover:bg-brand-500 lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}
    >
      <Plus className="h-5 w-5" aria-hidden />
      Sell
    </Link>
  );
}
