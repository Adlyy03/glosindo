# 🌐 GLOSINDO - Digital Guestbook System

**Global Media Pratama Solusindo**

Modern digital guestbook with facial recognition and biometric check-in system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Brand Identity

### Logo
![Glosindo Logo](src/assets/images/logo-glosindo.webp)

### Colors
- **Navy Blue**: `#1e3a8a` - Primary brand color
- **Cyan Blue**: `#0ea5e9` - Secondary/accent color

### Tailwind Classes
```jsx
bg-brand-navy    // Navy background
bg-brand-cyan    // Cyan background
text-brand-navy  // Navy text
border-brand-cyan // Cyan border
```

## 📁 Project Structure

```
src/
├── assets/          # Images, icons, media
├── components/      # Reusable UI components
├── constants/       # Brand constants (logo, colors, names)
├── hooks/           # Custom React hooks
├── layouts/         # Page layouts
├── pages/           # Route pages
├── services/        # API services
├── store/           # State management (Zustand)
└── utils/           # Helper functions
```

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State**: Zustand
- **HTTP**: Axios
- **Face Recognition**: face-api.js
- **Charts**: Recharts
- **Notifications**: react-hot-toast
- **Webcam**: react-webcam

## 📖 Documentation

- **[STRUCTURE.md](STRUCTURE.md)** - Detailed folder structure
- **[COMPONENTS.md](COMPONENTS.md)** - Component library & usage
- **[BRAND-GUIDE.md](BRAND-GUIDE.md)** - Brand colors, typography, UI guidelines

## 🔑 Features

- ✅ Biometric facial recognition check-in
- ✅ Role-based access (Admin, Receptionist)
- ✅ Real-time visitor tracking
- ✅ Dashboard with analytics
- ✅ Visit history & reporting
- ✅ Responsive mobile design
- ✅ Quick check-in/out mode

## 🎯 Key Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/dashboard` | Analytics dashboard | Admin, Receptionist |
| `/quick-check-in` | Fast face-scan check-in | Admin, Receptionist |
| `/check-in` | Manual check-in form | Admin, Receptionist |
| `/active-visitors` | Currently active visitors | Admin, Receptionist |
| `/visit-history` | Past visit records | Admin, Receptionist |
| `/visitors` | Visitor database | Admin, Receptionist |
| `/users` | User management | Admin only |
| `/settings` | System settings | Admin only |

## 🎨 Using Brand Assets

```jsx
import { LOGO, APP_NAME, APP_FULL_NAME, COLORS } from './constants';

// Logo
<img src={LOGO} alt={APP_NAME} className="h-10" />

// App name
<h1 className="text-brand-navy">{APP_NAME}</h1>
<p>{APP_FULL_NAME}</p>

// Colors
<button className="bg-brand-navy hover:bg-brand-navy-light">
  Click Me
</button>
```

## 🔐 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_FACE_DETECTION_THRESHOLD=0.6
```

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Output directory
dist/

# Deploy to static hosting
# Upload dist/ folder to your hosting provider
```

## 🧪 Development Tips

1. **Constants First**: Always import from `constants/index.js`
2. **Brand Colors**: Use Tailwind classes, not hex values
3. **Components**: Keep small, single-responsibility
4. **Hooks**: Extract reusable logic
5. **Services**: Centralize API calls

## 🤝 Contributing

Follow project structure and brand guidelines:
1. Use established folder structure
2. Follow naming conventions
3. Use brand colors from Tailwind config
4. Keep components reusable
5. Document new features

## 📝 License

© 2026 GLOSINDO. All rights reserved.

---

**Built with ❤️ by Global Media Pratama Solusindo**
