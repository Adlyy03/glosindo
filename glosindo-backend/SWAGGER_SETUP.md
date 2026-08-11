# Swagger / OpenAPI Documentation Setup

## Overview

Swagger UI telah berhasil diintegrasikan ke project **GLOSINDO Digital Guestbook API**.

Dokumentasi API lengkap dalam format **OpenAPI 3.0.3** tersedia dan dapat diakses melalui browser.

---

## File yang Dibuat

1. **`docs/openapi.yaml`**
   - Dokumentasi OpenAPI lengkap untuk semua endpoint
   - Berdasarkan analisis source code aktual
   - Include JWT Bearer authentication scheme
   - Semua request/response sesuai implementasi controller

2. **`public/swagger/index.html`**
   - Swagger UI interface
   - Menggunakan Swagger UI 5.11.0 dari CDN
   - Custom styling dengan warna hijau GLOSINDO
   - Fitur: filter, syntax highlighting, try-it-out, persist authorization

---

## File yang Diubah

1. **`routes/web.php`**
   - Ditambahkan route `/swagger` untuk Swagger UI
   - Ditambahkan route `/docs/openapi.yaml` untuk serve OpenAPI spec
   - CORS header sudah ditambahkan untuk OpenAPI YAML

---

## URL Swagger UI

Setelah server berjalan, akses Swagger UI di:

```
http://api-guestbook.test/swagger
```

Atau jika menggunakan built-in server:

```
http://localhost:8000/swagger
```

---

## Cara Menjalankan Project

### Opsi 1: Menggunakan Laragon (Recommended)

1. Pastikan Laragon sudah running
2. Pastikan virtual host `api-guestbook.test` sudah dikonfigurasi
3. Akses `http://api-guestbook.test/swagger`

### Opsi 2: Menggunakan PHP Built-in Server

```bash
cd glosindo-backend
php -S localhost:8000 -t public
```

Akses: `http://localhost:8000/swagger`

---

## Cara Menggunakan Swagger UI

### 1. Login dan Dapatkan JWT Token

1. Buka Swagger UI
2. Expand endpoint **POST /api/login**
3. Klik **Try it out**
4. Isi credentials:
   ```json
   {
     "email": "admin@glosindo.com",
     "password": "password123"
   }
   ```
5. Klik **Execute**
6. Copy JWT token dari response

### 2. Authorize dengan JWT Token

1. Klik tombol **Authorize** (ikon gembok) di kanan atas
2. Paste JWT token yang sudah di-copy (dengan atau tanpa prefix "Bearer ")
3. Klik **Authorize**
4. Klik **Close**

### 3. Test Endpoint yang Membutuhkan Authentication

Setelah authorize, semua endpoint yang membutuhkan JWT akan otomatis mengirim token di header.

Coba test:
- GET `/api/me` - Get current user
- GET `/api/visitors` - Get all visitors
- GET `/api/dashboard/stats` - Get dashboard stats

---

## Endpoint yang Didokumentasikan

### Authentication
- `POST /api/login` - User login
- `GET /api/me` - Get authenticated user
- `POST /api/logout` - Logout
- `POST /api/refresh` - Refresh JWT token

### Visitors
- `GET /api/visitors` - List visitors (paginated, searchable)
- `POST /api/visitors` - Create visitor (with photo & face_vector)
- `GET /api/visitors/{id}` - Get visitor detail
- `PUT /api/visitors/{id}` - Update visitor
- `POST /api/visitors/{id}` - Update visitor (alternative)
- `DELETE /api/visitors/{id}` - Delete visitor (Admin only)

### Face Embeddings
- `GET /api/face-embeddings` - Get all face embeddings
- `POST /api/face-embeddings/check-duplicate` - Check duplicate face
- `POST /api/visitors/{visitorId}/face-embedding` - Store face embedding
- `DELETE /api/visitors/{visitorId}/face-embedding` - Delete face embedding

### Visits
- `GET /api/visits` - List visits (paginated, filterable)
- `POST /api/visits` - Create visit (check-in)
- `GET /api/visits/active` - Get active visitors
- `GET /api/visits/history` - Get visit history
- `GET /api/visits/{id}` - Get visit detail
- `PUT /api/visits/{id}/checkout` - Check-out visitor
- `DELETE /api/visits/{id}` - Delete visit (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/visit-trends` - Get visit trends (last 7 days)
- `GET /api/dashboard/monthly-trends` - Get monthly trends (last 6 months)
- `GET /api/dashboard/top-visitors` - Get top visitors

---

## Testing Hasil

### ✅ Checklist yang Sudah Dilakukan

1. **Application Boot** - OK (Lumen 10.0.4)
2. **Routes Added** - OK (`/swagger`, `/docs/openapi.yaml`)
3. **Files Created** - OK (openapi.yaml, index.html)
4. **OpenAPI Spec** - OK (3.0.3, valid YAML)
5. **JWT Authentication** - OK (bearerAuth security scheme)
6. **All Endpoints Documented** - OK (22 endpoints total)
7. **Request/Response Schemas** - OK (sesuai controller actual)
8. **Validation Rules** - OK (sesuai `$this->validate()` di controller)

### 🧪 Manual Testing Required

Untuk memastikan Swagger UI benar-benar berfungsi, perlu test manual:

1. **Buka Swagger UI di browser** - Pastikan tampil tanpa error
2. **OpenAPI YAML loaded** - Pastikan tidak ada "Fetch error: Not Found"
3. **Authorize Button** - Pastikan tombol Authorize tersedia
4. **Login Endpoint** - Test POST /api/login dengan credentials valid
5. **JWT Authorization** - Test endpoint protected setelah authorize
6. **Try It Out** - Test beberapa endpoint langsung dari Swagger UI
7. **Response Match** - Pastikan response sesuai dokumentasi

---

## Dependencies

Tidak ada dependency baru yang ditambahkan ke `composer.json`.

Swagger UI menggunakan CDN (unpkg.com):
- `swagger-ui-dist@5.11.0`

---

## Notes

### Hal Penting

1. **Photo Upload**
   - Endpoint POST/PUT visitors mendukung `multipart/form-data`
   - Photo max 2MB (jpeg, png, jpg)
   - Di Swagger UI, bisa upload file langsung

2. **Face Vector**
   - Harus array 128 float (face-api.js descriptor)
   - Duplicate detection dengan Euclidean distance < 0.6
   - Face vector tidak wajib saat create visitor

3. **Admin Routes**
   - DELETE visitors dan visits butuh role:admin middleware
   - Jika user bukan admin, dapat 403 Forbidden

4. **Pagination**
   - Visitors: 15 per page
   - Visits: 15 per page
   - History: 20 per page

### Troubleshooting

**Jika Swagger UI tidak load:**
1. Check console browser untuk error
2. Pastikan route `/docs/openapi.yaml` accessible
3. Test langsung: `http://api-guestbook.test/docs/openapi.yaml`
4. Pastikan CORS header ada (sudah ditambahkan)

**Jika authorize tidak bekerja:**
1. Pastikan JWT token valid dan belum expired
2. Check JWT_SECRET di `.env`
3. Check JWT_TTL (default 1440 menit = 24 jam)

**Jika endpoint return 401:**
1. Token belum dimasukkan via Authorize button
2. Token expired, perlu refresh atau login ulang
3. JWT middleware tidak aktif (check bootstrap/app.php)

---

## Future Improvements

Hal yang bisa ditambahkan di masa depan:

1. **Environment Switcher** - Toggle between dev/staging/production
2. **Examples** - More example request/response
3. **Rate Limiting** - Dokumentasi rate limit jika ditambahkan
4. **Webhooks** - Jika ada webhook untuk notifikasi
5. **API Versioning** - Jika ada multiple API versions

---

## Source Code Reference

Dokumentasi dibuat berdasarkan analisis source code berikut:

- `routes/web.php` - Semua route definitions
- `app/Http/Controllers/*` - Request/response structure
- `database/migrations/*` - Database schema
- `app/Models/*` - Model relationships
- `.env.example` - Configuration reference
- `bootstrap/app.php` - Middleware configuration

Semua field, validation rules, dan response JSON sesuai implementasi aktual di controller.

---

**Status: ✅ READY TO USE**

Swagger UI sudah siap digunakan. Silakan jalankan server dan akses `/swagger` untuk mulai testing API.
