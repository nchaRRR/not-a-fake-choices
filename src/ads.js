// Rewarded ads. In the phone app: Google AdMob (admob.js). In a browser, or when AdMob has no ad
// to show (new app, no fill, offline), a stand-in screen counts down and still pays out.
import { adPause } from './audio.js';
import { createAdMob } from './admob.js';

// AdMob rewarded units. These are Google's public TEST units until the Choices app is created in
// AdMob (AdMob → Apps → Add app); then put the real "ca-app-pub-…/…" ids here and the app ids in
// AndroidManifest.xml / Info.plist (GADApplicationIdentifier).
const UNITS = { android: 'ca-app-pub-3940256099942544/5224354917', ios: 'ca-app-pub-3940256099942544/1712485313' };
// true: Google's test ads. Keep it on while we test on our own phones; false for the store release.
export const ADS_TESTING = true;
// Interstitial (between levels) units: Google's TEST units until Choices has its own in AdMob.
const INTERSTITIAL = { android: 'ca-app-pub-3940256099942544/1033173712', ios: 'ca-app-pub-3940256099942544/4411468910' };
const admob = createAdMob(UNITS, { testing: ADS_TESTING, onPlaying: (on) => adPause(on), interstitial: INTERSTITIAL });
if (admob) admob.init();
export const adPrivacy = admob;

let busy = false;
let skipAds = () => false;
// "No ads" purchase: rewards arrive without the video.
export function setSkipAds(fn) { skipAds = fn; }

function standIn() {
  const box = document.getElementById('ad-overlay');
  const count = document.getElementById('ad-count');
  const secs = window.__adFast ? 0 : 3;
  adPause(true);
  box.hidden = false;
  return new Promise((done) => {
    let left = secs;
    count.textContent = left;
    const tick = () => {
      if (left <= 0) { box.hidden = true; adPause(false); done(true); return; }
      left--;
      count.textContent = left;
      setTimeout(tick, 1000);
    };
    setTimeout(tick, window.__adFast ? 10 : 1000);
  });
}

export async function showRewarded(placement) {
  if (busy) return false;
  if (skipAds()) return true;
  busy = true;
  let ok = false;
  try {
    if (admob) {
      const r = await admob.show();
      if (r.earned) ok = true;
      else if (r.unavailable) ok = await standIn();
    } else ok = await standIn();
  } finally {
    busy = false;
  }
  try { window.dispatchEvent(new CustomEvent('nfa-ad', { detail: { placement, ok } })); } catch (e) { /* old webview */ }
  return ok;
}
