import { Request, Response } from 'express';
import { pool } from '../db/pool';

interface StaffRequest extends Request {
  adminId: number;
  role: string;
  ukmId?: number | null;
}

export const getSchedules = async (req: Request, res: Response) => {
  const { ukm_id, type } = req.query;

  try {
    let query = `
      SELECT s.*, u.name as ukm_name, u.category as ukm_category,
             (SELECT COUNT(*) FROM interview_bookings ib WHERE ib.schedule_id = s.id) as booked_count
      FROM schedules s
      JOIN ukm u ON s.ukm_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let idx = 1;

    if (ukm_id) {
      query += ` AND s.ukm_id = $${idx++}`;
      params.push(Number(ukm_id));
    }

    if (type) {
      query += ` AND s.type = $${idx++}`;
      params.push(type as string);
    }

    query += ' ORDER BY s.date ASC, s.start_time ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getSchedules error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  const staff = req as StaffRequest;
  const { ukm_id, title, date, start_time, end_time, location, quota, type } = req.body;

  // RBAC: Jika staff, pastikan ukm_id sesuai miliknya
  const targetUkmId = staff.role === 'staff' ? staff.ukmId : ukm_id;

  if (!targetUkmId || !title || !date || !start_time || !end_time || !location) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO schedules (ukm_id, title, date, start_time, end_time, location, quota, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [targetUkmId, title, date, start_time, end_time, location, quota || 20, type || 'kegiatan']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createSchedule error:', err);
    res.status(500).json({ message: 'Gagal membuat jadwal' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  const staff = req as StaffRequest;
  const { id } = req.params;

  try {
    // Validasi kepemilikan jika staff
    if (staff.role === 'staff') {
      const schedule = await pool.query('SELECT ukm_id FROM schedules WHERE id = $1', [id]);
      if (!schedule.rows[0] || schedule.rows[0].ukm_id !== staff.ukmId) {
        return res.status(403).json({ message: 'Akses ditolak: Jadwal ini bukan milik UKM Anda' });
      }
    }

    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
