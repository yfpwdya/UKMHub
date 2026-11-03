# Sistem Pendaftaran UKM - Website Flow

## Tech Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js / Express (REST API)
- **Database**: PostgreSQL

---

## 1. Arsitektur Umum

```
Pendaftar (Browser)
    └── React + TypeScript (Frontend)
            └── REST API
                    └── Express.js (Backend)
                            └── PostgreSQL (Database)
```

---

## 2. Database Schema

### Tabel `users`
```sql
CREATE TABLE users (
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
```

### Tabel `ukm`
```sql
CREATE TABLE ukm (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(50),   -- olahraga, seni, akademik, sosial, dll
  description TEXT,
  logo_url    TEXT
);
```

### Tabel `questions`
```sql
CREATE TABLE questions (
  id       SERIAL PRIMARY KEY,
  text     TEXT NOT NULL,
  category VARCHAR(50)   -- kategori bakat/minat yang diukur
);
```

### Tabel `answers`
```sql
CREATE TABLE answers (
  id          SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id),
  text        TEXT NOT NULL,
  weight      JSONB   -- { "olahraga": 2, "seni": 0, ... }
);
```

### Tabel `questionnaire_results`
```sql
CREATE TABLE questionnaire_results (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id),
  scores        JSONB,    -- { "olahraga": 14, "seni": 7, "akademik": 10, ... }
  recommended   INT[],    -- array ukm_id yang direkomendasikan
  submitted_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabel `registrations`
```sql
CREATE TABLE registrations (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id),
  result_id     INT REFERENCES questionnaire_results(id),
  ukm_choices   JSONB,  -- [{ "priority": 1, "ukm_id": 3 }, { "priority": 2, "ukm_id": 7 }, ...]
  status        VARCHAR(20) DEFAULT 'pending',  -- pending | accepted | rejected
  submitted_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Flow Halaman (Page Flow)

```
[Landing Page]
      |
      |-- Belum punya akun --> [Register Page]
      |                               |
      |                               v
      |                        [Login Page]
      |                               |
      |-- Sudah punya akun -----------+
                                      |
                                      v
                              [Dashboard Pendaftar]
                                      |
                              [Mulai Kuisioner]
                                      |
                                      v
                            [Questionnaire Page]
                            (step-by-step per soal)
                                      |
                                      v
                            [Result Page]
                            (tampilkan skor bakat/minat
                             + rekomendasi UKM)
                                      |
                                      v
                            [UKM Selection Page]
                            (pilih maks. 4 UKM
                             dengan drag & drop prioritas)
                                      |
                                      v
                            [Confirmation Page]
                            (review pilihan sebelum submit)
                                      |
                                      v
                            [Submission Success Page]
                                      |
                                      v
                            [Dashboard - Status Pendaftaran]
```

---

## 4. Detail Per Halaman

### 4.1 Landing Page (`/`)
- Hero section dengan penjelasan singkat sistem pendaftaran UKM
- Tombol "Daftar Sekarang" dan "Login"
- Daftar UKM yang tersedia (preview)

### 4.2 Register Page (`/register`)
- Form: Nama, NIM, Email, Fakultas, Jurusan, Semester, Password
- Validasi input di sisi client (React Hook Form + Zod)
- Submit → POST `/api/auth/register`
- Redirect ke `/login` setelah berhasil

### 4.3 Login Page (`/login`)
- Form: NIM/Email + Password
- Submit → POST `/api/auth/login` → dapat JWT token
- Token disimpan di `localStorage` / `httpOnly cookie`
- Redirect ke `/dashboard`

### 4.4 Dashboard (`/dashboard`)
- Tampilkan status pendaftaran user:
  - Belum mulai → tombol "Mulai Kuisioner"
  - Sudah isi kuisioner, belum pilih UKM → tombol "Pilih UKM"
  - Sudah submit → tampilkan pilihan UKM + status (pending/accepted/rejected)

### 4.5 Questionnaire Page (`/questionnaire`)
- Soal ditampilkan satu per satu (step-by-step)
- Progress bar di atas
- Tiap soal: pilihan jawaban dengan radio button
- State disimpan lokal (React state / Zustand) selama pengisian
- Tombol "Selanjutnya" / "Sebelumnya"
- Di akhir soal: tombol "Lihat Hasil"
- Submit jawaban → POST `/api/questionnaire/submit`

### 4.6 Result Page (`/result`)
- Tampilkan skor per kategori bakat/minat (bar chart / radar chart)
  - Gunakan library: `recharts` atau `chart.js`
- Tampilkan daftar UKM yang direkomendasikan berdasarkan skor tertinggi
- Tombol "Pilih UKM"

### 4.7 UKM Selection Page (`/select-ukm`)
- Grid/list semua UKM (dengan filter kategori)
- Setiap kartu UKM: nama, deskripsi singkat, badge "Rekomendasi" jika sesuai hasil
- Pendaftar memilih maksimal 4 UKM
- Setelah dipilih, muncul panel "Prioritas Pilihan" di samping/bawah
  - Drag & drop untuk mengatur urutan prioritas (library: `dnd-kit`)
- Validasi: minimal 1, maksimal 4 pilihan

### 4.8 Confirmation Page (`/confirm`)
- Review ringkasan:
  - Data diri pendaftar
  - Hasil bakat/minat (ringkasan)
  - 4 UKM pilihan beserta urutannya
- Checkbox persetujuan / disclaimer
- Tombol "Submit Pendaftaran" → POST `/api/registration/submit`

### 4.9 Submission Success Page (`/success`)
- Pesan konfirmasi berhasil
- Nomor referensi pendaftaran
- Redirect otomatis ke dashboard setelah beberapa detik

---

## 5. Struktur Folder Frontend

```
src/
├── api/                   # axios instance + API calls
│   ├── auth.ts
│   ├── questionnaire.ts
│   ├── ukm.ts
│   └── registration.ts
├── components/
│   ├── ui/                # komponen generik (Button, Input, Card, dll)
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── questionnaire/     # QuestionCard, ProgressBar
│   ├── ukm/               # UKMCard, UKMGrid, PriorityList
│   └── result/            # ScoreChart, RecommendationList
├── pages/
│   ├── LandingPage.tsx
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── QuestionnairePage.tsx
│   ├── ResultPage.tsx
│   ├── SelectUKMPage.tsx
│   ├── ConfirmationPage.tsx
│   └── SuccessPage.tsx
├── store/                 # Zustand global state
│   ├── authStore.ts
│   └── registrationStore.ts
├── types/                 # TypeScript interfaces & types
│   ├── user.ts
│   ├── ukm.ts
│   ├── questionnaire.ts
│   └── registration.ts
├── utils/                 # helper functions
│   └── scoreCalculator.ts
├── router/
│   └── index.tsx          # React Router v6 routes
└── App.tsx
```

---

## 6. Struktur Folder Backend

```
server/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── questionnaireController.ts
│   │   ├── ukmController.ts
│   │   └── registrationController.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── questionnaire.ts
│   │   ├── ukm.ts
│   │   └── registration.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT verify
│   │   └── errorHandler.ts
│   ├── db/
│   │   ├── pool.ts             # pg Pool config
│   │   └── migrations/        # SQL migration files
│   ├── services/
│   │   └── scoreService.ts    # logika perhitungan skor kuisioner
│   └── app.ts
└── package.json
```

---

## 7. API Endpoints

| Method | Endpoint                        | Deskripsi                             | Auth |
|--------|---------------------------------|---------------------------------------|------|
| POST   | `/api/auth/register`            | Registrasi akun baru                  | No   |
| POST   | `/api/auth/login`               | Login, return JWT                     | No   |
| GET    | `/api/ukm`                      | Ambil semua UKM                       | No   |
| GET    | `/api/ukm/:id`                  | Detail UKM                            | No   |
| GET    | `/api/questionnaire/questions`  | Ambil semua soal kuisioner            | Yes  |
| POST   | `/api/questionnaire/submit`     | Submit jawaban, hitung & simpan skor  | Yes  |
| GET    | `/api/questionnaire/result`     | Ambil hasil kuisioner user            | Yes  |
| POST   | `/api/registration/submit`      | Submit pilihan UKM                    | Yes  |
| GET    | `/api/registration/status`      | Cek status pendaftaran user           | Yes  |

---

## 8. Logika Perhitungan Skor Kuisioner

```
Setiap jawaban memiliki weight per kategori UKM.
Contoh:
  Soal: "Saya suka berolahraga secara tim"
  Jawaban A (Sangat setuju): { olahraga: 3, seni: 0, sosial: 1 }
  Jawaban B (Setuju):        { olahraga: 2, seni: 0, sosial: 0 }
  ...

Total skor per kategori = SUM(weight[kategori]) dari semua jawaban.

Rekomendasi UKM = ambil UKM dengan kategori yang memiliki skor tertinggi,
                  urutkan descending, tampilkan top 5-8 rekomendasi.
```

---

## 9. State Management (Zustand)

```typescript
// registrationStore.ts
interface RegistrationStore {
  answers: Record<number, number>;      // { question_id: answer_id }
  scores: Record<string, number>;       // { kategori: skor }
  recommended: UKM[];
  selectedUKM: { priority: number; ukm: UKM }[];
  setAnswer: (qId: number, aId: number) => void;
  setScores: (scores: Record<string, number>) => void;
  setRecommended: (ukm: UKM[]) => void;
  addUKMChoice: (ukm: UKM) => void;
  removeUKMChoice: (ukmId: number) => void;
  reorderChoices: (from: number, to: number) => void;
}
```

---

## 10. Route Guard

```typescript
// router/index.tsx
// Halaman yang butuh login:
// /dashboard, /questionnaire, /result, /select-ukm, /confirm, /success

<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/questionnaire" element={<QuestionnairePage />} />
  <Route path="/result" element={<ResultPage />} />
  <Route path="/select-ukm" element={<SelectUKMPage />} />
  <Route path="/confirm" element={<ConfirmationPage />} />
  <Route path="/success" element={<SuccessPage />} />
</Route>
```

---

## 11. Library yang Digunakan

| Kebutuhan              | Library                  |
|------------------------|--------------------------|
| Routing                | React Router v6          |
| Form & Validasi        | React Hook Form + Zod    |
| State Management       | Zustand                  |
| HTTP Client            | Axios                    |
| Chart / Visualisasi    | Recharts                 |
| Drag & Drop            | dnd-kit                  |
| Styling                | Tailwind CSS             |
| Auth Token             | JWT (jsonwebtoken)       |
| ORM / Query Builder    | pg (node-postgres)       |
| Password Hash          | bcryptjs                 |
