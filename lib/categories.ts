import type { Category } from '@/data/products';

/**
 * Presentation data for the category cards. Labels live in the message files
 * under `categories.<id>`; only the artwork is pinned here.
 */
export const CATEGORY_CARDS: {
  id: Category;
  image: string;
  alt: { en: string; nl: string };
}[] = [
  {
    id: 'lighting',
    image:
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=80',
    alt: {
      en: 'Copper pendant lamps hanging in a cluster',
      nl: 'Koperen hanglampen in een cluster',
    },
  },
  {
    id: 'textiles',
    image:
      'https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=900&q=80',
    alt: {
      en: 'Folded knit throws stacked by colour',
      nl: 'Gevouwen gebreide plaids gestapeld op kleur',
    },
  },
  {
    id: 'storage',
    image:
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80',
    alt: {
      en: 'Narrow wooden shelving column',
      nl: 'Smalle houten kolomkast',
    },
  },
  {
    id: 'tableware',
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
    alt: {
      en: 'Speckled stoneware bowls on a pale surface',
      nl: 'Gespikkelde steengoed kommen op een licht oppervlak',
    },
  },
  {
    id: 'decor-objects',
    image:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
    alt: {
      en: 'Three matte stone vases holding dried stems',
      nl: 'Drie matte stenen vazen met droogbloemen',
    },
  },
];
