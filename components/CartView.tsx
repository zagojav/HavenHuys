'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProduct, type Product } from '@/data/products';
import { useCart, type CartLine } from '@/lib/store/cart';
import { useToast } from '@/components/ui/Toast';
import { startCheckout } from '@/lib/checkout';
import { centsToFreeShipping, shippingCentsFor } from '@/lib/shipping';
import { buttonClasses } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { CartSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatPrice, formatPriceShort } from '@/lib/format';

interface ResolvedLine {
  line: CartLine;
  product: Product;
}

export function CartView({ locale }: { locale: Locale }) {
  const t = useTranslations('cart');
  const { notify } = useToast();

  const lines = useCart((state) => state.lines);
  const hydrated = useCart((state) => state.hydrated);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const clear = useCart((state) => state.clear);

  const [pending, setPending] = useState(false);

  // Persisted state is only available after the store rehydrates in the
  // browser; rendering the bag before then would mismatch the server HTML.
  if (!hydrated) {
    return <CartSkeleton label={t('loading')} />;
  }

  const resolved: ResolvedLine[] = lines.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ line, product }] : [];
  });

  if (resolved.length === 0) {
    return (
      <div className="py-16 text-center sm:py-24">
        <span className="bg-surface text-accent inline-flex size-14 items-center justify-center rounded-full">
          <ShoppingBag className="size-6" strokeWidth={1.4} />
        </span>
        <h2 className="font-display mt-6 text-2xl sm:text-3xl">{t('empty.title')}</h2>
        <p className="text-text-secondary mx-auto mt-3 max-w-sm text-sm">
          {t('empty.body')}
        </p>
        <Link href="/products" className={buttonClasses('primary', 'lg', 'mt-8')}>
          {t('empty.cta')}
        </Link>
      </div>
    );
  }

  const subtotal = resolved.reduce(
    (total, { line, product }) => total + product.priceCents * line.quantity,
    0,
  );

  // The same two helpers the Checkout Session is built from, so the figure in
  // the bag is the figure Stripe charges.
  const shipping = shippingCentsFor(subtotal);
  const missingForFreeShipping = centsToFreeShipping(subtotal);

  async function goToCheckout() {
    setPending(true);

    try {
      await startCheckout({
        locale,
        source: 'cart',
        items: resolved.map(({ line }) => ({
          slug: line.slug,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      });
    } catch {
      // Nothing was charged and the bag is untouched; the customer can retry.
      notify(t('checkout.error'), 'error');
      setPending(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
      <div>
        <ul className="border-border border-t">
          <AnimatePresence initial={false}>
            {resolved.map(({ line, product }) => {
              const image = product.images[0];
              const variantLabel =
                locale === 'nl' ? line.variantLabelNl : line.variantLabelEn;

              return (
                <motion.li
                  key={line.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="border-border overflow-hidden border-b"
                >
                  <div className="flex gap-4 py-6">
                    <Link
                      href={`/products/${product.slug}`}
                      className="bg-surface relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-28"
                    >
                      {image && (
                        <Image
                          src={image.src}
                          alt={image.alt[locale]}
                          fill
                          sizes="112px"
                          className="ease-soft object-cover transition-transform duration-300 hover:scale-105"
                        />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${product.slug}`}
                            className="link-underline font-display text-lg leading-snug"
                          >
                            {product.name[locale]}
                          </Link>
                          {variantLabel && (
                            <p className="text-text-secondary mt-0.5 text-xs">
                              {variantLabel}
                            </p>
                          )}
                        </div>

                        <CurrencyBadge
                          cents={product.priceCents * line.quantity}
                          locale={locale}
                          size="sm"
                          className="shrink-0"
                        />
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <div className="border-border inline-flex h-9 items-center rounded-full border">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.id, line.quantity - 1)}
                            aria-label={t('decrease', { name: product.name[locale] })}
                            className="text-text-primary hover:text-accent inline-flex size-9 items-center justify-center rounded-full transition-colors"
                          >
                            <Minus className="size-3.5" />
                          </button>

                          <span className="w-7 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => setQuantity(line.id, line.quantity + 1)}
                            disabled={line.quantity >= 99}
                            aria-label={t('increase', { name: product.name[locale] })}
                            className="text-text-primary hover:text-accent inline-flex size-9 items-center justify-center rounded-full transition-colors disabled:opacity-35"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            remove(line.id);
                            notify(t('removed', { name: product.name[locale] }), 'info');
                          }}
                          aria-label={t('remove', { name: product.name[locale] })}
                          className="text-text-secondary hover:text-error inline-flex items-center gap-1.5 text-xs transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/products" className="link-underline text-accent-hover text-sm">
            {t('continue')}
          </Link>

          <button
            type="button"
            onClick={() => {
              clear();
              notify(t('cleared'), 'info');
            }}
            className="text-text-secondary hover:text-error text-xs transition-colors"
          >
            {t('clear')}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="bg-surface rounded-2xl p-6">
          <h2 className="font-display text-xl">{t('summary.title')}</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">{t('summary.subtotal')}</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, locale)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">{t('summary.shipping')}</dt>
              <dd className={shipping === 0 ? 'text-sage' : 'tabular-nums'}>
                {shipping === 0
                  ? t('summary.shippingFree')
                  : formatPrice(shipping, locale)}
              </dd>
            </div>
            <div className="border-border flex items-center justify-between border-t pt-3 text-base">
              <dt className="font-medium">{t('summary.total')}</dt>
              <dd className="font-medium tabular-nums">
                {formatPrice(subtotal + shipping, locale)}
              </dd>
            </div>
          </dl>

          {missingForFreeShipping > 0 && (
            <p className="text-text-secondary mt-3 text-xs">
              {t('summary.freeHint', {
                amount: formatPriceShort(missingForFreeShipping, locale),
              })}
            </p>
          )}

          <p className="text-text-secondary mt-3 text-xs">{t('summary.vat')}</p>
        </div>

        <div className="border-border mt-5 rounded-2xl border p-6">
          <h2 className="font-display text-lg">{t('checkout.title')}</h2>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">
            {t('checkout.body')}
          </p>

          <button
            type="button"
            onClick={goToCheckout}
            disabled={pending}
            className={buttonClasses('primary', 'md', 'mt-5 w-full')}
          >
            <Lock className="size-3.5" strokeWidth={2} />
            {pending ? t('checkout.pending') : t('checkout.pay')}
          </button>

          <p className="text-text-secondary mt-3 text-xs">{t('checkout.countries')}</p>

          <p className="text-text-secondary mt-5 text-xs">
            {t('checkout.help')}{' '}
            <Link href="/contact" className="link-underline text-accent-hover">
              {t('checkout.helpLink')}
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
