import { appState } from './state.js';

const SESSION_KEY = 'ledger_ui_v1';
/** 跨關閉分頁／重新開啟瀏覽器仍保留：上次頁籤與行程 */
const LAST_ROUTE_KEY = 'ledger_last_route_v1';

const VALID_PERIODS = new Set(['week', 'month', 'year']);

/**
 * 寫入 sessionStorage（同分頁重新整理：含捲動）並同步寫入 localStorage（下次開啟仍回到該頁）。
 */
export function persistSessionSnapshot() {
  const payload = {
    v: 1,
    page: appState.currentPage,
    tripId: appState.currentTripId,
    scrollY: window.scrollY,
    analysisPeriod: appState.analysisPeriod,
  };
  const lastRoute = {
    v: 1,
    page: appState.currentPage,
    tripId: appState.currentTripId,
    analysisPeriod: appState.analysisPeriod,
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
  try {
    localStorage.setItem(LAST_ROUTE_KEY, JSON.stringify(lastRoute));
  } catch {
    /* quota / private mode */
  }
}

export function readSessionSnapshot() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 上次開啟的頁面（無捲動資訊）；新分頁或關閉後再開時使用 */
export function readLastRouteFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LAST_ROUTE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {ReturnType<typeof readSessionSnapshot>} s
 */
export function applyAnalysisPeriodFromSnapshot(s) {
  if (!s || typeof s.analysisPeriod !== 'string') return;
  if (VALID_PERIODS.has(s.analysisPeriod)) appState.analysisPeriod = s.analysisPeriod;
}
