import 'server-only';
import Stripe from 'stripe';

/**
 * The Stripe client, created on first use.
 *
 * Instantiating at module scope would make `next build` fail on any machine
 * without the key, including CI that only type-checks. Route handlers are the
 * only callers, so the first call always happens with the server env loaded.
 *
 * `apiVersion` is pinned rather than left to the account default: the account
 * default can be changed from the Dashboard, and a silent version bump is not
 * something a storefront should discover in production.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Copy .env.example to .env.local and paste a restricted key.',
    );
  }

  client = new Stripe(apiKey, {
    apiVersion: '2026-08-26.dahlia',
    typescript: true,
    appInfo: { name: 'Haven Huis', url: 'https://havenhuis.nl' },
  });

  return client;
}

/**
 * Tags every Checkout Session so the Dashboard can compare this flow against
 * any future one. Stripe asks for a random eight-letter suffix; it is fixed
 * here on purpose, because a per-request value would defeat the grouping.
 */
export const INTEGRATION_IDENTIFIER = 'havenhuis-hosted-checkout-vkqmzdrp';
