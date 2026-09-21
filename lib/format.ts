import type { Locale } from '@/i18n/routing';

/**
 * Money is formatted by hand rather than with Intl.NumberFormat: the server and
 * the browser can disagree on ICU details, and that disagreement shows up as a
 * hydration warning on every price on the page.
 */
function group(euros: number, separator: string): string {
  return euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/** Renders cents as a EUR string in the conventions of `locale`. */
export function formatPrice(cents: number, locale: Locale = 'en'): string {
  const euros = Math.floor(Math.abs(cents) / 100);
  const remainder = (Math.abs(cents) % 100).toString().padStart(2, '0');
  const sign = cents < 0 ? '-' : '';

  return locale === 'nl'
    ? `${sign}€ ${group(euros, '.')},${remainder}`
    : `${sign}€${group(euros, ',')}.${remainder}`;
}

/** "€149.00" without the decimals when they are .00 — used on compact cards. */
export function formatPriceShort(cents: number, locale: Locale = 'en'): string {
  const full = formatPrice(cents, locale);
  return cents % 100 === 0 ? full.replace(/[.,]00$/, '') : full;
}
