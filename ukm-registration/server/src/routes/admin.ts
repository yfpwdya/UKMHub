import { Router } from 'express';
import {
  getStats,
  getAllRegistrations,
  getRegistrationDetail,
  updateStatus,
  getAllUsers,
  runAutoSelection,
} from '../controllers/adminController';
import { adminMiddleware } from '../middleware/adminMiddleware';

export const adminRouter = Router();

adminRouter.use(adminMiddleware);
adminRouter.get('/stats', getStats);
adminRouter.post('/run-selection', runAutoSelection);
adminRouter.get('/registrations', getAllRegistrations);
adminRouter.get('/registrations/:id', getRegistrationDetail);
adminRouter.patch('/registrations/:id/status', updateStatus);
adminRouter.get('/users', getAllUsers);
