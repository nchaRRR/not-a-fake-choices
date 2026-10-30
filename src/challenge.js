// "Challenge a friend": an Endless run is fully decided by its seed, so a seed plus a score is a
// fair race. The code travels as a link (nimoriq.com/c/ opens the app or the store) and can also be
// typed in. Code = seed.score.check in base 36; the check stops typos from starting a wrong run.
import { nativeCall, nativeListen } from './cloud.js';

const LINK = 'https://nimoriq.com/c/?g=choices&c=';
const SCHEME = 'com.nimoriq.nfachoices://challenge';

const check = (seed, score) => ((seed * 31 + score * 7 + 11) % 1295).toString(36).padStart(2, '0');

export function encode(seed, score) {
  return `${(seed >>> 0).toString(36)}-${score.toString(36)}-${check(seed >>> 0, score)}`.toUpperCase();
}

export function decode(text) {
  const m = String(text || '').trim().toLowerCase().match(/([0-9a-z]{1,8})-([0-9a-z]{1,3})-([0-9a-z]{2})\s*$/);
  if (!m) return null;
  const seed = parseInt(m[1], 36), score = parseInt(m[2], 36);
  if (!Number.isFinite(seed) || !Number.isFinite(score) || check(seed, score) !== m[3]) return null;
  return { seed, score };
}

export const linkFor = (code) => LINK + encodeURIComponent(code);

// Share the link as text: system share sheet in the app, Web Share in browsers, clipboard last.
export async function shareText(text, url) {
  const P = (window.Capacitor && window.Capacitor.Plugins) || {};
  try {
    if (P.Share) { await P.Share.share({ text, url, dialogTitle: 'Not a Fake Ad' }); return 'native'; }
  } catch (e) { if (/cancel/i.test(String(e && e.message || e))) return 'cancel'; }
  try {
    if (navigator.share) { await navigator.share({ text, url }); return 'web'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }
  try { await navigator.clipboard.writeText(text + ' ' + url); return 'copied'; } catch (e) { return 'fail'; }
}

// Calls back with a code when the game was opened from a challenge link (app link, launch url or ?c=).
export function listenForChallenges(cb) {
  const take = (url) => {
    const s = String(url || '');
    if (!s.startsWith(SCHEME) && !s.includes('/c/') && !s.includes('?c=') && !s.includes('&c=')) return;
    const m = s.match(/[?&]c=([^&#]+)/);
    const c = m && decode(decodeURIComponent(m[1]));
    if (c) cb(c);
  };
  try { take(location.href); } catch (e) { /* no location */ }
  nativeCall('App', 'getLaunchUrl').then((r) => r && take(r.url)).catch(() => {});
  nativeListen('App', 'appUrlOpen', (e) => take(e && e.url));
}
