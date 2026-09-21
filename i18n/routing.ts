import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'nl'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
};
