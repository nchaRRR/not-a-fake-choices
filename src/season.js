// Seasons. Christmas runs Dec 1 – Jan 6 on the player's own clock. Remote config can force it on
// ('xmas') or off ('off') for everyone; tests force it with window.__season.
export function seasonNow(remote, date = new Date()) {
  const forced = typeof window !== 'undefined' && window.__season;
  if (forced) return forced === 'off' ? '' : forced;
  const r = remote && remote.get ? remote.get('season', '') : '';
  if (r === 'off') return '';
  if (r === 'xmas') return 'xmas';
  const m = date.getMonth(), d = date.getDate();
  return (m === 11) || (m === 0 && d <= 6) ? 'xmas' : '';
}

// Falling snow and a string of lights for the menus. Built once, shown with html.xmas.
export function buildSnow() {
  if (document.getElementById('snow')) return;
  const s = document.createElement('div');
  s.id = 'snow';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = Array.from({ length: 28 }, (_, i) => {
    const x = (i * 37) % 100, d = 6 + (i % 5) * 1.6, delay = -((i * 1.3) % d), size = 6 + (i % 4) * 3;
    return `<i style="left:${x}%;width:${size}px;height:${size}px;animation-duration:${d}s,${d / 2}s;animation-delay:${delay}s,${delay}s"></i>`;
  }).join('');
  document.body.appendChild(s);
}

export function garland() {
  const colors = ['#e8453c', '#ffd34d', '#2eb872', '#2f7cf6', '#ff9ac8'];
  const n = 13;
  const bulbs = Array.from({ length: n }, (_, i) => {
    const x = 10 + i * (380 / (n - 1));
    const y = 14 + Math.sin((i / (n - 1)) * Math.PI) * 18;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect x="-3" y="-4" width="6" height="6" fill="#2b2140"/><ellipse class="bulb" style="animation-delay:${(i % 3) * 0.4}s" cy="8" rx="6" ry="9" fill="${colors[i % colors.length]}" stroke="#2b2140" stroke-width="2.5"/></g>`;
  }).join('');
  return `<svg class="garland" viewBox="0 0 400 50" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q200 50 400 10" fill="none" stroke="#2e7d4a" stroke-width="5"/>${bulbs}</svg>`;
}
