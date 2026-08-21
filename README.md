# GLOSINDO Digital Guestbook

Sistem manajemen tamu dengan face recognition, event management, laporan visit history.

---

## 📋 Tech Stack

**Backend:**
- Lumen 10 (Laravel micro-framework)
- PHP 8.1+
- MySQL 8.0+
- JWT Auth (tymon/jwt-auth)
- PhpSpreadsheet (export Excel)
- Dompdf (export PDF)

**Frontend:**
- React 18
- Vite
- TailwindCSS
- face-api.js
- Zustand (state management)
- React Router v6
- Recharts

---

## 🚀 Instalasi

Lihat panduan lengkap di **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Utils Documentation

📖 **[Frontend Utils Documentation](./glosindo-frontend/src/utils/README.md)**
- Datetime (timezone-aware)
- Validation (phone/email/form)
- Loading components

📖 **[Event Status Logic](./EVENT_STATUS_LOGIC.md)**
- Auto-update event status (scheduled → active → finished)
- Real-time computed status attributes

### Quick Start

### 1. Clone Repository

```bash
git clone <repo-url>
cd glosindo
```

### 2. Backend Setup

```bash
cd glosindo-backend

# Install dependencies
composer install

# Copy env
cp .env.example .env

# Generate key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Setup database di .env
# DB_DATABASE=
# DB_USERNAME=
# DB_PASSWORD=

# Run migration
php artisan migrate

# (Optional) Seed data awal
php artisan db:seed

# Clear cache
php artisan cache:clear
```

### 3. Frontend Setup

```bash
cd glosindo-frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api

# Copy face-api models ke /public/models
# Download dari: https://github.com/justadudewhohacks/face-api.js-models
# Folder models wajib ada:
#   - ssd_mobilenetv1
#   - face_landmark_68
#   - face_recognition

# Jalanin dev server
npm run dev
```

### 4. Config `.env` Backend

```env
APP_NAME=GLOSINDO
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glosindo_db
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=...
JWT_TTL=1440

CORS_ALLOWED_ORIGIN=http://localhost:5173
```

### 5. Config Frontend

File `glosindo-frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

**Production:**
```env
VITE_API_URL=https://yourdomain.com/api
```

---

## ▶️ Cara Jalanin

### Backend (Lumen)

```bash
cd glosindo-backend
php -S localhost:8000 -t public
```

Atau pake Laragon: tambah virtual host manual.

### Frontend (React + Vite)

```bash
cd glosindo-frontend
npm run dev
```

Akses: `http://localhost:5173`

---

## 🔑 Default Login

```
Email: admin@glosindo.com
Password: password
```

(Seeder: `database/seeders/UserSeeder.php`)

---

## 📦 Depedencies Backend

```json
{
  "php": "^8.1",
  "laravel/lumen-framework": "^10.0",
  "tymon/jwt-auth": "^2.0",
  "phpoffice/phpspreadsheet": "^1.29",
  "dompdf/dompdf": "^2.0",
  "barryvdh/laravel-dompdf": "^2.0"
}
```

### Install via Composer

```bash
composer require tymon/jwt-auth
composer require phpoffice/phpspreadsheet
composer require dompdf/dompdf
composer require barryvdh/laravel-dompdf
```

---

## 📦 Depedencies Frontend

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.0",
  "face-api.js": "^0.22.2",
  "axios": "^1.6.0",
  "react-hot-toast": "^2.4.1",
  "recharts": "^2.10.0",
  "lucide-react": "^0.292.0",
  "dayjs": "^1.11.10"
}
```

### Install via npm

```bash
npm install react react-dom react-router-dom zustand axios
npm install face-api.js react-hot-toast recharts lucide-react dayjs
```

---

## 📁 Struktur Project

```
glosindo/
├── glosindo-backend/         # Backend Lumen
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # API controllers
│   │   │   └── Middleware/   # JWT, Role, CORS
│   │   ├── Models/           # User, Visitor, Visit, Event, EventParticipant, FaceEmbedding
│   │   └── Traits/           # Auditable
│   ├── database/
│   │   ├── migrations/       # Schema DB (14 files)
│   │   └── seeders/          # Data awal
│   ├── routes/web.php        # API routes
│   └── .env
│
├── glosindo-frontend/        # Frontend React
│   ├── public/
│   │   └── models/           # face-api.js models (wajib!)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Pages
│   │   ├── services/         # API service
│   │   ├── store/            # Zustand store
│   │   └── App.jsx
│   └── .env
│
├── DATABASE_SCHEMA.md        # 📊 Database documentation
└── README.md
```

---

## 🎯 Fitur Utama

- ✅ Face recognition check-in/out
- ✅ Manajemen visitor (CRUD)
- ✅ Visit history & reporting (Excel/PDF)
- ✅ Event management
- ✅ Dashboard analytics
- ✅ Role-based access (Admin, Receptionist, Supervisor)
- ✅ Feature toggle per user (admin bisa disable fitur per role)
- ✅ Quick check-in di event detail

---

## 📊 Database Schema

Lihat dokumentasi lengkap di **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

**Key Tables:**
- `visitors` - Master tamu (satu ID untuk semua event & regular visit)
- `event_participants` - Snapshot peserta per event (UNIQUE phone per event)
- `visits` - Check-in/out log (regular + event)
- `events` - Event management
- `face_embeddings` - Face vector 128-float (one-to-one dengan visitor)

**Recent Fixes (2026-08-21):**
- ✅ UNIQUE constraint `event_participants(event_id, phone)` - no duplicate registration
- ✅ Performance indexes: visits, events, audit_logs
- ✅ Phone index di visitors table

---

## 🛠️ Troubleshooting

### Face API Model Not Found

Download dari: https://github.com/justadudewhohacks/face-api.js-models

Copy ke `glosindo-frontend/public/models/`:
- ssd_mobilenetv1/
- face_landmark_68_model-weights_manifest.json
- face_recognition_model-weights_manifest.json

### CORS Error

Update `CORS_ALLOWED_ORIGIN` di `.env` backend:

```env
CORS_ALLOWED_ORIGIN=http://localhost:5173
```

### JWT Token Invalid

Re-generate JWT secret:

```bash
php artisan jwt:secret
```

Clear cache:

```bash
php artisan cache:clear
```

### Migration Error

Drop database & re-run:

```bash
php artisan migrate:fresh --seed
```

---

## 📝 Notes

- Face embedding: 128-float vector disimpan di DB (JSON)
- Photo visitor: `storage/app/public/visitors/`
- Export report: Excel & PDF via controller backend
- Admin bisa on/off fitur per user via Kelola Petugas
