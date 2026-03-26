import { create } from 'zustand';

const useUserStore = create((set) => ({
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  login: (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    set({ userInfo: userData });
  },

  // ✅ FIX: was missing — used by Profile & Checkout to sync address changes
  updateUserInfo: (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    set({ userInfo: userData });
  },

  register: async (name, email, password) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ userInfo: data });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ userInfo: null });
  },
}));

export default useUserStore;