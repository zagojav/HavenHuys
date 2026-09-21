'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine {
  /** `slug` plus the chosen variant, so two variants sit on separate rows. */
  id: string;
  slug: string;
  variantId?: string;
  variantLabelEn?: string;
  variantLabelNl?: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  /** False until persisted state has been read back in the browser. */
  hydrated: boolean;
  add: (line: Omit<CartLine, 'id' | 'quantity'>, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  setHydrated: () => void;
}

const lineId = (slug: string, variantId?: string) =>
  variantId ? `${slug}::${variantId}` : slug;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,

      add: (line, quantity = 1) =>
        set((state) => {
          const id = lineId(line.slug, line.variantId);
          const existing = state.lines.find((l) => l.id === id);

          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === id ? { ...l, quantity: l.quantity + quantity } : l,
              ),
            };
          }

          return { lines: [...state.lines, { ...line, id, quantity }] };
        }),

      remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) =>
                  l.id === id ? { ...l, quantity: Math.min(quantity, 99) } : l,
                ),
        })),

      clear: () => set({ lines: [] }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'haven-huis-bag',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }) as CartState,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Total number of items, not rows. */
export function countItems(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
