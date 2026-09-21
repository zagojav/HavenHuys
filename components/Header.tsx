'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useCart, countItems } from '@/lib/store/cart';

const NAV = [
  { href: '/products', key: 'shop' },
  { href: '/about', key: 'about' },
  { href: '/checkout-info', key: 'shipping' },
  { href: '/contact', key: 'contact' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = useCart((state) => state.lines);
  const hydrated = useCart((state) => state.hydrated);
  const count = hydrated ? countItems(lines) : 0;

  // The header is transparent while the page sits at the top and picks up a
  // blurred background once the content starts sliding underneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock the page behind the open panel.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="focus:bg-charcoal focus:text-bg sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:px-4 focus:py-2 focus:text-sm"
      >
        {tCommon('skipToContent')}
      </a>

      <header
        className={
          'ease-soft sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ' +
          (scrolled
            ? 'border-border bg-bg/85 border-b backdrop-blur-md'
            : 'border-b border-transparent bg-transparent')
        }
      >
        <div className="shell flex h-16 items-center justify-between gap-4 sm:h-20">
          <Link
            href="/"
            aria-label={t('home')}
            className="text-accent shrink-0 transition-opacity hover:opacity-80"
          >
            <Logo height={26} />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => {
              const isActive =
                item.href === '/products'
                  ? pathname.startsWith('/products')
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    'link-underline text-sm transition-colors duration-200 ' +
                    (isActive
                      ? 'text-accent-hover'
                      : 'text-text-secondary hover:text-text-primary')
                  }
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />

            <Link
              href="/cart"
              aria-label={t('bagWithCount', { count })}
              className="text-text-primary hover:bg-surface relative inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200 active:scale-95"
            >
              <ShoppingBag className="size-[1.15rem]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="bg-accent-hover text-bg absolute top-1 right-0.5 inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[0.625rem] leading-[1.15rem] font-semibold tabular-nums">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              className="text-text-primary hover:bg-surface inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200 active:scale-95 lg:hidden"
            >
              {menuOpen ? (
                <X className="size-5" strokeWidth={1.6} />
              ) : (
                <Menu className="size-5" strokeWidth={1.6} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-border bg-bg overflow-hidden border-t lg:hidden"
            >
              <nav aria-label="Mobile" className="shell flex flex-col py-4">
                {NAV.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index + 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="border-border font-display text-text-primary hover:text-accent-hover block border-b py-3.5 text-xl transition-colors"
                    >
                      {t(item.key)}
                    </Link>
                  </motion.div>
                ))}

                <div className="flex items-center justify-between pt-5">
                  <span className="eyebrow">{t('language')}</span>
                  <LanguageSwitcher />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
