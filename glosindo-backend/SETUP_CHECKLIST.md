# ✅ SETUP CHECKLIST - GLOSINDO Backend

## Status Setup Manual (Section 1.8)

### 1. ✅ Folder Storage untuk Foto Tamu
**Status:** SELESAI
- Folder `storage/app/public/visitors` sudah dibuat
- Lokasi: `c:\laragon\www\glosindo\glosindo-backend\storage\app\public\visitors`

**Catatan:** Karena Lumen tidak punya `php artisan storage:link`, kita perlu:
- Opsi 1: Buat route manual untuk serve file (akan ditambahkan di Phase 3)
- Opsi 2: Symlink manual dari `public/storage` ke `storage/app/public` (jalankan command di bawah jika diperlukan):

**Windows (PowerShell Admin):**
```powershell
cd c:\laragon\www\glosindo\glosindo-backend\public
New-Item -ItemType SymbolicLink -Path "storage" -Target "..\storage\app\public"
```

**Windows (CMD Admin):**
```cmd
cd c:\laragon\www\glosindo\glosindo-backend\public
mklink /D storage ..\storage\app\public
```

---

### 2. ⚠️ Webcam & Browser Permission
**Status:** PERLU VERIFIKASI MANUAL

**Checklist:**
- [ ] Webcam laptop/device berfungsi dengan baik
- [ ] Browser sudah allow permission untuk kamera
  - Chrome: Settings → Privacy and security → Site Settings → Camera
  - Firefox: Settings → Privacy & Security → Permissions → Camera
  - Edge: Settings → Site permissions → Camera

**Testing:**
1. Buka browser dan akses `https://webcamtests.com/` atau `about://webrtc-internals`
2. Pastikan webcam terdeteksi dan bisa capture video
3. Pastikan browser meminta/sudah granted permission untuk `localhost`

**⚠️ Catatan Penting untuk Deployment:**
- Webcam access via `getUserMedia()` WAJIB HTTPS di production
- Hanya `localhost` dan `127.0.0.1` yang diizinkan HTTP
- Siapkan SSL certificate untuk staging/production

---

### 3. 📝 Akun Admin Default
**Status:** AKAN DI-SEED DI PHASE 1

**Data yang akan dibuat di UserSeeder:**
```
Email:    admin@glosindo.com
Password: Admin123!
Role:     admin
Name:     Administrator GLOSINDO
```

**Untuk mengubah credential default:**
Edit file `database/seeders/UserSeeder.php` di Phase 1 sebelum menjalankan `php artisan db:seed`

---

### 4. 🔒 SSL Certificate untuk Production
**Status:** BELUM DIPERLUKAN (DEV MODE)

**Untuk Deployment ke Staging/Production:**

#### Mengapa HTTPS Wajib?
Browser modern **WAJIB HTTPS** untuk akses webcam/mikrofon di domain selain localhost karena security policy `getUserMedia()`.

#### Pilihan SSL:
1. **Let's Encrypt (Free)** - Recommended untuk production
   ```bash
   # Install certbot
   apt-get install certbot python3-certbot-nginx
   
   # Generate certificate
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

2. **Cloudflare (Free SSL)** - Jika pakai Cloudflare DNS
   - Enable SSL/TLS → Full (strict)
   - Auto redirect HTTP to HTTPS

3. **Self-Signed (Development/Staging Only)**
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/selfsigned.key \
     -out /etc/ssl/certs/selfsigned.crt
   ```

#### Konfigurasi Nginx dengan SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name api.glosindo.com;

    ssl_certificate /etc/letsencrypt/live/api.glosindo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.glosindo.com/privkey.pem;

    root /var/www/glosindo-backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.glosindo.com;
    return 301 https://$host$request_uri;
}
```

---

## Pre-Phase 1 Checklist

Sebelum memulai Phase 1 development, pastikan:

- [x] PHP 8.1+ dengan extensions (pdo_mysql, mbstring, openssl) terinstal
- [x] Composer 2.x terinstal
- [x] MySQL 8.0+ terinstal dan running
- [x] Database `glosindo_guestbook` sudah dibuat
- [x] User database `glosindo_user` sudah dibuat dengan privileges
- [x] File `.env` backend sudah dikonfigurasi (DB credentials, APP_KEY, etc)
- [x] Folder `storage/app/public/visitors` sudah dibuat
- [ ] Webcam device tersedia dan berfungsi
- [ ] Browser permission untuk camera sudah di-set
- [ ] Sudah menentukan credential admin default (atau pakai default di atas)

---

## Testing Webcam (Quick Test)

Buat file test sederhana untuk verifikasi webcam:

**File:** `public/test-webcam.html` (opsional)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Webcam Test</title>
</head>
<body>
    <h1>Webcam Test for GLOSINDO</h1>
    <video id="video" width="640" height="480" autoplay></video>
    <script>
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                document.getElementById('video').srcObject = stream;
            })
            .catch(err => {
                alert('Error accessing webcam: ' + err.message);
            });
    </script>
</body>
</html>
```

Akses via: `http://localhost:8000/test-webcam.html`

---

## Next Steps

✅ **Section 1.8 Setup Manual - SELESAI**

📋 **Ready untuk Phase 1:**
Setelah checklist di atas selesai, Anda siap untuk memulai:
- **PHASE 1** - Database Migration, Models & Backend Foundation

Jalankan command berikut untuk memulai Phase 1:
```bash
cd c:\laragon\www\glosindo\glosindo-backend
composer install
php -r "echo bin2hex(random_bytes(32));"  # Generate JWT_SECRET
```

Update `.env` dengan JWT_SECRET yang dihasilkan, lalu lanjut ke prompt Phase 1 untuk AI Agent.
