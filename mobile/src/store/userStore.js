import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const useUserStore = create(
  persist(
    (set) => ({
      userInfo: null,

      login: async (email, password) => {
        try {
          const res = await client.post('/users/login', { email, password });
          set({ userInfo: res.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },

      updateUserInfo: (userData) => {
        set({ userInfo: userData });
      },

      register: async (name, email, password) => {
        try {
          const res = await client.post('/users', { name, email, password });
          set({ userInfo: res.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
      },

      logout: () => {
        set({ userInfo: null });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
