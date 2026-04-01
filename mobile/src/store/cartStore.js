import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (product, qty) => {
        const item = {
          product: product._id || product.product,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty: Number(qty),
        };
        
        set((state) => {
          const existItem = state.cartItems.find((x) => x.product === item.product);
          if (existItem) {
            return {
              cartItems: state.cartItems.map((x) => 
                x.product === existItem.product ? item : x
              )
            };
          } else {
            return {
              cartItems: [...state.cartItems, item]
            };
          }
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((x) => x.product !== id)
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;
