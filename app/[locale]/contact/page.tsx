import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, Mail, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/ContactForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: locale === 'en' ? '/contact' : `/${locale}/contact`,
    },
    openGraph: { title: t('title'), description: t('metaDescription') },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations('contact');

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
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-surface rounded-2xl p-7">
            <h2 className="font-display text-xl">{t('aside.title')}</h2>

            <dl className="mt-6 space-y-6">
              <div className="flex gap-3">
                <Mail className="text-accent mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
                <div>
                  <dt className="text-text-secondary text-xs tracking-wide uppercase">
                    {t('aside.emailLabel')}
                  </dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={`mailto:${t('aside.email')}`}
                      className="link-underline text-text-primary"
                    >
                      {t('aside.email')}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="text-accent mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
                <div>
                  <dt className="text-text-secondary text-xs tracking-wide uppercase">
                    {t('aside.hoursLabel')}
                  </dt>
                  <dd className="mt-1 text-sm">{t('aside.hours')}</dd>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin
                  className="text-accent mt-0.5 size-4 shrink-0"
                  strokeWidth={1.6}
                />
                <div>
                  <dt className="text-text-secondary text-xs tracking-wide uppercase">
                    {t('aside.warehouseLabel')}
                  </dt>
                  <dd className="mt-1 text-sm">{t('aside.warehouse')}</dd>
                </div>
              </div>
            </dl>

            <div className="border-border mt-7 border-t pt-6">
              <p className="text-text-secondary text-sm">{t('aside.shippingNote')}</p>
              <Link
                href="/checkout-info"
                className="link-underline text-accent-hover mt-2 inline-block text-sm"
              >
                {t('aside.shippingLink')}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
