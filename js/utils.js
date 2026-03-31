export function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now();
}

/** 使用者偏好減少動態效果（無障礙／省電） */
export function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Observe list items and reveal with stagger-friendly CSS (--record-i / --day-i etc.).
 * Call the returned cleanup (or root._scrollRevealCleanup) before replacing innerHTML.
 * @param {Element | null} root
 * @param {string} selector
 * @param {{ enabled?: boolean }} [opts]
 */
export function bindScrollReveal(root, selector, { enabled = true } = {}) {
  if (!root || typeof root.querySelectorAll !== 'function') return () => {};
  if (root._scrollRevealCleanup) {
    root._scrollRevealCleanup();
    root._scrollRevealCleanup = null;
  }
  root.removeAttribute('data-scroll-reveal');
  const items = root.querySelectorAll(selector);
  if (items.length === 0) return () => {};

  const markVisible = () => {
    items.forEach(el => {
      el.classList.remove('scroll-reveal-pending');
      el.classList.add('scroll-reveal-visible');
    });
  };

  if (!enabled || prefersReducedMotion()) {
    markVisible();
    return () => {};
  }

  items.forEach(el => {
    el.classList.add('scroll-reveal-pending');
    el.classList.remove('scroll-reveal-visible');
  });
  root.setAttribute('data-scroll-reveal', 'active');

  const io = new IntersectionObserver(
    entries => {
      for (const ent of entries) {
        if (!ent.isIntersecting) continue;
        const t = ent.target;
        t.classList.remove('scroll-reveal-pending');
        t.classList.add('scroll-reveal-visible');
        io.unobserve(t);
      }
    },
    { root: null, rootMargin: '56px 0px 72px 0px', threshold: 0.01 },
  );
  items.forEach(el => io.observe(el));

  const cleanup = () => {
    io.disconnect();
    root.removeAttribute('data-scroll-reveal');
    root._scrollRevealCleanup = null;
  };
  root._scrollRevealCleanup = cleanup;
  return cleanup;
}

/**
 * Uniform integer in [0, n). Uses crypto.getRandomValues with rejection sampling so
 * each outcome has probability 1/n (no modulo bias from Math.random).
 * Falls back to Math.floor(Math.random() * n) if crypto is unavailable.
 * @param {number} n
 */
export function randomUniformIndex(n) {
  const k = Math.floor(Number(n));
  if (!Number.isFinite(k) || k <= 0) return 0;
  if (k === 1) return 0;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const max = 0x100000000;
    const limit = Math.floor(max / k) * k;
    const buf = new Uint32Array(1);
    let x;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % k;
  }
  return Math.floor(Math.random() * k);
}

/** 一般色用 class；隱藏色用 --member-fg/bg（由 getMemberColor 依主題解析） */
export function memberToneClass(rare) {
  return rare ? '' : ' member-tone';
}

/** @param {{ fg: string, bg: string }} color — 一般／隱藏皆輸出，供字色與外框 */
export function memberToneVars(color, rare) {
  void rare;
  if (!color || color.fg == null || color.bg == null) return '';
  return `--member-fg:${color.fg};--member-bg:${color.bg}`;
}

export function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Safe embedding inside inline onclick="" */
export function jq(v) {
  return JSON.stringify(v);
}

export function jqAttr(v) {
  return jq(v).replace(/"/g, '&quot;');
}

export function parseArr(s) {
  try {
    const r = JSON.parse(s);
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
}

export function toast(msg) {
  const el = document.getElementById('toast-container');
  const div = document.createElement('div');
  div.className = 'toast-item';
  div.textContent = msg;
  el.appendChild(div);
  setTimeout(() => div.remove(), 3200);
}

/** AbortSignal.timeout fallback for older browsers */
export function abortSignalAfter(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}
