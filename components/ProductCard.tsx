import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/products';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  /** Set on the first row so the LCP image is not lazy-loaded. */
  priority?: boolean;
  /** Overrides the responsive `sizes` hint when the card sits in a carousel. */
  sizes?: string;
}

const DEFAULT_SIZES = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw';

/**
 * Catalogue card. The second photograph is stacked underneath and cross-fades
 * in on hover, which keeps the whole card renderable on the server — no
 * client-side state for what is really a CSS transition.
 */
export async function ProductCard({
  product,
  locale,
  priority = false,
  sizes = DEFAULT_SIZES,
}: ProductCardProps) {
  const t = await getTranslations('product');

  const primary = product.images[0];
  const secondary = product.images[1];
  if (!primary) return null;

  return (
    <article>
      <Link
        href={`/products/${product.slug}`}
        className="group block rounded-xl focus-visible:outline-none"
      >
        <div className="bg-surface ring-accent ring-offset-bg ease-soft group-hover:shadow-lift relative aspect-[4/5] overflow-hidden rounded-xl ring-offset-4 transition-[transform,box-shadow] duration-300 group-hover:scale-[1.02] group-focus-visible:ring-2">
          <Image
            src={primary.src}
            alt={primary.alt[locale]}
            fill
            sizes={sizes}
            priority={priority}
            className="ease-soft object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              aria-hidden="true"
              fill
              sizes={sizes}
              loading="lazy"
              className="ease-soft object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {product.badge && (
            <span className="bg-bg/95 text-charcoal absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.08em] uppercase backdrop-blur-sm">
              <span
                aria-hidden="true"
                className={
                  'size-1.5 rounded-full ' +
                  (product.badge === 'new' ? 'bg-sage' : 'bg-accent')
                }
              />
              {t(`badge.${product.badge}`)}
            </span>
          )}
        </div>

        {/* The name reserves two lines whether it needs them or not, so the
            taglines and prices line up across a row of mixed-length names.
            Two columns on a phone leave no room for a price beside the name,
            so it drops underneath until there is width for both. */}
        <div className="mt-3.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-text-primary group-hover:text-accent-hover line-clamp-2 min-h-[2.75rem] text-[1.0625rem] leading-snug transition-colors">
              {product.name[locale]}
            </h3>
            <p className="text-text-secondary mt-0.5 truncate text-[0.8125rem]">
              {product.tagline[locale]}
            </p>
          </div>

          <CurrencyBadge
            cents={product.priceCents}
            compareAtCents={product.compareAtCents}
            locale={locale}
            size="sm"
            compareLabel={t('wasLabel')}
            className="shrink-0 sm:pt-0.5"
          />
        </div>
      </Link>
    </article>
  );
}
