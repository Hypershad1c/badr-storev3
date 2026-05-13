import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // productIds
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        if (!get().items.includes(productId)) {
          set((state) => ({ items: [...state.items, productId] }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((id) => id !== productId) }));
      },

      toggle: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "apex-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
