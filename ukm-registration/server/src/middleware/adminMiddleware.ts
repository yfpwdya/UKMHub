import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AdminRequest extends Request {
  adminId: number;
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    (req as AdminRequest).adminId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};
