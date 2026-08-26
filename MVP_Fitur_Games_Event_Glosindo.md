# PROMPT AI AGENT — IMPLEMENTASI FITUR GAMES EVENT

Kamu adalah AI coding agent yang bertugas mengimplementasikan fitur baru bernama **Games Event** pada project APK Tamu Glosindo.

## TUJUAN UTAMA

Tambahkan modul Games Event ke sistem yang sudah ada.

Konsep utamanya:

Event
→ Kelompok
→ Peserta
→ Link/QR Register khusus kelompok
→ QR Code Poin
→ Peserta scan QR
→ Sistem mencatat transaksi poin
→ Poin masuk ke peserta dan kelompok
→ Dashboard ranking/statistik

JANGAN membuat project baru.

JANGAN mengubah arsitektur utama project secara sembarangan.

Gunakan struktur, style, authentication, authorization, API pattern, database convention, component, dan UI yang SUDAH ADA di project.

Sebelum coding, WAJIB pahami struktur project terlebih dahulu.

---

# 1. WAJIB AUDIT PROJECT TERLEBIH DAHULU

Sebelum melakukan perubahan:

1. Cek struktur folder project.
2. Identifikasi backend dan frontend.
3. Identifikasi framework yang digunakan.
4. Identifikasi database.
5. Cek sistem authentication.
6. Cek role Admin dan Receptionist.
7. Cek routing backend.
8. Cek routing frontend.
9. Cek migration yang sudah ada.
10. Cek model yang sudah ada.
11. Cek controller/service/repository pattern jika tersedia.
12. Cek API endpoint yang sudah digunakan frontend.
13. Cek desain halaman Event yang sudah ada.
14. Cek sistem QR Code yang sudah tersedia jika ada.
15. Cek sistem registrasi tamu yang sudah ada.
16. Cek permission middleware yang sudah ada.

Jangan langsung membuat file baru sebelum memahami struktur existing project.

---

# 2. FITUR YANG HARUS DIBUAT

Implementasikan fitur berikut.

## A. Games Event

Receptionist/Admin dapat membuat Event Games.

Field minimal:

- name
- description
- start_date
- end_date
- status

Status:

- draft
- active
- completed

Gunakan format dan convention database yang sudah digunakan project.

---

# 3. KELOMPOK

Setiap Games Event dapat memiliki banyak kelompok.

Contoh:

Games 17 Agustus

- Kelompok Merah
- Kelompok Biru
- Kelompok Hijau
- Kelompok Kuning

Setiap kelompok mempunyai:

- event_id
- name
- unique code
- register token
- created_at
- updated_at

Receptionist/Admin dapat:

- membuat kelompok
- edit kelompok
- melihat kelompok
- menghapus kelompok jika belum memiliki data penting
- melihat peserta kelompok
- melihat total poin kelompok

---

# 4. REGISTER KHUSUS PER KELOMPOK

Setiap kelompok WAJIB memiliki link register unik.

Contoh:

/games/register/ABC123

Kelompok lain:

/games/register/XYZ789

Ketika peserta membuka link tersebut:

1. Sistem membaca token kelompok.
2. Sistem memvalidasi token.
3. Sistem menampilkan nama event.
4. Sistem menampilkan nama kelompok.
5. Peserta mengisi form.
6. Setelah submit, peserta otomatis masuk ke kelompok tersebut.

PENTING:

Peserta TIDAK BOLEH memilih kelompok secara manual.

Kelompok ditentukan berdasarkan register token.

Jangan percaya event_group_id dari request frontend tanpa validasi backend.

Backend harus menentukan kelompok berdasarkan token yang valid.

---

# 5. QR REGISTER

Setiap kelompok harus dapat memiliki QR Code register.

Receptionist/Admin dapat:

- melihat QR
- download QR
- print QR
- copy registration link

QR harus mengarah ke registration URL kelompok.

Gunakan library QR yang sudah tersedia di project jika ada.

Jika belum ada, gunakan library yang kompatibel dengan stack project.

Jangan menambahkan dependency baru jika functionality yang sama sudah tersedia.

---

# 6. PESERTA

Peserta games memiliki minimal:

- id
- event_group_id
- name
- phone
- email jika dibutuhkan

Peserta harus terhubung dengan satu kelompok.

Pastikan peserta hanya dapat mengikuti event melalui registration flow yang valid.

---

# 7. QR CODE POIN

Receptionist dapat membuat QR Code poin.

Nilai poin MVP:

10
20
30
40
50
60
70
80
90
100

Setiap QR poin minimal mempunyai:

- event_id
- point_value
- token
- status
- created_at
- updated_at

Contoh:

QR:

50 POINT

Saat dibuat, sistem menghasilkan token unik.

---

# 8. SCAN QR POIN

Peserta dapat scan QR poin menggunakan aplikasi/web yang sudah tersedia.

Flow:

Peserta
→ scan QR
→ sistem membaca token
→ validasi token
→ validasi peserta
→ validasi event
→ validasi QR
→ cek duplicate
→ create point transaction
→ poin berhasil diberikan

Response harus memberikan informasi yang jelas.

Contoh:

Berhasil:

"Berhasil mendapatkan 50 poin."

Jika duplicate:

"QR poin ini sudah pernah digunakan oleh Anda."

Jika QR tidak valid:

"QR poin tidak valid."

Jika event tidak aktif:

"Event sudah tidak aktif."

---

# 9. POINT TRANSACTION

WAJIB membuat tabel transaksi poin.

Jangan hanya menyimpan total poin.

Minimal:

point_transactions

- id
- event_id
- event_group_id
- participant_id
- point_qr_code_id
- points
- scanned_at
- created_at

Transaction menjadi sumber utama histori poin.

---

# 10. DUPLICATE SCAN

MVP:

Satu peserta hanya dapat menggunakan satu QR poin satu kali.

Contoh:

QR 100:

Andi scan pertama:

+100

Andi scan kedua:

DITOLAK

Budi scan:

+100

BERHASIL

Implementasikan validasi duplicate di BACKEND.

Jangan hanya mengandalkan frontend.

Jika memungkinkan, tambahkan database constraint/index untuk membantu mencegah duplicate transaction.

---

# 11. PERHITUNGAN POIN

Jangan membuat sistem yang hanya mengandalkan angka total yang bisa tidak sinkron.

Gunakan point_transactions sebagai source of truth.

Total poin peserta:

SUM(point_transactions.points)

Total poin kelompok:

SUM(point_transactions.points berdasarkan event_group_id)

Total poin event:

SUM(point_transactions.points berdasarkan event_id)

Jika project existing menggunakan cached total, tetap pastikan transaksi menjadi sumber histori dan total tidak mudah mismatch.

---

# 12. DASHBOARD GAMES

Buat dashboard khusus untuk event games.

Tampilkan:

## Statistik

- Total kelompok
- Total peserta
- Total poin
- Total transaksi

## Ranking kelompok

Urutkan berdasarkan total poin terbesar.

Contoh:

1. Merah — 1.250
2. Biru — 1.100
3. Hijau — 950
4. Kuning — 700

## Ranking peserta

Urutkan berdasarkan total poin terbesar.

Contoh:

1. Andi — Merah — 350
2. Budi — Biru — 300
3. Caca — Merah — 280

---

# 13. FILTER KELOMPOK

Dashboard harus memiliki filter kelompok.

Contoh:

Filter:

Kelompok Merah

Maka ranking peserta hanya menampilkan:

Peserta Kelompok Merah.

Contoh:

1. Andi — 350
2. Caca — 280
3. Deni — 200

---

# 14. GRAFIK

Tambahkan minimal:

### Grafik Total Poin per Kelompok

Contoh:

Merah 1250
Biru 1100
Hijau 950
Kuning 700

Gunakan chart library yang sudah digunakan project.

Jangan install library chart baru jika project sudah mempunyai chart library.

---

# 15. RIWAYAT TRANSAKSI POIN

Tambahkan halaman/list transaksi poin.

Minimal tampilkan:

- Peserta
- Kelompok
- Poin
- QR poin
- Waktu scan

Contoh:

Andi | Merah | +50 | 10:20

Budi | Biru | +100 | 10:25

Ini penting untuk audit jika ada komplain mengenai poin.

---

# 16. ROLE & PERMISSION

Ikuti sistem role existing.

Minimal:

ADMIN:

- dapat melihat event games
- membuat event
- edit event
- mengelola kelompok
- melihat peserta
- membuat QR poin
- melihat dashboard
- melihat transaksi

RECEPTIONIST:

- dapat mengelola event games sesuai permission existing
- membuat kelompok
- melihat peserta
- generate QR register
- membuat QR poin
- melihat dashboard
- melihat transaksi

Peserta:

- hanya dapat register
- hanya dapat scan QR poin
- tidak dapat mengakses dashboard admin/receptionist

Jangan membuat sistem authentication baru.

Gunakan authentication existing.

---

# 17. ROUTING

Tambahkan route sesuai pola project.

Contoh konsep:

Admin/Receptionist:

/games
/games/{event}
/games/{event}/groups
/games/{event}/participants
/games/{event}/point-qr
/games/{event}/dashboard
/games/{event}/transactions

Public:

/games/register/{token}

Scan:

/games/scan-point

Sesuaikan dengan routing existing project.

Jangan copy mentah route di atas jika struktur project mempunyai pola berbeda.

---

# 18. API

Buat endpoint yang diperlukan sesuai architecture existing.

Contoh:

POST /events/{event}/groups

GET /events/{event}/groups

POST /events/{event}/point-qr

GET /events/{event}/point-qr

POST /games/register/{token}

POST /games/scan-point

GET /events/{event}/dashboard

GET /events/{event}/transactions

Gunakan response format API existing.

Jangan membuat format response baru jika project sudah memiliki standard response.

---

# 19. VALIDASI BACKEND

WAJIB melakukan validation untuk:

Event:

- name required
- tanggal valid
- status valid

Group:

- name required
- event valid

Participant:

- name required
- data wajib sesuai kebutuhan existing

Point QR:

- point_value harus salah satu dari:
  10,20,30,40,50,60,70,80,90,100
- event valid
- token unique

Scan:

- token wajib
- participant valid
- QR valid
- event valid
- event aktif
- participant berada di event yang sama
- duplicate scan ditolak

---

# 20. DATABASE MIGRATION

Buat migration baru untuk kebutuhan Games Event.

Minimal:

events / gunakan existing jika sudah tersedia

event_groups

participants / gunakan tabel existing jika secara struktur memang cocok

point_qr_codes

point_transactions

JANGAN membuat tabel duplicate jika project sudah memiliki tabel yang dapat digunakan.

Jika sudah ada tabel events, gunakan tabel tersebut dan tambahkan field yang diperlukan dengan migration baru.

Pastikan foreign key dan index sesuai kebutuhan.

---

# 21. FRONTEND

Gunakan UI/UX existing project.

Jangan membuat desain yang tidak konsisten.

Gunakan:

- existing layout
- existing sidebar
- existing button
- existing modal
- existing table
- existing card
- existing toast
- existing form
- existing chart
- existing color scheme

Buat responsive untuk:

- desktop
- tablet
- HP

Karena peserta kemungkinan besar melakukan register dan scan menggunakan HP.

---

# 22. UX REGISTER

Halaman register harus sederhana.

Tampilkan:

Nama Event

Nama Kelompok

Form:

Nama
No HP
Email jika diperlukan

Button:

"Daftar"

Setelah berhasil:

"Registrasi berhasil"

Tampilkan informasi:

Nama peserta
Kelompok

Jangan tampilkan fitur admin.

---

# 23. UX SCAN POIN

Peserta harus bisa melakukan scan QR dengan mudah.

Jika project sudah memiliki scanner QR:

Gunakan scanner existing.

Jika belum:

Tambahkan scanner yang kompatibel dengan teknologi project.

Setelah scan:

Loading

→ validasi

→ success/error message

Success:

"Berhasil mendapatkan 50 poin."

Error harus jelas.

---

# 24. ERROR HANDLING

Jangan membiarkan error backend tampil mentah ke user.

Tangani:

- token invalid
- event tidak ditemukan
- group tidak ditemukan
- peserta tidak ditemukan
- QR expired/nonaktif
- QR sudah digunakan
- event selesai
- unauthorized
- validation error
- network error

Gunakan error handling existing project.

---

# 25. AUDIT DAN KEAMANAN

Pastikan:

- Token register sulit ditebak
- Token QR poin unik
- Jangan menerima point_value mentah dari frontend saat scan
- Nilai poin HARUS diambil dari data QR di database
- Jangan percaya event_id dari client
- Jangan percaya group_id dari client
- Validasi participant terhadap event
- Validasi QR terhadap event
- Cegah duplicate transaction

PENTING:

Ketika peserta scan QR, frontend cukup mengirim token QR.

Backend yang menentukan:

QR tersebut milik event mana.

Berapa nilai poinnya.

Peserta berada di kelompok mana.

---

# 26. TESTING

Setelah implementasi, WAJIB melakukan testing.

Test minimal:

## Event

- create event
- edit event
- status event

## Group

- create group
- edit group
- generate register token
- generate QR register

## Registration

- register melalui token valid
- register melalui token invalid
- peserta masuk kelompok yang benar
- peserta tidak dapat memilih kelompok lain

## Point QR

- create QR 10
- create QR 50
- create QR 100
- invalid point ditolak
- disable QR

## Scan

- scan valid
- scan duplicate
- scan QR event lain
- scan QR invalid
- scan saat event inactive
- participant tanpa group

## Dashboard

- total participant benar
- total group benar
- total point benar
- ranking group benar
- ranking participant benar
- filter group benar

---

# 27. JANGAN MERUSAK FITUR EXISTING

Ini sangat penting.

Sebelum mengubah code:

- pahami dependency
- pahami route
- pahami model
- pahami migration
- pahami component

Jangan menghapus fitur existing hanya untuk membuat fitur Games.

Jangan mengubah behavior fitur tamu biasa tanpa alasan.

Jangan mengubah authentication existing.

Jangan mengubah role existing secara sembarangan.

Jika harus mengubah file existing, pastikan perubahan backward-compatible.

---

# 28. URUTAN IMPLEMENTASI

Kerjakan dalam urutan:

1. Audit project
2. Identifikasi existing Event
3. Identifikasi existing Visitor/Guest
4. Design database
5. Migration
6. Model/relation
7. Backend validation
8. API
9. Event Games UI
10. Group UI
11. Registration UI
12. QR Register
13. Point QR
14. Scan Point
15. Point Transaction
16. Dashboard
17. Ranking
18. Filter
19. Permission
20. Testing
21. Fix bug
22. Final verification

---

# 29. ATURAN PENTING UNTUK AI AGENT

JANGAN:

- membuat dummy data sebagai solusi final
- hardcode total poin
- hardcode kelompok
- hardcode peserta
- hardcode QR
- hanya membuat frontend tanpa backend
- hanya membuat database tanpa UI
- melewati validation
- menyimpan total poin tanpa histori transaksi
- membuat authentication baru
- membuat role baru tanpa kebutuhan
- merusak fitur existing

HARUS:

- menggunakan data database real
- menggunakan API real
- menggunakan authentication existing
- menggunakan role existing
- menggunakan migration
- menggunakan validation backend
- menggunakan transaction poin
- menangani duplicate scan
- menangani error
- membuat responsive UI
- melakukan testing

---

# 30. DEFINITION OF DONE

Fitur dianggap SELESAI apabila flow berikut berjalan end-to-end:

Receptionist login
↓
Buat Games Event
↓
Buat Kelompok Merah
↓
Generate Link/QR Register
↓
Peserta scan QR
↓
Peserta registrasi
↓
Peserta otomatis masuk Kelompok Merah
↓
Receptionist membuat QR 50 poin
↓
Peserta scan QR 50
↓
Backend validasi
↓
Point Transaction dibuat
↓
Peserta mendapatkan +50
↓
Kelompok Merah mendapatkan +50
↓
Dashboard berubah
↓
Ranking kelompok berubah
↓
Ranking peserta berubah
↓
Scan QR yang sama oleh peserta yang sama ditolak
↓
Riwayat transaksi dapat dilihat

SEMUA flow tersebut harus benar-benar menggunakan database dan API real.

---

# 31. OUTPUT SETELAH SELESAI

Setelah selesai implementasi, berikan laporan singkat:

1. File yang dibuat
2. File yang diubah
3. Migration yang dibuat
4. Model yang dibuat/diubah
5. API endpoint
6. Route frontend
7. Fitur yang berhasil
8. Test yang dilakukan
9. Error yang ditemukan
10. Error yang masih tersisa jika ada

Jangan mengatakan "sudah selesai" jika fitur belum benar-benar diuji.

Jika menemukan masalah existing project yang menghambat implementasi, jelaskan masalahnya terlebih dahulu dan perbaiki jika aman dilakukan.

PRIORITAS UTAMA:

**FITUR HARUS BERFUNGSI END-TO-END, BUKAN SEKADAR TAMPILAN UI.**