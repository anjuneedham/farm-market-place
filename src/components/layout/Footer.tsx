import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/market', label: 'Browse the market' },
      { href: '/farmers', label: 'Find farmers' },
      { href: '/businesses', label: 'Agricultural businesses' },
      { href: '/requests', label: 'Buyer requests' },
    ],
  },
  {
    title: 'Learn & connect',
    links: [
      { href: '/academy', label: 'AgriLoop Academy' },
      { href: '/community', label: 'Community' },
      { href: '/premium', label: 'AgriLoop Premium' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About AgriLoop' },
      { href: '/guidelines', label: 'Community guidelines' },
      { href: '/signup', label: 'Join AgriLoop' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-lg font-bold text-white">AgriLoop</span>
            <p className="mt-2 text-sm text-brand-300">Connect. Grow. Trade.</p>
            <p className="mt-4 text-xs text-brand-400">Built for Jamaica. Architected for the Caribbean.</p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-micro text-brand-400">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-brand-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-brand-800 pt-6 text-xs text-brand-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} AgriLoop. All rights reserved.</p>
          <p>Jamaica 🇯🇲 · Caribbean expansion in progress</p>
        </div>
      </div>
    </footer>
  );
}
