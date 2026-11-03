import { Router } from 'express';
import {
  submitAthletePortfolio,
  getMyAthletePortfolio,
  verifyAthletePortfolio,
} from '../controllers/athleteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { staffMiddleware } from '../middleware/staffMiddleware';

export const athleteRouter = Router();

// Mahasiswa
athleteRouter.post('/submit', authMiddleware, submitAthletePortfolio);
athleteRouter.get('/me', authMiddleware, getMyAthletePortfolio);

// Staff / Admin Verifikasi
athleteRouter.patch('/:id/verify', staffMiddleware, verifyAthletePortfolio);
