-- Tambah tabel admins
CREATE TABLE IF NOT EXISTS admins (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed admin default (password: admin123)
-- hash dari bcrypt dengan salt 10
INSERT INTO admins (name, email, password)
VALUES (
  'Administrator UKM',
  'admin@ukm.ac.id',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
)
ON CONFLICT DO NOTHING;
