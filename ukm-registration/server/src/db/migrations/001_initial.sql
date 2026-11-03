-- Migration: Create all tables for UKM Registration System

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  nim         VARCHAR(20) UNIQUE NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  faculty     VARCHAR(100),
  major       VARCHAR(100),
  semester    INT,
  password    TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ukm (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(50),
  description TEXT,
  logo_url    TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id       SERIAL PRIMARY KEY,
  text     TEXT NOT NULL,
  category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS answers (
  id          SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  weight      JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS questionnaire_results (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE CASCADE,
  scores        JSONB NOT NULL DEFAULT '{}',
  recommended   INT[] DEFAULT '{}',
  submitted_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(id) ON DELETE CASCADE,
  result_id        INT REFERENCES questionnaire_results(id),
  ukm_choices      JSONB NOT NULL DEFAULT '[]',
  status           VARCHAR(20) DEFAULT 'pending',
  reference_number VARCHAR(50) UNIQUE,
  submitted_at     TIMESTAMP DEFAULT NOW()
);

-- Seed UKM data
INSERT INTO ukm (name, category, description) VALUES
  ('Basket', 'Olahraga', 'Tim basket kampus yang aktif berkompetisi di tingkat regional.'),
  ('Futsal', 'Olahraga', 'Komunitas futsal yang aktif berlatih dan bertanding.'),
  ('Renang', 'Olahraga', 'Klub renang kampus dengan pelatih berpengalaman.'),
  ('Paduan Suara', 'Seni', 'Kelompok paduan suara berprestasi di berbagai festival.'),
  ('Teater', 'Seni', 'Komunitas teater yang mengeksplorasi seni pertunjukan.'),
  ('Fotografi', 'Seni', 'Komunitas fotografi kreatif yang aktif mengadakan pameran.'),
  ('Robotika', 'Teknologi', 'Riset dan pengembangan robot untuk kompetisi nasional.'),
  ('Pemrograman', 'Teknologi', 'Komunitas coding dan pengembangan software.'),
  ('KSR PMI', 'Sosial', 'Kegiatan sosial kemasyarakatan dan kepalangmerahan.'),
  ('Pramuka', 'Sosial', 'Gerakan pramuka kampus dengan kegiatan kepanduan.'),
  ('English Club', 'Akademik', 'Komunitas pengembangan kemampuan bahasa Inggris.'),
  ('Debat', 'Akademik', 'Tim debat yang berpartisipasi dalam kompetisi debat.'),
  ('Kerohanian Islam', 'Keagamaan', 'Kegiatan keislaman dan pengembangan spiritual.'),
  ('Kerohanian Kristen', 'Keagamaan', 'Kegiatan kekristenan dan pengembangan iman.')
ON CONFLICT DO NOTHING;

-- Seed questions
INSERT INTO questions (text, category) VALUES
  ('Saya senang berolahraga secara tim dan berkompetisi', 'Olahraga'),
  ('Saya menyukai kegiatan seni seperti musik, teater, atau fotografi', 'Seni'),
  ('Saya tertarik pada teknologi dan pemrograman komputer', 'Teknologi'),
  ('Saya senang membantu orang lain dan kegiatan sosial', 'Sosial'),
  ('Saya suka belajar dan berdiskusi hal-hal akademis', 'Akademik'),
  ('Saya aktif dalam kegiatan keagamaan dan pengembangan spiritual', 'Keagamaan'),
  ('Saya lebih suka kegiatan yang melibatkan fisik dan gerak', 'Olahraga'),
  ('Saya senang mengekspresikan diri melalui karya kreatif', 'Seni'),
  ('Saya suka memecahkan masalah menggunakan logika dan algoritma', 'Teknologi'),
  ('Saya ingin berkontribusi untuk lingkungan sekitar', 'Sosial')
ON CONFLICT DO NOTHING;
