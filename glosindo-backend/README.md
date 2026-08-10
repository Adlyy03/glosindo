# GLOSINDO Digital Guestbook

Smart visitor management system with facial recognition. Track visitor check-ins/check-outs, store face embeddings for quick recognition.

## Tech Stack

**Backend:**
- PHP 8.1+ / Laravel Lumen 10
- MySQL database
- JWT authentication (tymon/jwt-auth)
- Face embeddings stored as JSON vectors

**Frontend:**  
- React 18 + TypeScript
- Vite build system
- TailwindCSS styling
- face-api.js for facial recognition
- Zustand state management
- React Router DOM navigation
- Recharts for analytics

## Features

- **Visitor Registration**: Name, phone, email, company, photo
- **Face Recognition**: 128-float vector embeddings for quick identification
- **Visit Tracking**: Check-in/check-out with purpose, meet-to person
- **Dashboard Analytics**: Visit trends, monthly stats, top visitors  
- **Role-based Access**: Admin/user permissions
- **Real-time Status**: Active visits, visit history

## Database Schema

**Users**: `id`, `name`, `email`, `password`, `role`
**Visitors**: `id`, `name`, `phone`, `email`, `company`, `photo`  
**Face Embeddings**: `id`, `visitor_id`, `face_vector` (JSON)
**Visits**: `id`, `visitor_id`, `purpose`, `meet_to`, `check_in`, `check_out`, `status`

## API Endpoints

### Authentication
```
POST /api/login          - Login user
GET  /api/me             - Get current user
POST /api/logout         - Logout
POST /api/refresh        - Refresh JWT token
```

### Visitors
```
GET    /api/visitors           - List all visitors
POST   /api/visitors           - Create visitor
GET    /api/visitors/{id}      - Get visitor details
PUT    /api/visitors/{id}      - Update visitor
DELETE /api/visitors/{id}      - Delete visitor (admin only)
```

### Face Embeddings
```
GET    /api/face-embeddings                    - List embeddings
POST   /api/visitors/{id}/face-embedding       - Store face vector
DELETE /api/visitors/{id}/face-embedding       - Remove face vector
```

### Visits
```
GET /api/visits           - List all visits
GET /api/visits/active    - Get active visits (status IN)
GET /api/visits/history   - Get completed visits
POST /api/visits          - Create new visit (check-in)
PUT /api/visits/{id}/checkout - Check-out visitor
```

### Dashboard
```
GET /api/dashboard/stats          - Basic stats
GET /api/dashboard/visit-trends   - Visit trend data  
GET /api/dashboard/monthly-trends - Monthly analytics
GET /api/dashboard/top-visitors   - Most frequent visitors
```

## Installation

### Backend Setup
```bash
cd glosindo-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php -S localhost:8000 -t public
```

### Frontend Setup  
```bash
cd glosindo-frontend
npm install
npm run dev
```

### Database Config
Update `.env`:
```
DB_DATABASE=glosindo_guestbook
DB_USERNAME=root
DB_PASSWORD=your_password
CORS_ALLOWED_ORIGIN=http://localhost:5173
```

## Usage Flow

1. **Register Visitor**: Add basic info + photo capture
2. **Face Training**: System extracts 128-point face embedding
3. **Check-in**: Camera recognizes face or manual search
4. **Visit Tracking**: Record purpose, person to meet
5. **Check-out**: Update visit status to OUT
6. **Analytics**: View dashboard stats, trends

## File Structure

```
glosindo-backend/
├── app/
│   ├── Http/Controllers/     # API controllers
│   ├── Models/              # Eloquent models
│   └── Middleware/          # JWT, CORS, Role middleware
├── database/
│   ├── migrations/          # DB schema
│   └── seeders/            # Sample data
└── routes/web.php          # API routes

glosindo-frontend/
├── src/
│   ├── components/         # React components
│   ├── pages/             # Route pages  
│   ├── store/             # Zustand stores
│   └── utils/             # Face API helpers
```

## Development

**Start Backend**: `php -S localhost:8000 -t public`
**Start Frontend**: `npm run dev` 
**Database**: Run migrations + seeders for sample data

Default login: Check `UserSeeder.php` for admin credentials.

## Face Recognition Notes

- Uses face-api.js models for browser-based detection
- 128-float embeddings stored in MySQL JSON column
- Threshold comparison for face matching
- Photo storage in `storage/app/public/visitors/`