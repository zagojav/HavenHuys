import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { fulfilOrder, markHandled, recordFailedPayment, toOrder } from '@/lib/fulfilment';

export const runtime = 'nodejs';

/**
 * Where orders actually come from.
 *
 * Not the success page: a customer can pay and then lose their connection
 * before it loads, and an order that only exists on that page is an order that
 * silently never shipped.
 */
export async function POST(request: Request) {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signingSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set');
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  // The raw body, unparsed: the signature is computed over these exact bytes.
  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(payload, signature, signingSecret);
  } catch (error) {
    console.error('[stripe-webhook] signature verification failed', error);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    await handle(event);
  } catch (error) {
    // A 500 asks Stripe to retry, which is what we want for a transient
    // failure — the handler is idempotent on the event id.
    console.error(`[stripe-webhook] handling ${event.type} failed`, error);
    return new Response('Handler failed', { status: 500 });
  }

  return Response.json({ received: true });
}

async function handle(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    // Both matter. `completed` fires the moment checkout finishes, which for a
    // delayed method (iDEAL and friends, once they are switched on) happens
    // before the money is confirmed; `async_payment_succeeded` is when it
    // lands. Gating both on `payment_status` means each order ships once, and
    // only after it is paid.
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;

      if (session.payment_status === 'unpaid') {
        console.info(
          `[stripe-webhook] ${session.id} is not paid yet, waiting for the async result`,
        );
        return;
      }

      if (!markHandled(event.id)) return;

      const lineItems = await stripe().checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ['data.price.product'],
      });

      await fulfilOrder(toOrder(session, lineItems.data));
      return;
    }

    case 'checkout.session.async_payment_failed': {
      if (!markHandled(event.id)) return;

      recordFailedPayment(event.data.object);
      return;
    }

    default:
      return;
  }
}
