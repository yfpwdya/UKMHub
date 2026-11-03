import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface StaffRequest extends Request {
  adminId: number;
  role: string;
  ukmId?: number | null;
}

export const staffMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: string;
      ukmId?: number | null;
    };

    if (!['admin', 'staff'].includes(payload.role)) {
      return res.status(403).json({ message: 'Akses ditolak: Hanya untuk Admin atau Staff UKM' });
    }

    (req as StaffRequest).adminId = payload.id;
    (req as StaffRequest).role = payload.role;
    (req as StaffRequest).ukmId = payload.ukmId || null;
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};
