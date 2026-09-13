import { Heart, LayoutDashboard, ListChecks, MessageCircle, Package, Sparkles, User } from 'lucide-react';
import type { DashboardNavItem } from './DashboardShell';

export function buyerNav(): DashboardNavItem[] {
  return [
    { href: '/dashboard/buyer', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/dashboard/buyer/orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { href: '/dashboard/buyer/saved', label: 'Saved', icon: <Heart className="h-4 w-4" /> },
    { href: '/dashboard/buyer/lists', label: 'Shopping Lists', icon: <ListChecks className="h-4 w-4" /> },
    { href: '/dashboard/buyer/requests', label: 'My Requests', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/messages', label: 'Messages', icon: <MessageCircle className="h-4 w-4" /> },
    { href: '/premium', label: 'Premium', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/account', label: 'Settings', icon: <User className="h-4 w-4" /> },
  ];
}
