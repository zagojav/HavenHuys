'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: ReactNode;
  /** Accessible name for the scroll region. */
  label: string;
  previousLabel: string;
  nextLabel: string;
}

/**
 * Horizontal scroll rail with snap points. The cards themselves are rendered on
 * the server and handed in as children — only the scroll controls need to be
 * interactive.
 */
export function Carousel({ children, label, previousLabel, nextLabel }: CarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft >= maxScroll - 4);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  function scrollBy(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={railRef}
        onScroll={sync}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar relative -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 md:-mx-8 md:px-8 xl:-mx-10 xl:px-10"
      >
        {children}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <CarouselButton
          label={previousLabel}
          disabled={atStart}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft className="size-4" />
        </CarouselButton>

        <CarouselButton label={nextLabel} disabled={atEnd} onClick={() => scrollBy(1)}>
          <ChevronRight className="size-4" />
        </CarouselButton>
      </div>
    </div>
  );
}

function CarouselButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="border-border text-text-primary ease-soft hover:border-accent hover:text-accent enabled:hover:shadow-lift inline-flex size-10 items-center justify-center rounded-full border transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
