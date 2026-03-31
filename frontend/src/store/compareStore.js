import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCompareStore = create(
  persist(
    (set, get) => ({
      compareItems: [],
      
      addToCompare: (product) => {
        const { compareItems } = get();
        if (compareItems.find((p) => p._id === product._id)) return;
        if (compareItems.length >= 4) {
          // You could throw an error or handle this in the UI
          return false;
        }
        set({ compareItems: [...compareItems, product] });
        return true;
      },
      
      removeFromCompare: (productId) => {
        set({
          compareItems: get().compareItems.filter((p) => p._id !== productId),
        });
      },
      
      clearCompare: () => set({ compareItems: [] }),
    }),
    {
      name: 'gadgetpro-compare-storage',
    }
  )
);

export default useCompareStore;
