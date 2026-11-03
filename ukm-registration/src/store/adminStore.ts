import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Admin {
  id: number;
  name: string;
  email: string;
  role?: string;
  ukm_id?: number;
  ukm_name?: string;
}

interface AdminStore {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAdminAuth: (admin: Admin, token: string) => void;
  adminLogout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAdminAuth: (admin, token) => set({ admin, token, isAuthenticated: true }),
      adminLogout: () => set({ admin: null, token: null, isAuthenticated: false }),
    }),
    { name: 'admin-auth-storage' }
  )
);
