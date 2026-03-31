import { appState } from './state.js';

const OVERLAY_OUT_MS = 280;

function finishDialogClose(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.classList.remove('closing');
  if (overlay._closingT) {
    clearTimeout(overlay._closingT);
    overlay._closingT = null;
  }
}

export function showConfirm(title, desc) {
  return new Promise(resolve => {
    appState._dlgResolve = resolve;
    document.getElementById('dlg-title').textContent = title;
    document.getElementById('dlg-desc').textContent = desc;
    document.getElementById('dlg-ok').onclick = () => {
      closeDialog();
      resolve(true);
    };
    const ov = document.getElementById('dialog-overlay');
    ov.classList.remove('closing');
    if (ov._closingT) {
      clearTimeout(ov._closingT);
      ov._closingT = null;
    }
    ov.classList.add('open');
  });
}

export function cancelDialog() {
  closeDialog();
  if (appState._dlgResolve) {
    appState._dlgResolve(false);
    appState._dlgResolve = null;
  }
}

export function closeDialog() {
  const overlay = document.getElementById('dialog-overlay');
  if (!overlay || !overlay.classList.contains('open') || overlay.classList.contains('closing')) return;
  if (overlay._closingT) clearTimeout(overlay._closingT);
  overlay.classList.add('closing');
  overlay._closingT = setTimeout(() => {
    finishDialogClose(overlay);
  }, OVERLAY_OUT_MS);
}

/** 單鍵提示（會蓋在畫面上直到使用者按下知道了） */
export function showAlert(title, desc) {
  return new Promise(resolve => {
    const overlay = document.getElementById('alert-overlay');
    const okBtn = document.getElementById('alert-dlg-ok');
    document.getElementById('alert-dlg-title').textContent = title;
    document.getElementById('alert-dlg-desc').textContent = desc;
    const done = () => {
      if (!overlay.classList.contains('open') || overlay.classList.contains('closing')) return;
      if (overlay._closingT) clearTimeout(overlay._closingT);
      overlay.classList.add('closing');
      overlay._closingT = setTimeout(() => {
        finishDialogClose(overlay);
        overlay.onclick = null;
        okBtn.onclick = null;
        resolve();
      }, OVERLAY_OUT_MS);
    };
    overlay.onclick = e => {
      if (e.target === overlay) done();
    };
    okBtn.onclick = () => done();
    overlay.classList.remove('closing');
    if (overlay._closingT) {
      clearTimeout(overlay._closingT);
      overlay._closingT = null;
    }
    overlay.classList.add('open');
    okBtn.focus();
  });
}
