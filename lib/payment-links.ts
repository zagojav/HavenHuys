/**
 * Mollie payment links, one per product.
 *
 * `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time,
 * which means they can only be read through a literal property access — a
 * dynamic `process.env[key]` lookup resolves to undefined in the browser. Hence
 * the explicit map: every slug in data/products.ts has a row here.
 *
 * Copy .env.example to .env.local and paste the links from your Mollie
 * dashboard. Products without a link fall back to the bag, so the shop stays
 * usable while links are still being created.
 */
export const MOLLIE_LINKS: Record<string, string | undefined> = {
  'linen-shade-charging-lamp':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_LINEN_SHADE_CHARGING_LAMP,
  'wooden-mushroom-touch-lamp':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_WOODEN_MUSHROOM_TOUCH_LAMP,
  'ridged-terracotta-sconce':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_RIDGED_TERRACOTTA_SCONCE,
  'pom-pom-velvet-cushion-set':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_POM_POM_VELVET_CUSHION_SET,
  'chunky-knit-fringe-throw':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_CHUNKY_KNIT_FRINGE_THROW,
  'woven-cotton-accent-rug':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_WOVEN_COTTON_ACCENT_RUG,
  'nested-storage-basket-set':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_NESTED_STORAGE_BASKET_SET,
  'solid-wood-floating-shelf':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_SOLID_WOOD_FLOATING_SHELF,
  'hexagonal-wood-serving-tray':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_HEXAGONAL_WOOD_SERVING_TRAY,
  'matte-ceramic-vase-trio':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_MATTE_CERAMIC_VASE_TRIO,
  'wood-slice-tealight-set':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_WOOD_SLICE_TEALIGHT_SET,
  'abstract-silhouette-sculpture-set':
    process.env.NEXT_PUBLIC_MOLLIE_LINK_ABSTRACT_SILHOUETTE_SCULPTURE_SET,
};

export function paymentLinkFor(slug: string): string | null {
  const link = MOLLIE_LINKS[slug];
  return link && link.length > 0 ? link : null;
}
