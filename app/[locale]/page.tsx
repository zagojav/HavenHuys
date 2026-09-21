import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Bestsellers } from '@/components/home/Bestsellers';
import { ValueProps } from '@/components/home/ValueProps';
import { Editorial } from '@/components/home/Editorial';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <CategoryGrid locale={locale as Locale} />
      <Bestsellers locale={locale as Locale} />
      <ValueProps />
      <Editorial />
      <NewsletterSection />
    </>
  );
}
