# Dokumentasi Deployment Sistem Buku Tamu GLOSINDO

Dokumentasi resmi arsitektur server, konfigurasi runtime, prosedur deployment ulang, pemeliharaan sistem, dan checklist pengujian untuk aplikasi **Buku Tamu Digital GLOSINDO (GLIDE Guestbook)**.

---

## 1. Arsitektur Infrastruktur & Server

Aplikasi mengimplementasikan pemisahan penuh antara Frontend (Web SPA) dan Backend (REST API & Database).

```
[ Browser Klien / Tamu / Kiosk / Admin ]
          │
          ├── HTTP Port 80 (Web SPA) ─────────► [ Server App (103.134.221.200) ]
          │                                      - Nginx Web Server
          │                                      - Root: /var/www/glosindo-frontend/dist
          │                                      - Face-api.js Models (/models)
          │                                      - SPA Fallback Routing
          │
          └── HTTP Port 80 (REST API / Storage) ► [ Server API (103.134.221.201) ]
                                                 - Nginx Reverse Proxy
                                                 - PHP 8.3 FPM (Lumen 10 Framework)
                                                 - Root: /var/www/glosindo-backend/public
                                                 - MySQL 8.0 Engine (127.0.0.1:3306)
                                                 - Persistent Storage (/storage/visitors)
```

### Detail Server

| Komponen | Server App (Frontend) | Server API (Backend & Database) |
|---|---|---|
| **Alamat IP** | `103.134.221.200` | `103.134.221.201` |
| **User Sistem** | `adminapp` | `adminapi` |
| **Sistem Operasi** | Ubuntu 24.04.3 LTS (Noble Numbat) | Ubuntu 24.04.3 LTS (Noble Numbat) |
| **Arsitektur CPU / RAM** | 4 vCPU / 5.8 GiB RAM | 4 vCPU / 5.8 GiB RAM |
| **Direktori Aplikasi** | `/var/www/glosindo-frontend` | `/var/www/glosindo-backend` |
| **Document Root** | `/var/www/glosindo-frontend/dist` | `/var/www/glosindo-backend/public` |
| **URL Akses Publik** | `https://103.134.221.200` (SSL/Kamera) / `http://103.134.221.200` | `http://103.134.221.201` |

---

## 2. Runtime & Kebutuhan Dependency

### Backend Server (`103.134.221.201`)
- **PHP:** 8.3.6 CLI & FPM
- **Ekstensi PHP Wajib:** `php-mysql`, `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-gd`, `php-intl`, `php-cli`
- **Database Server:** MySQL Server 8.0.46 (Terikat strictly ke `127.0.0.1:3306`, akses luar diblokir)
- **Web Server:** Nginx 1.24.0
- **Package Manager:** Composer 2.7.1
- **Komponen Inti Backend:**
  - `laravel/lumen-framework`: ^10.0
  - `tymon/jwt-auth`: ^2.3 (Autentikasi JWT)
  - `endroid/qr-code`: ^5.0 (QR Code Generator)
  - `league/flysystem`: ^3.0 (Storage & File Upload)
  - `phpoffice/phpspreadsheet`: ^2.0 (Ekspor Excel)
  - `barryvdh/laravel-dompdf`: ^3.0 (Ekspor PDF)

### Frontend Server (`103.134.221.200`)
- **Node.js:** v22.23.4 LTS
- **Package Manager:** npm 10.9.9
- **Web Server:** Nginx 1.24.0
- **Komponen Inti Frontend:**
  - React 18.3.1 + Vite 8.2.0
  - Tailwind CSS 4.3.3
  - `@vladmandic/face-api` / `face-api.js` 0.22.2 (AI Model Weights)
  - Zustand 5.0.14 (State Management)
  - React Router DOM 7.18.2 (Routing SPA)
  - Axios 1.19.0 (HTTP Client)

---

## 3. Daftar Environment Variable (Tanpa Nilai Rahasia)

### Backend (`/var/www/glosindo-backend/.env`)

```env
APP_NAME=
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://103.134.221.201
APP_TIMEZONE=Asia/Jakarta

FRONTEND_URL=http://103.134.221.200

LOG_CHANNEL=daily
LOG_SLACK_WEBHOOK_URL=

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glosindo
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=
JWT_TTL=1440
CORS_ALLOWED_ORIGIN=http://103.134.221.200,http://103.134.221.200:80

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### Frontend (`/var/www/glosindo-frontend/.env.production`)

```env
VITE_API_URL=http://103.134.221.201/api
```

---

## 4. Konfigurasi Web Server (Nginx)

### Server App (`/etc/nginx/sites-available/glosindo-frontend`)

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name 103.134.221.200 _;
    root /var/www/glosindo-frontend/dist;
    index index.html;

    client_max_body_size 20M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Mempertahankan rute download APK Wargaku (port 8088 internal)
    location = /wargaku-ipl.apk {
        proxy_pass http://127.0.0.1:8088/wargaku-ipl.apk;
    }
    location = /wargaku-ipl-v2.0.0.apk {
        proxy_pass http://127.0.0.1:8088/wargaku-ipl-v2.0.0.apk;
    }
    location /download/ {
        proxy_pass http://127.0.0.1:8088/download/;
    }

    # Cache asset statis frontend dengan hashing
    location ~* \.(?:css|js|woff2?|eot|ttf|otf|ico|png|jpg|jpeg|webp|gif|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Reverse Proxy API & Storage ke Backend Server (103.134.221.201)
    location /api/ {
        proxy_pass http://103.134.221.201/api/;
        proxy_set_header Host 103.134.221.201;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /storage/ {
        proxy_pass http://103.134.221.201/storage/;
        proxy_set_header Host 103.134.221.201;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Model Weights Biometrik Wajah
    location ^~ /models/ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### Server API (`/etc/nginx/sites-available/glosindo-backend`)

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name 103.134.221.201 _;
    root /var/www/glosindo-backend/public;
    index index.php index.html;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60s;
    }

    location ~ /\. {
        deny all;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
        expires 7d;
        access_log off;
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

---

## 5. Prosedur Build & Deployment Ulang

### A. Update & Deploy Backend (`103.134.221.201`)

```bash
# 1. Masuk ke server API
ssh adminapi@103.134.221.201

# 2. Masuk ke folder aplikasi
cd /var/www/glosindo-backend

# 3. Pull kode terbaru atau upload patch
git pull origin main

# 4. Install dependency production
composer install --no-dev --optimize-autoloader --no-interaction

# 5. Jalankan migrasi jika ada schema baru
php artisan migrate --force

# 6. Pastikan permission folder storage dan cache tetap benar
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 7. Reload runtime
sudo systemctl reload php8.3-fpm
sudo systemctl reload nginx
```

### B. Update & Deploy Frontend (`103.134.221.200`)

```bash
# 1. Masuk ke server App
ssh adminapp@103.134.221.200

# 2. Masuk ke folder aplikasi
cd /var/www/glosindo-frontend

# 3. Pull kode terbaru
git pull origin main

# 4. Install dependency
npm ci

# 5. Build bundle production
npm run build

# 6. Reload Nginx
sudo systemctl reload nginx
```

---

## 6. Pemeliharaan & Troubleshooting

### Restart Service

```bash
# Server API:
sudo systemctl restart nginx
sudo systemctl restart php8.3-fpm
sudo systemctl restart mysql

# Server App:
sudo systemctl restart nginx
```

### Memeriksa Log

```bash
# Log Backend (Lumen):
tail -f /var/www/glosindo-backend/storage/logs/lumen-$(date +%Y-%m-%d).log

# Log Nginx Access & Error:
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Log PHP-FPM:
tail -f /var/log/php8.3-fpm.log
```

### Database Backup & Restore

```bash
# Backup Manual (Server API):
mysqldump --no-tablespaces -u glosindo_user -p glosindo | gzip > /var/backups/glosindo/glosindo_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore Database:
gunzip < /var/backups/glosindo/nama_file_backup.sql.gz | mysql -u glosindo_user -p glosindo
```

---

## 7. Endpoint Health Check & Ringkasan Pengujian

- **Backend Health Check:** `GET http://103.134.221.201/`
  - Respon: `{"app":"GLOSINDO Digital Guestbook API","version":"Lumen (10.0.4) (Laravel Components ^10.0)"}`
- **Public Registration Status:** `GET http://103.134.221.201/api/public-registration/status`
  - Respon: `{"success":true,"enabled":true,"message":"Pendaftaran tamu mandiri dibuka"}`
- **Frontend Portal:** `GET http://103.134.221.200/` (HTTP 200 OK)
- **Kiosk Mode:** `GET http://103.134.221.200/guest-visit` (HTTP 200 OK)
- **Biometric Model Weights:** `GET http://103.134.221.200/models/ssd_mobilenetv1_model-weights_manifest.json` (HTTP 200 OK)

### Akun Bawaan Sistem

| Role | Email |
|---|---|
| **Administrator** | `admin@glosindo.com` |
| **Receptionist** | `receptionist@glosindo.com` |
| **Supervisor** | `supervisor@glosindo.com` |

*(Kredensial disimpan secara terenkripsi menggunakan algoritma bcrypt).*

