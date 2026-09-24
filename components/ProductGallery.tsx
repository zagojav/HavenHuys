'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ZoomIn } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import type { ProductImage } from '@/data/products';

interface ProductGalleryProps {
  images: ProductImage[];
  locale: Locale;
  productName: string;
}

const ZOOM = 1.9;

/**
 * Main image plus thumbnail rail. Moving the pointer over the main image pans a
 * magnified copy by moving the transform origin, which keeps the zoom to a
 * single composited layer rather than re-laying out the image.
 */
export function ProductGallery({ images, locale, productName }: ProductGalleryProps) {
  const t = useTranslations('product.gallery');
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const current = images[active] ?? images[0];
  if (!current) return null;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <section
      aria-label={productName}
      // `self-start` keeps the grid row from stretching the gallery to the
      // height of the details column, which would override the 4:5 frame.
      className="flex flex-col gap-3 self-start sm:flex-row-reverse sm:gap-4"
    >
      <div
        ref={frameRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => {
          setZooming(false);
          setOrigin({ x: 50, y: 50 });
        }}
        onMouseMove={handleMove}
        // `w-full` rather than a bare `flex-1`: in the mobile column layout a
        // zero flex basis would leave the frame's height to the aspect ratio's
        // minimum size, which is fragile. The row layout still grows it.
        className="bg-surface relative aspect-[4/5] w-full min-w-0 self-start overflow-hidden rounded-2xl sm:flex-1"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.alt[locale]}
              fill
              priority={active === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 45vw"
              className="ease-soft object-cover transition-transform duration-300"
              style={{
                transform: zooming ? `scale(${ZOOM})` : 'scale(1)',
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        <span
          aria-hidden="true"
          className={
            // Zooming is pointer-only, so the hint stays hidden on touch.
            'bg-bg/92 text-charcoal pointer-events-none absolute right-3 bottom-3 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-medium tracking-wide uppercase backdrop-blur-sm transition-opacity duration-200 [@media(hover:hover)]:inline-flex ' +
            (zooming ? 'opacity-0' : 'opacity-100')
          }
        >
          <ZoomIn className="size-3.5" />
          {t('zoomHint')}
        </span>
      </div>

      {images.length > 1 && (
        <ul
          aria-label={t('label')}
          className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible lg:w-24"
        >
          {images.map((image, index) => (
            <li key={image.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={t('thumbLabel', { index: index + 1 })}
                aria-current={index === active}
                className={
                  'bg-surface ease-soft relative block aspect-square w-20 overflow-hidden rounded-lg transition-all duration-200 hover:opacity-100 sm:w-full lg:w-24 ' +
                  (index === active
                    ? 'ring-accent ring-offset-bg ring-2 ring-offset-2'
                    : 'opacity-60')
                }
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
