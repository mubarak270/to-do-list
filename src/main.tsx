import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatic Service Worker update, activation, and cache cleanup
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;

  // When the new service worker activates and claims the client, refresh cleanly to load new assets
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // Check for updates whenever the tab/app is opened or focused
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }
  });

  // Periodic check for new versions every 30 minutes
  setInterval(() => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.update();
    });
  }, 30 * 60 * 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
