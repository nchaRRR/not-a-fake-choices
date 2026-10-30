// Rewarded ads. For now a stand-in screen that counts down and then pays out; the AdMob
// plugin goes in when the phone shells are made (same pattern as Tower).
import { adPause } from './audio.js';

export const ADS_TESTING = true;
let busy = false;

export function showRewarded(placement) {
  if (busy) return Promise.resolve(false);
  busy = true;
  const box = document.getElementById('ad-overlay');
  const count = document.getElementById('ad-count');
  const secs = window.__adFast ? 0 : 3;
  adPause(true);
  box.hidden = false;
  return new Promise((done) => {
    let left = secs;
    count.textContent = left;
    const tick = () => {
      if (left <= 0) {
        box.hidden = true;
        adPause(false);
        busy = false;
        done(true);
        return;
      }
      left--;
      count.textContent = left;
      setTimeout(tick, 1000);
    };
    setTimeout(tick, window.__adFast ? 10 : 1000);
  }).then((ok) => {
    try { window.dispatchEvent(new CustomEvent('nfa-ad', { detail: { placement, ok } })); } catch (e) { /* old webview */ }
    return ok;
  });
}
