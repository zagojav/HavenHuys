'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Two locales only, so a segmented toggle beats a dropdown: both options stay
 * visible and it is one tap on mobile. The current path is preserved across the
 * switch — `usePathname` from next-intl returns it without the locale prefix.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const t = useTranslations('nav');
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === active) return;
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div
      role="group"
      aria-label={t('language')}
      data-pending={isPending ? '' : undefined}
      className={[
        'border-border inline-flex items-center rounded-full border p-0.5 text-[0.6875rem] font-medium tracking-[0.08em] uppercase transition-opacity data-pending:opacity-60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === active;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={isActive ? 'true' : undefined}
            className={
              'rounded-full px-2.5 py-1 transition-colors duration-200 ' +
              (isActive
                ? 'bg-charcoal text-bg'
                : 'text-text-secondary hover:text-text-primary')
            }
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
