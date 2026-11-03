import api from './axiosInstance';
import type { Schedule } from '../types/schedule';

export const scheduleApi = {
  getAll: (params?: { ukm_id?: number; type?: string }) =>
    api.get<Schedule[]>('/schedules', { params }),
  create: (data: Partial<Schedule>) =>
    api.post<Schedule>('/schedules', data),
  delete: (id: number) =>
    api.delete<{ message: string }>(`/schedules/${id}`),
};
