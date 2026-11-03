import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { randomBytes } from 'crypto';

interface AuthRequest extends Request {
  userId: number;
}

export const submitRegistration = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const { ukm_choices } = req.body;

  try {
    const resultRes = await pool.query(
      'SELECT id FROM questionnaire_results WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1',
      [userId]
    );
    const resultId = resultRes.rows[0]?.id || null;

    // Cek apakah sudah pernah daftar yang statusnya bukan 'cancelled'
    const existing = await pool.query(
      "SELECT id FROM registrations WHERE user_id = $1 AND status != 'cancelled'",
      [userId]
    );
    if (existing.rows[0]) {
      return res.status(400).json({ message: 'Anda sudah memiliki pendaftaran aktif' });
    }

    const refNumber = `UKM-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

    // Set grace period 24 jam dari sekarang
    const result = await pool.query(
      `INSERT INTO registrations 
       (user_id, result_id, ukm_choices, reference_number, grace_deadline, status) 
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours', 'pending') 
       RETURNING *`,
      [userId, resultId, JSON.stringify(ukm_choices), refNumber]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Submit registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRegistrationStatus = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  try {
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.result_id, r.ukm_choices, r.status, r.reference_number, 
              r.submitted_at, r.grace_deadline, r.accepted_ukm_id, r.selection_note,
              u_acc.name as accepted_ukm_name, u_acc.category as accepted_ukm_category
       FROM registrations r
       LEFT JOIN ukm u_acc ON r.accepted_ukm_id = u_acc.id
       WHERE r.user_id = $1 AND r.status != 'cancelled'
       ORDER BY r.submitted_at DESC LIMIT 1`,
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// FITUR GRACE PERIOD: Revisi urutan prioritas UKM dalam 24 jam
export const reviseRegistration = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const { ukm_choices } = req.body;

  try {
    const regRes = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND status = 'pending' ORDER BY submitted_at DESC LIMIT 1",
      [userId]
    );

    const reg = regRes.rows[0];
    if (!reg) {
      return res.status(404).json({ message: 'Pendaftaran tidak ditemukan atau sudah tidak berstatus pending' });
    }

    // Cek batas waktu 24 jam
    const now = new Date();
    const deadline = new Date(reg.grace_deadline);
    if (now > deadline) {
      return res.status(400).json({ message: 'Masa tenggang 24 jam telah berakhir. Pilihan tidak dapat diubah lagi.' });
    }

    const updated = await pool.query(
      `UPDATE registrations 
       SET ukm_choices = $1 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(ukm_choices), reg.id]
    );

    res.json({
      message: 'Urutan prioritas UKM berhasil diperbarui',
      registration: updated.rows[0],
    });
  } catch (err) {
    console.error('Revise registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// FITUR GRACE PERIOD: Batalkan pendaftaran dalam 24 jam
export const cancelRegistration = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;

  try {
    const regRes = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND status = 'pending' ORDER BY submitted_at DESC LIMIT 1",
      [userId]
    );

    const reg = regRes.rows[0];
    if (!reg) {
      return res.status(404).json({ message: 'Pendaftaran aktif tidak ditemukan' });
    }

    const now = new Date();
    const deadline = new Date(reg.grace_deadline);
    if (now > deadline) {
      return res.status(400).json({ message: 'Masa tenggang 24 jam telah berakhir. Pendaftaran sudah dikunci untuk seleksi.' });
    }

    await pool.query(
      "UPDATE registrations SET status = 'cancelled' WHERE id = $1",
      [reg.id]
    );

    res.json({ message: 'Pendaftaran berhasil dibatalkan. Anda dapat mendaftar ulang.' });
  } catch (err) {
    console.error('Cancel registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
