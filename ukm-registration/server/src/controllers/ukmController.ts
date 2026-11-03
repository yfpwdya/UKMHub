import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const getAllUKM = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT u.*, 
             COALESCE(r.accepted_count, 0)::int as accepted_count,
             GREATEST(u.capacity - COALESCE(r.accepted_count, 0)::int, 0) as remaining_quota
      FROM ukm u
      LEFT JOIN (
        SELECT accepted_ukm_id, COUNT(*) as accepted_count
        FROM registrations
        WHERE status = 'accepted' AND accepted_ukm_id IS NOT NULL
        GROUP BY accepted_ukm_id
      ) r ON u.id = r.accepted_ukm_id
      ORDER BY u.category, u.name
    `;
    const params: string[] = [];
    if (category && typeof category === 'string') {
      query = `
        SELECT u.*, 
               COALESCE(r.accepted_count, 0)::int as accepted_count,
               GREATEST(u.capacity - COALESCE(r.accepted_count, 0)::int, 0) as remaining_quota
        FROM ukm u
        LEFT JOIN (
          SELECT accepted_ukm_id, COUNT(*) as accepted_count
          FROM registrations
          WHERE status = 'accepted' AND accepted_ukm_id IS NOT NULL
          GROUP BY accepted_ukm_id
        ) r ON u.id = r.accepted_ukm_id
        WHERE u.category = $1
        ORDER BY u.name
      `;
      params.push(category);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUKMById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM ukm WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'UKM tidak ditemukan' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUKM = async (req: Request, res: Response) => {
  try {
    const { name, category, description, logo_url, capacity } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Nama dan kategori UKM wajib diisi' });
    }
    const result = await pool.query(
      'INSERT INTO ukm (name, category, description, logo_url, capacity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, description || '', logo_url || '', capacity ? parseInt(capacity, 10) : 30]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Gagal menambahkan UKM' });
  }
};

export const updateUKM = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, logo_url, capacity } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Nama dan kategori UKM wajib diisi' });
    }
    const result = await pool.query(
      'UPDATE ukm SET name = $1, category = $2, description = $3, logo_url = $4, capacity = $5 WHERE id = $6 RETURNING *',
      [name, category, description || '', logo_url || '', capacity ? parseInt(capacity, 10) : 30, id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'UKM tidak ditemukan' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Gagal memperbarui UKM' });
  }
};

export const deleteUKM = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ukm WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'UKM tidak ditemukan' });
    res.json({ message: 'UKM berhasil dihapus' });
  } catch {
    res.status(500).json({ message: 'Gagal menghapus UKM' });
  }
};
