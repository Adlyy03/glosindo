# GLOSINDO - Log Kegiatan Development

## Judul Kegiatan
Upgrade Event System & Premium Dashboard UI

## Tanggal
21 Agustus 2026

## Waktu Mulai - Selesai
Sesi development full day

## Alat / Tools
- Laravel 10.x (Backend)
- React + Vite (Frontend)
- MySQL Database
- Chart.js, React-ChartJS-2
- Dayjs (Timezone Asia/Jakarta)
- VS Code

## Uraian Kegiatan

**Database & Backend:**
- Fix duplikat registrasi: UNIQUE constraint `event_participants(event_id, phone)`
- Performance indexes `visits`, `events` tables
- Rate limiting: 10 req/min public endpoints (ThrottleMiddleware)
- `ValidationHelper.php` - phone validation centralized
- Event status auto-update logic: scheduled → active → finished (Model hooks)
- Migration fix ENUM: 'ongoing' → 'active'
- Validation: `registration_end_at` <= `end_date + end_time` (frontend + backend)

**Frontend Utils:**
- `datetime.js` - timezone Asia/Jakarta lock, formatServerDate()
- `validation.js` - phone normalization 08xxxxxxxxxx
- LoadingSpinner components (TableSkeleton, CardSkeleton, ButtonSpinner)

**Premium UI/UX:**
- Dashboard glassmorphism cards, 3D hover effects, gradient animated backgrounds
- Event stats: 6 KPI cards (Total/Aktif/Selesai/Peserta/Check-In/Belum)
- Visitor stats: 3 premium cards (Hari Ini/Bulan Ini/Total Profil)
- EventDetailPage: Doughnut + Bar charts (status kehadiran & ringkasan)
- Removed EventReportPage route (grafik langsung di detail event)

**Bug Fixes:**
- Carbon date cast error - `format('Y-m-d')` sebelum concat time
- SQLSTATE ENUM 1265 error - status ENUM value sync

**Dependencies Installed:**
- chart.js, react-chartjs-2, dayjs
