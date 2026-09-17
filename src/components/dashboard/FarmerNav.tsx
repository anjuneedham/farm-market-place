import { BarChart3, LayoutDashboard, MessageCircle, Package, Sparkles, Sprout, Star, User } from 'lucide-react';
import type { DashboardNavItem } from './DashboardShell';

export function farmerNav(): DashboardNavItem[] {
  return [
    { href: '/dashboard/farmer', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/dashboard/farmer/profile', label: 'My Farm', icon: <Sprout className="h-4 w-4" /> },
    { href: '/dashboard/farmer/listings', label: 'Listings', icon: <Package className="h-4 w-4" /> },
    { href: '/dashboard/farmer/orders', label: 'Orders', icon: <BarChart3 className="h-4 w-4" /> },
    { href: '/messages', label: 'Messages', icon: <MessageCircle className="h-4 w-4" /> },
    { href: '/requests', label: 'Buyer Requests', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/dashboard/farmer/reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
    { href: '/premium', label: 'Premium', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/account', label: 'Settings', icon: <User className="h-4 w-4" /> },
  ];
}
