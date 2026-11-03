import { Router } from 'express';
import { adminLogin } from '../controllers/adminAuthController';
export const adminAuthRouter = Router();
adminAuthRouter.post('/login', adminLogin);
