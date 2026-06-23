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
    const msg = String(e.message || '').toLowerCase();
    if (
      !e.message ||
      msg.indexOf('script error') !== -1 ||
      msg.indexOf('resizeobserver') !== -1 ||
      msg.indexOf('loop limit') !== -1 ||
      msg.indexOf('loop completed') !== -1
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    console.warn('Intercepted main.tsx error event:', e.message || e);
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    const reasonMessage = e.reason ? (e.reason.message || String(e.reason)) : '';
    const msg = reasonMessage.toLowerCase();
    if (
      !e.reason ||
      msg.indexOf('script error') !== -1 ||
      msg.indexOf('resizeobserver') !== -1 ||
      msg.indexOf('loop limit') !== -1 ||
      msg.indexOf('loop completed') !== -1
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    console.warn('Intercepted main.tsx unhandled promise rejection:', reasonMessage);
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

