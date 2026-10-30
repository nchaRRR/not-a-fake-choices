// Tablets and iPads. CSS draws the UI a size up with `zoom`; this file handles the two things CSS
// can't: a centred play column in landscape (the 400×520 scene would otherwise be cropped to a
// strip), and converting screen rectangles back to CSS pixels under zoom.

// getBoundingClientRect is in screen pixels, style lengths are in zoomed CSS pixels. Measured, not
// assumed, because Chrome and Safari have treated zoom differently over the years.
export function uiScale() {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none';
  document.body.appendChild(d);
  const k = d.getBoundingClientRect().width / 100 || 1;
  d.remove();
  return k;
}

// The stage is 400×520; a column a bit wider than that keeps the whole scene in view.
const RATIO = 0.95;

export function layoutColumn() {
  const root = document.documentElement;
  // viewport in CSS pixels of the zoomed page (screen size divided by the measured zoom)
  const k = uiScale();
  const W = window.innerWidth / k, H = window.innerHeight / k;
  const choicesH = parseFloat(getComputedStyle(root).getPropertyValue('--choices-h')) || 178;
  const col = Math.round(Math.min(W, Math.max(360, (H - choicesH) * RATIO)));
  const wide = col < W - 40;
  root.classList.toggle('wide', wide);
  root.style.setProperty('--col-w', wide ? col + 'px' : '100%');
  root.style.setProperty('--col-x', wide ? Math.round((W - col) / 2) + 'px' : '0px');
}

export function watchLayout() {
  layoutColumn();
  addEventListener('resize', layoutColumn);
  addEventListener('orientationchange', () => setTimeout(layoutColumn, 250));
}
