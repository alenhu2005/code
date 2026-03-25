import { loadData } from './api.js';
import { render } from './render-registry.js';

const THRESHOLD = 68;
const MAX_PULL = 120;

let startY = 0;
let pulling = false;
let refreshing = false;

export function initPullToRefresh() {
  const indicator = document.getElementById('pull-indicator');
  if (!indicator) return;

  document.addEventListener('touchstart', e => {
    if (refreshing) return;
    if (window.scrollY > 5) return;
    startY = e.touches[0].clientY;
    pulling = true;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!pulling || refreshing) return;
    const dy = Math.max(0, e.touches[0].clientY - startY);
    if (dy === 0) return;
    const progress = Math.min(dy / MAX_PULL, 1);
    const translate = Math.round(progress * THRESHOLD);
    indicator.style.transform = `translateY(${translate}px)`;
    indicator.style.opacity = String(Math.min(progress * 1.5, 1));
    const iconEl = indicator.querySelector('.pull-indicator-icon');
    if (iconEl) iconEl.style.transform = `rotate(${Math.round(progress * 360)}deg)`;
    if (dy > 10) {
      indicator.classList.add('pull-indicator--visible');
    }
  }, { passive: true });

  const reset = () => {
    pulling = false;
    indicator.style.transform = '';
    indicator.style.opacity = '0';
    const iconEl = indicator.querySelector('.pull-indicator-icon');
    if (iconEl) iconEl.style.transform = '';
    setTimeout(() => {
      indicator.classList.remove('pull-indicator--visible', 'pull-indicator--refreshing');
    }, 250);
  };

  document.addEventListener('touchend', async () => {
    if (!pulling || refreshing) return;
    const currentTranslate = parseFloat(indicator.style.transform.replace(/[^0-9.]/g, '')) || 0;
    if (currentTranslate >= THRESHOLD * 0.8) {
      refreshing = true;
      indicator.classList.add('pull-indicator--refreshing');
      indicator.style.transform = `translateY(${THRESHOLD}px)`;
      indicator.style.opacity = '1';
      try {
        const unchanged = await loadData({ backgroundPoll: true });
        if (!unchanged) render();
      } catch { /* ignore */ }
      refreshing = false;
      reset();
    } else {
      reset();
    }
  });

  document.addEventListener('touchcancel', () => {
    if (pulling) reset();
  });
}
