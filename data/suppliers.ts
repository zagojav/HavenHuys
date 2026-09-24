import 'server-only';

/**
 * Sourcing sheet — where each product is bought and what it costs.
 *
 * SERVER ONLY. The `server-only` import above makes the build fail loudly if
 * this module is ever pulled into a client component, so cost prices and
 * supplier URLs cannot leak into the browser bundle by accident. Nothing here
 * is rendered; it exists so that when an order comes in you know what to buy
 * and where.
 *
 * `costCents` is what the supplier charges, excluding their shipping. For items
 * sold as a kit, it is the cost of the whole kit (unit cost × quantity). It is
 * NOT the cost basis for pricing — see `landedCostCents` below, which adds the
 * import duty.
 *
 * Every product ships from China, so budget 15–30 business days to the customer.
 */

export interface Supplier {
  supplierUrl: string;
  /** Supplier cost in cents, for the full unit as sold on the site. */
  costCents: number;
  /** Set when the site sells a multiple of the supplier's unit. */
  kitQuantity?: number;
  /** Anything that must be got right when placing the order. */
  note?: string;
}

/**
 * EU import duty on goods brought in from outside the customs union, charged
 * per item category since 1 July 2026.
 *
 * It is a landed cost, not something the supplier invoices and not shipping, so
 * it is deliberately kept out of `costCents`: when you place an order you
 * still pay the supplier exactly `costCents`. Anything to do with margin or
 * retail price goes through `landedCostCents` instead.
 */
export const IMPORT_DUTY_CENTS = 300;

/** Supplier cost plus the import duty — the real cost basis for pricing. */
export function landedCostCents(supplier: Supplier): number {
  return supplier.costCents + IMPORT_DUTY_CENTS;
}

/**
 * Retail prices in data/products.ts were re-derived from `landedCostCents` at
 * each product's existing multiple, except for these two. Their supplier
 * quantities are still unconfirmed (see the notes below), so repricing them
 * would bake an unverified cost into the shop. They are currently priced off
 * the pre-duty cost and are carrying the €3 out of margin until the quantities
 * are confirmed.
 *
 * `matte-ceramic-vase-trio` was the third entry here until its quantity came
 * back confirmed at one vase per line rather than three. That left a ~12%
 * margin, so the piece was withdrawn from the catalogue rather than repriced.
 */
export const PRICED_BEFORE_DUTY = [
  'nested-storage-basket-set',
  'solid-wood-floating-shelf',
] as const;

export const SUPPLIERS: Record<string, Supplier> = {
  // ---------------------------------------------------------------- lighting
  'linen-shade-charging-lamp': {
    supplierUrl:
      'https://cjdropshipping.com/product/multifunctional-bluetooth-compatible-playing-alarm-clock-fabric-table-lamp-p-1780856681509953536.html',
    costCents: 1429,
  },
  'wooden-mushroom-touch-lamp': {
    supplierUrl:
      'https://cjdropshipping.com/product/ins-wooden-cute-mushroom-led-night-light-with-touch-switch--bedside-table-lamp-for-bedroom-childrens-room-sleeping-night-lamps-home-decor-p-1605139484134354944.html',
    costCents: 843,
    note: 'Listing has two sizes (165 mm / 105 mm) and two wood tones. Match the size and finish the customer picked.',
  },
  'ridged-terracotta-sconce': {
    supplierUrl:
      'https://cjdropshipping.com/product/retro-minimalist-aisle-wall-decoration-lamps-p-1542084655321722880.html',
    costCents: 2002,
  },

  // ---------------------------------------------------------------- textiles
  'pom-pom-velvet-cushion-set': {
    supplierUrl:
      'https://cjdropshipping.com/product/wind-velvet-solid-color-cushion-cover-for-office-p-1380498548117868544.html',
    costCents: 1036,
    kitQuantity: 4,
    note: 'Sold on the site as a set of 4. Order 4 × €2.59. Covers only, no inserts. IMPORTANT: order the cream colourway, which is what the product photo and copy sell — never the pale pink the listing defaults to.',
  },
  'chunky-knit-fringe-throw': {
    supplierUrl:
      'https://cjdropshipping.com/product/sofa-cover-nap-blanket-knitted-small-blanket-p-2412040749281608900.html',
    costCents: 548,
  },
  'woven-cotton-accent-rug': {
    supplierUrl:
      'https://cjdropshipping.com/product/scandinavian-style-linen-cotton-rug-p-F0443A4D-DEEB-440D-A010-FEF21147C452.html',
    costCents: 346,
    note: 'IMPORTANT: pick the neutral colourway at checkout, NOT the "Cactus" variant the listing defaults to.',
  },

  // ----------------------------------------------------------------- storage
  'nested-storage-basket-set': {
    supplierUrl:
      'https://cjdropshipping.com/product/dog-toy-basket-p-1400391358765731840.html',
    costCents: 836,
    note: 'Confirm the €8.36 line covers all 4 baskets and not a single unit before the first order goes out. IMPORTANT: order the beige/grey two-tone colourway only — the other colourways on the listing are not what the site sells.',
  },
  'solid-wood-floating-shelf': {
    supplierUrl:
      'https://cjdropshipping.com/product/wall-storage-hanging-solid-wood-shelf-p-2411210744191603000.html',
    costCents: 394,
    note: 'Five finishes on the listing (white, light oak, grey, walnut, black). Match the finish the customer picked.',
  },

  // --------------------------------------------------------------- tableware
  'hexagonal-wood-serving-tray': {
    supplierUrl:
      'https://cjdropshipping.com/product/cake-tray-p-16B56CF2-14D2-49D4-A40C-1AB8ED63A30F.html',
    costCents: 1184,
  },

  // ---------------------------------------------------------- decor-objects
  'wood-slice-tealight-set': {
    supplierUrl:
      'https://cjdropshipping.com/product/simple-modern-pastoral-wood-candle-holder-p-1601765055845117952.html',
    costCents: 220,
    kitQuantity: 4,
    note: 'Sold on the site as a set of 4. Order 4 × €0.55.',
  },
  'abstract-silhouette-sculpture-set': {
    supplierUrl:
      'https://cjdropshipping.com/product/home-decor-living-room-art-art-girl-p-1436220340429787136.html',
    costCents: 505,
    note: 'Sold on the site as a set of 2. Confirm the listing price covers both figures.',
  },
};

export function supplierFor(slug: string): Supplier | undefined {
  return SUPPLIERS[slug];
}
