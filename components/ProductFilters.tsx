'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { CATEGORIES, type Category } from '@/data/products';
import { SORT_KEYS, type SortKey } from '@/lib/sorting';

const CATEGORY_KEYS: Record<Category, string> = {
  lighting: 'lighting',
  textiles: 'textiles',
  storage: 'storage',
  tableware: 'tableware',
  'decor-objects': 'decorObjects',
};

interface ProductFiltersProps {
  /** Current values come from the server so this never reads the URL itself. */
  category: Category | null;
  sort: SortKey;
  resultCount: number;
}

export function ProductFilters({ category, sort, resultCount }: ProductFiltersProps) {
  const t = useTranslations('products');
  const tCat = useTranslations('categories');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: { category?: Category | null; sort?: SortKey }) {
    const params = new URLSearchParams();
    const nextCategory = next.category !== undefined ? next.category : category;
    const nextSort = next.sort ?? sort;

    if (nextCategory) params.set('category', nextCategory);
    if (nextSort !== 'featured') params.set('sort', nextSort);

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/products?${query}` : '/products', { scroll: false });
    });
  }

  return (
    <div
      data-pending={isPending ? '' : undefined}
      className="flex flex-col gap-5 transition-opacity duration-200 data-pending:opacity-60 lg:flex-row lg:items-center lg:justify-between"
    >
      <div
        role="group"
        aria-label={t('filterLabel')}
        className="no-scrollbar relative -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8 lg:mx-0 lg:flex-wrap lg:px-0"
      >
        <FilterPill
          active={category === null}
          onClick={() => navigate({ category: null })}
          label={tCat('all')}
        />

        {CATEGORIES.map((id) => (
          <FilterPill
            key={id}
            active={category === id}
            onClick={() => navigate({ category: id })}
            label={tCat(CATEGORY_KEYS[id])}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 lg:justify-end">
        <p aria-live="polite" className="text-text-secondary text-sm tabular-nums">
          {t('count', { count: resultCount })}
        </p>

        <div className="relative">
          <label htmlFor="sort" className="sr-only">
            {t('sortLabel')}
          </label>

          <select
            id="sort"
            value={sort}
            onChange={(event) => navigate({ sort: event.target.value as SortKey })}
            className="border-border text-text-primary hover:border-accent focus-visible:border-accent h-10 cursor-pointer appearance-none rounded-full border bg-transparent py-0 pr-9 pl-4 text-sm transition-colors duration-200"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`sort.${key}`)}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className="text-text-secondary pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'ease-soft shrink-0 rounded-full border px-4 py-2 text-sm transition-all duration-200 ' +
        (active
          ? 'border-charcoal bg-charcoal text-bg'
          : 'border-border text-text-secondary hover:border-accent hover:text-accent-hover')
      }
    >
      {label}
    </button>
  );
}
