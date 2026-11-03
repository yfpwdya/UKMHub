import { pool } from './db/pool';
import fs from 'fs';
import path from 'path';

async function migrate() {
  console.log('Menghubungkan ke Supabase PostgreSQL...');
  try {
    const sqlPath = path.join(__dirname, 'db', 'migrations', '001_initial.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Jalankan SQL Migration...');
    await pool.query(sql);
    console.log('✅ Migration & Seed Data Supabase Berhasil!');
  } catch (err) {
    console.error('❌ Migration Gagal:', err);
  } finally {
    await pool.end();
  }
}

migrate();
