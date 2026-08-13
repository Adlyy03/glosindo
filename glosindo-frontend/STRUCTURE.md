# 📁 Frontend Project Structure

## Overview
Struktur folder terorganisir untuk aplikasi Glosindo Digital Guestbook.

## Directory Structure

```
glosindo-frontend/
├── public/                    # Static assets (favicon, manifest, etc)
├── src/
│   ├── assets/               # Media assets
│   │   ├── images/          # Gambar (logo, hero, dll)
│   │   │   ├── logo-glosindo.webp  # Logo utama
│   │   │   └── hero.png
│   │   └── icons/           # Icon files (SVG, PNG)
│   │
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── FaceScanner.jsx
│   │   ├── WebcamCapture.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SplashOverlay.jsx
│   │   ├── StatCard.jsx
│   │   └── VisitorTable.jsx
│   │
│   ├── constants/           # App constants & config
│   │   └── index.js         # Logo path, colors, app name
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFaceMatcher.js
│   │   └── useFaceModels.js
│   │
│   ├── layouts/             # Layout components
│   │   └── DashboardLayout.jsx  # Main dashboard wrapper
│   │
│   ├── pages/               # Page components
│   │   ├── admin/          # Admin-only pages
│   │   │   ├── AdminSettingsPage.jsx
│   │   │   └── AdminUsersPage.jsx
│   │   ├── receptionist/   # Receptionist pages
│   │   │   ├── ReceptionistDashboard.jsx
│   │   │   ├── ReceptionistCheckIn.jsx
│   │   │   ├── ReceptionistActiveVisitors.jsx
│   │   │   └── ReceptionistVisitHistory.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CheckInPage.jsx
│   │   ├── CheckInCameraPage.jsx
│   │   ├── QuickCheckInPage.jsx
│   │   ├── ActiveVisitorPage.jsx
│   │   ├── VisitHistoryPage.jsx
│   │   ├── VisitorListPage.jsx
│   │   └── VisitorFormPage.jsx
│   │
│   ├── services/            # API & external services
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── faceService.js
│   │   ├── visitorService.js
│   │   └── visitService.js
│   │
│   ├── store/               # State management (Zustand)
│   │   └── authStore.js
│   │
│   ├── utils/               # Utility functions
│   │   └── faceUtils.js
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── .env                      # Environment variables
├── .gitignore
├── index.html               # HTML template
├── package.json             # Dependencies
├── postcss.config.js        # PostCSS config
├── tailwind.config.js       # Tailwind theme (brand colors)
├── vite.config.js           # Vite config
└── README.md

```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `Navbar.jsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.js`)
- **Services**: camelCase with Service suffix (e.g., `authService.js`)
- **Utils**: camelCase (e.g., `faceUtils.js`)
- **Constants**: camelCase or UPPER_SNAKE_CASE

### Folders
- lowercase with hyphens for multi-word (e.g., `check-in-page/`)
- singular for utils, plural for collections (e.g., `components/`, `pages/`)

## Brand Assets

### Logo
- **Location**: `src/assets/images/logo-glosindo.webp`
- **Import**: `import { LOGO } from '../constants'`

### Colors (Tailwind)
```js
// Primary brand colors
brand-navy      // #1e3a8a (dark blue dari logo)
brand-cyan      // #0ea5e9 (cyan dari logo)

// Usage in components
className="bg-brand-navy text-white"
className="border-brand-cyan"
```

## Key Features

1. **Face Recognition**: `face-api.js` integration
2. **State Management**: Zustand for auth & app state
3. **Styling**: Tailwind CSS with custom brand theme
4. **Routing**: React Router v7
5. **HTTP Client**: Axios with interceptors
6. **Notifications**: react-hot-toast
7. **Charts**: Recharts for dashboard analytics

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes
- All brand colors extracted from logo
- Responsive design (mobile-first)
- Role-based access (admin, receptionist)
- Biometric authentication support
