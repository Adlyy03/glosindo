Betul. Kita pertegas: **backend, API, database, face recognition, dan business logic existing jangan disentuh. Fokus 100% rebuild frontend + responsive.**

# Rebuild Frontend GLOSINDO Guestbook

Saya ingin **membangun ulang seluruh frontend UI/UX GLOSINDO Guestbook** menggunakan frontend dan system yang sudah ada di project.

Gunakan **UI UX Pro Max** sebagai design intelligence selama proses redesign.

## DISCLAIMER — WAJIB DIPATUHI

**JANGAN mengubah atau membangun ulang backend/system yang sudah ada.**

Gunakan seluruh system existing sebagai source of truth.

Jangan mengubah:

* Backend
* API endpoint
* API contract
* Database
* Database schema
* Authentication
* Face recognition logic
* face-api.js implementation
* Business logic
* Existing services
* Existing data flow
* Existing validation logic
* Existing state/data handling yang masih diperlukan

**Fokus pekerjaan HANYA pada frontend.**

Jika frontend membutuhkan perubahan kecil agar UI dapat terhubung dengan system existing, lakukan seminimal mungkin tanpa mengubah logic/system backend.

Jangan mengganti architecture backend.

---

# OBJECTIVE

Build ulang frontend GLOSINDO Guestbook agar terlihat:

* Modern
* Professional
* Corporate
* Clean
* Premium
* Trustworthy
* Simple
* Easy to use
* Touch-friendly
* Fast
* Accessible

Frontend harus terasa seperti **modern visitor management / self-service guestbook system**, bukan template dashboard generik.

---

# RESPONSIVE DESIGN — WAJIB

Frontend harus benar-benar responsive dan dioptimalkan untuk:

## Mobile

Target:

* 375px
* 390px
* 430px

Pastikan:

* Layout tidak overflow
* Text tidak terpotong
* Button mudah disentuh
* Form nyaman digunakan
* Camera interface tetap usable
* Navigation tetap usable
* Spacing menyesuaikan layar

## Tablet

Target:

* 768px
* 820px
* 1024px

Tablet adalah salah satu **primary device** aplikasi ini.

Pastikan:

* Layout memanfaatkan ruang dengan baik
* CTA cukup besar untuk touch
* Camera preview proporsional
* Form tidak terlalu melebar
* Content tetap memiliki visual hierarchy yang jelas

## Desktop

Target:

* 1280px
* 1440px
* 1920px

Pastikan:

* Layout tidak terlalu kosong
* Content memiliki max-width yang masuk akal
* Camera interface terlihat proporsional
* Typography tetap nyaman
* UI terlihat professional pada layar besar

**Jangan hanya mengecilkan desktop layout untuk mobile.**

Gunakan responsive layout yang memang dirancang untuk setiap ukuran layar.

---

# DESIGN DIRECTION

Gunakan:

**Modern Corporate Minimalism**

Visual direction:

* Clean
* Professional
* Modern
* Soft but structured
* Strong visual hierarchy
* Generous whitespace
* Clear CTA
* Consistent spacing
* Subtle interaction
* Accessible contrast

Hindari:

* Purple/pink AI gradient
* Neon
* Excessive glassmorphism
* Excessive rounded cards
* Excessive shadows
* Over-animation
* UI terlalu ramai
* Decorative elements yang tidak berguna
* Emoji sebagai UI icon
* Design yang terlihat seperti template AI generik

Gunakan SVG icon dari library yang sudah ada atau gunakan Lucide/Heroicons jika memang diperlukan.

---

# EXISTING FRONTEND

Sebelum melakukan perubahan:

1. Inspect seluruh frontend existing.
2. Pahami routing.
3. Pahami component.
4. Pahami state management.
5. Pahami API integration.
6. Pahami face recognition integration.
7. Pahami existing styling.
8. Pahami asset yang tersedia.
9. Identifikasi halaman yang sudah ada.
10. Identifikasi reusable logic/component yang masih dapat dipertahankan.

**Jangan langsung menghapus component existing.**

Jika component masih memiliki logic penting, pertahankan logic-nya dan rebuild bagian visual/UI-nya.

---

# CORE USER FLOW

Pertahankan flow system existing.

Minimal frontend harus memiliki UX yang jelas untuk:

### Existing Guest

Landing
→ Face Scan
→ Face Recognition
→ Recognized
→ Check-in
→ Success

### New Guest

Landing
→ Registration
→ Personal Information
→ Visit Information
→ Confirmation
→ Check-in
→ Success

### Face Recognition Failure

Face Scan
→ Face Not Detected / Recognition Failed
→ Clear Instruction
→ Retry / Registration

**Flow dan logic existing harus tetap digunakan.**

---

# PAGE REDESIGN

## 1. Landing Page

Buat landing page sebagai **self-service guestbook kiosk**.

Harus langsung menjelaskan:

* Ini adalah GLOSINDO Guestbook
* Apa yang harus dilakukan user
* Pilihan untuk tamu lama
* Pilihan untuk tamu baru

CTA utama harus jelas dan besar.

Jangan membuat landing page seperti marketing website.

Prioritaskan functionality.

---

# 2. Face Recognition Page

Ini adalah fitur utama.

UI harus memiliki state yang jelas:

* Camera initializing
* Camera permission
* Camera ready
* Face not detected
* Face detected
* Scanning
* Processing
* Recognition success
* Recognition failed
* Retry

Gunakan visual feedback yang jelas.

**Jangan mengubah implementation face-api.js.**

Rebuild hanya:

* Layout
* Camera container
* Instructions
* Status indicator
* Button
* Loading state
* Error state
* Success state

---

# 3. Registration Page

Redesign registration form agar modern dan mudah digunakan.

Jika sesuai dengan UX existing, gunakan multi-step form.

Contoh:

### Step 1

Personal Information

### Step 2

Visit Information

### Step 3

Confirmation

Pertahankan field dan validation existing.

Jangan mengubah data structure hanya untuk kebutuhan visual.

---

# 4. Success Page

Buat success screen yang jelas.

Tampilkan:

* Success indicator
* Nama user
* Check-in status
* Welcome message
* Completion action

Gunakan animation ringan jika diperlukan.

---

# DESIGN SYSTEM

Gunakan UI UX Pro Max untuk menentukan:

### Color

Gunakan brand identity GLOSINDO jika sudah tersedia di project.

Jika belum jelas:

* Audit existing brand colors
* Jangan mengganti warna brand secara sembarangan

Tentukan:

* Primary
* Secondary
* Background
* Surface
* Text
* Muted
* Border
* Success
* Warning
* Error
* Info

### Typography

Gunakan typography modern dan readable.

Prioritaskan Inter jika sesuai dengan project.

Buat hierarchy:

* Display
* H1
* H2
* H3
* Body
* Caption
* Label
* Button

### Spacing

Gunakan spacing system yang konsisten.

### Components

Build reusable frontend components:

* Button
* Input
* Select
* Card
* Modal
* Alert
* Toast
* Badge
* Loading
* Error state
* Success state
* Camera frame
* Face scan indicator
* Step indicator
* Form components

Jangan membuat component duplicate.

---

# RESPONSIVE COMPONENT BEHAVIOR

Setiap component harus dipikirkan behavior-nya pada:

```text
Mobile
↓
Tablet
↓
Desktop
```

Contoh:

### Desktop

```text
[ Camera ]    [ Instructions ]
```

### Tablet

```text
[ Camera ]
[ Instructions ]
```

### Mobile

```text
[ Camera ]

[ Instructions ]

[ Action ]
```

Gunakan layout yang sesuai dengan viewport, bukan sekadar CSS scaling.

---

# TOUCH UX

Karena aplikasi digunakan pada tablet:

* Minimum touch target sekitar 48px
* CTA utama sekitar 52–56px jika memungkinkan
* Jangan membuat button terlalu kecil
* Input harus nyaman disentuh
* Spacing antar interactive element harus cukup
* Hindari hover sebagai satu-satunya feedback

---

# ANIMATION

Gunakan animation secara minimal dan fungsional.

Prioritaskan:

* 150–300ms transition
* subtle fade
* subtle scale
* camera scanning feedback
* success animation

Hindari animation yang:

* memperlambat user
* terlalu ramai
* mengganggu camera scanning
* hanya dekorasi

Respect:

`prefers-reduced-motion`

---

# IMPLEMENTATION PROCESS

Kerjakan secara bertahap.

## Phase 1 — Audit

Inspect existing frontend.

Jangan ubah code terlebih dahulu.

Output:

* Existing page
* Existing component
* Existing route
* Existing frontend logic
* Existing API usage
* Existing styling
* Existing face recognition integration

## Phase 2 — Design System

Gunakan UI UX Pro Max.

Tentukan:

* Visual style
* Color
* Typography
* Spacing
* Component system
* Responsive behavior
* UX pattern
* Accessibility

## Phase 3 — Landing Page

Rebuild frontend Landing Page.

Jangan mengubah business logic.

## Phase 4 — Face Recognition

Rebuild visual UI Face Recognition.

Pertahankan face-api.js logic.

## Phase 5 — Registration

Rebuild registration UI.

Pertahankan:

* Existing field
* Validation
* API
* State
* Data structure

## Phase 6 — Success

Rebuild success/welcome UI.

## Phase 7 — Responsive

Test seluruh halaman:

### Mobile

375 / 390 / 430

### Tablet

768 / 820 / 1024

### Desktop

1280 / 1440 / 1920

## Phase 8 — Final Polish

Review:

* Typography
* Spacing
* Alignment
* Color
* Contrast
* Button
* Form
* Camera UI
* Loading
* Error
* Success
* Responsive
* Accessibility
* Animation
* Component consistency

---

# TECHNICAL RULES

Sebelum coding:

**READ existing frontend code first.**

Jangan:

* Rewrite backend
* Rewrite API
* Rewrite database
* Rewrite face recognition logic
* Mengubah API contract
* Menghapus business logic
* Menghapus dependency tanpa alasan
* Mengganti framework
* Mengganti library existing tanpa alasan kuat
* Hardcode API response
* Membuat mock data untuk menggantikan data real
* Membuat duplicate component
* Membuat styling yang tidak konsisten

Fokus:

**REBUILD FRONTEND UI/UX.**

---

# FINAL REQUIREMENT

Hasil akhir harus:

1. Menggunakan system existing.
2. Tidak merusak business logic.
3. Tidak mengubah backend.
4. Tidak mengubah API contract.
5. Tidak mengubah database.
6. Tidak merusak face recognition.
7. Memiliki UI/UX baru yang modern.
8. Responsive penuh untuk mobile.
9. Responsive penuh untuk tablet.
10. Responsive penuh untuk desktop.
11. Touch-friendly.
12. Accessible.
13. Consistent design system.
14. Reusable components.
15. Tidak terlihat seperti template AI generik.

**Mulai dari audit frontend existing terlebih dahulu.**

Setelah audit selesai, gunakan UI UX Pro Max untuk menentukan design direction, lalu implementasikan rebuild frontend secara bertahap.

Jangan melakukan perubahan backend/system.
