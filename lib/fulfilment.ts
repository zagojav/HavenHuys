import 'server-only';
import type Stripe from 'stripe';

/**
 * What happens after a payment succeeds.
 *
 * This shop has no database and no mail service yet, so fulfilment is a
 * structured log and two clearly marked seams: the supplier order and the
 * confirmation email. Both take the same `Order` and nothing else, so wiring
 * them up later is a function body each, not a refactor.
 */

export interface OrderLine {
  slug: string;
  variantId: string | null;
  name: string;
  quantity: number;
  amountTotalCents: number;
}

export interface Order {
  sessionId: string;
  paymentIntentId: string | null;
  email: string | null;
  name: string | null;
  locale: string;
  currency: string;
  amountTotalCents: number;
  shippingCents: number;
  address: Stripe.Address | null;
  lines: OrderLine[];
}

/**
 * Events Stripe has already delivered, kept so a retry does not order the same
 * parcel twice.
 *
 * In-process only, which is enough for one Node instance and not enough for
 * production: a restart or a second instance forgets everything. Replace this
 * with a uniqueness constraint on `event.id` in the order table as soon as
 * there is one — that is the real fix, and it is the reason the check lives
 * here rather than inline in the route.
 */
const handledEvents = new Set<string>();

export function markHandled(eventId: string): boolean {
  if (handledEvents.has(eventId)) return false;

  handledEvents.add(eventId);
  return true;
}

/** Turns a paid Checkout Session and its line items into an order. */
export function toOrder(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
): Order {
  return {
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    email: session.customer_details?.email ?? null,
    name: session.customer_details?.name ?? null,
    locale: session.metadata?.locale ?? 'en',
    currency: session.currency ?? 'eur',
    amountTotalCents: session.amount_total ?? 0,
    shippingCents: session.total_details?.amount_shipping ?? 0,
    address: session.collected_information?.shipping_details?.address ?? null,
    lines: lineItems.map((item) => {
      const product = item.price?.product;
      const metadata =
        product && typeof product !== 'string' && !product.deleted
          ? product.metadata
          : undefined;

      return {
        slug: metadata?.slug ?? '',
        variantId: metadata?.variant_id ? metadata.variant_id : null,
        name: item.description ?? '',
        quantity: item.quantity ?? 0,
        amountTotalCents: item.amount_total,
      };
    }),
  };
}

export async function fulfilOrder(order: Order): Promise<void> {
  // TODO: place the order with CJ Dropshipping, one call per line.
  // TODO: send the confirmation email once a mail service is connected.
  console.info('[fulfilment] paid order ready to ship', JSON.stringify(order));
}

export function recordFailedPayment(session: Stripe.Checkout.Session): void {
  // A delayed payment method that did not come through. Nothing was shipped,
  // so there is nothing to undo — but it is worth seeing in the logs.
  console.warn(
    '[fulfilment] payment failed after checkout',
    JSON.stringify({
      sessionId: session.id,
      email: session.customer_details?.email ?? null,
    }),
  );
}
