import { Request, Response } from 'express';
import { pool } from '../db/pool';

interface AuthRequest extends Request {
  userId: number;
}

export const bookInterviewSlot = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const { schedule_id, registration_id } = req.body;

  if (!schedule_id || !registration_id) {
    return res.status(400).json({ message: 'schedule_id dan registration_id wajib diisi' });
  }

  try {
    // 1. Cek kuota sesi jadwal
    const schedRes = await pool.query(
      `SELECT s.*, (SELECT COUNT(*) FROM interview_bookings ib WHERE ib.schedule_id = s.id) as booked_count
       FROM schedules s WHERE s.id = $1`,
      [schedule_id]
    );

    const schedule = schedRes.rows[0];
    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    if (parseInt(schedule.booked_count) >= schedule.quota) {
      return res.status(400).json({ message: 'Maaf, kuota untuk sesi ini sudah penuh' });
    }

    // 2. Cek apakah sudah pernah booking untuk registrasi ini
    await pool.query(
      'DELETE FROM interview_bookings WHERE registration_id = $1',
      [registration_id]
    );

    // 3. Simpan booking baru
    const result = await pool.query(
      `INSERT INTO interview_bookings (registration_id, user_id, schedule_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [registration_id, userId, schedule_id]
    );

    res.status(201).json({
      message: 'Jadwal wawancara berhasil dipilih',
      booking: result.rows[0],
    });
  } catch (err) {
    console.error('bookInterview error:', err);
    res.status(500).json({ message: 'Gagal memilih jadwal wawancara' });
  }
};

export const getMyBooking = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  try {
    const result = await pool.query(
      `SELECT ib.*, s.title, s.date, s.start_time, s.end_time, s.location, s.type, u.name as ukm_name
       FROM interview_bookings ib
       JOIN schedules s ON ib.schedule_id = s.id
       JOIN ukm u ON s.ukm_id = u.id
       WHERE ib.user_id = $1
       ORDER BY ib.booked_at DESC LIMIT 1`,
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
