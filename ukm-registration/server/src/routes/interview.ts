import { Router } from 'express';
import { bookInterviewSlot, getMyBooking } from '../controllers/interviewController';
import { authMiddleware } from '../middleware/authMiddleware';

export const interviewRouter = Router();

interviewRouter.post('/book', authMiddleware, bookInterviewSlot);
interviewRouter.get('/my-booking', authMiddleware, getMyBooking);
