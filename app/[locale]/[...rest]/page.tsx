import { notFound } from 'next/navigation';

/**
 * Catch-all that hands unmatched URLs to app/[locale]/not-found.tsx.
 *
 * A nested not-found boundary only renders for `notFound()` thrown inside its
 * own subtree; without this route an unknown path such as /en/foo escapes the
 * locale layout entirely and falls back to the framework's default 404.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
