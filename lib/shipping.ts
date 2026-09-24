/**
 * Shipping terms, in one place.
 *
 * The Checkout Session builds its `shipping_options` from these constants and
 * every price the site quotes is formatted from them too, so the figure on the
 * bag, the figure on the shipping page and the figure the customer is actually
 * charged cannot drift apart.
 */

/** Flat rate, charged below the free-shipping threshold. */
export const SHIPPING_FLAT_CENTS = 495;

/** Subtotal at or above which shipping is free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

/**
 * Countries Checkout will accept a delivery address in: the 27 EU member
 * states.
 *
 * Two things make the bloc one shipping zone rather than 27. The supplier
 * picks from a European warehouse, so the delivery window quoted below holds
 * for any address inside it. And distance selling to consumers anywhere in the
 * EU is covered by a single OSS registration, so crossing an internal border
 * needs no separate registration per country — the same VAT arrangement that
 * already applies to the Netherlands.
 */
export const SHIPPING_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
] as const;

export type ShippingCountry = (typeof SHIPPING_COUNTRIES)[number];

/** Delivery window quoted on the shipping page, in business days. */
export const DELIVERY_DAYS = { min: 15, max: 30 } as const;

/**
 * What shipping costs for a given goods subtotal, in cents.
 *
 * One rate for the whole bloc today. If a region turns out to cost materially
 * more to reach — the islands and the far edges are the candidates, Cyprus and
 * Malta first — the rate belongs here rather than at the call site:
 *
 *   const FLAT_CENTS_BY_COUNTRY: Partial<Record<ShippingCountry, number>> = {
 *     CY: 895,
 *     MT: 895,
 *   };
 *
 * Note what that costs at the Stripe end, though. `shipping_options` is fixed
 * when the Session is created, and the destination is not known until the
 * customer types an address inside Checkout — so a per-country rate means
 * either asking for the country before the session is created, or moving to
 * Stripe's dynamic shipping rates. Until one of those is in place, a single
 * rate across the bloc is not a simplification, it is the constraint.
 */
export function shippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

/** Cents still missing before shipping becomes free; 0 once it is. */
export function centsToFreeShipping(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
