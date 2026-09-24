import type { NextRequest } from 'next/server';
import { products } from '@/data/products';
import { routing, type Locale } from '@/i18n/routing';

/**
 * Google Merchant Center product feed: RSS 2.0 with the `g:` namespace.
 *
 * Built on every request, so the feed always matches data/products.ts. Links
 * are made absolute against the origin the feed was fetched from, which keeps
 * them on whichever domain Merchant Center verified (production, a preview
 * deploy, or localhost while testing).
 *
 * English by default. `?locale=nl` returns the same catalogue with Dutch
 * titles, descriptions and `/nl/...` links, for a separate Dutch-language feed.
 *
 * Lives outside `[locale]` on purpose: the middleware matcher skips any path
 * containing a dot, so `/product-feed.xml` is never rewritten.
 */
export const dynamic = 'force-dynamic';

const BRAND = 'Haven Huis';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function tag(name: string, value: string): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

/** Google wants "12.34 EUR": a dot decimal and the ISO code, whatever the locale. */
function feedPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const requested = request.nextUrl.searchParams.get('locale');
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  const items = products.map((product) => {
    const [image, ...extraImages] = product.images;
    const onSale =
      product.compareAtCents !== undefined && product.compareAtCents > product.priceCents;

    const fields = [
      tag('g:id', product.slug),
      tag('g:title', product.name[locale]),
      tag('g:description', `${product.tagline[locale]} ${product.description[locale]}`),
      tag('g:link', `${origin}${prefix}/products/${product.slug}`),
      image ? tag('g:image_link', image.src) : '',
      ...extraImages.slice(0, 10).map((extra) => tag('g:additional_image_link', extra.src)),
      tag('g:availability', 'in_stock'),
      // With a was-price, `price` is the regular price and `sale_price` what is charged.
      tag('g:price', feedPrice(onSale ? product.compareAtCents! : product.priceCents)),
      onSale ? tag('g:sale_price', feedPrice(product.priceCents)) : '',
      tag('g:brand', BRAND),
      tag('g:condition', 'new'),
      // Own-brand pieces with no GTIN or MPN; without this Google flags every item.
      tag('g:identifier_exists', 'no'),
      tag('g:product_type', product.category),
    ].filter(Boolean);

    return `    <item>\n      ${fields.join('\n      ')}\n    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    ${tag('title', BRAND)}
    ${tag('link', `${origin}${prefix || '/'}`)}
    ${tag('description', `${BRAND} product feed`)}
${items.join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
