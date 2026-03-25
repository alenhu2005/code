/**
 * 產生短字串供試算表／日誌一欄顯示（非精確型號，僅從 UA／Client Hints 推斷）。
 * 例：手機 · iOS 17.2 · Safari 17 ｜ 手機 · Android 14 · SM-G991B · Chrome 124 ｜ 電腦 · Windows · Edge 120
 */

function browserLabel(ua) {
  if (/Edg\//i.test(ua)) {
    const m = ua.match(/Edg\/([\d.]+)/);
    return m ? `Edge ${m[1]}` : 'Edge';
  }
  if (/CriOS\/([\d.]+)/i.test(ua)) {
    const m = ua.match(/CriOS\/([\d.]+)/i);
    return m ? `Chrome ${m[1]}` : 'Chrome';
  }
  if (/Chrome\/([\d.]+)/i.test(ua) && !/Edg\//i.test(ua)) {
    const m = ua.match(/Chrome\/([\d.]+)/i);
    return m ? `Chrome ${m[1]}` : 'Chrome';
  }
  if (/Firefox\/([\d.]+)/i.test(ua)) {
    const m = ua.match(/Firefox\/([\d.]+)/i);
    return m ? `Firefox ${m[1]}` : 'Firefox';
  }
  if (/Safari/i.test(ua) && !/Chrome|CriOS|Edg/i.test(ua)) {
    const m = ua.match(/Version\/([\d.]+)/i);
    return m ? `Safari ${m[1]}` : 'Safari';
  }
  return '瀏覽器';
}

function osLabel(ua) {
  if (/iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS ([\d_]+)/i);
    return m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
  }
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/i);
    return m ? `Android ${m[1]}` : 'Android';
  }
  if (/Win64|Windows NT/i.test(ua)) {
    const m = ua.match(/Windows NT ([\d.]+)/i);
    if (m) {
      const v = m[1];
      if (v === '10.0') return 'Windows 10/11';
      return `Windows ${v}`;
    }
    return 'Windows';
  }
  if (/Mac OS X/i.test(ua)) {
    const m = ua.match(/Mac OS X ([\d_]+)/i);
    return m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
  }
  if (/Linux/i.test(ua)) return 'Linux';
  return '系統';
}

function kindLabel(ua) {
  if (/iPad/i.test(ua)) return '平板';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return '手機';
  return '電腦';
}

/**
 * @returns {Promise<string>}
 */
export async function getClientDeviceSummary() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const parts = [kindLabel(ua), osLabel(ua), browserLabel(ua)];

  try {
    const uad = navigator.userAgentData;
    if (uad?.getHighEntropyValues) {
      const h = await uad.getHighEntropyValues(['model']);
      if (h.model && String(h.model).trim()) {
        parts.splice(2, 0, String(h.model).trim());
      }
    }
  } catch {
    /* ignore */
  }

  return parts.join(' · ');
}
