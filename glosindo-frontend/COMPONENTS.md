# 🧩 Component Library Documentation

## Brand Constants

### Import Usage
```jsx
import { LOGO, APP_NAME, APP_FULL_NAME, COLORS } from '../constants';
```

### Available Constants
```js
LOGO          // "/src/assets/images/logo-glosindo.webp"
APP_NAME      // "GLOSINDO"
APP_FULL_NAME // "Global Media Pratama Solusindo"

COLORS.brand  // {
  navy: '#1e3a8a',
  navyLight: '#2563eb',
  navyDark: '#1e293b',
  cyan: '#0ea5e9',
  cyanLight: '#38bdf8',
  cyanDark: '#0284c7'
}
```

## Tailwind Brand Classes

### Colors
```jsx
// Background
bg-brand-navy
bg-brand-cyan
bg-brand-navy-light
bg-brand-cyan-light

// Text
text-brand-navy
text-brand-cyan

// Border
border-brand-navy
border-brand-cyan

// Ring (focus states)
ring-brand-cyan
focus:ring-brand-cyan
```

### Example Usage
```jsx
// Primary button
<button className="bg-brand-navy hover:bg-brand-navy-light text-white">
  Submit
</button>

// Input with brand focus
<input className="focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan" />

// Badge
<span className="bg-brand-cyan/10 text-brand-navy border border-brand-cyan">
  Active
</span>
```

## Layout Components

### DashboardLayout
Main dashboard wrapper with navbar and sidebar.

```jsx
import DashboardLayout from '../layouts/DashboardLayout';

// In App.jsx routing
<Route element={<DashboardLayout />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/visitors" element={<VisitorListPage />} />
</Route>
```

## Core Components

### Navbar
Top navigation bar with hamburger menu, logo, user info, and logout.

**Props:**
- `onToggleSidebar` (function): Callback to toggle sidebar

```jsx
<Navbar onToggleSidebar={toggleSidebar} />
```

### Sidebar
Collapsible sidebar with role-based navigation menu.

**Props:**
- `isOpen` (boolean): Sidebar visibility state
- `onClose` (function): Callback to close sidebar

```jsx
<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
```

### ProtectedRoute
Route wrapper for authentication check.

**Props:**
- `children` (ReactNode): Protected page content

```jsx
<Route element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

### StatCard
Dashboard statistic card component.

**Usage:**
```jsx
<StatCard
  title="Total Tamu"
  value="156"
  icon={<UserIcon />}
  color="blue"
  trend="+12%"
/>
```

### VisitorTable
Data table for displaying visitor list.

**Usage:**
```jsx
<VisitorTable
  data={visitors}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Face Recognition Components

### FaceScanner
Facial recognition scanner using face-api.js.

**Props:**
- `onDetect` (function): Callback when face detected
- `onError` (function): Error callback

```jsx
<FaceScanner
  onDetect={(descriptor) => console.log('Face detected', descriptor)}
  onError={(err) => toast.error(err.message)}
/>
```

### WebcamCapture
Webcam capture component for check-in photos.

**Props:**
- `onCapture` (function): Callback with captured image data
- `width` (number): Camera width
- `height` (number): Camera height

```jsx
<WebcamCapture
  onCapture={(imageSrc) => setPhoto(imageSrc)}
  width={640}
  height={480}
/>
```

### SplashOverlay
Loading splash screen overlay.

**Props:**
- `visible` (boolean): Show/hide overlay
- `message` (string): Loading message

```jsx
<SplashOverlay visible={loading} message="Memuat data..." />
```

## Design Patterns

### Color Usage Guidelines

1. **Primary Actions**: Use `brand-navy`
2. **Secondary/Info**: Use `brand-cyan`
3. **Hover States**: Use lighter variants (`brand-navy-light`, `brand-cyan-light`)
4. **Backgrounds**: Use opacity variants (`bg-brand-cyan/10`)

### Component File Structure
```jsx
// Imports
import { useState } from 'react';
import { LOGO, APP_NAME } from '../constants';

// Component
const MyComponent = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(null);

  // Handlers
  const handleClick = () => {
    // logic
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

// Export
export default MyComponent;
```

## Best Practices

1. **Always import brand constants** instead of hardcoding colors/logos
2. **Use Tailwind classes** for styling (avoid inline styles)
3. **Extract reusable logic** into custom hooks
4. **Keep components small** and focused on single responsibility
5. **Use semantic HTML** for accessibility
6. **Add proper ARIA labels** for screen readers
7. **Handle loading and error states** gracefully
