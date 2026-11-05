# 🌐 GLOSINDO - GLIDE Digital Guestbook System

**PT Global Media Pratama Solusindo**

Sistem buku tamu digital mandiri (kiosk) dan manajemen pengunjung cerdas terintegrasi berbasis **Biometric Face Recognition (AI)**, **Event Management**, **Gamification Scan Point**, serta **Laporan & Analitik Kunjungan**.

---

## 📋 Tech Stack

### Backend
- **Framework:** Lumen 10 (Laravel Micro-framework)
- **Runtime:** PHP 8.1+
- **Database:** MySQL 8.0+
- **Authentication:** JWT Auth (`tymon/jwt-auth`)
- **Export Data:** `phpoffice/phpspreadsheet` (Excel), `barryvdh/laravel-dompdf` (PDF)

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Biometrik / Face Recognition:** `face-api.js` (TensorFlow.js based)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Icons & UI:** `lucide-react`, `react-hot-toast`, `recharts`
- **Mobile Support:** Capacitor Android (`com.glosindo.app`)

---

## 🎯 Fitur Utama

- 👤 **Kiosk Kunjungan Mandiri (GLIDE Guestbook):** Layar sentuh kiosk ramah tamu dengan pemindaian biometrik wajah instan, verifikasi otomatis tamu terdaftar, dan form pendaftaran tamu baru cepat.
- 🌐 **Pendaftaran Tamu Publik (Online):** Portal publik bagi tamu untuk mendaftar mandiri sebelum hadir ke kantor atau pabrik.
- 🎪 **Event & Public Event Registration:** Manajemen acara perusahaan dengan portal registrasi mandiri via kode event unik.
- 🎮 **Gamification & Scan Point:** Sistem game pameran/acara dengan scan QR point, token registrasi peserta, dan pencatatan aktivitas pengunjung.
- ⚡ **Face Recognition Check-In / Out:** Deteksi wajah cepat dan pencocokan embedding vector 128-dimensi secara real-time.
- 📊 **Dashboard Analitik & Tamu Aktif:** Monitoring total tamu harian, tamu sedang aktif di gedung, dan riwayat kunjungan.
- 📑 **Export Laporan Komprehensif:** Unduh laporan kunjungan harian/bulanan ke format PDF dan Microsoft Excel.
- 🛡️ **Multi-Role & Feature Access Gate:** Pembagian hak akses granular (Admin, Resepsionis, Supervisor) dengan kontrol aktif/nonaktif fitur per role.
- 📱 **Aplikasi Mobile (Android):** Kompatibel dengan perangkat tablet / smartphone berbasis Android via Capacitor.

---

## 🗺️ Panduan Rute (Routing System)

### Rute Publik & Kiosk
| Path | Deskripsi | Akses |
|------|-----------|-------|
| `/guest-visit` / `/kunjungan-tamu` | Kiosk Mandiri Wajah (GLIDE Guestbook) | Publik (Kiosk) |
| `/register` / `/registrasi-tamu` | Form Pendaftaran Tamu Mandiri Publik | Publik |
| `/event/:code/register` | Pendaftaran Peserta Acara / Event | Publik |
| `/games/register/:token` | Registrasi Peserta Game Event | Publik |
| `/games/scan-point` | Terminal Pindai Poin Gamification Event | Publik |
| `/login` | Halaman Masuk Petugas / Admin | Publik |

### Rute Petugas / Resepsionis
| Path | Deskripsi | Role |
|------|-----------|------|
| `/receptionist/check-in` | Check-in Tamu Cepat oleh Resepsionis | Receptionist |
| `/receptionist/active` | Daftar Tamu Aktif Saat Ini | Receptionist |
| `/receptionist/history` | Riwayat Kunjungan Resepsionis | Receptionist |
| `/receptionist/visitors` | Direktori Master Tamu | Receptionist |

### Rute Dashboard & Admin
| Path | Deskripsi | Role |
|------|-----------|------|
| `/dashboard` | Dashboard Statistik & Grafik Kunjungan | Admin, Receptionist |
| `/check-in` | Pemindai Kamera Check-In Petugas | Admin, Receptionist |
| `/check-in/manual` | Form Check-In Manual Petugas | Admin, Receptionist |
| `/active-visitors` | Monitoring Tamu yang Belum Check-Out | Admin, Receptionist |
| `/visit-history` | Riwayat Kunjungan & Export Data | Admin, Receptionist |
| `/visitors` | Database Master Tamu & Embedding Wajah | Admin, Receptionist |
| `/events` | Manajemen Acara & Daftar Peserta | Admin |
| `/games/events` | Manajemen Event Gamification & Titik Scan | Admin |
| `/users` | Kelola Akun Petugas & Hak Akses | Admin Only |
| `/settings` | Konfigurasi Sistem & Fitur Portal Publik | Admin Only |

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat Sistem
- PHP >= 8.1 dengan ekstensi `pdo_mysql`, `mbstring`, `gd`
- Composer
- Node.js >= 18.x & npm
- MySQL / MariaDB (e.g. Laragon / XAMPP)

### 2. Setup Backend (Lumen)

```bash
cd glosindo-backend

# 1. Install dependensi
composer install

# 2. Buat konfigurasi .env
cp .env.example .env

# 3. Generate kunci JWT
php artisan jwt:secret

# 4. Sesuaikan konfigurasi database di file .env:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=glosindo_db
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migrasi & seeder awal
php artisan migrate
php artisan db:seed

# 6. Jalankan backend server
php -S localhost:8000 -t public
```

### 3. Setup Frontend (React + Vite)

```bash
cd glosindo-frontend

# 1. Install paket npm
npm install

# 2. Buat file .env
cp .env.example .env
# Pastikan VITE_API_URL mengarah ke backend:
# VITE_API_URL=http://localhost:8000/api

# 3. Pastikan model AI face-api.js ada di folder:
# glosindo-frontend/public/models/
# - ssd_mobilenetv1_model-weights_manifest.json (dan shards)
# - face_landmark_68_model-weights_manifest.json (dan shards)
# - face_recognition_model-weights_manifest.json (dan shards)

# 4. Jalankan dev server
npm run dev
```

Akses web browser di: **`http://localhost:5173`**

---

## 🔑 Akun Default (Seeder)

```text
Admin:
Email    : admin@glosindo.com
Password : password (atau Admin123!)

Resepsionis:
Email    : receptionist@glosindo.com
Password : password (atau Recep123!)
```

*(Dapat dikonfigurasi melalui seeder `database/seeders/UserSeeder.php`)*

---

## 📁 Struktur Direktori

```text
glosindo/
├── glosindo-backend/             # REST API Lumen Micro-framework
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/      # Controller API (Visitor, Event, Games, Kiosk, Report)
│   │   │   └── Middleware/       # JWT, Role-Based Access, CORS
│   │   ├── Models/               # Model Eloquent (Visitor, Visit, Event, Participant, Game)
│   │   └── Traits/               # Audit Log & Helpers
│   ├── database/
│   │   ├── migrations/           # Skema Tabel Database
│   │   └── seeders/              # Data Awal Sistem
│   └── routes/web.php            # Definisi Rute API
│
├── glosindo-frontend/            # Frontend SPA React + Vite
│   ├── public/
│   │   └── models/               # Model Bobot Neural Network face-api.js
│   ├── src/
│   │   ├── assets/               # Gambar, Ilustrasi, dan Logo Glosindo
│   │   ├── components/           # Komponen UI (Navbar, Sidebar, FaceScanner, Modal)
│   │   ├── pages/                # Halaman Aplikasi & Kiosk
│   │   │   ├── GuestVisitPage.jsx # Terminal Kiosk Mandiri (GLIDE)
│   │   │   ├── admin/            # Halaman Pengaturan & Manajemen Petugas
│   │   │   ├── events/           # Halaman Kelola Acara
│   │   │   ├── games/            # Halaman Game & Scan Point
│   │   │   └── receptionist/     # Halaman Kerja Resepsionis
│   │   ├── services/             # Axios API Client Modules
│   │   ├── store/                # Zustand State Stores (Auth, Visitor, UI)
│   │   └── utils/                # Helper Waktu, Validasi & Face Utils
│   └── vite.config.js
│
├── DATABASE_SCHEMA.md            # Dokumentasi Detail Tabel & Relasi DB
└── README.md                     # Dokumentasi Utama Proyek
```

---

## 🛠️ Troubleshooting

- **Model Face-api Tidak Terload:**  
  Pastikan file manifest dan shard model telah ditempatkan di direktori `glosindo-frontend/public/models/`.
- **CORS Error Saat Request API:**  
  Periksa variabel `CORS_ALLOWED_ORIGIN` di `.env` backend agar menyertakan URL frontend (contoh: `http://localhost:5173`).
- **Token JWT Invalid / Expired:**  
  Jalankan `php artisan jwt:secret` dan pastikan konfigurasi `JWT_TTL` di `.env` sesuai kebutuhan.
- **Build Produksi:**  
  Jalankan `npm run build` di dalam folder `glosindo-frontend` untuk menghasilkan bundle statis pada direktori `dist/`.

---

## 📝 Lisensi & Hak Cipta

© 2026 **PT Global Media Pratama Solusindo (GLOSINDO)**. All rights reserved.
