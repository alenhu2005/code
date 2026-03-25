import { loadData } from './api.js';
import { render } from './render-registry.js';

const THRESHOLD = 68;
const MAX_PULL = 140;

let startY = 0;
let pulling = false;
let refreshing = false;

export function initPullToRefresh() {
  const indicator = document.getElementById('pull-indicator');
  const app = document.getElementById('app');
  if (!indicator || !app) return;

  document.addEventListener('touchstart', e => {
    if (refreshing) return;
    if (window.scrollY > 5) return;
    startY = e.touches[0].clientY;
    pulling = true;
    app.style.transition = 'none';
    indicator.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!pulling || refreshing) return;
    const dy = Math.max(0, e.touches[0].clientY - startY);
    if (dy === 0) return;

    const dampened = dy < THRESHOLD ? dy : THRESHOLD + (dy - THRESHOLD) * 0.35;
    const progress = Math.min(dampened / THRESHOLD, 1.6);
    const translate = Math.round(Math.min(dampened, MAX_PULL));

    app.style.transform = `translateY(${translate}px)`;
    indicator.style.transform = `translateY(${translate}px)`;
    indicator.style.opacity = String(Math.min(progress, 1));
    indicator.classList.add('pull-indicator--visible');

    const iconEl = indicator.querySelector('.pull-indicator-icon');
    if (iconEl) iconEl.style.transform = `rotate(${Math.round(progress * 540)}deg)`;
  }, { passive: true });

  const animateBack = () => {
    app.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1)';
    indicator.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1), opacity .3s ease';
    app.style.transform = '';
    indicator.style.transform = '';
    indicator.style.opacity = '0';
    const iconEl = indicator.querySelector('.pull-indicator-icon');
    if (iconEl) iconEl.style.transform = '';
    setTimeout(() => {
      indicator.classList.remove('pull-indicator--visible', 'pull-indicator--refreshing');
      app.style.transition = '';
      indicator.style.transition = '';
    }, 380);
  };

  document.addEventListener('touchend', async () => {
    if (!pulling || refreshing) return;
    pulling = false;

    const current = parseFloat(app.style.transform.replace(/[^0-9.]/g, '')) || 0;
    if (current >= THRESHOLD * 0.75) {
      refreshing = true;
      indicator.classList.add('pull-indicator--refreshing');

      app.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
      indicator.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)';
      app.style.transform = `translateY(${THRESHOLD}px)`;
      indicator.style.transform = `translateY(${THRESHOLD}px)`;
      indicator.style.opacity = '1';

      const iconEl = indicator.querySelector('.pull-indicator-icon');
      if (iconEl) iconEl.style.transform = '';

      try {
        const unchanged = await loadData({ backgroundPoll: true });
        if (!unchanged) render();
      } catch { /* ignore */ }

      refreshing = false;
      animateBack();
    } else {
      animateBack();
    }
  });

  document.addEventListener('touchcancel', () => {
    if (pulling || refreshing) {
      pulling = false;
      refreshing = false;
      animateBack();
    }
  });
}
