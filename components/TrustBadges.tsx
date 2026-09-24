import { getTranslations } from 'next-intl/server';
import { Lock, RotateCcw, Truck } from 'lucide-react';

const BADGES = [
  { key: 'secure', Icon: Lock },
  { key: 'returns', Icon: RotateCcw },
  { key: 'shipping', Icon: Truck },
] as const;

/**
 * Three quiet reassurances for the moment just before a purchase. Each one
 * restates a promise the shop keeps elsewhere on the site, so nothing here is
 * a claim we would have to walk back.
 */
export async function TrustBadges({ className = '' }: { className?: string }) {
  const t = await getTranslations('product.trust');

  return (
    <ul
      className={
        'text-text-secondary flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ' +
        className
      }
    >
      {BADGES.map(({ key, Icon }) => (
        <li key={key} className="inline-flex items-center gap-1.5">
          <Icon className="size-3.5 shrink-0" strokeWidth={1.6} />
          {t(key)}
        </li>
      ))}
    </ul>
  );
}
