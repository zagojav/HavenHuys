import type { Locale } from '@/i18n/routing';

export interface CheckoutItem {
  slug: string;
  variantId?: string;
  quantity: number;
}

interface CheckoutRequest {
  locale: Locale;
  source: 'cart' | 'product';
  items: CheckoutItem[];
}

/**
 * Asks the server for a Checkout Session and sends the browser to it.
 *
 * Only slugs and quantities go over the wire. The server prices the bag from
 * data/products.ts, so what the customer is charged never depends on what is
 * in their localStorage.
 *
 * Resolves by navigating away; rejects if the session could not be created,
 * which is the caller's cue to keep the purchase intent rather than drop it.
 */
export async function startCheckout(request: CheckoutRequest): Promise<void> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Checkout Session request failed with ${response.status}`);
  }

  const { url } = (await response.json()) as { url?: string };

  if (!url) {
    throw new Error('Checkout Session request returned no URL');
  }

  window.location.href = url;
}
