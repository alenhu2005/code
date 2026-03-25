const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(panel) {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll(FOCUSABLE)).filter(el => {
    if (el.hasAttribute('disabled')) return false;
    return el.getClientRects().length > 0;
  });
}

/**
 * 為全螢幕 overlay 註冊：開啟時 focus 第一個可聚焦元素、Tab 循環、Esc 關閉。
 * @param {string} overlayId
 * @param {{ closeFn: () => void, panelSelector?: string }} opts
 */
export function registerOverlayFocusTrap(overlayId, opts) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  const panelSelector = opts.panelSelector || '.edit-dialog, .dialog, .backup-dialog';

  let prevFocus = null;
  let keyHandler = null;

  const onOpen = () => {
    if (!overlay.classList.contains('open')) return;
    if (keyHandler) {
      overlay.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    const panel = overlay.querySelector(panelSelector);
    prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const list = getFocusable(panel);
    if (list.length) list[0].focus();

    keyHandler = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        opts.closeFn();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusables = getFocusable(panel);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    overlay.addEventListener('keydown', keyHandler, true);
  };

  const onClose = () => {
    if (overlay.classList.contains('open')) return;
    if (keyHandler) {
      overlay.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    if (prevFocus && typeof prevFocus.focus === 'function') {
      try {
        prevFocus.focus();
      } catch {
        /* ignore */
      }
    }
    prevFocus = null;
  };

  const obs = new MutationObserver(() => {
    if (overlay.classList.contains('open')) onOpen();
    else onClose();
  });
  obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  if (overlay.classList.contains('open')) onOpen();
}
