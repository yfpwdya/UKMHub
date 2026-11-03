import api from './axiosInstance';
import type { InterviewBooking } from '../types/schedule';

export const interviewApi = {
  book: (payload: { schedule_id: number; registration_id: number }) =>
    api.post<{ message: string; booking: InterviewBooking }>('/interview/book', payload),
  getMyBooking: () =>
    api.get<InterviewBooking | null>('/interview/my-booking'),
};
