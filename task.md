# 📘 PANDUAN PENGEMBANGAN — Digital Guestbook GLOSINDO
**Stack:** React JS (SPA) · Laravel Lumen (REST API) · MySQL · face-api.js (Client-Side Face Recognition)

---

## 🧭 CARA MEMAKAI DOKUMEN INI

Dokumen ini dibagi 3 bagian besar:
1. **PART 1** — yang HARUS kamu kerjakan manual sebagai developer sebelum AI Agent mulai coding.
2. **PART 2** — pembagian tanggung jawab kodingan yang akan digenerate AI Agent.
3. **PART 3** — 7 Phase implementasi step-by-step, lengkap dengan skema, kode inti, dan urutan eksekusi.

Setiap Phase didesain agar bisa kamu copy-paste sebagai prompt terpisah ke AI coding agent (Cursor/Claude Code), **satu Phase per sesi**, tanpa skip.

---

# PART 1 — PREREQUISITES & SETUP MANUAL (Human Developer Task)

Ini adalah tugas yang **tidak bisa/tidak sebaiknya** didelegasikan ke AI Agent karena butuh akses environment lokal, akun, atau download binary.

### 1.1 Environment yang Harus Terinstall
| Tool | Versi Minimum | Cek dengan |
|---|---|---|
| PHP | 8.1+ (butuh ext: `pdo_mysql`, `mbstring`, `openssl`) | `php -v` |
| Composer | 2.x | `composer -v` |
| Node.js | 18+ (LTS) | `node -v` |
| npm/pnpm | npm 9+ | `npm -v` |
| MySQL | 8.0+ | `mysql --version` |
| Git | any | `git --version` |

### 1.2 Setup Project Skeleton (Manual — jalankan sendiri)
```bash
# Backend
composer create-project --prefer-dist laravel/lumen glosindo-backend
cd glosindo-backend
composer require tymon/jwt-auth
composer require illuminate/redis --dev   # opsional, untuk cache stats

# Frontend (pakai Vite, BUKAN CRA — lebih cepat & modern)
npm create vite@latest glosindo-frontend -- --template react
cd glosindo-frontend
npm install
```

### 1.3 Setup Database MySQL
```sql
CREATE DATABASE glosindo_guestbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'glosindo_user'@'localhost' IDENTIFIED BY 'password_aman_kamu';
GRANT ALL PRIVILEGES ON glosindo_guestbook.* TO 'glosindo_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1.4 Konfigurasi `.env` Backend (Lumen)
Buat file `.env` di root `glosindo-backend`:
```env
APP_NAME=GLOSINDO_Guestbook
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glosindo_guestbook
DB_USERNAME=glosindo_user
DB_PASSWORD=password_aman_kamu

JWT_SECRET=          # akan diisi otomatis oleh `php artisan jwt:secret` (lihat Phase 2)
JWT_TTL=1440         # 24 jam dalam menit

CORS_ALLOWED_ORIGIN=http://localhost:5173
```
> ⚠️ Lumen default **tidak** punya `artisan jwt:secret` bawaan seperti Laravel — kamu perlu generate manual dan taruh string random 32+ karakter di `JWT_SECRET`, atau jalankan lewat `php -r` (dijelaskan di Phase 2).

### 1.5 Konfigurasi `.env` Frontend (React/Vite)
Buat file `.env` di root `glosindo-frontend`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FACE_MATCH_THRESHOLD=0.5
```

### 1.6 Download Model face-api.js (WAJIB MANUAL)
`face-api.js` butuh file model (weight) statis yang **tidak** ikut ter-bundle otomatis lewat npm — harus didownload manual dan ditaruh di folder `public`.

**Langkah:**
1. Buka repo model resmi: `https://github.com/vladmandic/face-api` (fork aktif dari `justadudewhohacks/face-api.js`) → folder `model/`.
2. Download folder `model` tersebut (bisa via `git clone` lalu copy, atau download manual per-file).
3. Taruh semua isinya ke:
   ```
   glosindo-frontend/public/models/
   ```
4. Minimal file yang WAJIB ada untuk kebutuhan kita (deteksi + landmark + recognition):
   ```
   public/models/
   ├── ssd_mobilenetv1_model-weights_manifest.json
   ├── ssd_mobilenetv1_model-shard1
   ├── face_landmark_68_model-weights_manifest.json
   ├── face_landmark_68_model-shard1
   ├── face_recognition_model-weights_manifest.json
   ├── face_recognition_model-shard1
   ├── face_recognition_model-shard2
   ```
5. Verifikasi via browser: akses `http://localhost:5173/models/ssd_mobilenetv1_model-weights_manifest.json` — harus return JSON, bukan 404.

> 💡 Alternatif cepat: `npm install @vladmandic/face-api` lalu copy folder `model` dari `node_modules/@vladmandic/face-api/model` ke `public/models` via script `postinstall`.

### 1.7 Instalasi Dependency Utama (Frontend)
```bash
npm install axios react-router-dom zustand
npm install face-api.js
npm install react-webcam
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install recharts          # untuk chart dashboard
npm install react-hot-toast   # notifikasi
npm install dayjs             # format tanggal/jam
```

Pastikan semua dependency frontend di atas berhasil terinstal tanpa error sebelum melanjutkan ke langkah manual berikutnya. Jika ada masalah terkait versi paket atau peer dependency, hapus folder `node_modules` dan `package-lock.json`, lalu jalankan instalasi ulang.

### 1.8 Hal Lain yang Harus Kamu Siapkan Manual
- [ ] Folder `storage/app/public/visitors` di backend Lumen untuk simpan foto tamu (dan `php artisan storage:link` jika tersedia, atau serve manual via route Lumen).
- [ ] Pastikan webcam laptop/device browser dev kamu berfungsi & izin browser untuk kamera di-allow (untuk testing Phase 5).
- [ ] Siapkan minimal 1 akun user Admin awal (akan di-seed di Phase 1, tapi kamu tentukan email/password-nya).
- [ ] Jika deploy nanti pakai HTTPS — **face-api.js webcam access WAJIB HTTPS** kecuali di `localhost` (browser security policy). Siapkan SSL cert kalau sudah mau ke staging/production.

---

# PART 2 — TASK FOR AI AGENT (AI Developer Task)

AI Agent bertanggung jawab generate seluruh source code berikut. Sudah dikelompokkan per layer supaya mudah dijadikan prompt per-Phase.

### Backend (Lumen)
| Kategori | Isi |
|---|---|
| **Migrations** | `users`, `visitors`, `face_embeddings`, `visits` |
| **Models** | `User`, `Visitor`, `FaceEmbedding`, `Visit` (dengan relasi Eloquent) |
| **Controllers** | `AuthController`, `VisitorController`, `FaceEmbeddingController`, `VisitController`, `DashboardController` |
| **Middleware** | `JwtMiddleware` (validasi Bearer Token), `RoleMiddleware` (cek role admin/receptionist) |
| **Routes** | `routes/web.php` (Lumen tidak pakai `api.php` default — semua didaftarkan di `web.php` atau custom `api.php` yang di-include) |
| **Seeders** | `UserSeeder` (buat akun admin default) |
| **Resource/Transformer (opsional)** | Format response JSON konsisten |
| **Validation** | Request validation di tiap controller (`$this->validate()`) |

### Frontend (React)
| Kategori | Isi |
|---|---|
| **Pages** | `LoginPage`, `DashboardPage`, `VisitorListPage`, `VisitorFormPage`, `CheckInPage` (dengan scan wajah), `ActiveVisitorPage`, `VisitHistoryPage` |
| **Components** | `Navbar`, `Sidebar`, `WebcamCapture`, `FaceScanner`, `StatCard`, `VisitorTable`, `ProtectedRoute` |
| **Hooks** | `useAuth`, `useFaceModels` (load model face-api.js sekali di awal), `useFaceMatcher` (matching logic) |
| **Services (API layer)** | `services/api.js` (axios instance + interceptor token), `services/authService.js`, `services/visitorService.js`, `services/visitService.js`, `services/dashboardService.js` |
| **State Management** | `store/authStore.js` (Zustand — simpan token, user, role) |
| **Routing** | `App.jsx` dengan React Router, route per role |
| **Utils** | `utils/faceUtils.js` (extract descriptor, euclidean distance matching) |

---

# PART 3 — PHASED DEVELOPMENT ROADMAP

---

## 🔹 PHASE 1 — Database Migration, Models & Backend Foundation (Lumen Setup)

**Goal:** Backend Lumen berdiri, koneksi ke MySQL sukses, seluruh tabel & relasi Eloquent siap dipakai.

**File yang dibuat:**
```
glosindo-backend/
├── database/migrations/
│   ├── 2026_08_01_000001_create_users_table.php
│   ├── 2026_08_01_000002_create_visitors_table.php
│   ├── 2026_08_01_000003_create_face_embeddings_table.php
│   └── 2026_08_01_000004_create_visits_table.php
├── database/seeds/UserSeeder.php
├── app/Models/User.php
├── app/Models/Visitor.php
├── app/Models/FaceEmbedding.php
├── app/Models/Visit.php
└── bootstrap/app.php  (aktifkan Eloquent, Facades, Auth jika belum)
```

**Langkah teknis:**

1. Di `bootstrap/app.php`, pastikan baris berikut ter-uncomment:
   ```php
   $app->withFacades();
   $app->withEloquent();
   ```

2. **Skema Migration:**

   `users`:
   ```php
   Schema::create('users', function (Blueprint $table) {
       $table->id();
       $table->string('name');
       $table->string('email')->unique();
       $table->string('password');
       $table->enum('role', ['admin', 'receptionist'])->default('receptionist');
       $table->timestamps();
   });
   ```

   `visitors`:
   ```php
   Schema::create('visitors', function (Blueprint $table) {
       $table->id();
       $table->string('name');
       $table->string('phone')->nullable();
       $table->string('email')->nullable();
       $table->string('company')->nullable();
       $table->string('photo')->nullable(); // path storage
       $table->timestamps();
   });
   ```

   `face_embeddings`:
   ```php
   Schema::create('face_embeddings', function (Blueprint $table) {
       $table->id();
       $table->foreignId('visitor_id')->constrained()->onDelete('cascade');
       $table->longText('face_vector'); // JSON array 128 float
       $table->timestamps();
   });
   ```

   `visits`:
   ```php
   Schema::create('visits', function (Blueprint $table) {
       $table->id();
       $table->foreignId('visitor_id')->constrained()->onDelete('cascade');
       $table->string('purpose');
       $table->string('meet_to');
       $table->timestamp('check_in')->useCurrent();
       $table->timestamp('check_out')->nullable();
       $table->enum('status', ['IN', 'OUT'])->default('IN');
       $table->timestamps();
   });
   ```

3. **Model relasi:**
   - `Visitor` → `hasOne(FaceEmbedding::class)`, `hasMany(Visit::class)`
   - `FaceEmbedding` → `belongsTo(Visitor::class)`, dengan cast `face_vector` sebagai `array` (`protected $casts = ['face_vector' => 'array'];`)
   - `Visit` → `belongsTo(Visitor::class)`

4. Jalankan:
   ```bash
   php artisan migrate
   php artisan db:seed --class=UserSeeder
   ```

5. **UserSeeder** — buat 1 admin default (misal `admin@glosindo.com` / password di-hash pakai `Hash::make()`).

**✅ Validasi selesai Phase 1:** `php artisan migrate:status` menunjukkan 4 tabel migrated, dan query manual `SELECT * FROM users` menampilkan 1 akun admin.

---

## 🔹 PHASE 2 — Authentication & User Management API (Lumen + JWT)

**Goal:** Login menghasilkan Bearer Token, endpoint terproteksi menolak akses tanpa token valid, role-based middleware aktif.

**File yang dibuat/dimodifikasi:**
```
app/Http/Controllers/AuthController.php
app/Http/Middleware/JwtMiddleware.php
app/Http/Middleware/RoleMiddleware.php
config/jwt.php  (publish config dari tymon/jwt-auth)
routes/web.php
```

**Langkah teknis:**

1. Publish config JWT & generate secret:
   ```bash
   php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LumenServiceProvider"
   ```
   Karena Lumen tidak punya command `jwt:secret` otomatis, generate manual:
   ```bash
   php -r "echo bin2hex(random_bytes(32));"
   ```
   Copy hasilnya ke `.env` → `JWT_SECRET=`.

2. Di `bootstrap/app.php`, register:
   ```php
   $app->configure('jwt');
   $app->routeMiddleware([
       'jwt.auth' => App\Http\Middleware\JwtMiddleware::class,
       'role'     => App\Http\Middleware\RoleMiddleware::class,
   ]);
   $app->register(Tymon\JWTAuth\Providers\LumenServiceProvider::class);
   ```

3. **`AuthController`** — endpoint:
   - `POST /api/login` → validasi email/password, generate token via `JWTAuth::attempt()`, return `{ token, user: { id, name, role } }`
   - `POST /api/logout` → invalidate token
   - `GET /api/me` → return user dari token aktif (untuk restore session di React saat refresh)

4. **`JwtMiddleware`** — parse header `Authorization: Bearer <token>`, validasi via `JWTAuth::parseToken()->authenticate()`, kalau gagal return `401`.

5. **`RoleMiddleware`** — terima parameter role (misal `role:admin`), cek `auth()->user()->role`, kalau tidak sesuai return `403`.

6. Routing contoh di `routes/web.php`:
   ```php
   $router->post('api/login', 'AuthController@login');
   $router->group(['middleware' => 'jwt.auth'], function () use ($router) {
       $router->get('api/me', 'AuthController@me');
       $router->post('api/logout', 'AuthController@logout');
       // route lain di Phase 3 masuk sini juga
   });
   ```

7. **CORS** — install `fruitcake/laravel-cors` atau tangani manual via middleware custom yang set header `Access-Control-Allow-Origin` sesuai `.env CORS_ALLOWED_ORIGIN`.

**✅ Validasi selesai Phase 2:** Test via Postman — `POST /api/login` return token, `GET /api/me` dengan token valid return data user, tanpa token return 401.

---

## 🔹 PHASE 3 — Core API Services (Visitors, Face Embeddings, Visits & Dashboard Stats)

**Goal:** Seluruh REST endpoint CRUD & business logic utama tersedia dan teruji lewat Postman, sebelum disambungkan ke React.

**File yang dibuat:**
```
app/Http/Controllers/VisitorController.php
app/Http/Controllers/FaceEmbeddingController.php
app/Http/Controllers/VisitController.php
app/Http/Controllers/DashboardController.php
```

**Endpoint List:**

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/visitors` | List semua visitor (support `?search=`) |
| POST | `/api/visitors` | Registrasi visitor baru + upload foto |
| GET | `/api/visitors/{id}` | Detail visitor + riwayat kunjungan |
| PUT | `/api/visitors/{id}` | Update data visitor |
| DELETE | `/api/visitors/{id}` | Hapus visitor (admin only) |
| POST | `/api/visitors/{id}/face-embedding` | Simpan/replace vector wajah 128-D |
| GET | `/api/face-embeddings` | Ambil SEMUA vector wajah + visitor_id (dipakai React untuk matching client-side) |
| POST | `/api/visits` | Buat record check-in baru (status IN) |
| PUT | `/api/visits/{id}/checkout` | Update checkout time + status OUT |
| GET | `/api/visits/active` | List visitor yang sedang status IN |
| GET | `/api/visits/history` | Riwayat kunjungan (pagination + filter tanggal) |
| GET | `/api/dashboard/stats` | Statistik agregat dashboard |

**Detail logika penting:**

1. **`VisitorController@store`** — terima `multipart/form-data` (karena ada file foto), simpan file ke `storage/app/public/visitors/`, insert row `visitors`.

2. **`FaceEmbeddingController@store`** — terima `face_vector` sebagai JSON array 128 float dari React, simpan sebagai `json_encode()` di kolom `face_vector` (kolom `longText`, model cast `array`).

3. **`FaceEmbeddingController@index`** (endpoint `GET /api/face-embeddings`) — **PENTING**: ini yang membuat matching wajah bisa dilakukan **di client (React)**, bukan di server. Response:
   ```json
   [
     { "visitor_id": 1, "name": "Muhammad Adli", "face_vector": [0.12, -0.03, ...] },
     { "visitor_id": 2, "name": "Budi Santoso", "face_vector": [0.08, 0.11, ...] }
   ]
   ```
   React akan load ini sekali saat buka halaman Check-In, lalu bandingkan live descriptor webcam dengan tiap `face_vector` pakai euclidean distance (detail di Phase 5).

4. **`VisitController@store`** — validasi `visitor_id` tidak sedang punya visit dengan `status = IN` (mencegah double check-in), lalu insert record baru.

5. **`VisitController@checkout`** — update `check_out = now()`, `status = OUT`.

6. **`DashboardController@stats`** — query agregat:
   ```php
   [
     'total_visitor'        => Visitor::count(),
     'visitor_today'        => Visit::whereDate('check_in', today())->count(),
     'active_visitor'       => Visit::where('status', 'IN')->count(),
     'total_visit_this_month'=> Visit::whereMonth('check_in', now()->month)->count(),
   ]
   ```

7. Tambahkan seluruh route di atas ke dalam group `middleware: jwt.auth` pada `routes/web.php`; endpoint DELETE visitor & konfigurasi sistem dibungkus tambahan `role:admin`.

**✅ Validasi selesai Phase 3:** Semua endpoint di atas ditest via Postman dengan token valid — response sesuai skema, error handling (404/422) berjalan.

---

## 🔹 PHASE 4 — Frontend Setup, Layout, Auth Flow & Routing (React JS)

**Goal:** React app punya struktur folder rapi, bisa login, menyimpan token, dan routing berbasis role berjalan dengan protected routes.

**Struktur folder target:**
```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   └── StatCard.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── ...(halaman lain diisi Phase 6)
├── services/
│   ├── api.js
│   └── authService.js
├── store/
│   └── authStore.js
├── App.jsx
└── main.jsx
```

**Langkah teknis:**

1. **`services/api.js`** — axios instance dengan base URL dari `.env`, interceptor otomatis attach `Authorization: Bearer <token>` dari Zustand store, dan interceptor response untuk auto-logout kalau dapat 401.

2. **`store/authStore.js`** (Zustand) — simpan `{ token, user, isAuthenticated }`, action `login()`, `logout()`, persist ke `localStorage` supaya survive refresh, plus `restoreSession()` yang panggil `GET /api/me` saat app pertama load.

3. **`LoginPage.jsx`** — form email/password → panggil `authService.login()` → simpan token+user ke store → redirect ke `/dashboard`.

4. **`ProtectedRoute.jsx`** — cek `isAuthenticated` dari store; kalau belum login redirect ke `/login`; support prop `allowedRoles` untuk proteksi halaman admin-only (misal kelola user).

5. **`App.jsx`** — setup React Router:
   ```jsx
   <Routes>
     <Route path="/login" element={<LoginPage />} />
     <Route element={<ProtectedRoute />}>
       <Route path="/dashboard" element={<DashboardPage />} />
       {/* route Phase 6 ditambahkan di sini */}
     </Route>
   </Routes>
   ```

6. **Layout** — `Navbar` (info user login + tombol logout) & `Sidebar` (menu navigasi berbeda tampilan untuk role admin vs receptionist).

7. Setup Tailwind (`tailwind.config.js` content path ke `./src/**/*.{js,jsx}`) dan buat design token dasar (warna primer, spacing) supaya konsisten di semua halaman berikutnya.

**✅ Validasi selesai Phase 4:** Login berhasil → redirect dashboard kosong (belum ada data) → refresh halaman tidak logout paksa → akses `/dashboard` tanpa login redirect ke `/login`.

---

## 🔹 PHASE 5 — Face Recognition Module & Camera Integration (`face-api.js` + Webcam)

**Goal:** React bisa akses webcam, load model face-api.js, ekstrak 128-D descriptor dari wajah live, dan mencocokkan dengan data `face_embeddings` dari backend.

**File yang dibuat:**
```
src/hooks/useFaceModels.js
src/hooks/useFaceMatcher.js
src/components/WebcamCapture.jsx
src/components/FaceScanner.jsx
src/utils/faceUtils.js
```

**Langkah teknis:**

1. **`useFaceModels.js`** — load model sekali (idealnya di root `App.jsx` atau context global, supaya tidak reload tiap ganti halaman):
   ```js
   import * as faceapi from 'face-api.js';

   async function loadModels() {
     const MODEL_URL = '/models';
     await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
     await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
     await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
   }
   ```
   Hook return `{ modelsLoaded, loading }` untuk ditampilkan sebagai loading state di UI.

2. **`WebcamCapture.jsx`** — pakai `react-webcam`, render `<Webcam ref={webcamRef} />`, expose fungsi `captureDescriptor()` yang:
   - Ambil frame video saat ini.
   - Jalankan `faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()`.
   - Return `Float32Array` 128 angka (descriptor), atau `null` jika tidak ada wajah terdeteksi.

3. **`faceUtils.js`** — helper matching:
   ```js
   export function euclideanDistance(vecA, vecB) {
     return Math.sqrt(
       vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0)
     );
   }

   export function findBestMatch(liveDescriptor, storedEmbeddings, threshold = 0.5) {
     let best = { visitor: null, distance: Infinity };
     for (const entry of storedEmbeddings) {
       const dist = euclideanDistance(liveDescriptor, entry.face_vector);
       if (dist < best.distance) best = { visitor: entry, distance: dist };
     }
     return best.distance <= threshold ? best.visitor : null;
   }
   ```
   > Threshold `0.5` adalah nilai umum dipakai komunitas face-api.js — bisa dituning lewat `.env VITE_FACE_MATCH_THRESHOLD`.

4. **`useFaceMatcher.js`** — hook yang saat mount memanggil `GET /api/face-embeddings` sekali (cache di memory selama sesi Check-In terbuka), lalu expose fungsi `matchFace(liveDescriptor)` yang memanggil `findBestMatch()`.

5. **`FaceScanner.jsx`** — komponen gabungan: tampilkan webcam + overlay bounding box (opsional, pakai `faceapi.draw.drawDetections`), tombol "Scan Wajah", dan hasil:
   - Jika match ditemukan → auto-populate data visitor + tombol lanjut ke Form Check-In.
   - Jika tidak ditemukan → tampilkan tombol "Daftar Tamu Baru" (lanjut ke form registrasi + capture descriptor baru untuk disimpan).

6. Registrasi tamu baru: setelah capture wajah sukses, kirim descriptor (`Array.from(descriptor)`) ke `POST /api/visitors/{id}/face-embedding` setelah visitor berhasil dibuat via `POST /api/visitors`.

**⚠️ Catatan performa penting:**
- Load model `ssd_mobilenetv1` cukup berat (~5-6MB) — tampilkan loading spinner sampai `modelsLoaded === true` sebelum render tombol scan.
- Jalankan deteksi wajah **on-demand** (saat user klik tombol), bukan terus-menerus tiap frame, supaya tidak membebani CPU/GPU browser.

**✅ Validasi selesai Phase 5:** Webcam nyala, klik "Scan Wajah" berhasil extract descriptor, kalau wajah sudah terdaftar sebelumnya sistem menampilkan nama yang cocok, kalau belum terdaftar diarahkan ke form registrasi baru.

---

## 🔹 PHASE 6 — Flow Check-In, Check-Out, Active Visitor Dashboard & Real-time Integration

**Goal:** Seluruh alur end-to-end tamu datang → scan wajah → check-in → tampil di dashboard aktif → check-out, berjalan mulus dari UI React sampai database.

**File yang dibuat:**
```
src/pages/CheckInPage.jsx
src/pages/ActiveVisitorPage.jsx
src/pages/VisitHistoryPage.jsx
src/pages/VisitorListPage.jsx
src/pages/VisitorFormPage.jsx
src/services/visitorService.js
src/services/visitService.js
src/services/dashboardService.js
```

**Langkah teknis:**

1. **`CheckInPage.jsx`** — orkestrasi penuh flow dari deskripsi awal:
   ```
   <FaceScanner /> 
     → match found  → tampilkan form Purpose + Meet To → POST /api/visits
     → no match     → <VisitorFormPage inline/modal> → simpan visitor + embedding → lanjut form Purpose+Meet To → POST /api/visits
   ```
   Setelah sukses, tampilkan toast sukses + redirect/reset ke state awal siap scan tamu berikutnya.

2. **`ActiveVisitorPage.jsx`** — tabel visitor dengan `status = IN`, kolom: Nama, Perusahaan, Bertemu, Jam Masuk, Aksi (`Check-Out`).
   - Fetch data via `GET /api/visits/active`.
   - **Polling sederhana**: `setInterval` fetch ulang tiap 15-30 detik untuk simulasi "real-time" (tanpa WebSocket, sesuai stack Lumen+MySQL polos). Kalau nanti mau upgrade ke real-time murni, catat sebagai future improvement (butuh Laravel Echo/Pusher/WebSocket server — di luar scope stack saat ini).
   - Tombol Check-Out memanggil `PUT /api/visits/{id}/checkout`, lalu refresh list.

3. **`VisitHistoryPage.jsx`** — tabel riwayat semua visit (IN & OUT), dengan filter tanggal & search nama, pagination dari backend (`GET /api/visits/history?page=`).

4. **`VisitorListPage.jsx`** — CRUD visitor biasa (list, edit, hapus — hapus hanya admin), terpisah dari flow Check-In (untuk keperluan manajemen data master).

5. **`DashboardPage.jsx`** — lengkapi dengan data asli dari `GET /api/dashboard/stats`, render 4 `StatCard` (Total Visitor, Visitor Hari Ini, Active Visitor, Total Kunjungan Bulan Ini) + chart tren kunjungan mingguan/bulanan pakai `recharts` (opsional, data agregat tambahan dari backend jika mau grafik).

6. Tambahkan seluruh route Phase 6 ini ke `App.jsx` di dalam `<ProtectedRoute>`, dengan beberapa dibungkus tambahan proteksi role admin (misal hapus visitor).

7. Sambungkan `Sidebar` dari Phase 4 ke seluruh halaman baru ini sesuai role user login.

**✅ Validasi selesai Phase 6:** Simulasikan skenario penuh — tamu baru datang, scan wajah tidak ketemu, isi form, check-in sukses, muncul di Active Visitor, lakukan check-out, muncul di History, dashboard stats ter-update.

---

## 🔹 PHASE 7 — Testing, Edge Case Handling & Deployment Preparation

**Goal:** Aplikasi tahan terhadap input aneh/error umum, dan siap dideploy ke server staging/production.

**Checklist Edge Case yang harus ditangani AI Agent:**

**Backend:**
- [ ] Validasi request di semua endpoint (`required`, `email`, `unique`, tipe file foto max size & mime type `jpg/png`).
- [ ] Cegah double check-in: tolak `POST /api/visits` kalau visitor tsb masih punya visit `status=IN` aktif (return 422 dengan pesan jelas).
- [ ] Handle 404 untuk visitor/visit id yang tidak ditemukan.
- [ ] Handle token expired (401) dengan pesan konsisten supaya React bisa auto-redirect ke login.
- [ ] Rate limiting sederhana di endpoint `/api/login` (cegah brute force) — bisa pakai middleware custom cek attempt count.

**Frontend:**
- [ ] Handle kondisi kamera tidak diizinkan browser (`getUserMedia` rejected) → tampilkan pesan fallback + tombol "Coba Lagi" atau alternatif input manual tanpa face-api.
- [ ] Handle koneksi API gagal (network error) → toast error, jangan biarkan UI freeze.
- [ ] Handle model face-api.js gagal load (404 pada file model) → pesan jelas "Model wajah gagal dimuat, cek koneksi/konfigurasi".
- [ ] Validasi form sisi client sebelum submit (nama wajib, format email, dll).
- [ ] Loading state & disable tombol ganda saat proses submit sedang berjalan (cegah double-submit check-in).

**Deployment Preparation:**
1. **Backend (Lumen):**
   - `.env` production: `APP_DEBUG=false`, `APP_ENV=production`, DB credential server.
   - Jalankan `composer install --optimize-autoloader --no-dev`.
   - Setup web server (Nginx/Apache) point ke folder `public/`.
   - Pastikan folder `storage` writable oleh web server user.
2. **Frontend (React):**
   - `npm run build` → hasil di folder `dist/` → deploy sebagai static file (Nginx, Vercel, Netlify, atau S3+CloudFront).
   - Update `.env.production` dengan `VITE_API_BASE_URL` ke domain backend production.
   - **WAJIB HTTPS** di production (syarat browser untuk akses webcam di domain non-localhost).
3. **CORS production** — update `CORS_ALLOWED_ORIGIN` di backend `.env` ke domain frontend production, jangan pakai wildcard `*` kalau sudah pakai credentials/token di header.
4. Backup strategy sederhana: dump MySQL berkala (`mysqldump`) — terutama tabel `face_embeddings` karena berisi data biometrik sensitif.

> 🔒 **Catatan Privasi/Keamanan:** `face_vector` adalah data biometrik. Pastikan koneksi API pakai HTTPS di production, dan pertimbangkan kebijakan retensi data (berapa lama data wajah tamu disimpan) sesuai kebijakan internal perusahaan/PDP Indonesia (UU PDP).

**✅ Validasi selesai Phase 7:** Aplikasi berjalan stabil di environment staging dengan domain HTTPS, seluruh edge case di atas sudah dicoba manual dan tidak crash.

---

# 🎯 RINGKASAN URUTAN EKSEKUSI

```
PHASE 1 → PHASE 2 → PHASE 3   (Backend penuh, test via Postman dulu)
   │
   ▼
PHASE 4 → PHASE 5 → PHASE 6   (Frontend, sambung ke backend yang sudah jadi)
   │
   ▼
PHASE 7                        (Hardening + Deploy)
```

**Rekomendasi cara kerja bareng AI Agent:** selesaikan 1 Phase penuh, jalankan validasi manual di checklist "✅ Validasi selesai", baru lanjut Phase berikutnya sebagai prompt/sesi baru. Jangan loncat Phase meski terasa lambat — dependency antar Phase (terutama Backend→Frontend) cukup ketat di arsitektur ini.