import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, PackageCheck, Ruler, Sprout, Undo2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getProduct, products, relatedProducts } from '@/data/products';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductPurchase } from '@/components/ProductPurchase';
import { ProductCard } from '@/components/ProductCard';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Reveal } from '@/components/ui/Reveal';
import { formatPrice } from '@/lib/format';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    products.map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    const t = await getTranslations({ locale, namespace: 'product.notFound' });
    return { title: t('title') };
  }

  const key = locale as Locale;
  const title = product.name[key];
  const description = `${product.tagline[key]} ${product.description[key]}`.slice(0, 180);
  const image = product.images[0]?.src;

  return {
    title,
    description,
    alternates: {
      canonical: locale === 'en' ? `/products/${slug}` : `/${locale}/products/${slug}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: image ? [{ url: image, width: 1400, height: 1400, alt: title }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const product = getProduct(slug);
  if (!product) notFound();

  const key = locale as Locale;
  const t = await getTranslations('product');
  const related = relatedProducts(product, 4);

  // Product structured data, so the listing can earn a rich result.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[key],
    description: product.description[key],
    image: product.images.map((image) => image.src),
    // Only emit `material` when we have a confirmed value; an empty property
    // is worse than an absent one for rich results.
    ...(product.material ? { material: product.material[key] } : {}),
    brand: { '@type': 'Brand', name: 'Haven Huis' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (product.priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="shell pt-8 sm:pt-12">
      <script
        type="application/ld+json"
        // Static, locally-built object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/products"
        className="group text-text-secondary hover:text-accent-hover inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="ease-soft size-4 transition-transform duration-200 group-hover:-translate-x-1" />
        {t('back')}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <ProductGallery
          images={product.images}
          locale={key}
          productName={product.name[key]}
        />

        <div className="lg:pt-4">
          {product.badge && (
            <span className="bg-surface text-charcoal inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-medium tracking-[0.08em] uppercase">
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

          <h1 className="font-display mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            {product.name[key]}
          </h1>

          <p className="text-text-secondary mt-3 text-[0.9375rem]">
            {product.tagline[key]}
          </p>

          <div className="mt-6">
            <CurrencyBadge
              cents={product.priceCents}
              compareAtCents={product.compareAtCents}
              locale={key}
              size="lg"
              compareLabel={t('wasLabel')}
            />
            {product.compareAtCents && (
              <p className="text-text-secondary mt-1.5 text-xs">
                {t('was', { price: formatPrice(product.compareAtCents, key) })}
              </p>
            )}
          </div>

          <ProductPurchase product={product} locale={key} />

          <div className="border-border mt-10 border-t pt-8">
            <h2 className="eyebrow">{t('details')}</h2>
            <p className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
              {product.description[key]}
            </p>

            <dl className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {product.material && (
                <Detail
                  Icon={Sprout}
                  label={t('material')}
                  value={product.material[key]}
                />
              )}
              {product.dimensions && (
                <Detail Icon={Ruler} label={t('dimensions')} value={product.dimensions} />
              )}
              <Detail
                Icon={PackageCheck}
                label={t('delivery')}
                value={t('deliveryValue')}
              />
              <Detail Icon={Undo2} label={t('returns')} value={t('returnsValue')} />
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 sm:mt-32">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl">{t('related')}</h2>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
            {related.map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.05}>
                <ProductCard product={item} locale={key} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-accent mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
      <div>
        <dt className="text-text-secondary text-xs tracking-wide uppercase">{label}</dt>
        <dd className="text-text-primary mt-1 text-sm">{value}</dd>
      </div>
    </div>
  );
}
