import { Router } from 'express';
import { getAllUKM, getUKMById, createUKM, updateUKM, deleteUKM } from '../controllers/ukmController';
import { adminMiddleware } from '../middleware/adminMiddleware';

export const ukmRouter = Router();

ukmRouter.get('/', getAllUKM);
ukmRouter.get('/:id', getUKMById);

// Admin UKM CRUD routes
ukmRouter.post('/', adminMiddleware, createUKM);
ukmRouter.put('/:id', adminMiddleware, updateUKM);
ukmRouter.delete('/:id', adminMiddleware, deleteUKM);

