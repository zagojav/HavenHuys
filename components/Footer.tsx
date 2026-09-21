import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/Logo';
import { NewsletterForm } from '@/components/NewsletterForm';
import { CATEGORIES } from '@/data/products';

const CATEGORY_KEYS: Record<string, string> = {
  lighting: 'lighting',
  textiles: 'textiles',
  storage: 'storage',
  tableware: 'tableware',
  'decor-objects': 'decorObjects',
};

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tCat = await getTranslations('categories');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-bg mt-24 sm:mt-32">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.5fr] lg:gap-10">
          <div>
            <Link href="/" aria-label={tNav('home')} className="text-bg inline-block">
              <Logo height={28} />
            </Link>
            <p className="text-bg/60 mt-5 max-w-xs text-sm leading-relaxed">
              {t('blurb')}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t('instagram')}
                className="border-bg/20 text-bg/70 hover:border-bg/50 hover:text-bg inline-flex size-9 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Brand glyphs were dropped from lucide v1, so these are inline. */}
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3.8" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t('pinterest')}
                className="border-bg/20 text-bg/70 hover:border-bg/50 hover:text-bg inline-flex size-9 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M9.5 21c-.4-1.3-.2-3 .1-4.3l1.2-5" strokeLinecap="round" />
                  <path
                    d="M8.6 10.4c0-2.4 1.8-4.4 4.5-4.4 2.4 0 4.1 1.5 4.1 3.9 0 2.9-1.5 5.1-3.7 5.1-1.2 0-2.1-1-1.8-2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9.2" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2
              id="footer-shop"
              className="text-bg/45 text-[0.6875rem] font-medium tracking-[0.16em] uppercase"
            >
              {t('shopTitle')}
            </h2>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/products?category=${category}`}
                    className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                  >
                    {tCat(CATEGORY_KEYS[category] ?? category)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-house">
            <h2
              id="footer-house"
              className="text-bg/45 text-[0.6875rem] font-medium tracking-[0.16em] uppercase"
            >
              {t('houseTitle')}
            </h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                >
                  {tNav('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                >
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout-info"
                  className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                >
                  {tNav('shipping')}
                </Link>
              </li>
              {/* Kept in the footer on purpose: the cancellation route has to be
                  reachable from any page, not only from a customer's account. */}
              <li>
                <Link
                  href="/cancel-order"
                  className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                >
                  {tNav('cancelOrder')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="link-underline text-bg/75 hover:text-bg text-sm transition-colors"
                >
                  {tNav('bag')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-bg/45 text-[0.6875rem] font-medium tracking-[0.16em] uppercase">
              {t('newsletterTitle')}
            </h2>
            <p className="text-bg/60 mt-5 mb-4 text-sm">{t('newsletterBody')}</p>
            <NewsletterForm tone="dark" />
          </div>
        </div>

        <div className="border-bg/12 text-bg/45 mt-14 flex flex-col gap-4 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{t('rights', { year })}</p>
          <p className="sm:order-first">{t('operator')}</p>
        </div>
      </div>
    </footer>
  );
}
