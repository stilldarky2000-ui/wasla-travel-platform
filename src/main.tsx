import './preamble';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clean up any stale dev-sw.js workers and register standalone /sw.js
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          const scriptUrl = reg.active?.scriptURL || reg.installing?.scriptURL || '';
          if (scriptUrl.includes('dev-sw.js') || scriptUrl.includes('workbox')) {
            void reg.unregister();
          }
        }
      })
      .catch(() => {});
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Tier 1 Google Maps Demo Key quota detection (registered before Maps JS SDK loads)
const prevAuthFailure = (window as unknown as {gm_authFailure?: () => void}).gm_authFailure;
(window as unknown as {gm_authFailure?: () => void}).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  prevAuthFailure?.();
};

const origError = console.error;
console.error = (...args: unknown[]) => {
  if (
    args.some(
      (a) => typeof a === 'string' && /OverQuotaMapError|QuotaExceededError/.test(a)
    )
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
  origError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);


