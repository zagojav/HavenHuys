import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, CreditCard, PackageCheck, Truck, Undo2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { formatPrice, formatPriceShort } from '@/lib/format';
import {
  DELIVERY_DAYS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FLAT_CENTS,
} from '@/lib/shipping';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkoutInfo' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: locale === 'en' ? '/checkout-info' : `/${locale}/checkout-info`,
    },
    openGraph: { title: t('title'), description: t('metaDescription') },
  };
}

export default async function CheckoutInfoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations('checkoutInfo');

  // Both figures come from lib/shipping.ts, the same constants the Checkout
  // Session is built from, so this page cannot quote a rate we do not charge.
  const shippingRows = [
    {
      label: t('shipping.rows.euLabel'),
      value: t('shipping.rows.euValue', {
        min: DELIVERY_DAYS.min,
        max: DELIVERY_DAYS.max,
        price: formatPrice(SHIPPING_FLAT_CENTS, locale as Locale),
        threshold: formatPriceShort(FREE_SHIPPING_THRESHOLD_CENTS, locale as Locale),
      }),
    },
    {
      label: t('shipping.rows.elsewhereLabel'),
      value: t('shipping.rows.elsewhereValue'),
    },
  ];

  const returnSteps = [
    t('returns.steps.one'),
    t('returns.steps.two'),
    t('returns.steps.three'),
    t('returns.steps.four'),
  ];

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      <Reveal as="header" className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
          {t('lead')}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Section Icon={PackageCheck} title={t('shipping.title')}>
            <p>{t('shipping.body')}</p>

            <dl className="divide-border border-border mt-6 divide-y border-y">
              {shippingRows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3.5"
                >
                  <dt className="text-text-primary text-sm">{row.label}</dt>
                  <dd className="text-text-secondary text-sm">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <div className="mt-12">
            <Section Icon={Truck} title={t('delivery.title')}>
              <p>{t('delivery.body')}</p>
            </Section>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Section Icon={Undo2} title={t('returns.title')}>
            <p>{t('returns.body')}</p>

            <ol className="mt-6 space-y-4">
              {returnSteps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="bg-surface text-accent-hover inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <span className="text-text-secondary pt-1 text-sm">{step}</span>
                </li>
              ))}
            </ol>

            <p className="bg-surface text-text-secondary mt-6 rounded-xl px-5 py-4 text-sm">
              {t('returns.note')}
            </p>

            <Link
              href="/cancel-order"
              className="link-underline text-accent-hover mt-5 inline-block text-sm"
            >
              {t('returns.cancelLink')}
            </Link>
          </Section>

          <div className="mt-12">
            <Section Icon={CreditCard} title={t('payment.title')}>
              <p>{t('payment.body')}</p>
            </Section>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <Link href="/products" className={buttonClasses('primary', 'lg')}>
          {t('cta')}
          <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </div>
  );
}

function Section({
  Icon,
  title,
  children,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="bg-surface text-accent inline-flex size-9 items-center justify-center rounded-full">
          <Icon className="size-4" strokeWidth={1.6} />
        </span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>

      <div className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
