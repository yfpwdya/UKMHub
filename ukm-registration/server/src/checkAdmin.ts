import { pool } from './db/pool';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  try {
    const res = await pool.query('SELECT * FROM admins WHERE email = $1', ['admin@ukm.ac.id']);
    console.log('Result from DB:', res.rows);
    if (res.rows.length === 0) {
      console.log('Admin tidak ditemukan. Membuat akun admin baru...');
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
        ['Administrator UKM', 'admin@ukm.ac.id', hash]
      );
      console.log('✅ Akun admin berhasil dibuat!');
    } else {
      console.log('Admin ditemukan. Mereset password ke admin123...');
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'UPDATE admins SET password = $1 WHERE email = $2',
        [hash, 'admin@ukm.ac.id']
      );
      console.log('✅ Password admin berhasil direset ke "admin123"!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkAdmin();
