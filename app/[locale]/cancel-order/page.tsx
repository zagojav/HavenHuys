import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarClock, ShieldCheck, Undo2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { CancelOrderForm } from '@/components/CancelOrderForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cancelOrder' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: locale === 'en' ? '/cancel-order' : `/${locale}/cancel-order`,
    },
    openGraph: { title: t('title'), description: t('metaDescription') },
  };
}

export default async function CancelOrderPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations('cancelOrder');

  const rights = [
    { Icon: CalendarClock, body: t('rights.body') },
    { Icon: ShieldCheck, body: t('rights.policy') },
    { Icon: Undo2, body: t('rights.refund') },
  ];

  return (
    <div className="shell pt-12 pb-8 sm:pt-16">
      <Reveal as="header" className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-text-secondary mt-4 text-[0.9375rem] leading-relaxed">
          {t('lead')}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <CancelOrderForm />
        </Reveal>

        <Reveal delay={0.1}>
          <section className="bg-surface rounded-2xl p-7">
            <h2 className="font-display text-xl">{t('rights.title')}</h2>

            <ul className="mt-6 space-y-6">
              {rights.map(({ Icon, body }) => (
                <li key={body} className="flex gap-3">
                  <Icon
                    className="text-accent mt-0.5 size-4 shrink-0"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <p className="text-text-secondary text-sm leading-relaxed">{body}</p>
                </li>
              ))}
            </ul>

            <div className="border-border mt-7 border-t pt-6">
              <Link
                href="/checkout-info"
                className="link-underline text-accent-hover inline-block text-sm"
              >
                {t('rights.link')}
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
