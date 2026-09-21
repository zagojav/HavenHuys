import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Carousel } from '@/components/ui/Carousel';
import { ProductCard } from '@/components/ProductCard';
import { bestsellers } from '@/data/products';
import type { Locale } from '@/i18n/routing';

export async function Bestsellers({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.bestsellers');

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t('eyebrow')}</p>
            <h2 className="font-display mt-3 max-w-xl text-3xl leading-tight sm:text-4xl">
              {t('title')}
            </h2>
            <p className="text-text-secondary mt-3 max-w-md text-sm">{t('body')}</p>
          </div>

          <Link href="/products" className="link-underline text-accent-hover text-sm">
            {t('cta')}
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <Carousel
            label={t('title')}
            previousLabel={t('previous')}
            nextLabel={t('next')}
          >
            {bestsellers.map((product) => (
              <div
                key={product.slug}
                className="w-[16rem] shrink-0 snap-start sm:w-[18rem] lg:w-[20rem]"
              >
                <ProductCard
                  product={product}
                  locale={locale}
                  sizes="(max-width: 640px) 60vw, 20rem"
                />
              </div>
            ))}
          </Carousel>
        </Reveal>
      </div>
    </section>
  );
}
