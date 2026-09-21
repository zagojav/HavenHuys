# Haven Huis

A storefront for a small home-decor shop selling into the Netherlands.
Dropshipping model: no stock is held, and payment runs through Stripe's hosted
Checkout.

Bilingual (English default, Dutch second), statically rendered, deployable to
Vercel with no custom server.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npm run format     # prettier
```

## Payments

Checkout is a [Stripe-hosted Checkout Session](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted).
Copy `.env.example` to `.env.local` and fill in a sandbox key and a webhook
signing secret. Locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

```
app/api/checkout/route.ts          creates the Checkout Session
app/api/webhooks/stripe/route.ts   turns a paid session into an order
app/[locale]/order-confirmed/      where Stripe returns the customer
lib/stripe.ts                      the SDK client, pinned to one API version
lib/checkout.ts                    the browser's half: post slugs, follow the URL
lib/shipping.ts                    rate, threshold, countries, delivery window
lib/fulfilment.ts                  what happens once the money is in
```

**The browser never sends a price.** It posts slugs, variant ids and
quantities; `app/api/checkout/route.ts` looks every piece up in
`data/products.ts` and builds the line items from that. A tampered bag in
localStorage changes nothing about what is charged.

**Orders come from the webhook, not the success page.** A customer can pay and
then lose their connection before `/order-confirmed` loads, so anything that
only ran there would silently drop the order. The handler fulfils on
`checkout.session.completed` and `checkout.session.async_payment_succeeded`,
and only once `payment_status` is no longer `unpaid` — the second event and
that check are what make delayed methods like iDEAL safe to switch on.

**Fulfilment is a seam, not an implementation.** `lib/fulfilment.ts` logs the
order and marks where the CJ Dropshipping call and the confirmation email go.
Its replay guard is an in-process `Set` of event ids, which is enough for one
instance and not enough for production: move it to a uniqueness constraint on
the event id in the order table as soon as there is one.

**Shipping terms live in `lib/shipping.ts`.** €4.95 flat, free from €50,
Netherlands only, 15–30 business days. The Checkout Session, the bag summary
and the shipping page all read those constants, so the quoted rate and the
charged rate cannot drift.

**Stripe Tax is not on yet.** The shop's Stripe account is registered in
Brazil, where Stripe Tax is unavailable and iDEAL cannot be offered, so the
session runs without `automatic_tax` and without product tax codes. The two
places that change when an EU entity exists are marked in
`app/api/checkout/route.ts`.

## Project layout

```
app/[locale]/          routes: home, products, products/[slug], cart,
                       about, contact, checkout-info, cancel-order,
                       order-confirmed, catch-all 404
app/api/               checkout session + Stripe webhook route handlers
components/            Header, Footer, ProductCard, ProductGallery, Logo, …
components/ui/         Button, Toast, CurrencyBadge, LoadingSkeleton, Reveal, Carousel
components/home/       the home page sections
data/products.ts       the 18-piece catalogue, bilingual, typed
i18n/                  next-intl routing, navigation and request config
lib/                   price formatting, Stripe, shipping, category artwork
lib/store/cart.ts      zustand bag, persisted to localStorage
messages/              en.json, nl.json
```

## Notes for whoever picks this up next

**Photography.** Images come from the Unsplash CDN by photo id
(`data/products.ts`, `lib/categories.ts`). Every id was checked against the CDN,
so nothing renders as a broken image. Replace the `img()` helper's output with
your own asset paths after the studio shoot.

**The accent colour is used in three steps.** The brief's `--color-accent`
(`#A8734A`) reaches only 3.77:1 against the cream background. That clears the
3:1 bar WCAG sets for icons, focus rings and other non-text UI, but not the
4.5:1 it asks of body-size text. So:

| token                  | value     | used for                                               |
| ---------------------- | --------- | ------------------------------------------------------ |
| `--color-accent`       | `#A8734A` | logo, icons, focus rings, badge dots, display numerals |
| `--color-accent-hover` | `#8F5F3B` | accent-coloured text, filled buttons at rest (5.08:1)  |
| `--color-accent-deep`  | `#7A5032` | hover/active state of filled buttons (6.50:1)          |

Every variable from the original palette is present and unchanged in
`app/globals.css`; `--color-accent-deep` is the one addition.

**The middleware matcher is deliberately unusual.** The widely-copied
next-intl matcher

```js
matcher: '/((?!api|_next|_vercel|.*\\..*).*)';
```

silently fails to match sub-paths on Next 15.5 — `/` resolves but `/products`
returns a bare 404 — because the escaped-dot alternative is mangled when the
matcher is parsed. `middleware.ts` uses `'/((?!api|_next|_vercel)[^.]*)'`
instead: matching only paths that contain no dot excludes static files just as
well and actually works. Re-test every route if you change it.

**`app/[locale]/[...rest]/page.tsx` exists to route unknown URLs into the
branded 404.** A nested `not-found.tsx` only catches `notFound()` thrown inside
its own subtree, so without the catch-all an unknown path escapes the locale
layout and gets the framework's default 404 page.

**Prices are formatted by hand** in `lib/format.ts` rather than with
`Intl.NumberFormat`. Server and browser can disagree on ICU details, and that
disagreement shows up as a hydration warning on every price on the page.
English renders `€149.00`, Dutch `€ 149,00`.

**The contact, newsletter and cancellation forms validate but do not send.**
They are client-side only (React Hook Form + Zod) with a simulated delay and a
success toast. Wire them to a mail service when there is one. The cancellation
form composes its message in one place — `sendCancellation` in
`components/CancelOrderForm.tsx` — so the Resend or Formspree call replaces a
single function body.

**`/cancel-order` is a compliance route, not a convenience one.** Dutch law
requires a visible, one-click way to cancel an order, so the link sits in the
footer of every page rather than behind a customer account. The page also
states the statutory 14-day right of withdrawal in both languages. Keep the
footer link if you rework the footer.

**Retail prices are derived, not typed in.** Every `priceCents` in
`data/products.ts` is its own multiple of `landedCostCents` from
`data/suppliers.ts` — supplier cost plus the €3 EU import duty — rounded to end
in ,90 or ,95. The duty is held in `IMPORT_DUTY_CENTS` rather than folded into
`costCents`, because `costCents` is still what you actually pay the supplier.
The three slugs in `PRICED_BEFORE_DUTY` have unconfirmed kit quantities and are
still on their pre-duty price; reprice them once the quantities are confirmed.

## Checks

`npm run build` completes with no errors or warnings, `npx tsc --noEmit` and
`npx eslint .` are clean, and the browser console is free of errors and
hydration warnings. Layout was verified at 390px, 768px and 1280px.
