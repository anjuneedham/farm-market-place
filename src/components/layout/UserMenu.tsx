'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LayoutDashboard, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { dashboardPathFor } from '@/lib/auth/permissions';
import { Avatar } from '@/components/ui/Avatar';
import { signOutAction } from '@/app/(auth)/actions';
import type { User } from '@/lib/types';

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md py-1 pl-1 pr-2 hover:bg-brand-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size={32} />
        <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-line bg-surface p-1.5 shadow-float"
        >
          <p className="truncate px-3 py-2 text-sm font-medium text-ink-900">{user.name}</p>
          <div className="my-1 h-px bg-line" />
          <MenuLink href={dashboardPathFor(user)} icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </MenuLink>
          <MenuLink href="/account" icon={<Settings className="h-4 w-4" />}>
            Account settings
          </MenuLink>
          {user.role === 'ADMIN' ? (
            <MenuLink href="/admin" icon={<ShieldCheck className="h-4 w-4" />}>
              Admin console
            </MenuLink>
          ) : null}
          <div className="my-1 h-px bg-line" />
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-700 hover:bg-brand-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-brand-50">
      {icon}
      {children}
    </Link>
  );
}
