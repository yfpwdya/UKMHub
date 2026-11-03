import { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
} from '../controllers/scheduleController';
import { staffMiddleware } from '../middleware/staffMiddleware';

export const scheduleRouter = Router();

// Public / Mahasiswa dapat melihat jadwal
scheduleRouter.get('/', getSchedules);

// Staff / Admin membuat & menghapus jadwal
scheduleRouter.post('/', staffMiddleware, createSchedule);
scheduleRouter.delete('/:id', staffMiddleware, deleteSchedule);
