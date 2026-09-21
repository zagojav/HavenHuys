import type { Product } from '@/data/products';

/**
 * Sort options for the collection listing.
 *
 * These live outside components/ProductFilters.tsx deliberately. That module is
 * marked 'use client', and a value imported from a client module into a server
 * component arrives as a client-reference proxy rather than the value itself —
 * `SORT_KEYS.includes(...)` then throws "includes is not a function" during the
 * server render. Keeping the data here lets both sides import the real array.
 */
export type SortKey = 'featured' | 'newest' | 'priceAsc' | 'priceDesc';

export const SORT_KEYS: readonly SortKey[] = [
  'featured',
  'newest',
  'priceAsc',
  'priceDesc',
];

export function isSortKey(value: string | undefined): value is SortKey {
  return !!value && (SORT_KEYS as readonly string[]).includes(value);
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const sorted = [...list];

  switch (sort) {
    case 'priceAsc':
      return sorted.sort((a, b) => a.priceCents - b.priceCents);
    case 'priceDesc':
      return sorted.sort((a, b) => b.priceCents - a.priceCents);
    case 'newest':
      return sorted.sort((a, b) => b.addedOn.localeCompare(a.addedOn));
    case 'featured':
    default:
      // Bestsellers first, then catalogue order.
      return sorted.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
  }
}
