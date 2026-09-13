import Link from 'next/link';
import { Bell, MessageCircle, Search } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { ButtonLink } from '@/components/ui/Button';
import { UserMenu } from './UserMenu';

const NAV = [
  { href: '/market', label: 'Market' },
  { href: '/farmers', label: 'Farmers' },
  { href: '/requests', label: 'Requests' },
  { href: '/community', label: 'Community' },
  { href: '/academy', label: 'Academy' },
  { href: '/premium', label: 'Premium' },
];

export async function Header() {
  const user = await getCurrentUser();
  const unreadMessages = user ? db.conversations.unreadCount(user.id) : 0;
  const unreadNotifications = user ? db.notifications.unreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm text-white">
            AL
          </span>
          <span className="hidden text-lg sm:inline">AgriLoop</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/market"
          className="ml-auto hidden items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-sm text-ink-400 sm:flex lg:ml-0 lg:w-56"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search the market…
        </Link>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          {user ? (
            <>
              <Link
                href="/messages"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink-600 hover:bg-brand-50"
                aria-label="Messages"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {unreadMessages > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-600" aria-hidden />
                ) : null}
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-md text-ink-600 hover:bg-brand-50"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" aria-hidden />
                {unreadNotifications > 0 ? (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-600" aria-hidden />
                ) : null}
              </Link>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <ButtonLink href="/signin" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup" variant="primary" size="sm">
                Join AgriLoop
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
