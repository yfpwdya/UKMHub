import api from './axiosInstance';
import type { LoginPayload, RegisterPayload, User } from '../types/user';

export const authApi = {
  register: (payload: RegisterPayload) => api.post<{ message: string }>('/auth/register', payload),
  login: (payload: LoginPayload) =>
    api.post<{ user: User; token: string }>('/auth/login', payload),
};
