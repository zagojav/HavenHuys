interface SkeletonProps {
  className?: string;
}

/** A single shimmering block. Compose these into page-shaped placeholders. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={['animate-shimmer bg-surface rounded-lg', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

/** Matches the footprint of one ProductCard so the grid never shifts. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  /** Announced to assistive tech while the grid is still empty. */
  label: string;
}

export function ProductGridSkeleton({ count = 8, label }: ProductGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Placeholder for the bag page while persisted state is read back. */
export function CartSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-12 lg:grid-cols-[1fr_22rem]"
    >
      <span className="sr-only">{label}</span>

      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border-border flex gap-4 border-b pb-6">
            <Skeleton className="size-24 shrink-0 rounded-lg sm:size-28" />
            <div className="flex flex-1 flex-col gap-3 pt-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
