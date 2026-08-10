# 🔧 PROMPT PERBAIKAN GAP — GLOSINDO Guestbook

5 prompt siap-pakai, paste satu-satu ke AI Agent (Cursor). Urutan pengerjaan: **1 → 2 → 3 → 4 → 5** (4 tergantung 1-3 selesai).

---

## PROMPT 1 — Finalisasi Environment Config (Backend + Frontend)

```
Kamu Senior Backend/DevOps Engineer. Tugas: finalisasi file .env untuk project GLOSINDO Guestbook (Lumen backend + React/Vite frontend), sampai benar-benar bisa dipakai runtime, bukan sekadar template.

BACKEND (glosindo-backend/.env):
1. Generate APP_KEY jika masih kosong: jalankan `php -r "echo 'base64:'.base64_encode(random_bytes(32));"` dan isi ke APP_KEY.
2. Generate JWT_SECRET: jalankan `php -r "echo bin2hex(random_bytes(32));"`, isi ke JWT_SECRET.
3. Pastikan semua variabel berikut TERISI (bukan placeholder), sesuaikan dengan environment lokal saya:
   APP_NAME, APP_ENV=local, APP_DEBUG=true, APP_URL, APP_TIMEZONE=Asia/Jakarta,
   DB_CONNECTION=mysql, DB_HOST, DB_PORT=3306, DB_DATABASE, DB_USERNAME, DB_PASSWORD,
   JWT_SECRET, JWT_TTL=1440,
   CORS_ALLOWED_ORIGIN=http://localhost:5173
4. Buat juga file .env.example (copy dari .env tapi kosongkan value sensitif seperti password & secret) untuk didaftarkan ke git.
5. Tambahkan .env ke .gitignore kalau belum ada.
6. Verifikasi: jalankan `php artisan tinker` (atau route test sederhana) untuk konfirmasi koneksi DB sukses — tampilkan hasil query `DB::connection()->getPdo()` tanpa error.

FRONTEND (glosindo-frontend/.env):
1. Isi VITE_API_BASE_URL sesuai APP_URL backend + /api (contoh: http://localhost:8000/api).
2. Isi VITE_FACE_MATCH_THRESHOLD=0.5.
3. Buat .env.example juga.
4. Verifikasi: buat 1 fetch test sederhana di App.jsx (sementara, nanti dihapus) yang hit endpoint manapun di backend pakai import.meta.env.VITE_API_BASE_URL, pastikan response diterima (boleh 401 asal bukan network error/CORS error).

Output akhir yang saya mau lihat:
- Isi final .env backend & frontend (dengan value asli, bukan placeholder — kecuali password yang memang saya isi manual).
- Bukti/log bahwa koneksi DB backend sukses.
- Bukti fetch dari frontend ke backend tidak kena network error.
```

---

## PROMPT 2 — Finalisasi & Verifikasi JWT Secret + CORS

```
Kamu Senior Backend Engineer. Tugas: pastikan JWT authentication dan CORS di Lumen benar-benar berfungsi end-to-end, bukan cuma ter-konfigurasi di file.

1. Cek bootstrap/app.php — pastikan baris berikut ada dan urutannya benar:
   $app->configure('jwt');
   $app->register(Tymon\JWTAuth\Providers\LumenServiceProvider::class);
   $app->routeMiddleware(['jwt.auth' => App\Http\Middleware\JwtMiddleware::class, 'role' => App\Http\Middleware\RoleMiddleware::class]);

2. Cek config/jwt.php sudah ke-publish dan membaca JWT_SECRET dari .env dengan benar (bukan default Laravel).

3. Buat/cek middleware CORS custom (karena Lumen tidak selalu punya CORS bawaan):
   - Set header Access-Control-Allow-Origin dari env CORS_ALLOWED_ORIGIN (bukan wildcard *, karena kita pakai Bearer token).
   - Set Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS.
   - Set Access-Control-Allow-Headers: Content-Type, Authorization.
   - Handle preflight OPTIONS request return 200 kosong tanpa lanjut ke controller.
   - Daftarkan middleware ini SEBELUM jwt.auth di app middleware global (bukan route middleware), supaya jalan di semua request termasuk yang gagal auth.

4. Test manual dan tunjukkan hasilnya:
   a. curl -i -X OPTIONS http://localhost:8000/api/login -H "Origin: http://localhost:5173" 
      → harus return 200 dengan header CORS lengkap.
   b. curl -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d '{"email":"admin@glosindo.com","password":"<password_admin>"}' 
      → harus return token JWT valid.
   c. curl http://localhost:8000/api/me -H "Authorization: Bearer <token_dari_langkah_b>" 
      → harus return data user, bukan 401.
   d. curl http://localhost:8000/api/me -H "Authorization: Bearer token_salah" 
      → harus return 401 dengan pesan error jelas (bukan 500).
   e. Dari browser React (localhost:5173), coba fetch ke /api/me dengan token valid — pastikan TIDAK muncul CORS error di console.

Laporkan hasil dari 5 test di atas satu-satu (pass/fail + output-nya), jangan cuma bilang "sudah beres".
```

---

## PROMPT 3 — Perbaiki Seeder Jadi Idempotent

```
Kamu Backend Engineer. Perbaiki database/seeds/UserSeeder.php di project Lumen GLOSINDO supaya idempotent — bisa dijalankan berkali-kali (`php artisan db:seed`) tanpa error duplicate entry.

Requirement:
1. Ganti pola create() polos jadi updateOrCreate() dengan email sebagai unique key, contoh pola:

   User::updateOrCreate(
       ['email' => 'admin@glosindo.com'],
       [
           'name' => 'Admin GLOSINDO',
           'password' => Hash::make('ganti_dengan_password_aman'),
           'role' => 'admin',
       ]
   );

2. Lakukan hal sama untuk seeder lain jika ada (misal seeder dummy visitor untuk testing) — pastikan semua seeder di project ini idempotent, bukan cuma UserSeeder.

3. Tambahkan 1 akun receptionist default juga dengan pola sama, supaya saya punya 2 role untuk testing (admin@glosindo.com dan receptionist@glosindo.com).

4. Setelah diperbaiki, jalankan `php artisan db:seed` DUA KALI berturut-turut dan tunjukkan buktinya tidak error di kedua run, serta tabel users tetap cuma punya 2 row (tidak dobel).

5. Cek juga apakah ada migration/seeder lain di project yang berpotensi punya masalah sama (insert tanpa cek existing) — kalau ada, list dan perbaiki juga.
```

---

## PROMPT 4 — Testing End-to-End Full Flow (Manual + Scripted)

```
Kamu QA Engineer sekaligus Full-Stack Developer. Tugas: verifikasi FULL FLOW aplikasi GLOSINDO Guestbook dari Login sampai Check-Out, backend dan frontend sekaligus, dan laporkan hasil per langkah.

FLOW YANG HARUS DIUJI (urutan wajib):
1. Login sebagai receptionist@glosindo.com → dapat token → redirect ke dashboard.
2. Buka halaman Check-In → izinkan akses webcam browser → pastikan model face-api.js ter-load (cek Network tab: semua file di /models return 200, bukan 404).
3. Klik "Scan Wajah" untuk wajah yang BELUM terdaftar → sistem harus mendeteksi "tidak ditemukan" → arahkan ke form registrasi visitor baru.
4. Isi form visitor baru (nama, phone, email, company) + capture foto → submit → verifikasi:
   a. Record baru muncul di tabel visitors (cek lewat GET /api/visitors).
   b. Face vector 128-D tersimpan di face_embeddings (cek lewat GET /api/face-embeddings, pastikan array panjangnya 128).
5. Lanjut isi form Purpose + Meet To → submit check-in → verifikasi record baru di tabel visits dengan status IN dan check_in terisi waktu sekarang.
6. Buka halaman Active Visitor → pastikan visitor yang baru check-in MUNCUL di list dengan data benar.
7. Scan wajah LAGI dengan wajah yang SAMA (visitor yang sudah terdaftar barusan) → sistem harus BERHASIL match dan menampilkan nama visitor yang benar (bukan "tidak ditemukan").
8. Coba check-in LAGI untuk visitor yang statusnya masih IN → sistem HARUS MENOLAK (validasi double check-in), tampilkan pesan error yang jelas ke user, bukan crash.
9. Klik Check-Out di Active Visitor page → verifikasi status berubah jadi OUT dan check_out terisi waktu sekarang, serta visitor hilang dari Active Visitor list.
10. Buka Visit History → pastikan record check-in/check-out barusan muncul dengan waktu yang benar.
11. Buka Dashboard → pastikan angka Total Visitor, Visitor Hari Ini, Active Visitor, dan Total Kunjungan Bulan Ini SEMUA ter-update sesuai aktivitas testing di atas (bandingkan angka sebelum vs sesudah).

OUTPUT YANG SAYA MAU:
- Checklist pass/fail untuk tiap 11 langkah di atas.
- Screenshot atau paste response JSON untuk langkah 4, 5, 8, 9 (yang paling rawan bug).
- Kalau ada langkah yang FAIL, jangan cuma lapor — langsung investigasi root cause (cek log Lumen di storage/logs, cek console browser) dan perbaiki kodenya, lalu re-test ulang langkah tersebut sampai pass.
- Kalau webcam/browser environment kamu tidak bisa akses kamera fisik, tetap jalankan langkah 1,4(tanpa foto real, pakai file upload dummy),5,6,8,9,10,11 dan tandai eksplisit langkah 2,3,7 "SKIP - butuh testing manual saya sebagai human di browser real" supaya saya yang lanjutin manual.
```

---

## PROMPT 5 — Enforce & Uji Role-Based Access di Frontend

```
Kamu Frontend Engineer. Tugas: pastikan role-based access control di React BENAR-BENAR ketat, tidak cuma sembunyiin menu di UI tapi tembus kalau diakses lewat URL langsung.

1. Audit ProtectedRoute.jsx — pastikan menerima prop allowedRoles (array), dan kalau user.role tidak termasuk di situ, redirect ke halaman "403 Unauthorized" (buat halaman ini kalau belum ada), BUKAN cuma disembunyikan dari Sidebar.

2. Tentukan matriks akses berikut dan terapkan ke routing di App.jsx:
   | Halaman | Admin | Receptionist |
   |---|---|---|
   | Dashboard | ✅ | ✅ |
   | Check-In | ✅ | ✅ |
   | Active Visitor | ✅ | ✅ |
   | Visit History | ✅ | ✅ |
   | Visitor List (CRUD) | ✅ | ✅ (tanpa hapus) |
   | Hapus Visitor | ✅ | ❌ |
   | Kelola User/Petugas | ✅ | ❌ |
   | Konfigurasi Sistem | ✅ | ❌ |

3. Untuk aksi yang levelnya per-tombol (bukan per-halaman, misal tombol "Hapus" di Visitor List yang halamannya sama-sama bisa diakses admin & receptionist): sembunyikan tombolnya DAN tetap disable fungsinya di level service call kalau role tidak sesuai (defense in depth, jangan andalkan UI doang — backend role middleware di Phase 2 sudah ada, tapi frontend juga harus reject sebelum kirim request).

4. Test manual dan laporkan hasilnya:
   a. Login sebagai receptionist, coba akses langsung via URL bar ke halaman yang admin-only (misal /users atau /settings) → harus kena redirect 403, BUKAN nge-render halaman lalu error API di background.
   b. Login sebagai receptionist, cek tombol Hapus di Visitor List benar-benar tidak muncul.
   c. Login sebagai admin, pastikan SEMUA halaman & tombol di atas bisa diakses normal.
   d. Cek localStorage/state — pastikan role user tersimpan dan tidak bisa dengan mudah dimanipulasi dari console browser untuk bypass (misal edit localStorage role jadi 'admin' manual di devtools) — kalau ini rawan, tambahkan validasi role juga di setiap response API sensitif (backend jadi source of truth, frontend cuma UX layer).

Laporkan hasil test a-d satu-satu, dan screenshot halaman 403 yang muncul di test (a).
```

---

## 📋 Checklist Progress

- [ ] Prompt 1 — Environment config lengkap & terverifikasi
- [ ] Prompt 2 — JWT + CORS terverifikasi lewat 5 test manual
- [ ] Prompt 3 — Seeder idempotent
- [ ] Prompt 4 — Full flow E2E lolos 11 langkah
- [ ] Prompt 5 — Role-based access ketat di frontend

Setelah kelima ini beres, project GLOSINDO Guestbook baru bisa dianggap siap ke tahap Phase 7 (deployment) di dokumen sebelumnya.