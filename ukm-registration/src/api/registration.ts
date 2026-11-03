import api from './axiosInstance';
import type { Registration } from '../types/registration';
import type { UKMChoice } from '../types/ukm';

export const registrationApi = {
  submit: (choices: UKMChoice[]) =>
    api.post<Registration>('/registration/submit', { ukm_choices: choices }),
  getStatus: () => 
    api.get<Registration | null>('/registration/status'),
  revise: (choices: UKMChoice[]) =>
    api.patch<{ message: string; registration: Registration }>('/registration/revise', { ukm_choices: choices }),
  cancel: () =>
    api.delete<{ message: string }>('/registration/cancel'),
};
