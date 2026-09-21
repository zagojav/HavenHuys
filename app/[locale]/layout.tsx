import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Fraunces, Inter } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import '../globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://havenhuis.nl';

const OG_IMAGE =
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&h=630&q=80';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t('name')} · ${t('tagline')}`,
      template: `%s · ${t('name')}`,
    },
    description: t('description'),
    applicationName: t('name'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages: { en: '/', nl: '/nl' },
    },
    openGraph: {
      type: 'website',
      siteName: t('name'),
      title: `${t('name')} · ${t('tagline')}`,
      description: t('description'),
      locale: locale === 'nl' ? 'nl_NL' : 'en_GB',
      url: locale === routing.defaultLocale ? '/' : `/${locale}`,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('tagline'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('name')} · ${t('tagline')}`,
      description: t('description'),
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts every page under this layout into static rendering.
  setRequestLocale(locale as Locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider>
          <ToastProvider>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
