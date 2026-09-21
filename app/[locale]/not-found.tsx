'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonClasses } from '@/components/ui/Button';

/**
 * Client component on purpose: it renders inside the locale layout's
 * NextIntlClientProvider, which supplies messages without needing the request
 * locale that a not-found render does not always carry.
 */
export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-accent text-7xl sm:text-8xl">404</p>
      <h1 className="font-display mt-6 text-3xl sm:text-4xl">{t('title')}</h1>
      <p className="text-text-secondary mt-4 max-w-md text-[0.9375rem] leading-relaxed">
        {t('body')}
      </p>
      <Link href="/" className={buttonClasses('primary', 'lg', 'mt-8')}>
        {t('cta')}
      </Link>
    </div>
  );
}
