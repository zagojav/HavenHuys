import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { buttonClasses } from '@/components/ui/Button';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=2000&q=80';

export async function Hero() {
  const t = await getTranslations('home.hero');

  return (
    <section className="relative isolate flex min-h-[32rem] items-end overflow-hidden sm:min-h-[36rem] lg:min-h-[44rem]">
      <Image
        src={HERO_IMAGE}
        alt={t('imageAlt')}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />

      {/* Warm scrim: dark enough at the foot for AA contrast on the copy,
          clear at the top so the photograph still reads. */}
      <div
        aria-hidden="true"
        className="from-charcoal/85 via-charcoal/45 to-charcoal/10 absolute inset-0 -z-10 bg-gradient-to-t"
      />

      <div className="shell w-full pt-28 pb-12 sm:pb-16 lg:pt-40 lg:pb-20">
        <div className="max-w-2xl">
          <p className="text-bg/80 text-[0.6875rem] font-medium tracking-[0.16em] uppercase">
            {t('eyebrow')}
          </p>

          <h1 className="font-display text-bg mt-4 text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-7xl">
            {t('headline')}
          </h1>

          <p className="text-bg/85 mt-5 max-w-lg text-[0.9375rem] leading-relaxed sm:text-base">
            {t('body')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products" className={buttonClasses('primary', 'lg')}>
              {t('cta')}
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/about"
              className={buttonClasses(
                'secondary',
                'lg',
                'border-bg/35 text-bg hover:border-bg hover:bg-bg/10 hover:text-bg',
              )}
            >
              {t('secondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
