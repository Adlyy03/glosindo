/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Glosindo logo
        brand: {
          navy: '#1e3a8a',      // Dark blue from logo
          'navy-light': '#2563eb',
          'navy-dark': '#1e293b',
          cyan: '#0ea5e9',      // Cyan from logo
          'cyan-light': '#38bdf8',
          'cyan-dark': '#0284c7',
        },
        // Keep as aliases for compatibility
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0ea5e9',      // Cyan from logo
          600: '#2563eb',      // Navy from logo
          700: '#1e3a8a',      // Dark navy from logo
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
