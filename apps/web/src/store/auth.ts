import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  role: string | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, role: user.role, accessToken: token }),
      logout: () => set({ user: null, role: null, accessToken: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
