import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';

export const register = async (req: Request, res: Response) => {
  const { name, nim, email, faculty, major, semester, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, nim, email, faculty, major, semester, password) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [name, nim, email, faculty, major, semester, hashed]
    );
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err: unknown) {
    const error = err as { code?: string; response?: { data?: { message?: string } } };
    if (error.code === '23505') {
      return res.status(400).json({ message: 'NIM atau email sudah terdaftar' });
    }
    console.error('Registration server error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { nim, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE nim = $1', [nim]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'NIM atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'NIM atau password salah' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    const { password: _pw, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
