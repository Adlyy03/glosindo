# Setup Guide - GLOSINDO

Quick start production-ready setup.

---

## 1. Requirements

- PHP 8.1+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+
- Laragon/XAMPP/Laravel Valet (local dev)

---

## 2. Backend Setup

```bash
cd glosindo-backend

# Install
composer install

# Env
cp .env.example .env

# Edit .env:
# DB_DATABASE=glosindo_db
# DB_USERNAME=root
# DB_PASSWORD=
# APP_URL=http://localhost:8000
# CORS_ALLOWED_ORIGIN=http://localhost:5173

# Generate keys
php artisan key:generate
php artisan jwt:secret

# Migrate + seed
php artisan migrate
php artisan db:seed

# Storage link (photos)
php artisan storage:link

# Run
php -S localhost:8000 -t public
```

---

## 3. Frontend Setup

```bash
cd glosindo-frontend

# Install
npm install

# Env
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:8000/api

# Download face-api.js models
# https://github.com/justadudewhohacks/face-api.js-models
# Extract to: public/models/
# Required folders:
#   - ssd_mobilenetv1/
#   - face_landmark_68_model-*
#   - face_recognition_model-*

# Run
npm run dev
```

---

## 4. Face-API Models Download

**Manual:**
1. Download: https://github.com/justadudewhohacks/face-api.js-models/tree/master/models
2. Extract to `glosindo-frontend/public/models/`

**Structure:**
```
public/
└── models/
    ├── ssd_mobilenetv1/
    │   ├── ssd_mobilenetv1_model-weights_manifest.json
    │   └── ssd_mobilenetv1_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_recognition_model-weights_manifest.json
    └── face_recognition_model-shard1
```

**Verification:**
Open browser console → check `fetch` errors di Network tab saat scan face.

---

## 5. Database Schema

Run migrations auto-create tables:
- `users`
- `visitors`
- `face_embeddings`
- `visits`
- `events`
- `event_participants`
- `audit_logs`
- `system_settings`

Detail: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 6. Default Login

```
Email: admin@glosindo.com
Password: password
```

Change password after first login.

---

## 7. Production Deploy

### Backend (Laravel/Lumen):
```bash
# Env production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Optimize
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
```

### Frontend (React):
```bash
# Build
npm run build

# Deploy dist/ folder to static host (Vercel/Netlify/CDN)
# Set env var: VITE_API_URL=https://api.yourdomain.com/api
```

### CORS production:
Update backend `.env`:
```
CORS_ALLOWED_ORIGIN=https://app.yourdomain.com
```

Or multi-origin di `CorsMiddleware.php`:
```php
$allowedOrigins = ['https://app.yourdomain.com', 'https://admin.yourdomain.com'];
$origin = in_array($request->header('Origin'), $allowedOrigins) 
    ? $request->header('Origin') 
    : $allowedOrigins[0];
```

---

## 8. Security Checklist

✅ Change default admin password  
✅ Set `APP_DEBUG=false` production  
✅ Set strong `APP_KEY` & `JWT_SECRET`  
✅ Enable HTTPS (SSL cert)  
✅ Restrict DB user permissions  
✅ Set CORS origin whitelist  
✅ Enable rate limiting (already set: 10 req/min public endpoints)  
✅ Regular backup database  

---

## 9. Troubleshooting

### Face model 404 error:
- Check `public/models/` folder structure
- Verify model files exist
- Open Network tab → see exact path requested

### CORS error:
- Update `CORS_ALLOWED_ORIGIN` di backend `.env`
- Match frontend origin exactly (no trailing slash)

### JWT token invalid:
```bash
php artisan jwt:secret --force
php artisan cache:clear
```

### Migration error:
```bash
php artisan migrate:fresh --seed
```

### Storage permission (Linux):
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

---

## 10. Monitoring

**Logs:**
- Backend: `storage/logs/lumen.log`
- Audit trail: `audit_logs` table

**Performance:**
- Check query time via DB slow query log
- Use indexes (already added in migrations)

**Health check endpoint:**
```
GET /api
Response: {"app":"GLOSINDO Digital Guestbook API","version":"10.0"}
```
