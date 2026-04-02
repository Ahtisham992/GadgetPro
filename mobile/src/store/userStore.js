import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { setAuthToken } from '../api/client';

const useUserStore = create(
  persist(
    (set) => ({
      userInfo: null,

      login: async (email, password) => {
        try {
          const res = await client.post('/users/login', { email, password });
          set({ userInfo: res.data });
          setAuthToken(res.data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
      },

      updateUserInfo: (userData) => {
        set({ userInfo: userData });
        if (userData?.token) setAuthToken(userData.token);
      },

      register: async (name, email, password) => {
        try {
          const res = await client.post('/users', { name, email, password });
          set({ userInfo: res.data });
          setAuthToken(res.data.token);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
      },

      logout: () => {
        set({ userInfo: null });
        setAuthToken(null);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.userInfo?.token) {
          setAuthToken(state.userInfo.token);
        }
      },
    }
  )
);

export default useUserStore;
