'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product } from '@/data/products';
import type { Locale } from '@/i18n/routing';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/store/cart';
import { useToast } from '@/components/ui/Toast';
import { paymentLinkFor } from '@/lib/payment-links';
import { Button } from '@/components/ui/Button';

interface ProductPurchaseProps {
  product: Product;
  locale: Locale;
}

export function ProductPurchase({ product, locale }: ProductPurchaseProps) {
  const t = useTranslations('product');
  const { notify } = useToast();
  const router = useRouter();
  const add = useCart((state) => state.add);

  const firstOption = product.variants?.options[0];
  const [variantId, setVariantId] = useState<string | undefined>(firstOption?.id);
  const [quantity, setQuantity] = useState(1);

  const selected = product.variants?.options.find((option) => option.id === variantId);

  function addToBag() {
    add(
      {
        slug: product.slug,
        variantId: selected?.id,
        variantLabelEn: selected?.label.en,
        variantLabelNl: selected?.label.nl,
      },
      quantity,
    );
    notify(t('toast.added', { name: product.name[locale] }));
  }

  function buyNow() {
    const link = paymentLinkFor(product.slug);

    if (link) {
      window.location.href = link;
      return;
    }

    // No Mollie link configured for this piece yet — keep the purchase intent
    // rather than dropping it on the floor.
    addToBagSilently();
    notify(t('toast.noLink'), 'info');
    router.push('/cart');
  }

  function addToBagSilently() {
    add(
      {
        slug: product.slug,
        variantId: selected?.id,
        variantLabelEn: selected?.label.en,
        variantLabelNl: selected?.label.nl,
      },
      quantity,
    );
  }

  return (
    <div className="mt-8">
      {product.variants && (
        <fieldset className="mb-7">
          <legend className="eyebrow mb-3">
            {product.variants.label[locale]}
            {selected && (
              <span className="text-text-primary ml-2 tracking-normal normal-case">
                {selected.label[locale]}
              </span>
            )}
          </legend>

          <div className="flex flex-wrap gap-2">
            {product.variants.options.map((option) => {
              const isActive = option.id === variantId;

              return option.swatch ? (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVariantId(option.id)}
                  aria-pressed={isActive}
                  aria-label={option.label[locale]}
                  title={option.label[locale]}
                  className={
                    'ease-soft size-9 rounded-full border transition-all duration-200 hover:scale-110 ' +
                    (isActive
                      ? 'border-charcoal ring-charcoal ring-offset-bg ring-2 ring-offset-2'
                      : 'border-border')
                  }
                  style={{ backgroundColor: option.swatch }}
                />
              ) : (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVariantId(option.id)}
                  aria-pressed={isActive}
                  className={
                    'ease-soft rounded-full border px-4 py-2 text-sm transition-all duration-200 ' +
                    (isActive
                      ? 'border-charcoal bg-charcoal text-bg'
                      : 'border-border text-text-secondary hover:border-accent hover:text-accent-hover')
                  }
                >
                  {option.label[locale]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label={t('quantity')}
          className="border-border inline-flex h-11 items-center rounded-full border"
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label={t('decrease')}
            className="text-text-primary hover:text-accent inline-flex size-11 items-center justify-center rounded-full transition-colors disabled:opacity-35"
          >
            <Minus className="size-4" />
          </button>

          <span
            aria-live="polite"
            className="w-8 text-center text-sm font-medium tabular-nums"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={quantity >= 99}
            aria-label={t('increase')}
            className="text-text-primary hover:text-accent inline-flex size-11 items-center justify-center rounded-full transition-colors disabled:opacity-35"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={buyNow}
          className="flex-1 sm:flex-none"
        >
          {t('buyNow')}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={addToBag}
          className="flex-1 sm:flex-none"
        >
          <ShoppingBag className="size-4" strokeWidth={1.7} />
          {t('addToBag')}
        </Button>
      </div>
    </div>
  );
}
