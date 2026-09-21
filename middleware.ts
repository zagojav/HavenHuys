import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  /**
   * Run on every page route so `/products` can be rewritten to `/en/products`
   * under `localePrefix: 'as-needed'`, while skipping API routes, Next
   * internals and anything that looks like a static file.
   *
   * `[^.]*` is doing the static-file exclusion on purpose. The more common
   * `'/((?!api|_next|_vercel|.*\..*).*)'` matcher silently fails to match any
   * sub-path under Next 15.5 — `/` still resolves but `/products` 404s —
   * because the escaped-dot alternative is mangled when the matcher is parsed.
   * Matching only paths that contain no dot gives the same result and works.
   */
  matcher: ['/((?!api|_next|_vercel)[^.]*)'],
};
