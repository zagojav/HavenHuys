import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { CartView } from '@/components/CartView';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations('cart');

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t('title')}</h1>

      <div className="mt-10">
        <CartView locale={locale as Locale} />
      </div>
    </div>
  );
}
