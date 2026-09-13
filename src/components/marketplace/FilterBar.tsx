'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Checkbox, Select } from '@/components/ui/Field';
import type { Category, Region } from '@/lib/types';

/**
 * Client-side filter shell. Submits by navigating with query params so every
 * result is a real, shareable, server-rendered URL — no client-only state
 * that a shared link would lose.
 */
export function FilterBar({
  categories,
  regions,
  basePath,
}: {
  categories: Category[];
  regions: Region[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  function applyParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    applyParam('q', q || null);
  }

  const activeCount = ['region', 'category', 'wholesale', 'verified'].filter((key) =>
    searchParams.get(key),
  ).length;

  return (
    <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-4">
      <div className="flex items-center gap-2">
        <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tomatoes, goat, tractor…"
              aria-label="Search the marketplace"
              className="h-11 w-full rounded-[10px] border border-line-strong bg-surface pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none"
            />
          </div>
          <Button type="submit" size="md" className="hidden sm:inline-flex">
            Search
          </Button>
        </form>
        <IconButton
          label="Filters"
          onClick={() => setOpen((v) => !v)}
          className="relative border border-line-strong sm:hidden"
        >
          <Filter className="h-5 w-5" />
          {activeCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-600 text-[10px] text-white">
              {activeCount}
            </span>
          ) : null}
        </IconButton>
      </div>

      <div className={`${open ? 'grid' : 'hidden'} mt-3 grid-cols-1 gap-2.5 sm:mt-3 sm:grid sm:grid-cols-2 lg:grid-cols-5`}>
        <Select
          aria-label="Category"
          value={searchParams.get('category') ?? ''}
          onChange={(e) => applyParam('category', e.target.value || null)}
        >
          <option value="">All categories</option>
          {categories
            .filter((c) => c.level === 0)
            .map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
        </Select>

        <Select
          aria-label="Parish"
          value={searchParams.get('region') ?? ''}
          onChange={(e) => applyParam('region', e.target.value || null)}
        >
          <option value="">All parishes</option>
          {regions.map((region) => (
            <option key={region.id} value={region.slug}>
              {region.name}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sort"
          value={searchParams.get('sort') ?? 'recent'}
          onChange={(e) => applyParam('sort', e.target.value)}
        >
          <option value="recent">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated sellers</option>
        </Select>

        <div className="flex items-center rounded-[10px] border border-line-strong px-3">
          <Checkbox
            label="Wholesale"
            checked={searchParams.get('wholesale') === 'true'}
            onChange={(e) => applyParam('wholesale', e.target.checked ? 'true' : null)}
          />
        </div>
        <div className="flex items-center rounded-[10px] border border-line-strong px-3">
          <Checkbox
            label="Verified sellers"
            checked={searchParams.get('verified') === 'true'}
            onChange={(e) => applyParam('verified', e.target.checked ? 'true' : null)}
          />
        </div>
      </div>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(basePath))}
          className="mt-2 hidden items-center gap-1 text-xs font-medium text-ink-500 hover:text-danger sm:inline-flex"
        >
          <X className="h-3 w-3" /> Clear filters
        </button>
      ) : null}
      {pending ? <span className="sr-only" role="status">Updating results…</span> : null}
    </div>
  );
}
