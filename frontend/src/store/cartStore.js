import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
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
      let newCartItems;
      if (existItem) {
        newCartItems = state.cartItems.map((x) => x.product === existItem.product ? item : x);
      } else {
        newCartItems = [...state.cartItems, item];
      }
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return { cartItems: newCartItems };
    });
  },
  removeFromCart: (id) => {
    set((state) => {
      const newCartItems = state.cartItems.filter((x) => x.product !== id);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      return { cartItems: newCartItems };
    });
  }
}));

export default useCartStore;
