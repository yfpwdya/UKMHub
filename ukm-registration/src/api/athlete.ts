import api from './axiosInstance';
import type { AthletePortfolio, AthletePayload } from '../types/athlete';

export const athleteApi = {
  submit: (payload: AthletePayload) =>
    api.post<AthletePortfolio>('/athlete/submit', payload),
  getMyPortfolios: () =>
    api.get<AthletePortfolio[]>('/athlete/me'),
  verify: (id: number, status: 'verified' | 'rejected') =>
    api.patch<AthletePortfolio>(`/athlete/${id}/verify`, { status }),
};
