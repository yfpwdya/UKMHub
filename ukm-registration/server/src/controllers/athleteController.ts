import { Request, Response } from 'express';
import { pool } from '../db/pool';

interface AuthRequest extends Request {
  userId: number;
}

export const submitAthletePortfolio = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const { registration_id, sport_category, achievement_level, club_history, certificate_url } = req.body;

  if (!sport_category || !achievement_level || !certificate_url) {
    return res.status(400).json({ message: 'Kategori olahraga, level prestasi, dan link sertifikat wajib diisi' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM athlete_portfolios WHERE user_id = $1 AND sport_category = $2',
      [userId, sport_category]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE athlete_portfolios 
         SET achievement_level = $1, club_history = $2, certificate_url = $3, registration_id = $4, verified_status = 'pending'
         WHERE id = $5 RETURNING *`,
        [achievement_level, club_history, certificate_url, registration_id || null, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO athlete_portfolios 
         (registration_id, user_id, sport_category, achievement_level, club_history, certificate_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [registration_id || null, userId, sport_category, achievement_level, club_history, certificate_url]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Athlete portfolio error:', err);
    res.status(500).json({ message: 'Gagal menyimpan data portofolio atlet' });
  }
};

export const getMyAthletePortfolio = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  try {
    const result = await pool.query(
      'SELECT * FROM athlete_portfolios WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyAthletePortfolio = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'verified' | 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status verifikasi tidak valid' });
  }

  try {
    const result = await pool.query(
      `UPDATE athlete_portfolios 
       SET verified_status = $1, verified_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result.rows[0]) return res.status(404).json({ message: 'Portofolio tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
