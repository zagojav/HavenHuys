import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { products } from '@/data/products';

const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1400&q=80';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: locale === 'en' ? '/about' : `/${locale}/about`,
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [{ url: ABOUT_IMAGE, width: 1400, height: 1050, alt: t('imageAlt') }],
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations('about');

  const stats = [
    { value: String(products.length), label: t('stats.pieces') },
    { value: '30', label: t('stats.returns') },
    { value: '15–30', label: t('stats.delivery') },
  ];

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      <Reveal as="header" className="max-w-3xl">
        <p className="eyebrow">{t('title')}</p>
        <h1 className="font-display mt-4 text-[2rem] leading-[1.15] sm:text-5xl lg:text-[3.25rem]">
          {t('lead')}
        </h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <div className="bg-surface relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src={ABOUT_IMAGE}
            alt={t('imageAlt')}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="text-text-secondary space-y-5 text-[0.9375rem] leading-relaxed">
          <p className="text-text-primary text-lg leading-relaxed">{t('body1')}</p>
          <p>{t('body2')}</p>
          <p>{t('body3')}</p>

          <div className="pt-4">
            <Link href="/products" className={buttonClasses('primary', 'lg')}>
              {t('cta')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="divide-border bg-surface divide-y rounded-2xl px-6">
            {stats.map((stat) => (
              <div key={stat.label} className="py-6">
                <dt className="font-display text-accent text-4xl">{stat.value}</dt>
                <dd className="text-text-secondary mt-1 text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </div>
  );
}
