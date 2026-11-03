import { pool } from './db/pool';

async function seedAnswers() {
  console.log('Mengisi data jawaban kuisioner ke Supabase...');
  try {
    const qRes = await pool.query('SELECT id, category FROM questions ORDER BY id');
    const questions = qRes.rows;

    if (questions.length === 0) {
      console.log('Tidak ada soal found.');
      return;
    }

    await pool.query('DELETE FROM answers');

    for (const q of questions) {
      const cat = q.category.toLowerCase();
      let weights = [
        { text: 'Sangat Setuju / Sangat Suka', weight: { [cat]: 3 } },
        { text: 'Setuju / Suka', weight: { [cat]: 2 } },
        { text: 'Ragu-ragu / Netral', weight: { [cat]: 1 } },
        { text: 'Tidak Setuju / Tidak Suka', weight: { [cat]: 0 } },
      ];

      for (const w of weights) {
        await pool.query(
          'INSERT INTO answers (question_id, text, weight) VALUES ($1, $2, $3)',
          [q.id, w.text, JSON.stringify(w.weight)]
        );
      }
    }

    console.log('✅ Seed Jawaban Kuisioner Berhasil!');
  } catch (err) {
    console.error('❌ Seed Jawaban Gagal:', err);
  } finally {
    await pool.end();
  }
}

seedAnswers();
