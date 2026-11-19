// Must be imported first in src/main.tsx (plain .ts file, no JSX)
// Guarantees @vitejs/plugin-react preamble globals are present before any JSX module evaluates.

if (typeof window !== 'undefined') {
  const win = window as unknown as {
    $RefreshReg$?: () => void;
    $RefreshSig$?: () => <T>(type: T) => T;
    __vite_plugin_react_preamble_installed__?: boolean;
  };

  if (!win.$RefreshReg$) {
    win.$RefreshReg$ = () => {};
  }
  if (!win.$RefreshSig$) {
    win.$RefreshSig$ = () => (type) => type;
  }
  win.__vite_plugin_react_preamble_installed__ = true;

  // Purge any stale Workbox precaches from earlier dev-sw registrations
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          if (key.includes('workbox') || key.includes('precache')) {
            void caches.delete(key);
          }
        }
      })
      .catch(() => {});
  }
}

export {};
