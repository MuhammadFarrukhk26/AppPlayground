import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Safeguard against benign ResizeObserver loop errors and cross-origin script errors in sandboxed frames
if (typeof window !== 'undefined') {
  let safeHost = '';
  try {
    safeHost = window.location && window.location.host ? window.location.host : '';
  } catch (e) {}

  window.addEventListener('error', (e) => {
    console.warn('Intercepted main.tsx error event:', e.message || e, 'Filename:', e.filename);
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    const reasonMessage = e.reason ? (e.reason.message || String(e.reason)) : 'unknown';
    console.warn('Intercepted main.tsx unhandled promise rejection:', reasonMessage);
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

