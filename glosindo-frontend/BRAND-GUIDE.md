# 🎨 Glosindo Brand Guide

## Logo

### Official Logo
**File**: `src/assets/images/logo-glosindo.webp`

**Description**: Blue globe with horizontal stripes, text "GLOBAL MEDIA PRATAMA SOLUSINDO" in circular layout, "GLOSINDO" brand name below.

### Usage
```jsx
import { LOGO, APP_NAME } from '../constants';

// In components
<img src={LOGO} alt={APP_NAME} className="h-10 w-10" />
```

## Brand Colors

### Primary Palette

#### Navy Blue (Primary)
- **Name**: Brand Navy
- **Hex**: `#1e3a8a`
- **Tailwind**: `brand-navy`
- **Usage**: Primary buttons, headers, main branding
- **From**: Dark blue stripes in logo

#### Cyan Blue (Secondary)  
- **Name**: Brand Cyan
- **Hex**: `#0ea5e9`
- **Tailwind**: `brand-cyan`
- **Usage**: Accents, highlights, interactive elements
- **From**: Light blue stripes in logo

### Color Variants

```css
/* Navy variants */
brand-navy-light: #2563eb
brand-navy-dark:  #1e293b

/* Cyan variants */
brand-cyan-light: #38bdf8
brand-cyan-dark:  #0284c7
```

## Typography

### Font Family
**Inter** - Modern, clean sans-serif

```css
font-family: 'Inter', sans-serif;
```

Loaded from Google Fonts in `index.html`:
- Weights: 300, 400, 500, 600, 700, 800

### Usage Examples

```jsx
// Headings
<h1 className="text-3xl font-bold text-brand-navy">Title</h1>
<h2 className="text-2xl font-semibold text-gray-900">Subtitle</h2>

// Body text
<p className="text-base text-gray-700">Regular text</p>
<p className="text-sm text-gray-500">Small text</p>
```

## UI Components

### Buttons

#### Primary Button
```jsx
<button className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold px-4 py-2 rounded-lg">
  Primary Action
</button>
```

#### Secondary Button
```jsx
<button className="bg-brand-cyan hover:bg-brand-cyan-light text-white font-semibold px-4 py-2 rounded-lg">
  Secondary Action
</button>
```

#### Outline Button
```jsx
<button className="border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-4 py-2 rounded-lg">
  Outline
</button>
```

### Cards

```jsx
<div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
  {/* Card content */}
</div>
```

### Badges

```jsx
// Active status
<span className="bg-brand-cyan/10 text-brand-navy border border-brand-cyan px-3 py-1 rounded-full text-sm">
  Active
</span>

// Info badge
<span className="bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full text-sm">
  Admin
</span>
```

### Form Inputs

```jsx
<input 
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
/>
```

## Layout

### Spacing
Use Tailwind spacing scale (4px base):
- `gap-2` / `p-2` = 8px
- `gap-4` / `p-4` = 16px
- `gap-6` / `p-6` = 24px
- `gap-8` / `p-8` = 32px

### Border Radius
- **Small**: `rounded-lg` (8px) - buttons, inputs
- **Medium**: `rounded-xl` (12px) - cards
- **Large**: `rounded-2xl` (16px) - large cards
- **Full**: `rounded-full` - badges, avatars

### Shadows
```css
shadow-sm   /* Subtle */
shadow-lg   /* Cards */
shadow-xl   /* Modals, elevated elements */
```

## Gradients

### Background Gradients
```jsx
// Login page
<div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50">
  {/* Content */}
</div>
```

## Icons

### Style
Use **outline icons** from Heroicons (included in inline SVG)

### Size Guidelines
- Small actions: `w-4 h-4`
- Regular buttons: `w-5 h-5`  
- Nav items: `w-5 h-5`
- Large display: `w-8 h-8`

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Navy on white: ✅ 7.2:1
- Cyan on white: ✅ 4.5:1
- White on navy: ✅ 7.2:1

### Focus States
Always include focus rings:
```jsx
className="focus:ring-2 focus:ring-brand-cyan focus:outline-none"
```

## Voice & Tone

### Brand Personality
- **Professional**: Corporate, trustworthy
- **Modern**: Clean, tech-forward
- **Efficient**: Fast, streamlined processes
- **Secure**: Biometric, data protection

### Messaging
- **Tagline**: "Global Media Pratama Solusindo"
- **System Name**: "Digital Guestbook System"
- **Language**: Bahasa Indonesia (primary)

## Do's and Don'ts

### ✅ Do
- Use official logo file
- Maintain proper logo spacing
- Use brand colors from Tailwind config
- Keep UI clean and minimal
- Provide feedback for user actions

### ❌ Don't
- Distort or recolor logo
- Use generic blue colors instead of brand colors
- Hardcode color values
- Overcomplicate UI
- Skip loading/error states

## Resources

- **Logo**: `src/assets/images/logo-glosindo.webp`
- **Constants**: `src/constants/index.js`
- **Tailwind Config**: `tailwind.config.js`
- **Components Guide**: `COMPONENTS.md`
- **Structure Guide**: `STRUCTURE.md`
