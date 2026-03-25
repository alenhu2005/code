/**
 * 使用者正在 #app 內編輯表單時，暫停背景 fetch 同步，避免打斷輸入或與送出競爭。
 */
export function isSyncPauseTarget(el) {
  if (!el || !(el instanceof Element)) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = (el.type || '').toLowerCase();
    if (
      ['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'hidden', 'range', 'color'].includes(
        type,
      )
    ) {
      return false;
    }
    return true;
  }
  return false;
}

export function syncPausedForUserInput() {
  const app = document.getElementById('app');
  const el = document.activeElement;
  return !!(app && el && app.contains(el) && isSyncPauseTarget(el));
}
