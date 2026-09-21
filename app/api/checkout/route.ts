import { NextResponse } from 'next/server';
import { z } from 'zod';
import type Stripe from 'stripe';
import { getProduct } from '@/data/products';
import { routing, type Locale } from '@/i18n/routing';
import { INTEGRATION_IDENTIFIER, stripe } from '@/lib/stripe';
import { DELIVERY_DAYS, SHIPPING_COUNTRIES, shippingCentsFor } from '@/lib/shipping';

export const runtime = 'nodejs';

/**
 * The browser sends slugs and quantities, never prices. Everything chargeable
 * is looked up again from data/products.ts below, so a tampered bag in
 * localStorage cannot change what the customer is charged.
 */
const checkoutSchema = z.object({
  locale: z.enum(['en', 'nl']),
  /** Where the click came from, for reading the funnel in the Dashboard. */
  source: z.enum(['cart', 'product']).default('cart'),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(40),
});

const SHIPPING_LABEL: Record<Locale, { paid: string; free: string }> = {
  en: { paid: 'Standard shipping', free: 'Free shipping' },
  nl: { paid: 'Standaard verzending', free: 'Gratis verzending' },
};

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const { locale, source, items } = parsed.data;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const product = getProduct(item.slug);

    if (!product) {
      return NextResponse.json({ error: 'unknown_product' }, { status: 400 });
    }

    // A variant id that is not on the product is a stale bag, not a valid
    // order: it would print a label nobody can pick.
    const variant = item.variantId
      ? product.variants?.options.find((option) => option.id === item.variantId)
      : undefined;

    if (item.variantId && !variant) {
      return NextResponse.json({ error: 'unknown_variant' }, { status: 400 });
    }

    subtotalCents += product.priceCents * item.quantity;

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: product.priceCents,
        // Consumer prices in the EU are quoted with VAT in them. Saying so
        // here means the figure on the product page stays the figure the
        // customer pays once Stripe Tax is switched on for an EU entity.
        // The matching `product_data.tax_code` goes in at the same time.
        tax_behavior: 'inclusive',
        product_data: {
          name: variant
            ? `${product.name[locale]} — ${variant.label[locale]}`
            : product.name[locale],
          description: product.tagline[locale],
          images: product.images[0] ? [product.images[0].src] : undefined,
          metadata: {
            slug: product.slug,
            variant_id: variant?.id ?? '',
          },
        },
      },
    });
  }

  const shippingCents = shippingCentsFor(subtotalCents);
  const labels = SHIPPING_LABEL[locale];
  const base = siteOrigin(request);
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      locale,
      integration_identifier: INTEGRATION_IDENTIFIER,
      // No `payment_method_types`: leaving it out lets Stripe pick and order
      // the methods each customer is most likely to pay with. Which methods
      // are eligible is configured in the Dashboard, not here.
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: 'eur' },
            display_name: shippingCents === 0 ? labels.free : labels.paid,
            tax_behavior: 'inclusive',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: DELIVERY_DAYS.min },
              maximum: { unit: 'business_day', value: DELIVERY_DAYS.max },
            },
          },
        },
      ],
      success_url: `${base}${prefix}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${prefix}/cart`,
      metadata: { locale, source },
    });

    if (!session.url) {
      // Only happens for embedded sessions, which this is not.
      throw new Error(`Checkout Session ${session.id} came back without a URL.`);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[checkout] could not create a Checkout Session', error);
    return NextResponse.json({ error: 'checkout_unavailable' }, { status: 502 });
  }
}

/**
 * Return URLs are built from the configured site URL, not from the request's
 * Origin header: the header is attacker-controlled, and these URLs are handed
 * to Stripe to redirect the customer back to. The fallback keeps `npm run dev`
 * working on a machine with no .env.local.
 */
function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  return configured || new URL(request.url).origin;
}
