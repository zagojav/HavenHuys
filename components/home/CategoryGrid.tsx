import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { CATEGORY_CARDS } from '@/lib/categories';
import type { Locale } from '@/i18n/routing';

const CATEGORY_KEYS: Record<string, string> = {
  lighting: 'lighting',
  textiles: 'textiles',
  storage: 'storage',
  tableware: 'tableware',
  'decor-objects': 'decorObjects',
};

export async function CategoryGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.categories');
  const tCat = await getTranslations('categories');

  const [feature, ...rest] = CATEGORY_CARDS;
  if (!feature) return null;

  return (
    <section className="shell py-20 sm:py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h2 className="font-display mt-3 max-w-lg text-3xl leading-tight sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-text-secondary mt-3 max-w-md text-sm">{t('body')}</p>
        </div>

        <Link
          href="/products"
          className="link-underline text-accent-hover hidden text-sm sm:inline-block"
        >
          {t('cta')}
        </Link>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {/* The first edit takes a double-height slot on wide screens. */}
        <Reveal className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <CategoryTile
            href={`/products?category=${feature.id}`}
            label={tCat(CATEGORY_KEYS[feature.id] ?? feature.id)}
            image={feature.image}
            alt={feature.alt[locale]}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 33vw"
            className="aspect-[4/5] lg:aspect-auto lg:h-full"
            priority
          />
        </Reveal>

        {rest.map((category, index) => (
          <Reveal key={category.id} delay={0.06 * (index + 1)}>
            <CategoryTile
              href={`/products?category=${category.id}`}
              label={tCat(CATEGORY_KEYS[category.id] ?? category.id)}
              image={category.image}
              alt={category.alt[locale]}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="aspect-[4/3]"
              priority={index === 0}
            />
          </Reveal>
        ))}
      </div>

      <Link
        href="/products"
        className="link-underline text-accent-hover mt-8 inline-block text-sm sm:hidden"
      >
        {t('cta')}
      </Link>
    </section>
  );
}

interface CategoryTileProps {
  href: string;
  label: string;
  image: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

function CategoryTile({
  href,
  label,
  image,
  alt,
  sizes,
  className,
  priority = false,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className={
        'group bg-surface ring-accent ring-offset-bg relative block w-full overflow-hidden rounded-xl ring-offset-4 focus-visible:ring-2 focus-visible:outline-none ' +
        (className ?? '')
      }
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="ease-soft object-cover transition-transform duration-[600ms] group-hover:scale-[1.05]"
      />

      <div
        aria-hidden="true"
        className="from-charcoal/70 via-charcoal/10 group-hover:from-charcoal/80 absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-300"
      />

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5">
        <span className="font-display text-bg text-xl sm:text-2xl">{label}</span>
        <span className="bg-bg/15 text-bg ease-soft group-hover:bg-bg group-hover:text-charcoal inline-flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200">
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </Link>
  );
}
