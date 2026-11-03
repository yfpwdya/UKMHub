import api from './axiosInstance';
import type { Question, QuestionnaireResult } from '../types/questionnaire';

export const questionnaireApi = {
  getQuestions: () => api.get<Question[]>('/questionnaire/questions'),
  submitAnswers: (answers: Record<number, number>) =>
    api.post<QuestionnaireResult>('/questionnaire/submit', { answers }),
  getResult: () => api.get<QuestionnaireResult>('/questionnaire/result'),
};
