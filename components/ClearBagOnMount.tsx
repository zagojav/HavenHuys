'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/store/cart';

/**
 * Empties the bag after a completed checkout.
 *
 * It runs on the confirmation page rather than before the redirect: a customer
 * who abandons Stripe and comes back should still find their pieces where they
 * left them.
 */
export function ClearBagOnMount() {
  useEffect(() => {
    useCart.getState().clear();
  }, []);

  return null;
}
