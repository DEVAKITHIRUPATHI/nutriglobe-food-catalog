import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { reportWebVitals } from "./lib/vitals";

// Initialize Core Web Vitals telemetry monitoring
reportWebVitals();

// Register Service Worker for PWA Offline-First & Stale-While-Revalidate caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[NutriGlobe SW] Registered successfully with scope:', reg.scope);
    }).catch((err) => {
      console.warn('[NutriGlobe SW] Registration failed:', err);
    });
  });
}

// Render application wrapped in top-level Error Boundary Shield
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

