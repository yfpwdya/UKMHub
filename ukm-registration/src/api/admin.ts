import api from './axiosInstance';
import { useAdminStore } from '../store/adminStore';
import type { AthletePortfolio } from '../types/athlete';

export interface AdminStats {
  totalUsers: number;
  totalRegistrations: number;
  pending: number;
  accepted: number;
  rejected: number;
  topUKM: { ukm_name: string; total: string }[];
}

export interface AdminRegistrationItem {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  reference_number: string;
  submitted_at: string;
  grace_deadline?: string;
  ukm_choices: { priority: number; ukm: { id: number; name: string; category: string } }[];
  accepted_ukm_id?: number;
  accepted_ukm_name?: string;
  selection_note?: string;
  name: string;
  nim: string;
  email: string;
  faculty: string;
  major: string;
  semester: number;
  athlete_doc_count?: number;
}

export interface AdminRegistrationDetail extends AdminRegistrationItem {
  scores?: Record<string, number>;
  athlete_portfolio?: AthletePortfolio | null;
}

export interface AdminUserItem {
  id: number;
  name: string;
  nim: string;
  email: string;
  faculty: string;
  major: string;
  semester: number;
  created_at: string;
  reg_status: string | null;
  reference_number: string | null;
}

export const adminApi = {
  login: (payload: { email: string; password: string }) =>
    api.post<{ admin: { id: number; name: string; email: string; role?: string; ukm_id?: number; ukm_name?: string }; token: string }>(
      '/admin/auth/login',
      payload
    ),

  getStats: () => {
    const token = useAdminStore.getState().token;
    return api.get<AdminStats>('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getRegistrations: (params: { status?: string; search?: string; page?: number; limit?: number }) => {
    const token = useAdminStore.getState().token;
    return api.get<{
      data: AdminRegistrationItem[];
      total: number;
      page: number;
      totalPages: number;
    }>('/admin/registrations', {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getRegistrationDetail: (id: string | number) => {
    const token = useAdminStore.getState().token;
    return api.get<AdminRegistrationDetail>(`/admin/registrations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateStatus: (id: number, status: 'pending' | 'accepted' | 'rejected', accepted_ukm_id?: number, selection_note?: string) => {
    const token = useAdminStore.getState().token;
    return api.patch(
      `/admin/registrations/${id}/status`,
      { status, accepted_ukm_id, selection_note },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  runAutoSelection: () => {
    const token = useAdminStore.getState().token;
    return api.post<{ message: string; totalProcessed: number; acceptedTotal: number; rejectedTotal: number }>(
      '/admin/run-selection',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  getUsers: (search?: string) => {
    const token = useAdminStore.getState().token;
    return api.get<AdminUserItem[]>('/admin/users', {
      params: search ? { search } : {},
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
