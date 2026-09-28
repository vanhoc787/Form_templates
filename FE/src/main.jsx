import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Avoid layout jump on mobile when the on-screen keyboard appears by
// calculating a CSS variable --vh from window.innerHeight and using it
// instead of 100vh in styles. This helps keep layout stable on mobile/tablet.
function setVh(value) {
  const v = typeof value === 'number' ? value : window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${v * 0.01}px`);
}

// Auto-detect mobile-ish environments. If running on a small touch device
// we lock the viewport height by default so on-screen keyboards won't
// resize the layout. Consumers may still override by setting
// window.__KB_LOCK_VH = false
const isTouch = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
const smallScreen = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : false;
const lockVh = typeof window !== 'undefined' && (Boolean(window.__KB_LOCK_VH) || (isTouch && smallScreen));

if (lockVh) {
  // set once to the current innerHeight and do not attach dynamic listeners
  setVh(window.innerHeight);
  try { console.debug('[main] --vh locked (mobile) at', window.innerHeight); } catch { /* ignore */ }
} else {
  // Recalculate on common events, but guard inside handler to avoid
  // changing --vh if some component later requests a lock.
  const handle = () => {
    if (typeof window !== 'undefined' && window.__KB_LOCK_VH) return;
    setVh();
  };
  window.addEventListener('resize', handle);
  window.addEventListener('orientationchange', handle);
  window.addEventListener('focusin', handle);
  window.addEventListener('focusout', handle);
  // initial set
  setVh();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
