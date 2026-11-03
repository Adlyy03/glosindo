import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register PWA Service Worker for Offline & Kiosk Resiliency
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ PWA Service Worker aktif! Scope:', registration.scope);
      })
      .catch((err) => {
        console.log('ℹ️ Catatan PWA Service Worker:', err.message);
      });
  });
}
