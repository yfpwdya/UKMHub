import { Router } from 'express';
import {
  submitRegistration,
  getRegistrationStatus,
  reviseRegistration,
  cancelRegistration,
} from '../controllers/registrationController';
import { authMiddleware } from '../middleware/authMiddleware';

export const registrationRouter = Router();

registrationRouter.post('/submit', authMiddleware, submitRegistration);
registrationRouter.get('/status', authMiddleware, getRegistrationStatus);
registrationRouter.patch('/revise', authMiddleware, reviseRegistration);
registrationRouter.delete('/cancel', authMiddleware, cancelRegistration);
