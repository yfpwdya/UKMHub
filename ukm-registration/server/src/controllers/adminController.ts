import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { sendStatusNotificationEmail } from '../services/emailService';

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalReg, pending, accepted, rejected] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM registrations WHERE status != 'cancelled'"),
      pool.query("SELECT COUNT(*) FROM registrations WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM registrations WHERE status = 'accepted'"),
      pool.query("SELECT COUNT(*) FROM registrations WHERE status = 'rejected'"),
    ]);

    const topUKM = await pool.query(`
      SELECT ukm_name, COUNT(*) as total
      FROM (
        SELECT jsonb_array_elements(ukm_choices)->>'ukm' AS ukm_json
        FROM registrations
        WHERE status != 'cancelled'
      ) sub
      CROSS JOIN LATERAL (
        SELECT (ukm_json::jsonb)->>'name' AS ukm_name
      ) u
      GROUP BY ukm_name
      ORDER BY total DESC
      LIMIT 5
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalRegistrations: parseInt(totalReg.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      accepted: parseInt(accepted.rows[0].count),
      rejected: parseInt(rejected.rows[0].count),
      topUKM: topUKM.rows,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let where = "WHERE r.status != 'cancelled'";
    const params: (string | number)[] = [];
    let idx = 1;

    if (status && status !== 'semua') {
      where += ` AND r.status = $${idx++}`;
      params.push(status as string);
    }

    if (search) {
      where += ` AND (u.name ILIKE $${idx} OR u.nim ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM registrations r JOIN users u ON r.user_id = u.id ${where}`,
      params
    );

    const dataRes = await pool.query(
      `SELECT
        r.id, r.status, r.reference_number, r.submitted_at, r.grace_deadline, r.ukm_choices,
        r.accepted_ukm_id, r.selection_note,
        ukm_acc.name as accepted_ukm_name, ukm_acc.category as accepted_ukm_category,
        u.name, u.nim, u.email, u.faculty, u.major, u.semester,
        (SELECT COUNT(*) FROM athlete_portfolios ap WHERE ap.registration_id = r.id OR ap.user_id = r.user_id) as athlete_doc_count
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN ukm ukm_acc ON r.accepted_ukm_id = ukm_acc.id
       ${where}
       ORDER BY r.submitted_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit as string), offset]
    );

    res.json({
      data: dataRes.rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page as string),
      totalPages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit as string)),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRegistrationDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        r.id, r.user_id, r.status, r.reference_number, r.submitted_at, r.grace_deadline, r.ukm_choices,
        r.accepted_ukm_id, r.selection_note,
        ukm_acc.name as accepted_ukm_name, ukm_acc.category as accepted_ukm_category,
        u.name, u.nim, u.email, u.faculty, u.major, u.semester,
        qr.scores
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN questionnaire_results qr ON r.result_id = qr.id
       LEFT JOIN ukm ukm_acc ON r.accepted_ukm_id = ukm_acc.id
       WHERE r.id = $1`,
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const reg = result.rows[0];

    // Ambil portofolio atlet jika ada
    const athleteRes = await pool.query(
      'SELECT * FROM athlete_portfolios WHERE user_id = $1 OR registration_id = $2',
      [reg.user_id, reg.id]
    );

    res.json({
      ...reg,
      athlete_portfolio: athleteRes.rows[0] || null,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const runAutoSelection = async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ukmRes = await client.query('SELECT id, name, category, capacity FROM ukm');
    const ukmMap = new Map<number, { id: number; name: string; category: string; capacity: number; accepted: number }>();
    for (const u of ukmRes.rows) {
      ukmMap.set(u.id, { ...u, accepted: 0 });
    }

    // Ambil semua pendaftaran pending + skor + portofolio atlet
    const regRes = await client.query(`
      SELECT r.id, r.user_id, r.reference_number, r.ukm_choices, r.status, qr.scores,
             u.name as user_name, u.email as user_email,
             ap.achievement_level as athlete_level, ap.verified_status as athlete_verified
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN questionnaire_results qr ON r.result_id = qr.id
      LEFT JOIN athlete_portfolios ap ON ap.user_id = r.user_id
      WHERE r.status = 'pending'
      ORDER BY r.submitted_at ASC
    `);

    let acceptedTotal = 0;
    let rejectedTotal = 0;

    for (const reg of regRes.rows) {
      const choices = (reg.ukm_choices || []) as { priority: number; ukm: { id: number; name: string; category: string } }[];
      const scores = (reg.scores || {}) as Record<string, number>;

      let assignedUKMId: number | null = null;
      let assignedUKMName = '';
      let note = '';

      // AFIRMASI POIN ATLET
      let athleteBonus = 0;
      if (reg.athlete_verified === 'verified') {
        if (reg.athlete_level === 'Internasional') athleteBonus = 50;
        else if (reg.athlete_level === 'Nasional') athleteBonus = 30;
        else if (reg.athlete_level === 'Provinsi') athleteBonus = 20;
        else athleteBonus = 10;
      }

      const evaluatedChoices = choices.map((c) => {
        const cat = c.ukm.category;
        const catScore = scores[cat.toLowerCase()] || scores[cat] || 0;
        const priorityBonus = Math.max(0, 25 - c.priority * 5);
        const extraSportBonus = cat.toLowerCase() === 'olahraga' ? athleteBonus : 0;
        const totalFitScore = catScore + priorityBonus + extraSportBonus;
        return {
          ...c,
          catScore,
          totalFitScore,
          extraSportBonus,
        };
      });

      evaluatedChoices.sort((a, b) => {
        if (b.totalFitScore !== a.totalFitScore) return b.totalFitScore - a.totalFitScore;
        return a.priority - b.priority;
      });

      for (const choice of evaluatedChoices) {
        const ukm = ukmMap.get(choice.ukm.id);
        if (ukm && ukm.accepted < ukm.capacity) {
          assignedUKMId = ukm.id;
          assignedUKMName = ukm.name;
          ukm.accepted += 1;
          const athleteNote = choice.extraSportBonus > 0 ? ` + Afirmasi Atlet (+${choice.extraSportBonus} poin)` : '';
          note = `Diterima di ${ukm.name} (Pilihan #${choice.priority}) - Fit Score: ${choice.totalFitScore} poin${athleteNote}`;
          break;
        }
      }

      if (assignedUKMId) {
        await client.query(
          `UPDATE registrations 
           SET status = 'accepted', accepted_ukm_id = $1, selection_note = $2 
           WHERE id = $3`,
          [assignedUKMId, note, reg.id]
        );
        acceptedTotal++;

        // Trigger Notifikasi Email Asinkron
        sendStatusNotificationEmail(
          reg.user_id,
          reg.id,
          reg.user_email,
          reg.user_name,
          'accepted',
          assignedUKMName,
          reg.reference_number,
          note
        ).catch(() => {});
      } else {
        await client.query(
          `UPDATE registrations 
           SET status = 'rejected', accepted_ukm_id = NULL, selection_note = 'Kuota pada seluruh pilihan UKM telah terpenuhi' 
           WHERE id = $1`,
          [reg.id]
        );
        rejectedTotal++;

        sendStatusNotificationEmail(
          reg.user_id,
          reg.id,
          reg.user_email,
          reg.user_name,
          'rejected',
          undefined,
          reg.reference_number,
          'Kuota pada seluruh pilihan UKM telah terpenuhi'
        ).catch(() => {});
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Seleksi otomatis berhasil dijalankan',
      totalProcessed: regRes.rows.length,
      acceptedTotal,
      rejectedTotal,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Auto selection error:', err);
    res.status(500).json({ message: 'Gagal menjalankan seleksi otomatis' });
  } finally {
    client.release();
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, accepted_ukm_id, selection_note } = req.body;
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }
  try {
    const result = await pool.query(
      `UPDATE registrations 
       SET status = $1, accepted_ukm_id = $2, selection_note = $3 
       WHERE id = $4 RETURNING *`,
      [status, accepted_ukm_id || null, selection_note || null, id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Kirim notifikasi email
    const userRes = await pool.query(
      `SELECT u.name, u.email, r.reference_number, ukm.name as ukm_name
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN ukm ON r.accepted_ukm_id = ukm.id
       WHERE r.id = $1`,
      [id]
    );

    if (userRes.rows[0]) {
      const u = userRes.rows[0];
      sendStatusNotificationEmail(
        result.rows[0].user_id,
        parseInt(id as string),
        u.email,
        u.name,
        status as 'accepted' | 'rejected' | 'pending',
        u.ukm_name,
        u.reference_number,
        selection_note
      ).catch(() => {});
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.name, u.nim, u.email, u.faculty, u.major, u.semester, u.created_at,
             r.status as reg_status, r.reference_number
      FROM users u
      LEFT JOIN registrations r ON r.user_id = u.id AND r.status != 'cancelled'
    `;
    const params: string[] = [];
    if (search) {
      query += ' WHERE u.name ILIKE $1 OR u.nim ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY u.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
