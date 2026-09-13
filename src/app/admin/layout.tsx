import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import {
  BarChart3,
  BookOpen,
  Flag,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Sparkles,
  Users as UsersIcon,
  ShieldCheck,
} from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/listings', label: 'Listings', icon: Package },
  { href: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/admin/community', label: 'Community', icon: MessageSquare },
  { href: '/admin/academy', label: 'Academy', icon: BookOpen },
  { href: '/admin/premium', label: 'Premium', icon: Sparkles },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
];

/**
 * Admin layout guards every admin route. Non-admins get a 404 here, before
 * any admin page code runs (docs/SECURITY.md §2) — this is in addition to,
 * not instead of, the per-page requireRole calls.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN', '/admin');

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="mb-4 flex items-center gap-2 px-2">
          <BarChart3 className="h-5 w-5 text-brand-600" />
          <span className="font-semibold text-ink-900">AgriLoop Admin</span>
        </div>
        <nav className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-600 hover:bg-canvas"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4 lg:hidden">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-600"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
