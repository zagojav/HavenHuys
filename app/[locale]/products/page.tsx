import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { CATEGORIES, products, type Category, type Product } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { isSortKey, sortProducts, type SortKey } from '@/lib/sorting';
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: locale === 'en' ? '/products' : `/${locale}/products`,
    },
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
    },
  };
}

function isCategory(value: string | undefined): value is Category {
  return !!value && (CATEGORIES as readonly string[]).includes(value);
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const query = await searchParams;
  const category = isCategory(query.category) ? query.category : null;
  const sort: SortKey = isSortKey(query.sort) ? query.sort : 'featured';

  const t = await getTranslations('products');

  const filtered = category ? products.filter((p) => p.category === category) : products;
  const visible = sortProducts(filtered, sort);

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      <Reveal as="header" className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
          {t('lead')}
        </p>
      </Reveal>

      <div className="border-border mt-10 border-y py-5">
        <ProductFilters category={category} sort={sort} resultCount={visible.length} />
      </div>

      {/* Keyed on the query so a filter change re-suspends and the skeleton
          covers the round-trip instead of leaving the old grid in place. */}
      <Suspense
        key={`${category ?? 'all'}-${sort}`}
        fallback={
          <div className="mt-10">
            <ProductGridSkeleton count={8} label={t('loading')} />
          </div>
        }
      >
        <ProductGrid products={visible} locale={locale as Locale} />
      </Suspense>
    </div>
  );
}

async function ProductGrid({
  products: visible,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const t = await getTranslations('products');

  if (visible.length === 0) {
    return (
      <div className="mt-20 mb-16 text-center">
        <h2 className="font-display text-2xl">{t('empty.title')}</h2>
        <p className="text-text-secondary mx-auto mt-3 max-w-sm text-sm">
          {t('empty.body')}
        </p>
        <Link href="/products" className={buttonClasses('secondary', 'md', 'mt-7')}>
          {t('empty.cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
      {visible.map((product, index) => (
        <Reveal key={product.slug} delay={Math.min(index, 7) * 0.04}>
          <ProductCard product={product} locale={locale} priority={index < 4} />
        </Reveal>
      ))}
    </div>
  );
}
