import { Router } from 'express';
import { getQuestions, submitAnswers, getResult } from '../controllers/questionnaireController';
import { authMiddleware } from '../middleware/authMiddleware';
export const questionnaireRouter = Router();
questionnaireRouter.get('/questions', authMiddleware, getQuestions);
questionnaireRouter.post('/submit', authMiddleware, submitAnswers);
questionnaireRouter.get('/result', authMiddleware, getResult);
