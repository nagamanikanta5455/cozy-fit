import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// One-time cleanup to unregister all legacy service workers and clear Cache Storage
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
    } catch {
      // Ignore errors during service worker cleanup
    }
  }

  if ('caches' in window) {
    try {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {});
        }
      }).catch(() => {});
    } catch {
      // Ignore errors during cache cleanup
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);
