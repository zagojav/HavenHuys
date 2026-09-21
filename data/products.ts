/**
 * Haven Huis product catalogue.
 *
 * Photography is served directly from the CJ Dropshipping CDN. Both hostnames
 * (`cf.` and `oss-cf.`) are allow-listed in next.config.ts > images.remotePatterns.
 * Every URL below was fetched and checked. All twelve return 200 image/jpeg.
 *
 * Supplier links and cost prices live in data/suppliers.ts, which is server-only
 * and must never be imported from a client component.
 *
 * `priceCents` is derived from that sheet: each piece is sold at its own
 * multiple of `landedCostCents` (supplier cost plus the €3 import duty), rounded
 * to end in ,90 or ,95. Two kinds of exception exist and both are commented
 * where they occur: the slugs in `PRICED_BEFORE_DUTY`, which still sit on their
 * pre-duty price, and pieces whose derived price lands badly and is set by hand.
 *
 * `material` and `dimensions` are optional on purpose: the product detail page
 * skips the row when a value is missing, so we show a spec only where it has
 * been confirmed against the supplier listing rather than guessed.
 */

export const CATEGORIES = [
  'lighting',
  'textiles',
  'storage',
  'tableware',
  'decor-objects',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** A string that exists in both shop languages. */
export interface Localized {
  en: string;
  nl: string;
}

export interface VariantOption {
  id: string;
  label: Localized;
  /** Hex used for the colour swatch; omitted for size variants. */
  swatch?: string;
}

export interface VariantGroup {
  type: 'colour' | 'size';
  label: Localized;
  options: VariantOption[];
}

export interface ProductImage {
  src: string;
  alt: Localized;
}

export interface Product {
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  category: Category;
  /** Stored in cents to keep money arithmetic exact. */
  priceCents: number;
  /** Optional was-price, also in cents. */
  compareAtCents?: number;
  images: ProductImage[];
  badge?: 'new' | 'bestseller';
  bestseller: boolean;
  /** Only set where the fibre or material is confirmed by the supplier listing. */
  material?: Localized;
  /** Only set where measurements are confirmed by the supplier listing. */
  dimensions?: string;
  /** ISO date, drives the "Newest first" sort. */
  addedOn: string;
  variants?: VariantGroup;
}

export const products: Product[] = [
  // ---------------------------------------------------------------- lighting
  {
    slug: 'linen-shade-charging-lamp',
    name: {
      en: 'Linen Shade Table Lamp with Charging Base',
      nl: 'Linnen Tafellamp met Oplaadvoet',
    },
    tagline: {
      en: 'One object instead of three.',
      nl: 'Eén object in plaats van drie.',
    },
    description: {
      en: 'A woven shade over a warm LED, on a base that holds the clock, the alarm and the charging ports. Touch the stem to step the light up or down. It clears the nightstand of the lamp, the charger and the clock radio that were all competing for it.',
      nl: 'Een geweven kap over een warme led, op een voet waarin de klok, de wekker en de oplaadpoorten zitten. Tik op de stang om het licht hoger of lager te zetten. Hij ruimt het nachtkastje op: de lamp, de lader en de wekkerradio vallen samen in één ding.',
    },
    category: 'lighting',
    priceCents: 6995,
    images: [
      {
        src: 'https://oss-cf.cjdropshipping.com/product/2024/04/18/07/6adce35f-33e4-4c77-8239-bf6064d0ddec.jpg',
        alt: {
          en: 'Table lamp with a woven beige shade on a black base with a clock display and charging ports',
          nl: 'Tafellamp met geweven beige kap op een zwarte voet met klokdisplay en oplaadpoorten',
        },
      },
    ],
    badge: 'new',
    bestseller: false,
    material: {
      en: 'Fabric shade, moulded base',
      nl: 'Stoffen kap, gegoten voet',
    },
    addedOn: '2026-09-19',
  },
  {
    slug: 'wooden-mushroom-touch-lamp',
    name: { en: 'Wooden Mushroom Touch Lamp', nl: 'Houten Paddenstoellamp' },
    tagline: {
      en: 'Tap the cap and it is on.',
      nl: 'Tik op de hoed en hij brandt.',
    },
    description: {
      en: 'A turned stem under a solid cap, dimmed by touching the wood instead of feeling for a switch in the dark. It charges over USB, so it works on a shelf with no socket behind it. The light stays low enough to read by without waking the room.',
      nl: 'Een gedraaide steel onder een massieve hoed, gedimd door het hout aan te raken in plaats van in het donker naar een schakelaar te tasten. Hij laadt via usb, dus hij werkt ook op een plank zonder stopcontact erachter. Het licht blijft laag genoeg om bij te lezen zonder de kamer wakker te maken.',
    },
    category: 'lighting',
    priceCents: 4595,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/d86666b8-a0dc-4f40-8bc0-e47ec6781ce0.jpg',
        alt: {
          en: 'Mushroom-shaped wooden lamps in dark walnut and pale beech, shown in two sizes',
          nl: 'Paddenstoelvormige houten lampen in donker notenhout en licht beuken, in twee maten',
        },
      },
    ],
    badge: 'new',
    bestseller: false,
    material: { en: 'Turned solid wood', nl: 'Gedraaid massief hout' },
    dimensions: 'Large 16.5 × 10 cm · small 10.5 × 9 cm',
    addedOn: '2026-09-18',
    variants: {
      type: 'colour',
      label: { en: 'Wood', nl: 'Houtsoort' },
      options: [
        { id: 'walnut', label: { en: 'Walnut', nl: 'Notenhout' }, swatch: '#5A4030' },
        { id: 'beech', label: { en: 'Beech', nl: 'Beuken' }, swatch: '#D9BE9A' },
      ],
    },
  },
  {
    slug: 'ridged-terracotta-sconce',
    name: { en: 'Ridged Terracotta Wall Sconce', nl: 'Geribbelde Terracotta Wandlamp' },
    tagline: {
      en: 'Light that grazes the wall.',
      nl: 'Licht dat langs de muur strijkt.',
    },
    description: {
      en: 'A shallow dish ringed with concentric ridges, so the bulb at its centre throws rings of shadow instead of a flat glare. Made for a hallway or the side of a bed, where you want the wall lit and not the room.',
      nl: 'Een ondiepe schaal met concentrische ribbels, waardoor de lamp in het midden een ring van schaduw werpt in plaats van een vlakke gloed. Bedoeld voor een gang of naast het bed, waar je de muur wilt verlichten en niet de kamer.',
    },
    category: 'lighting',
    priceCents: 9190,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/ca144124-0478-469b-ba48-65337253ad71.jpg',
        alt: {
          en: 'Round ridged wall lamp lit by a single opal bulb against a grey wall',
          nl: 'Ronde geribbelde wandlamp verlicht door één opaalglazen lamp tegen een grijze muur',
        },
      },
    ],
    badge: 'bestseller',
    bestseller: true,
    addedOn: '2026-09-17',
  },

  // ---------------------------------------------------------------- textiles
  {
    slug: 'pom-pom-velvet-cushion-set',
    name: {
      en: 'Pom-Pom Trim Velvet Cushion Cover, Set of 4',
      nl: 'Fluwelen Kussenhoes met Pompons, Set van 4',
    },
    tagline: {
      en: 'Four covers, one afternoon.',
      nl: 'Vier hoezen, één middag.',
    },
    description: {
      en: 'Short-pile velvet with a row of small pom-poms along the seam. They come in fours, which is what it takes for a sofa to look finished rather than sampled. Covers only, hidden zip. Keep the inserts you already own.',
      nl: 'Kortpolig fluweel met een rij kleine pompons langs de naad. Ze komen per vier, want dat is wat een bank nodig heeft om af te ogen in plaats van uitgeprobeerd. Alleen hoezen, met verborgen rits. De binnenkussens die je al hebt, blijven gewoon liggen.',
    },
    category: 'textiles',
    priceCents: 5190,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/1617966336484.jpg',
        alt: {
          en: 'Two cream velvet cushions with pom-pom trim on a pale sofa beside a knitted throw',
          nl: 'Twee crèmekleurige fluwelen kussens met pomponrand op een lichte bank naast een gebreide plaid',
        },
      },
    ],
    badge: 'bestseller',
    bestseller: true,
    material: { en: 'Velvet cover, hidden zip', nl: 'Fluwelen hoes, verborgen rits' },
    addedOn: '2026-09-16',
  },
  {
    slug: 'chunky-knit-fringe-throw',
    name: { en: 'Chunky Knit Fringe Throw', nl: 'Grofgebreide Plaid met Franjes' },
    tagline: {
      en: 'For the end of the sofa.',
      nl: 'Voor het uiteinde van de bank.',
    },
    description: {
      en: 'An open wavy knit that ends in a long fringe. Light enough to nap under, loose enough to drape without bulk. It is sized for the arm of a sofa, which is where it will actually live.',
      nl: 'Een open, golvende breisteek die uitloopt in lange franjes. Licht genoeg om onder weg te doezelen, soepel genoeg om zonder volume te draperen. Hij is op maat voor de armleuning van een bank, want daar ligt hij toch.',
    },
    category: 'textiles',
    priceCents: 3390,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/quick/product/08fa5ab1-0822-4aae-ab2e-adf197964020.jpg',
        alt: {
          en: 'Cream fringed knit throw draped over a cream sofa with a tufted cushion',
          nl: 'Crèmekleurige gebreide plaid met franjes over een crèmekleurige bank met getuft kussen',
        },
      },
    ],
    bestseller: false,
    addedOn: '2026-09-15',
  },
  {
    slug: 'woven-cotton-accent-rug',
    name: {
      en: 'Woven Linen-Cotton Accent Rug',
      nl: 'Geweven Linnen-Katoen Vloerkleed',
    },
    tagline: {
      en: 'A soft landing by the bed.',
      nl: 'Een zachte landing naast het bed.',
    },
    description: {
      en: 'Flat-woven linen and cotton, finished with knotted tassels at both ends. Small enough for a bedside, a bathroom door, or the strip of floor in front of the sink. It washes and dries flat, which is the whole point of a rug this size.',
      nl: 'Plat geweven linnen en katoen, afgewerkt met geknoopte kwastjes aan beide uiteinden. Klein genoeg voor naast het bed, bij de badkamerdeur of voor de gootsteen. Hij wast en droogt vlak, en dat is bij een kleed van dit formaat het hele punt.',
    },
    category: 'textiles',
    priceCents: 2595,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/20200717/154708186696880.jpg',
        alt: {
          en: 'Flat-woven tasselled rug with a blue and red geometric pattern on a wooden floor',
          nl: 'Plat geweven kleed met kwastjes en een blauw-rood geometrisch patroon op een houten vloer',
        },
      },
    ],
    bestseller: false,
    material: { en: 'Linen-cotton blend', nl: 'Linnen-katoenmix' },
    addedOn: '2026-09-14',
  },

  // ----------------------------------------------------------------- storage
  {
    slug: 'nested-storage-basket-set',
    name: {
      en: 'Nested Fabric Storage Baskets, Set of 4',
      nl: 'Stoffen Opbergmanden, Set van 4',
    },
    tagline: {
      en: 'Four sizes that stack into one.',
      nl: 'Vier maten die in elkaar passen.',
    },
    description: {
      en: 'Two-tone canvas with rope handles set through metal eyelets. The sides give, so they slump into a shelf rather than fighting it, and they sit inside each other when empty. Open top, no lid to lose.',
      nl: 'Tweekleurig canvas met touwhandvatten door metalen ringen. De wanden geven mee, dus ze voegen zich naar een plank in plaats van ertegen te vechten, en leeg passen ze in elkaar. Open bovenkant, geen deksel om kwijt te raken.',
    },
    category: 'storage',
    priceCents: 3390,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/1622717210791.jpg',
        alt: {
          en: 'Two-tone grey and natural fabric storage basket with rope handles',
          nl: 'Tweekleurige grijs met naturel stoffen opbergmand met touwhandvatten',
        },
      },
    ],
    bestseller: false,
    material: { en: 'Fabric, metal eyelets', nl: 'Stof, metalen ringen' },
    addedOn: '2026-09-13',
  },
  {
    slug: 'solid-wood-floating-shelf',
    name: {
      en: 'Solid Wood Floating Wall Shelf',
      nl: 'Massief Houten Zwevende Wandplank',
    },
    tagline: {
      en: 'One plank, no brackets in sight.',
      nl: 'Eén plank, geen beugel te zien.',
    },
    description: {
      en: 'One length of solid wood that slides onto concealed steel rods, so what you see is a line on the wall rather than a fixture. It takes books, a small plant, and the things that otherwise pile up on the nearest flat surface.',
      nl: 'Eén stuk massief hout dat over verborgen stalen staven schuift, zodat je een lijn op de muur ziet en geen beslag. Hij draagt boeken, een kleine plant en de dingen die zich anders opstapelen op het eerste het beste vlakke oppervlak.',
    },
    category: 'storage',
    priceCents: 1590,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/quick/product/245a19fc-270d-465d-ab9f-af78f1d6b169.jpg',
        alt: {
          en: 'Walnut-stained solid wood floating shelves with concealed steel mounting rods',
          nl: 'Zwevende planken van massief hout in notenbeits met verborgen stalen montagestaven',
        },
      },
    ],
    badge: 'new',
    bestseller: false,
    material: { en: 'Solid wood, steel fixings', nl: 'Massief hout, stalen bevestiging' },
    addedOn: '2026-09-12',
    variants: {
      type: 'colour',
      label: { en: 'Finish', nl: 'Afwerking' },
      options: [
        { id: 'white', label: { en: 'White', nl: 'Wit' }, swatch: '#EDEAE4' },
        { id: 'oak', label: { en: 'Light oak', nl: 'Licht eiken' }, swatch: '#D6BE99' },
        { id: 'grey', label: { en: 'Grey', nl: 'Grijs' }, swatch: '#8C8B88' },
        { id: 'walnut', label: { en: 'Walnut', nl: 'Notenhout' }, swatch: '#6B4A2F' },
        { id: 'black', label: { en: 'Black', nl: 'Zwart' }, swatch: '#2E2B28' },
      ],
    },
  },

  // --------------------------------------------------------------- tableware
  {
    slug: 'hexagonal-wood-serving-tray',
    name: {
      en: 'Hexagonal Wood Inlay Serving Tray',
      nl: 'Zeshoekig Dienblad met Houtinleg',
    },
    tagline: {
      en: 'Carries breakfast, then stays out.',
      nl: 'Brengt het ontbijt en blijft daarna staan.',
    },
    description: {
      en: 'Strips of pale and dark wood laid into a chevron across the base, framed by a raised rim. It is flat enough to work as a surface on a coffee table once the cups have gone, which is most of the time.',
      nl: 'Stroken licht en donker hout in een visgraatpatroon over de bodem, omlijst door een opstaande rand. Vlak genoeg om als ondergrond op de salontafel te blijven liggen zodra de kopjes weg zijn, en dat is het grootste deel van de tijd.',
    },
    category: 'tableware',
    priceCents: 5995,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/203001/3091702238354.jpg',
        alt: {
          en: 'Hexagonal wooden tray with a chevron inlay of pale and dark wood strips, held in two hands',
          nl: 'Zeshoekig houten dienblad met visgraatinleg van lichte en donkere houtstroken, vastgehouden in twee handen',
        },
      },
    ],
    badge: 'bestseller',
    bestseller: true,
    material: { en: 'Wood with inlay', nl: 'Hout met inleg' },
    addedOn: '2026-09-11',
  },

  // ---------------------------------------------------------- decor-objects
  {
    slug: 'matte-ceramic-vase-trio',
    name: { en: 'Matte Ceramic Vase Trio', nl: 'Matte Keramische Vazen, Trio' },
    tagline: { en: 'Three heights, one group.', nl: 'Drie hoogtes, één groep.' },
    description: {
      en: 'A tall bottle, a rounded oval and a low sphere, all in the same chalky matte glaze. They are made to stand together on a sill or a shelf. The necks are narrow, so one stem holds itself upright.',
      nl: 'Een hoge fles, een ronde ovaal en een lage bol, alle drie in hetzelfde krijtachtige matte glazuur. Ze zijn gemaakt om samen op een vensterbank of plank te staan. De halzen zijn smal, dus één tak blijft vanzelf rechtop.',
    },
    category: 'decor-objects',
    priceCents: 2390,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/203002/906377125639.jpg',
        alt: {
          en: 'Three matte ceramic vases in grey, dusty pink and black on marble beside a framed print',
          nl: 'Drie matte keramische vazen in grijs, oudroze en zwart op marmer naast een ingelijste print',
        },
      },
    ],
    badge: 'bestseller',
    bestseller: true,
    material: { en: 'Ceramic, matte glaze', nl: 'Keramiek, mat glazuur' },
    addedOn: '2026-09-10',
  },
  {
    slug: 'wood-slice-tealight-set',
    name: {
      en: 'Wood Slice Tealight Holder, Set of 4',
      nl: 'Houten Schijf Waxinelichthouder, Set van 4',
    },
    tagline: {
      en: 'A line of small fires down the table.',
      nl: 'Een rij kleine vuurtjes over de tafel.',
    },
    description: {
      en: 'Cut from a log and left with the bark on, each with a recess turned to take a standard tealight. Put them in a row down the middle of a table and the light sits low, across the cloth rather than in your eyes.',
      nl: 'Gezaagd uit een stam, met de schors er nog omheen, elk met een uitsparing op maat van een standaard waxinelichtje. Zet ze op een rij midden op tafel: het licht blijft laag en strijkt over het tafelkleed in plaats van in je ogen.',
    },
    category: 'decor-objects',
    // Set by hand, not derived. At its old 6.77x multiple the duty would have
    // carried this to €34.95, which is more than a set of four wood slices
    // can hold. €21.90 is 4.21x landed cost — a 76% margin, and a price the
    // piece still sells at.
    priceCents: 2190,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/15431b79-72f9-44fc-96ee-d7e491831670.jpg',
        alt: {
          en: 'Lit tealight set into a bark-edged wooden slice on a linen tablecloth',
          nl: 'Brandend waxinelichtje in een houten schijf met schors op een linnen tafelkleed',
        },
      },
    ],
    bestseller: false,
    material: {
      en: 'Wood with natural bark edge',
      nl: 'Hout met natuurlijke schorsrand',
    },
    addedOn: '2026-09-09',
  },
  {
    slug: 'abstract-silhouette-sculpture-set',
    name: {
      en: 'Abstract Silhouette Sculpture, Set of 2',
      nl: 'Abstracte Silhouetsculptuur, Set van 2',
    },
    tagline: {
      en: 'Two figures, mid-gesture.',
      nl: 'Twee figuren, midden in een gebaar.',
    },
    description: {
      en: 'Two seated figures in matte black and brushed silver, each leaning into an open ring. They are scaled for a shelf or a sideboard, not a plinth, and they only work as a pair. Bought together, placed together.',
      nl: 'Twee zittende figuren in mat zwart en geborsteld zilver, elk leunend in een open ring. Ze zijn op maat voor een plank of dressoir, niet voor een sokkel, en ze werken alleen samen. Samen gekocht, samen geplaatst.',
    },
    category: 'decor-objects',
    priceCents: 3295,
    images: [
      {
        src: 'https://cf.cjdropshipping.com/e6ba2385-9b8f-4c02-94f2-d0be9a036a6a.jpg',
        alt: {
          en: 'Two black and silver figurative sculptures seated in open rings on a grey sideboard',
          nl: 'Twee zwart-zilveren figuratieve sculpturen in open ringen op een grijs dressoir',
        },
      },
    ],
    bestseller: false,
    addedOn: '2026-09-08',
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

/** Same category first, then anything else, capped at `limit`. */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  );
  const rest = products.filter(
    (p) => p.category !== product.category && p.slug !== product.slug,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export const bestsellers = products.filter((p) => p.bestseller);
