# Database Schema - GLOSINDO

## Overview
Database visitor management dengan face recognition & event system.

---

## Tables

### 1. **users**
Admin, receptionist, supervisor.

```sql
id              BIGINT UNSIGNED PK
name            VARCHAR(255)
email           VARCHAR(255) UNIQUE
password        VARCHAR(255)
role            ENUM('admin','receptionist','supervisor')
disabled_features JSON NULL -- Array fitur yg di-disable per user
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

### 2. **visitors**
Master tamu. **Satu visitor ID untuk semua event & regular visit.**

```sql
id              BIGINT UNSIGNED PK
name            VARCHAR(255)
phone           VARCHAR(255) NULL -- INDEX
email           VARCHAR(255) NULL
company         VARCHAR(255) NULL
position        VARCHAR(255) NULL
photo           VARCHAR(255) NULL -- path: storage/app/public/visitors/
created_at      TIMESTAMP
updated_at      TIMESTAMP
deleted_at      TIMESTAMP NULL
```

**Indexes:**
- `phone` (lookup cepat)

---

### 3. **face_embeddings**
Face vector 128-float per visitor (one-to-one).

```sql
id              BIGINT UNSIGNED PK
visitor_id      BIGINT UNSIGNED UNIQUE FK -> visitors.id ON DELETE CASCADE
face_vector     JSON -- Array[128] float
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

### 4. **visits**
Check-in/out log. **Gabungan regular + event visit.**

```sql
id              BIGINT UNSIGNED PK
visitor_id      BIGINT UNSIGNED FK -> visitors.id ON DELETE CASCADE
receptionist_id BIGINT UNSIGNED NULL FK -> users.id ON DELETE SET NULL
event_id        BIGINT UNSIGNED NULL FK -> events.id ON DELETE CASCADE
purpose         VARCHAR(255)
meet_to         VARCHAR(255)
check_in        TIMESTAMP
check_out       TIMESTAMP NULL
status          ENUM('IN','OUT')
visitor_name    VARCHAR(255) NULL -- Snapshot jika visitor dihapus
visitor_company VARCHAR(255) NULL
visitor_phone   VARCHAR(255) NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
deleted_at      TIMESTAMP NULL
```

**Indexes:**
- `visitor_id`
- `status` (filter active/out)
- `check_in` (date range query)
- `event_id, status` (event report)

**Logic:**
- `event_id` NULL = regular visit
- `event_id` NOT NULL = event visit

---

### 5. **events**
Acara/event tamu.

```sql
id                    BIGINT UNSIGNED PK
code                  VARCHAR(64) UNIQUE NULL -- Slug public registration: /event/{code}/register
name                  VARCHAR(255)
description           TEXT NULL
event_date            DATE
start_date            DATE NULL
end_date              DATE NULL
start_time            TIME
end_time              TIME
registration_start_at DATETIME NULL
registration_end_at   DATETIME NULL
location              VARCHAR(255) NULL
status                ENUM('draft','scheduled','ongoing','active','finished','cancelled')
created_by            BIGINT UNSIGNED FK -> users.id
created_at            TIMESTAMP
updated_at            TIMESTAMP
deleted_at            TIMESTAMP NULL
```

**Indexes:**
- `code` (public lookup)
- `status` (filter by status)
- `start_date` (date range query)

---

### 6. **event_participants** ⭐ **NEW - PISAH DARI VISITORS**
Peserta event. **Snapshot data independen per event.**

```sql
id              BIGINT UNSIGNED PK
event_id        BIGINT UNSIGNED FK -> events.id ON DELETE CASCADE
visitor_id      BIGINT UNSIGNED NULL FK -> visitors.id ON DELETE SET NULL
name            VARCHAR(255)
phone           VARCHAR(30)
email           VARCHAR(255) NULL
company         VARCHAR(255) NULL
position        VARCHAR(255) NULL
status          VARCHAR(30) DEFAULT 'registered' -- registered, checked_in, checked_out, cancelled
registered_at   DATETIME NULL
checked_in_at   DATETIME NULL
checked_out_at  DATETIME NULL
notes           TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
deleted_at      TIMESTAMP NULL
```

**UNIQUE CONSTRAINT:**
- `event_id + phone` → **No duplicate registration per event by phone** ✅

**Indexes:**
- `event_id, phone` (lookup)
- `event_id, status` (filter peserta)

**Logic:**
- Data di-snapshot saat registrasi
- `visitor_id` bisa NULL (jika visitor master dihapus)
- Phone UNIQUE per event (gak bisa register 2x di event sama)

---

### 7. **audit_logs**
Activity log semua model.

```sql
id              BIGINT UNSIGNED PK
user_id         BIGINT UNSIGNED NULL FK -> users.id ON DELETE SET NULL
action          VARCHAR(255) -- created, updated, deleted, checked_in, checked_out
model_type      VARCHAR(255) -- App\Models\Visitor, App\Models\Visit, etc.
model_id        BIGINT UNSIGNED NULL
description     TEXT NULL
old_values      JSON NULL
new_values      JSON NULL
ip_address      VARCHAR(45) NULL
user_agent      VARCHAR(255) NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Indexes:**
- `model_type, model_id`
- `user_id`
- `created_at`

---

### 8. **system_settings**
Public registration toggle, etc.

```sql
id              BIGINT UNSIGNED PK
key             VARCHAR(255) UNIQUE
value           TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Relationships

```
users 1:N visits (receptionist)
users 1:N events (creator)

visitors 1:1 face_embeddings
visitors 1:N visits
visitors 1:N event_participants

events 1:N visits
events 1:N event_participants

event_participants N:1 visitor (nullable)
event_participants N:1 event
```

---

## Migration Fixes Applied

### ✅ **2026_08_21_000000** - Event Participants Unique Constraint
- UNIQUE `event_id + phone` (prevent double registration)
- INDEX `visitors.phone` (faster lookup)

### ✅ **2026_08_21_000001** - Performance Indexes
- `visits`: status, check_in, event_id+status
- `events`: status, start_date

---

## Data Flow

### Regular Visit Flow:
1. Visitor check-in → create/update `visitors`
2. Create `visits` (event_id = NULL)
3. Face scan → store `face_embeddings`

### Event Registration Flow:
1. Public register → find/create `visitors`
2. Create `event_participants` (snapshot data + visitor_id link)
3. Face scan → store `face_embeddings`

### Event Check-In Flow:
1. Face scan → match `face_embeddings`
2. Find `event_participants` by visitor_id
3. Create `visits` (event_id = event.id)
4. Update `event_participants` status = 'checked_in'

---

## Key Changes

**BEFORE:**
- Event participant data mixed with regular visitors
- Duplicate registration possible (email OR phone check)
- No proper constraint

**AFTER:**
- `event_participants` separate table with snapshot
- UNIQUE constraint `event_id + phone` (DB-level enforcement)
- Cleaner separation: visitors (master) vs event_participants (snapshot per event)

---

## Query Examples

### Find duplicate event participants:
```sql
SELECT event_id, phone, COUNT(*) 
FROM event_participants 
GROUP BY event_id, phone 
HAVING COUNT(*) > 1;
```

### Active event visitors:
```sql
SELECT v.*, ep.status 
FROM visits v
JOIN event_participants ep ON v.visitor_id = ep.visitor_id AND v.event_id = ep.event_id
WHERE v.event_id = ? AND v.status = 'IN';
```

### Performance: check if phone registered in event:
```sql
SELECT 1 FROM event_participants 
WHERE event_id = ? AND phone = ? 
LIMIT 1;
-- Fast lookup via unique index
```
