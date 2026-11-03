import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as ukm_name 
       FROM admins a 
       LEFT JOIN ukm u ON a.ukm_id = u.id 
       WHERE a.email = $1`,
      [email]
    );
    const admin = result.rows[0];
    if (!admin) return res.status(401).json({ message: 'Email atau password salah' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: 'Email atau password salah' });

    const role = admin.role || 'admin';
    const token = jwt.sign(
      { id: admin.id, role, ukmId: admin.ukm_id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    const { password: _pw, ...safeAdmin } = admin;
    res.json({ admin: safeAdmin, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
