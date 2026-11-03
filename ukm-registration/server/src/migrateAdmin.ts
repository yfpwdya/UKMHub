import { pool } from './db/pool';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

async function migrateAdmin() {
  console.log('Membuat tabel admin di Supabase...');
  try {
    const sqlPath = path.join(__dirname, 'db', 'migrations', '002_admin.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await pool.query(sql);

    // Update dengan hash yang benar untuk "admin123"
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `UPDATE admins SET password = $1 WHERE email = 'admin@ukm.ac.id'`,
      [hash]
    );

    console.log('✅ Tabel admin & akun default berhasil dibuat!');
    console.log('   Email : admin@ukm.ac.id');
    console.log('   Password : admin123');
  } catch (err) {
    console.error('❌ Gagal:', err);
  } finally {
    await pool.end();
  }
}

migrateAdmin();
