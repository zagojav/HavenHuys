/**
 * Shipping terms, in one place.
 *
 * The Checkout Session builds its `shipping_options` from these constants and
 * every price the site quotes is formatted from them too, so the figure on the
 * bag, the figure on the shipping page and the figure the customer is actually
 * charged cannot drift apart.
 */

/** Flat domestic rate, charged below the free-shipping threshold. */
export const SHIPPING_FLAT_CENTS = 495;

/** Subtotal at or above which shipping is free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

/**
 * Countries Checkout will accept a delivery address in. The Netherlands only
 * for now: the rest of the EU needs a VAT registration and Stripe Tax before
 * we can quote a legal price at the border.
 */
export const SHIPPING_COUNTRIES = ['NL'] as const;

/** Delivery window quoted on the shipping page, in business days. */
export const DELIVERY_DAYS = { min: 15, max: 30 } as const;

/** What shipping costs for a given goods subtotal, in cents. */
export function shippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

/** Cents still missing before shipping becomes free; 0 once it is. */
export function centsToFreeShipping(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
}
