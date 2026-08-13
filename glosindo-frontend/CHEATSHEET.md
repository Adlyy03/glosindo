# 🚀 Quick Reference Cheatsheet

## Import Brand Assets

```jsx
import { LOGO, APP_NAME, APP_FULL_NAME, COLORS } from '../constants';
```

## Brand Colors

```jsx
// Backgrounds
bg-brand-navy           // #1e3a8a (dark blue)
bg-brand-cyan           // #0ea5e9 (cyan)
bg-brand-navy-light     // Hover states
bg-brand-cyan-light     // Lighter accents

// Text
text-brand-navy
text-brand-cyan

// Borders
border-brand-navy
border-brand-cyan

// Focus rings
focus:ring-brand-cyan
```

## Common Patterns

### Primary Button
```jsx
<button className="bg-brand-navy hover:bg-brand-navy-light text-white px-4 py-2 rounded-lg">
  Submit
</button>
```

### Input Field
```jsx
<input className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan" />
```

### Card
```jsx
<div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
  Content
</div>
```

### Active Badge
```jsx
<span className="bg-brand-cyan/10 text-brand-navy border border-brand-cyan px-3 py-1 rounded-full text-sm">
  Active
</span>
```

### Logo Usage
```jsx
<img src={LOGO} alt={APP_NAME} className="h-10 w-10 object-contain" />
```

## File Locations

| Asset | Path |
|-------|------|
| Logo | `src/assets/images/logo-glosindo.webp` |
| Constants | `src/constants/index.js` |
| Tailwind Config | `tailwind.config.js` |
| Layout | `src/layouts/DashboardLayout.jsx` |

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Folder Structure Quick Ref

```
src/
├── assets/images/   → Logo, images
├── components/      → Reusable UI
├── constants/       → Brand constants
├── hooks/           → Custom hooks
├── layouts/         → Page wrappers
├── pages/           → Routes
├── services/        → API calls
├── store/           → State (Zustand)
└── utils/           → Helpers
```

## API Service Pattern

```jsx
// services/myService.js
import api from './api';

export const getData = async () => {
  const res = await api.get('/endpoint');
  return res.data;
};
```

## State Management (Zustand)

```jsx
// store/myStore.js
import { create } from 'zustand';

const useMyStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export default useMyStore;
```

## Protected Route

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route element={<ProtectedRoute><Page /></ProtectedRoute>} />
```

## Toast Notifications

```jsx
import toast from 'react-hot-toast';

toast.success('Success!');
toast.error('Error!');
toast.loading('Loading...');
```

## Responsive Classes

```jsx
// Mobile first
className="text-sm md:text-base lg:text-lg"

// Hide on mobile
className="hidden md:block"

// Show on mobile only
className="block md:hidden"
```
