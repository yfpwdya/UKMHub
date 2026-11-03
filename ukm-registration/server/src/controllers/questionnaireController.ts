import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const getQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await pool.query('SELECT * FROM questions ORDER BY id');
    const answers = await pool.query('SELECT * FROM answers ORDER BY question_id, id');

    const result = questions.rows.map((q) => ({
      ...q,
      answers: answers.rows.filter((a) => a.question_id === q.id),
    }));

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitAnswers = async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  const { answers } = req.body as { answers: Record<string, number> };

  try {
    // fetch all answers weights
    const answerIds = Object.values(answers);
    const answerRows = await pool.query(
      'SELECT id, weight FROM answers WHERE id = ANY($1)',
      [answerIds]
    );

    // calculate scores
    const scores: Record<string, number> = {};
    answerRows.rows.forEach((row) => {
      const weight = row.weight as Record<string, number>;
      Object.entries(weight).forEach(([cat, val]) => {
        scores[cat] = (scores[cat] || 0) + val;
      });
    });

    // get recommended UKM
    const topCategory = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0];
    let recommended: number[] = [];
    if (topCategory) {
      const ukmRes = await pool.query(
        'SELECT id FROM ukm WHERE LOWER(category) = LOWER($1) LIMIT 5',
        [topCategory]
      );
      recommended = ukmRes.rows.map((r) => r.id);
    }

    // delete old result if exists
    await pool.query('DELETE FROM questionnaire_results WHERE user_id = $1', [userId]);

    // insert new result
    const result = await pool.query(
      'INSERT INTO questionnaire_results (user_id, scores, recommended) VALUES ($1, $2, $3) RETURNING *',
      [userId, JSON.stringify(scores), recommended]
    );

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getResult = async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: number }).userId;
  try {
    const result = await pool.query(
      'SELECT * FROM questionnaire_results WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1',
      [userId]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Belum ada hasil' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
