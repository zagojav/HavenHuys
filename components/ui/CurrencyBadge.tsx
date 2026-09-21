import { formatPrice } from '@/lib/format';
import type { Locale } from '@/i18n/routing';

interface CurrencyBadgeProps {
  cents: number;
  locale: Locale;
  /** Struck-through original price, when the piece is reduced. */
  compareAtCents?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Prefix read by screen readers only, e.g. "Was". */
  compareLabel?: string;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl sm:text-2xl',
} as const;

/**
 * Prices always render in EUR with the symbol in the position the locale
 * expects: "€149.00" in English, "€ 149,00" in Dutch.
 */
export function CurrencyBadge({
  cents,
  locale,
  compareAtCents,
  size = 'md',
  className,
  compareLabel,
}: CurrencyBadgeProps) {
  const price = formatPrice(cents, locale);

  return (
    // `relative` matters: the sr-only label below is absolutely positioned, and
    // without a positioned ancestor it escapes any scroll container it sits in
    // and stretches the page horizontally.
    <span
      className={['relative inline-flex items-baseline gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={['font-medium tabular-nums', sizes[size]].join(' ')}>{price}</span>

      {compareAtCents !== undefined && compareAtCents > cents && (
        <span className="text-text-secondary text-sm tabular-nums line-through">
          {compareLabel && <span className="sr-only">{compareLabel} </span>}
          {formatPrice(compareAtCents, locale)}
        </span>
      )}
    </span>
  );
}
