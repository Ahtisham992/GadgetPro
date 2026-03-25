import { create } from 'zustand';

const useUserStore = create((set) => ({
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,

  // Simply receives the user data object (fetched by the calling page) and persists it
  login: (userData) => {
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
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ userInfo: null });
  }
}));

export default useUserStore;
