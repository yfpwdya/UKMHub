import api from './axiosInstance';
import type { UKM } from '../types/ukm';
import { useAdminStore } from '../store/adminStore';

export const ukmApi = {
  getAll: (category?: string) =>
    api.get<UKM[]>('/ukm', { params: category && category !== 'Semua' ? { category } : {} }),
  getById: (id: number) => api.get<UKM>(`/ukm/${id}`),
  create: (data: { name: string; category: string; description?: string; logo_url?: string }) => {
    const token = useAdminStore.getState().token;
    return api.post<UKM>('/ukm', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  update: (id: number, data: { name: string; category: string; description?: string; logo_url?: string }) => {
    const token = useAdminStore.getState().token;
    return api.put<UKM>(`/ukm/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  delete: (id: number) => {
    const token = useAdminStore.getState().token;
    return api.delete(`/ukm/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
