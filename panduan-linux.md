
# GLOSINDO - Development Setup

## Menjalankan Project

Project terdiri dari:

- `glosindo-backend` — Lumen API + DDEV
- `glosindo-frontend` — React + Vite

### 1. Jalankan Backend

Buka terminal:

```bash
cd ~/Projects/glosindo/glosindo-backend
ddev start
````

Backend tersedia di:

```text
https://glosindo-backend.ddev.site
```

### 2. Jalankan Frontend

Buka terminal baru:

```bash
cd ~/Projects/glosindo/glosindo-frontend
npm run dev
```

Frontend tersedia di:

```text
http://localhost:5173
```

### 3. Login

```text
Email    : admin@glosindo.com
Password : Admin123!
```

## Stop Project

### Frontend

Di terminal frontend:

```bash
Ctrl+C
```

### Backend

```bash
cd ~/Projects/glosindo/glosindo-backend
ddev stop
```

## Quick Start

Setiap kali ingin menjalankan project:

**Terminal 1:**

```bash
cd ~/Projects/glosindo/glosindo-backend
ddev start
```

**Terminal 2:**

```bash
cd ~/Projects/glosindo/glosindo-frontend
npm run dev
```

Kemudian buka:

```text
http://localhost:5173
```

```
```
