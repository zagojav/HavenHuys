import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/Reveal';

const EDITORIAL_IMAGE =
  'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1400&q=80';

export async function Editorial() {
  const t = await getTranslations('home.editorial');

  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow">{t('eyebrow')}</p>

          <h2 className="font-display mt-3 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]">
            {t('title')}
          </h2>

          <div className="text-text-secondary mt-6 space-y-4 text-[0.9375rem] leading-relaxed">
            <p>{t('body1')}</p>
            <p>{t('body2')}</p>
          </div>

          <Link
            href="/about"
            className="group text-accent-hover mt-8 inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="link-underline">{t('cta')}</span>
            <ArrowRight className="ease-soft size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <div className="bg-surface relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[5/6]">
            <Image
              src={EDITORIAL_IMAGE}
              alt={t('imageAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
