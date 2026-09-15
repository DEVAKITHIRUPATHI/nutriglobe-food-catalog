import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { reportWebVitals } from "./lib/vitals";

// Global Window-Level Error Handlers for Live Preview Diagnostics
window.addEventListener('error', (event) => {
  console.error('[NutriGlobe Window Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[NutriGlobe Unhandled Promise Rejection]', {
    reason: event.reason
  });
});

// Dependency resolution diagnostic check during mount
(() => {
  try {
    const reactOk = typeof React !== 'undefined' && typeof React.useState === 'function';
    if (!reactOk) console.warn('[NutriGlobe Diagnostics] React not detected properly');
  } catch (err) {
    console.error('[NutriGlobe Diagnostics] React check error:', err);
  }
})();

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

// Ensure mount point exists and render
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('[NutriGlobe Mount Error] Root container #root not found in DOM!');
} else {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}


