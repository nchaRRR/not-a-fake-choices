// Every danger the hero can be in. Each one draws its scene, names the tool that saves him and
// gives every wrong tool its own (comic) ending. Scene coordinates: 400 x 520, ground near y 430.
// The ctx passed in comes from main.js: layer, hero, T (tween), wait, tool(), puff(), helpers.
import { el, g, place, setFace, setArms, paintHero } from './art.js';
import { PACK_HAZARDS, PACK_AMB } from './packs.js';

const INK = '#2b2140';
const q = (ctx, cls) => ctx.layer.querySelector('.' + cls);

// little helpers used by many scenes
const sky = (top, bottom, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="520" fill="url(#${id})"/>`;
const ground = (color, y = 430) => `<rect y="${y}" width="400" height="${520 - y}" fill="${color}"/><rect y="${y}" width="400" height="8" fill="${INK}" opacity="0.15"/>`;
const flame = (x, y, s = 1, cls = '') => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 C-26 -30 -24 0 0 4 C24 0 26 -30 0 -60 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="4"/><path d="M0 -30 C-10 -18 -10 -4 0 -2 C10 -4 10 -18 0 -30 Z" fill="#ffd34d"/></g>`;

// scenery and character helpers (decoration only; nothing here is queried by the game logic)
const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
const S4 = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
// two bands of far hills sitting on the ground line
const hills = (far, near, y = 430) => `<path d="M0 ${y} V${y - 74} Q50 ${y - 126} 120 ${y - 92} T250 ${y - 104} T400 ${y - 80} V${y} Z" fill="${far}" stroke="${INK}" stroke-width="3" stroke-opacity="0.3"/><path d="M0 ${y} V${y - 34} Q90 ${y - 74} 180 ${y - 40} T340 ${y - 50} T400 ${y - 40} V${y} Z" fill="${near}" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>`;
const pine = (x, y, s = 1, c = '#2e7d4a', snow = '') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-14" width="10" height="16" fill="#6b3f22" ${S3}/><path d="M0 -92 L-24 -48 h10 L-32 -14 h64 L14 -48 h10 Z" fill="${c}" ${S3}/>${snow ? `<path d="M0 -92 L-12 -70 q6 4 12 0 q6 4 12 0 Z M-18 -48 q9 5 18 0 q9 5 18 0 l-4 -8 h-28 Z" fill="${snow}"/>` : ''}</g>`;
const bush = (x, y, c = '#3f9a4a', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" ${S3}><circle cx="-16" cy="-12" r="14"/><circle cx="16" cy="-12" r="14"/><circle cy="-22" r="18"/><path d="M-26 0 h52" stroke-width="3"/></g>`;
const stone = (x, y, s = 1, c = '#9aa0b0') => `<path transform="translate(${x} ${y}) scale(${s})" d="M-20 0 C-22 -14 -10 -22 2 -20 C14 -22 22 -10 20 0 Z" fill="${c}" ${S3}/>`;
const tomb = (x, y, s = 1, c = '#8a8698') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 v-46 q0 -22 22 -22 q22 0 22 22 v46 Z" fill="${c}" ${S4}/><path d="M-10 -40 h20 M0 -52 v26" stroke="${INK}" stroke-width="4" opacity="0.5"/><path d="M-16 -10 l6 -8 l4 6 M8 -6 l8 -10" stroke="${INK}" stroke-width="2" fill="none" opacity="0.4"/></g>`;
const deadTree = (x, y, s = 1, c = '#3a2a3a') => `<path transform="translate(${x} ${y}) scale(${s})" d="M-8 0 L-6 -70 L-30 -100 M-6 -70 L-4 -110 L-20 -140 M-4 -110 L12 -136 M-5 -84 L22 -104 L30 -96" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
// a cartoon eye: white, pupil, highlight (+ an eyelid that idle() can flash for a blink)
const eye = (x, y, r = 6, lidCls = '', lid = '#fff') => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${x - r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="${INK}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.2}" r="${r * 0.22}" fill="#fff"/>` +
  (lidCls ? `<g class="${lidCls}" opacity="0"><circle cx="${x}" cy="${y}" r="${r + 0.5}" fill="${lid}" stroke="${INK}" stroke-width="2.5"/><path d="M${x - r} ${y} q${r} ${r * 0.6} ${r * 2} 0" fill="none" stroke="${INK}" stroke-width="2.5"/></g>` : '');
const blink = (t, off = 0) => t !== 3 && (t + off) % 3.4 > 3.24;
const setLids = (ctx, cls, on) => ctx.layer.querySelectorAll('.' + cls).forEach((n) => n.setAttribute('opacity', on ? 1 : 0));
const spin = (ctx, cls, tf) => { const n = q(ctx, cls); if (n) n.setAttribute('transform', tf); };
// the vampire's body (shared by the graveyard and the sunny-room vampires)
const VAMP = `<path d="M-46 0 L-30 -100 L30 -100 L46 0 Z" fill="#1a1a24" stroke="${INK}" stroke-width="4"/><path d="M-40 -4 L-27 -96 L-17 -96 L-24 -4 Z M40 -4 L27 -96 L17 -96 L24 -4 Z" fill="#9b1c2c"/>
  <path d="M-14 -100 L0 -46 L14 -100 Z" fill="#f6f8ff" ${S3}/><path d="M-7 -98 l7 5 l7 -5 v8 l-7 -4 l-7 4 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="2"/><circle cy="-70" r="5" fill="#ffd34d" ${S3}/>
  <path d="M-46 -100 L-60 -140 L-20 -110 Z M46 -100 L60 -140 L20 -110 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="4"/><path d="M-22 -126 l-12 -14 l4 22 Z M22 -126 l12 -14 l-4 22 Z" fill="#d8d8e8" ${S3}/>
  <circle cy="-124" r="24" fill="#d8d8e8" stroke="${INK}" stroke-width="4"/><path d="M12 -142 a22 22 0 0 1 4 32 a24 24 0 0 0 -4 -32 Z" fill="#b8b8cc"/><path d="M-24 -134 q24 -24 48 0 L0 -126 Z" fill="#1a1a24"/>
  <path d="M-17 -133 l10 5 M17 -133 l-10 5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="-9" cy="-124" r="4" fill="#e8453c"/><circle cx="9" cy="-124" r="4" fill="#e8453c"/><circle cx="-10" cy="-125.5" r="1.3" fill="#fff"/><circle cx="8" cy="-125.5" r="1.3" fill="#fff"/>
  <path d="M-9 -111 q9 4 18 0" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M-6 -110 l3 6 l3 -6 M2 -110 l3 6 l3 -6" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
const bat = (cls) => `<g class="${cls}"><ellipse rx="6" ry="5" fill="#1a1424"/><path class="wing" d="M-4 -2 q-10 -10 -20 -2 q6 0 6 6 q-6 -4 -10 2 Z M4 -2 q10 -10 20 -2 q-6 0 -6 6 q6 -4 10 2 Z" fill="#1a1424"/><circle cx="-2" cy="-1" r="1.2" fill="#ff6f5e"/><circle cx="2" cy="-1" r="1.2" fill="#ff6f5e"/></g>`;
const flyBat = (ctx, cls, t, cx, cy, rx, ry, sp) => { const b = q(ctx, cls); if (!b) return; b.setAttribute('transform', `translate(${(cx + Math.cos(t * sp) * rx).toFixed(1)} ${(cy + Math.sin(t * sp * 2) * ry).toFixed(1)}) scale(1 ${(0.5 + Math.abs(Math.sin(t * 12)) * 0.6).toFixed(2)})`); };

export const HAZARDS = {
  // ---------------------------------------------------------------- 1. hanging over lava
  lava: {
    correct: 'water',
    wrong: { gasoline: 'flare', sword: 'cut', fan: 'flare' },
    bg: () => sky('#3a1e2e', '#7a2e1e', 'lv') + `
      <defs><radialGradient id="lvglow" cx="50%" cy="85%" r="65%"><stop offset="0" stop-color="#ffbe2e" stop-opacity="0.45"/><stop offset="1" stop-color="#ff6a1e" stop-opacity="0"/></radialGradient></defs><rect width="400" height="520" fill="url(#lvglow)"/>
      <path d="M0 60 C70 140 40 220 80 300 C100 360 60 400 70 430 H0 Z M400 60 C320 120 350 200 322 270 C300 330 350 380 340 430 H400 Z" fill="#2b1a22" stroke="${INK}" stroke-width="4"/>
      <path d="M30 140 l14 20 l-6 18 l12 16 M368 180 l-14 18 l8 16 l-10 20 M50 330 l10 16 l-4 14 M352 330 l-8 14 l6 12" fill="none" stroke="#ff8a2e" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
      <path d="M40 300 q30 -8 60 0 v10 h-60 Z M300 250 q26 -10 52 0 v10 h-52 Z" fill="#4a2a2e" ${S3}/>
      <g transform="translate(76 300)"><circle r="9" fill="#f6efe0" ${S3}/><circle cx="-3" cy="0" r="2.5" fill="${INK}"/><circle cx="4" cy="0" r="2.5" fill="${INK}"/><path d="M-4 9 h8" stroke="${INK}" stroke-width="2"/></g><path d="M318 250 l-8 -10 m8 10 l10 -12 m-10 12 v-14" stroke="#f6efe0" stroke-width="4" stroke-linecap="round"/>
            <path d="M0 0 h400 v60 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 Z" fill="#2b1a22" stroke="${INK}" stroke-width="4"/>
      <path d="M50 66 l8 34 l8 -30 Z M130 72 l6 24 l6 -22 Z M270 70 l7 30 l7 -28 Z M346 66 l6 22 l6 -20 Z" fill="#2b1a22" ${S3}/>
      <rect x="150" y="0" width="100" height="16" fill="#6b3f22" ${S3}/><path d="M162 4 h20 M206 10 h26" stroke="${INK}" stroke-width="2" opacity="0.5"/>
      <rect class="rope" x="197" y="0" width="6" height="200" fill="#c9a06b" stroke="${INK}" stroke-width="2"/>
      <g class="lava"><path d="M0 420 q25 -14 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V520 H0 Z" fill="#ff6a1e" stroke="${INK}" stroke-width="4"/>
      <path d="M20 446 q20 -6 40 0 M120 462 q24 -6 48 0 M230 450 q20 -6 40 0 M320 486 q20 -6 40 0" fill="none" stroke="#ffd34d" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <path d="M150 432 q16 -14 36 -4 q6 8 -4 12 h-28 Z M300 438 q12 -10 26 -2 q4 6 -4 8 h-20 Z" fill="#4a2a2e" ${S3}/>
      <circle class="bub" cx="80" cy="450" r="8" fill="#ffd34d"/><circle class="bub" cx="300" cy="470" r="6" fill="#ffd34d"/><circle class="bub" cx="210" cy="490" r="5" fill="#ffd34d"/></g>
      ${flame(200, 70, 0.45, 'ropefire')}`,
    setup(ctx) { place(ctx.hero, 200, 340); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const l = q(ctx, 'lava'); place(l, Math.sin(t * 2) * 6, -Math.min(30, t * 3));
      l.querySelectorAll('.bub').forEach((b, i) => { const k = (t * 0.7 + i * 0.37) % 1; b.setAttribute('r', (3 + k * 7).toFixed(1)); b.setAttribute('opacity', (1 - k * k).toFixed(2)); });
      spin(ctx, 'ropefire', `translate(200 70) scale(${0.45 + Math.sin(t * 13) * 0.03} ${0.45 + Math.sin(t * 17) * 0.05})`);
      ctx.hero.setAttribute('transform', `translate(200 ${340 + Math.sin(t * 3) * 3}) rotate(${Math.sin(t * 1.7) * 4})`);
    },
    async win(ctx) {
      ctx.pour(200, 300);
      await ctx.wait(0.5);
      const lava = q(ctx, 'lava').firstElementChild;
      await ctx.T(0.6, (k) => lava.setAttribute('fill', k < 0.5 ? '#ff6a1e' : '#6a6a72'));
      ctx.puff(200, 410, '#e8e8f0', 16, 60);
      q(ctx, 'ropefire').style.display = 'none';
      await ctx.T(0.5, (k) => place(ctx.hero, 200, 340 + k * 70));
    },
    fails: {
      async flare(ctx) { ctx.flash('#ffbe2e'); ctx.puff(200, 300, '#ff8a2e', 24, 90); await ctx.wait(0.2); ctx.burn(); await ctx.T(0.6, (k) => place(ctx.hero, 200, 340 + k * 120)); },
      async cut(ctx) { q(ctx, 'rope').style.display = 'none'; ctx.sfx.whoosh(); await ctx.T(0.5, (k) => place(ctx.hero, 200, 340 + k * k * 140)); ctx.puff(200, 430, '#ff8a2e', 20, 70); ctx.burn(); },
    },
  },

  // ---------------------------------------------------------------- 2. shark around the raft
  shark: {
    correct: 'steak',
    wrong: { banana: 'eaten', rod: 'pulled', icecream: 'eaten' },
    bg: () => sky('#8fd3ff', '#cdeeff', 'sk') + `
      <g class="sunrays" transform="translate(330 70)"><path d="M0 -48 v-14 M0 48 v14 M-48 0 h-14 M48 0 h14 M34 34 l10 10 M-34 -34 l-10 -10 M34 -34 l10 -10 M-34 34 l-10 10" stroke="#ffbe2e" stroke-width="5" stroke-linecap="round"/></g>
      <circle cx="330" cy="70" r="34" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><circle cx="320" cy="60" r="10" fill="#fff6c0" opacity="0.7"/>
      <path d="M20 300 q30 -26 70 -22 q30 4 50 22 Z" fill="#f0d090" ${S3}/><path d="M60 290 q2 -40 14 -60" fill="none" stroke="#8a5a32" stroke-width="6" stroke-linecap="round"/><path d="M74 230 q-24 -8 -36 8 M74 230 q20 -12 34 2 M74 230 q-6 -16 -22 -20 M74 230 q10 -18 26 -16" fill="none" stroke="#2e7d4a" stroke-width="6" stroke-linecap="round"/>
      <rect y="300" width="400" height="220" fill="#2f8fd8"/><rect y="400" width="400" height="120" fill="#2a7cc0"/><rect y="470" width="400" height="50" fill="#246cb0"/>
      <path d="M30 350 h40 M300 370 h50 M120 420 h30 M240 450 h44 M60 490 h36 M330 500 h30" stroke="#8fd3ff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
      <path d="M0 300 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
      <g class="raft"><rect x="140" y="300" width="120" height="22" rx="6" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M160 300 v22 M180 300 v22 M200 300 v22 M220 300 v22 M240 300 v22" stroke="${INK}" stroke-width="2"/>
        <path d="M250 300 V220" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/><path class="flag" d="M252 222 q14 -4 26 4 q-12 6 -26 10 Z" fill="#e8453c" ${S3}/>
        <rect x="148" y="286" width="22" height="16" rx="3" fill="#b58a5a" ${S3}/><path d="M148 294 h22" stroke="${INK}" stroke-width="2"/><path d="M140 314 q-10 4 -20 2 M260 314 q10 4 20 2" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7"/></g>
      <g class="shark"><ellipse cx="20" cy="22" rx="70" ry="16" fill="#1d5a9a" opacity="0.55"/><path d="M0 0 L22 -46 L40 0 Z" fill="#6a7f9e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M12 -6 L22 -36 L26 -6 Z" fill="#8aa0bc"/><path d="M28 -16 l6 4 m-8 4 l6 4" stroke="${INK}" stroke-width="2" opacity="0.5"/><path d="M-14 4 q10 -8 20 -2 M36 2 q10 -6 22 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 200, 302); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const r = Math.max(90, 160 - t * 6);
      place(q(ctx, 'shark'), 180 + Math.cos(t * 1.4) * r, 330 + Math.sin(t * 1.4) * 30, 0, Math.sin(t * 1.4) > 0 ? -1 : 1, 1);
      place(q(ctx, 'raft'), 0, Math.sin(t * 2) * 3);
      spin(ctx, 'sunrays', `translate(330 70) rotate(${t * 12})`);
      spin(ctx, 'flag', `translate(252 228) scale(1 ${1 + Math.sin(t * 7) * 0.25}) translate(-252 -228)`);
    },
    async win(ctx) {
      const s = ctx.tool('steak', 200, 230, 0.6);
      await ctx.T(0.6, (k) => place(s, 200 + k * 120, 230 - Math.sin(k * Math.PI) * 80 + k * 100, k * 360, 0.6));
      ctx.puff(320, 330, '#fff', 12, 40);
      await ctx.T(0.4, (k) => place(q(ctx, 'shark'), 300, 330 - Math.sin(k * Math.PI) * 60));
      s.remove();
      await ctx.T(0.7, (k) => place(q(ctx, 'shark'), 300 + k * 160, 330));
    },
    fails: {
      async eaten(ctx) {
        await ctx.wait(0.3);
        const sh = q(ctx, 'shark');
        sh.innerHTML = `<path d="M-60 0 C-40 -60 60 -60 70 -10 L40 -20 L70 0 L40 10 L70 20 C40 60 -40 50 -60 0 Z" fill="#6a7f9e" stroke="${INK}" stroke-width="4"/><circle cx="20" cy="-20" r="5" fill="${INK}"/>`;
        await ctx.T(0.35, (k) => place(sh, 380 - k * 180, 330 - k * 60, 0, -1, 1));
        ctx.sfx.chomp(); ctx.say('CHOMP!');
        ctx.hero.style.display = 'none';
        await ctx.T(0.5, (k) => place(sh, 200 - k * 260, 270 + k * 80, 0, -1, 1));
      },
      async pulled(ctx) { await ctx.wait(0.3); ctx.sfx.whoosh(); await ctx.T(0.5, (k) => place(ctx.hero, 200 + k * 90, 302 + k * k * 90, k * 90)); ctx.splash(290, 320); },
    },
  },

  // ---------------------------------------------------------------- 3. angry bees
  bees: {
    correct: 'torch',
    wrong: { honey: 'stung', stick: 'stung', water: 'stung' },
    bg: () => sky('#9fe3ff', '#e2f6ff', 'be') + hills('#bfe6a8', '#9fd47e') + ground('#7cc35a') + `
      <g fill="none" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"><path d="M0 396 H120 M0 414 H120"/></g><g fill="#f6efe0" ${S3}>${[10, 50, 90].map((x) => `<path d="M${x} 430 v-50 l7 -8 l7 8 v50 Z"/>`).join('')}</g>
      <rect x="300" y="120" width="34" height="310" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><path d="M310 170 q6 40 0 90 M322 300 q-6 40 2 90" fill="none" stroke="#6b3f22" stroke-width="3"/><path d="M300 430 q-14 -2 -20 4 M334 430 q14 -2 20 4" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M302 180 Q270 168 250 150" fill="none" stroke="#8a5a32" stroke-width="10" stroke-linecap="round"/>
      <circle cx="320" cy="110" r="70" fill="#2eb872" stroke="${INK}" stroke-width="4"/><circle cx="270" cy="140" r="30" fill="#2eb872" stroke="${INK}" stroke-width="4"/><path d="M290 70 q12 -8 24 0 M330 120 q12 -8 24 0 M296 150 q10 -6 20 0 M262 130 q8 -6 16 0" fill="none" stroke="#1f9a5a" stroke-width="4" stroke-linecap="round"/>
      <path d="M280 150 v-10" stroke="${INK}" stroke-width="4"/>
      <g class="hive" transform="translate(280 190)"><ellipse rx="34" ry="40" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/><ellipse cx="-12" cy="-16" rx="8" ry="12" fill="#ffe680"/><path d="M-30 -14 h60 M-34 4 h68 M-28 22 h56" stroke="${INK}" stroke-width="3"/><circle cy="10" r="7" fill="${INK}"/><path d="M14 36 q4 10 0 16 q-4 -6 0 -16 Z" fill="#ffbe2e" ${S3}/></g>
      ${[[150, 432, '#ff6f9e'], [196, 438, '#fff'], [236, 430, '#ffd34d']].map(([x, y, c]) => `<path d="M${x} ${y} v-18" stroke="#2e7d4a" stroke-width="3"/><circle cx="${x}" cy="${y - 22}" r="6" fill="${c}" stroke="${INK}" stroke-width="5" stroke-dasharray="3 2.2"/><circle cx="${x}" cy="${y - 22}" r="3" fill="#ffbe2e"/>`).join('')}
      <g class="swarm"></g>`,
    setup(ctx) {
      place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const sw = q(ctx, 'swarm');
      for (let i = 0; i < 9; i++) sw.insertAdjacentHTML('beforeend', `<g class="bee"><ellipse rx="9" ry="7" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><path d="M-2 -7 v14 M3 -7 v14" stroke="${INK}" stroke-width="2"/><circle cx="-6" cy="-1" r="1.8" fill="${INK}"/><ellipse class="wing" cx="-2" cy="-9" rx="6" ry="4" fill="#fff" opacity="0.8" stroke="${INK}" stroke-width="1.5"/></g>`);
    },
    idle(ctx, t) {
      const near = Math.min(1, t / 9);
      [...q(ctx, 'swarm').children].forEach((b, i) => {
        const a = t * 3 + i * 0.7;
        place(b, 280 - near * 120 + Math.cos(a) * (40 + i * 3), 200 + near * 120 + Math.sin(a * 1.3) * 30);
        const w = b.querySelector('.wing'); if (w) w.setAttribute('ry', (2 + Math.abs(Math.sin(t * 40 + i)) * 3).toFixed(1));
      });
    },
    async win(ctx) {
      ctx.puff(220, 320, '#c8c8d0', 22, 110);
      await ctx.wait(0.4);
      const bees = [...q(ctx, 'swarm').children];
      await ctx.T(0.9, (k) => bees.forEach((b, i) => place(b, 200 + i * 20 + k * 200, 300 - k * 260 + i * 6, 0, 1 - k * 0.5)));
    },
    fails: {
      async stung(ctx) {
        const bees = [...q(ctx, 'swarm').children];
        await ctx.T(0.5, (k) => bees.forEach((b, i) => place(b, 140 + Math.cos(i) * (40 - k * 20), 330 + Math.sin(i * 2) * (40 - k * 20))));
        ctx.sfx.buzz();
        ctx.sting();
        await ctx.wait(0.4);
      },
    },
  },

  // ---------------------------------------------------------------- 4. house on fire
  fire: {
    correct: 'extinguisher',
    wrong: { gasoline: 'boom', fan: 'bigfire', banana: 'bigfire' },
    bg: () => sky('#ffb27a', '#ffe0c4', 'fi') + hills('#f4c9a0', '#c8e09a') + ground('#9adf6a') + `
      <g class="smoke" fill="#8a8698" opacity="0.55"><circle cx="300" cy="150" r="16"/><circle cx="314" cy="120" r="20"/><circle cx="300" cy="86" r="24"/></g>
      <g transform="translate(250 430)"><rect x="40" y="-224" width="26" height="54" fill="#b5584a" ${S4}/><rect x="36" y="-230" width="34" height="10" fill="#8a3a32" ${S3}/>
        <rect x="-90" y="-150" width="180" height="150" fill="#f3dcc0" stroke="${INK}" stroke-width="4"/><path d="M-90 -120 h180 M-90 -90 h180 M-90 -60 h180 M-90 -30 h180" stroke="#e0c4a0" stroke-width="3"/><rect x="-90" y="-150" width="180" height="16" fill="#e0b896" opacity="0.6"/>
        <path d="M-110 -150 L0 -230 L110 -150 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M-80 -172 h160 M-50 -194 h100 M-24 -214 h48" stroke="#b8302a" stroke-width="3"/><circle cy="-180" r="10" fill="#ffe680" ${S3}/>
        <rect x="-60" y="-110" width="40" height="40" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/><path d="M-60 -76 q10 -24 20 -10 q10 -26 20 0 Z" fill="#ff6a1e"/><path d="M-40 -110 v40 M-60 -90 h40" stroke="${INK}" stroke-width="3"/><rect x="-66" y="-72" width="52" height="8" rx="2" fill="#8a5a32" ${S3}/>
        <rect x="20" y="-70" width="40" height="70" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><path d="M28 -60 h24 v22 h-24 Z M28 -30 h24 v22 h-24 Z" fill="none" stroke="#6b3f22" stroke-width="3"/><circle cx="52" cy="-34" r="3.5" fill="#ffd34d" stroke="${INK}" stroke-width="2"/>
        <path d="M60 -90 h22 v12 h-22 Z" fill="#7fd3ff" ${S3}/></g>
      <g transform="translate(162 430)"><path d="M0 0 v-46" stroke="${INK}" stroke-width="5"/><rect x="-16" y="-66" width="32" height="22" rx="10" fill="#2f7cf6" ${S3}/><path d="M14 -64 v-12 h10 v6 h-10" fill="#e8453c" ${S3}/></g>
      ${bush(380, 432, '#3f9a4a', 0.9)}
      <g class="fires">${flame(200, 300, 0.9)}${flame(260, 250, 1.1)}${flame(320, 300, 0.8)}${flame(250, 200, 0.7)}</g>`,
    setup(ctx) { place(ctx.hero, 90, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.8 + i * 0.1) * (1 + Math.min(0.5, t * 0.05)) * (1 + Math.sin(t * 8 + i) * 0.06)})`)));
      [...q(ctx, 'smoke').children].forEach((c, i) => { const k = (t * 0.35 + i / 3) % 1; c.setAttribute('cx', (300 + Math.sin(k * 6 + i) * 10 + k * 30).toFixed(1)); c.setAttribute('cy', (176 - k * 150).toFixed(1)); c.setAttribute('r', (10 + k * 22).toFixed(1)); });
    },
    async win(ctx) {
      ctx.spray(120, 330, 250, 260, '#ffffff');
      await ctx.wait(0.6);
      const fires = [...q(ctx, 'fires').children];
      await ctx.T(0.7, (k) => fires.forEach((f) => { f.style.opacity = 1 - k; }));
    },
    fails: {
      async boom(ctx) { await ctx.wait(0.2); ctx.boom(200, 320); ctx.burn(); await ctx.T(0.6, (k) => place(ctx.hero, 90 - k * 60, 430 - Math.sin(k * Math.PI) * 120, -k * 180)); },
      async bigfire(ctx) {
        const fires = [...q(ctx, 'fires').children];
        await ctx.T(0.6, (k) => fires.forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${1 + k * 1.2 + i * 0.1})`))));
        ctx.burn();
      },
    },
  },

  // ---------------------------------------------------------------- 5. hungry bear
  bear: {
    correct: 'honey',
    wrong: { drum: 'swipe', broccoli: 'swipe', teddy: 'swipe' },
    bg: () => sky('#bfe0ff', '#e6f4ff', 'br') + hills('#b8d8c8', '#8ec49a') + `
      ${pine(120, 400, 0.7, '#5a9a6a')}${pine(250, 396, 0.8, '#5a9a6a')}${pine(300, 404, 0.6, '#5a9a6a')}` + ground('#5aa84a') + `
      <path d="M0 430 L40 300 L80 430 Z M330 430 L370 280 L410 430 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/><path d="M20 380 l20 -12 l20 12 M24 410 l16 -10 l16 10 M350 360 l20 -12 l20 12 M346 400 l24 -14 l24 14" fill="none" stroke="#1f6a3a" stroke-width="3"/>
      <g transform="translate(200 432)"><path d="M-22 0 v-26 h44 v26 Z" fill="#a0703a" ${S3}/><ellipse cy="-26" rx="22" ry="7" fill="#e0b88a" ${S3}/></g>
      <g transform="translate(250 436)"><path d="M-3 0 v-10" stroke="#f6efe0" stroke-width="5"/><path d="M-12 -10 q12 -16 24 0 Z" fill="#e8453c" ${S3}/></g>
      <g class="bear"><ellipse cx="0" cy="-60" rx="56" ry="62" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><ellipse cx="-8" cy="-48" rx="32" ry="38" fill="#a8744a"/><path d="M-24 -60 q6 4 12 0 M-6 -40 q6 4 12 0 M-20 -24 q6 4 12 0" fill="none" stroke="#8a5a32" stroke-width="3" stroke-linecap="round"/>
        <circle cx="-6" cy="-138" r="38" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-32" cy="-168" r="12" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="20" cy="-168" r="12" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-32" cy="-168" r="5" fill="#e0b08a"/><circle cx="20" cy="-168" r="5" fill="#e0b08a"/>
        <ellipse cx="-18" cy="-128" rx="16" ry="12" fill="#e0b08a" stroke="${INK}" stroke-width="3"/><circle cx="-22" cy="-132" r="5" fill="${INK}"/><circle cx="-24" cy="-134" r="1.6" fill="#fff"/>${eye(-24, -150, 5.5, 'blid', '#8a5a32')}${eye(8, -150, 5.5, 'blid', '#8a5a32')}<path d="M-34 -160 l10 3 M18 -160 l-10 3" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path class="bear-mouth" d="M-28 -118 q10 8 20 0" fill="none" stroke="${INK}" stroke-width="3"/>
        <g class="bpaw"><ellipse cx="-50" cy="-80" rx="14" ry="20" transform="rotate(30 -50 -80)" fill="#8a5a32" ${S4}/><path d="M-66 -94 l-6 -6 M-62 -100 l-4 -8 M-56 -102 l-1 -8" stroke="#f6efe0" stroke-width="3" stroke-linecap="round"/></g>
        <g fill="#8a5a32" ${S4}><ellipse cx="-28" cy="-4" rx="18" ry="10"/><ellipse cx="28" cy="-4" rx="18" ry="10"/></g><path d="M-42 -8 v-4 M-34 -10 v-4 M14 -8 v-4 M22 -10 v-4" stroke="#f6efe0" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'bear'), 360 - Math.min(110, t * 12), 430 + Math.abs(Math.sin(t * 5)) * -4);
      setLids(ctx, 'blid', blink(t));
      spin(ctx, 'bpaw', `rotate(${Math.sin(t * 5) * 10} -40 -70)`);
    },
    async win(ctx) {
      const h = ctx.tool('honey', 150, 340, 0.5);
      const bear = q(ctx, 'bear');
      await ctx.T(0.5, (k) => place(h, 150 + k * 80, 340 - Math.sin(k * Math.PI) * 60 + k * 30, 0, 0.5));
      q(ctx, 'bear-mouth').setAttribute('d', 'M-30 -120 q12 14 26 0');
      ctx.heart(260, 230);
      await ctx.T(0.8, (k) => { place(bear, 250 + k * 160, 430, 0, -1, 1); place(h, 230 + k * 160, 370); });
    },
    fails: {
      async swipe(ctx) {
        const bear = q(ctx, 'bear');
        q(ctx, 'bear-mouth').setAttribute('d', 'M-30 -114 q12 -12 26 0 Z');
        ctx.sfx.roar(); ctx.shake(0.4);
        await ctx.T(0.25, (k) => place(bear, 250 - k * 50, 430));
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 110 - k * 80, 430 - Math.sin(k * Math.PI) * 70, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- 6. ghost in the house
  ghost: {
    correct: 'vacuum',
    wrong: { candle: 'scared', teddy: 'scared', mirror: 'scared' },
    bg: () => sky('#2b2140', '#4b3a6b', 'gh') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `M${20 + i * 46} 0 V430`).join(' ')}" stroke="#3a2e58" stroke-width="10"/><rect y="370" width="400" height="60" fill="#3a2a2a" stroke="${INK}" stroke-width="4"/><path d="M0 384 h400" stroke="#5a4a3a" stroke-width="3"/>` + ground('#5a4a3a') + `
      <path d="M0 452 h400 M0 480 h400 M0 506 h400 M80 430 v22 M210 452 v28 M330 430 v22 M140 480 v26 M290 480 v26" stroke="#4a3a2e" stroke-width="3"/>
      <ellipse cx="200" cy="470" rx="150" ry="22" fill="#6a2a3a" ${S3}/><ellipse cx="200" cy="470" rx="120" ry="14" fill="none" stroke="#9b3a4a" stroke-width="3" stroke-dasharray="8 6"/>
      <rect x="40" y="60" width="90" height="120" fill="#1a1530" stroke="${INK}" stroke-width="4"/><path d="M40 120 h90 M85 60 v120" stroke="${INK}" stroke-width="4"/><circle cx="105" cy="90" r="16" fill="#fff6d0"/>
      <path d="M30 52 h110" stroke="#6b3f22" stroke-width="6" stroke-linecap="round"/><path d="M34 54 q10 70 -2 140 h20 q-10 -70 4 -140 Z M136 54 q-10 70 2 140 h-20 q10 -70 -4 -140 Z" fill="#6a2a4a" ${S3}/>
      <g transform="translate(250 96) rotate(6)"><rect x="-30" y="-36" width="60" height="72" fill="#8a5a32" ${S4}/><rect x="-20" y="-26" width="40" height="52" fill="#c8b8a0"/><circle cy="-8" r="10" fill="#8a7a6a"/><path d="M-14 26 q14 -26 28 0" fill="#8a7a6a"/>${eye(-4, -9, 2.4)}${eye(4, -9, 2.4)}</g>
      <g transform="translate(340 430)"><rect x="-22" y="-150" width="44" height="150" rx="6" fill="#6b3f22" ${S4}/><circle cy="-118" r="16" fill="#f6efe0" ${S3}/><path d="M0 -118 v-10 M0 -118 l7 4" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path class="pend" d="M0 -98 V-50" stroke="#ffbe2e" stroke-width="3"/><rect x="-14" y="-90" width="28" height="56" fill="none" stroke="#4a2a1a" stroke-width="2"/></g>
      <path d="M400 0 L340 0 Q370 20 400 50 M372 0 q8 14 28 22 M352 0 q14 26 48 38" fill="none" stroke="#c8c0e0" stroke-width="2" opacity="0.7"/>
      <g class="ghost"><path d="M-40 0 C-40 -80 40 -80 40 0 L40 50 L26 38 L13 50 L0 38 L-13 50 L-26 38 L-40 50 Z" fill="#f6f8ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-30 -10 C-30 -50 -4 -60 10 -58 C-10 -50 -22 -30 -22 40 L-30 46 Z" fill="#dfe4f6"/><ellipse cx="-14" cy="-10" rx="7" ry="10" fill="${INK}"/><ellipse cx="14" cy="-10" rx="7" ry="10" fill="${INK}"/><circle cx="-16" cy="-14" r="2.5" fill="#fff"/><circle cx="12" cy="-14" r="2.5" fill="#fff"/><ellipse cx="0" cy="16" rx="9" ry="12" fill="${INK}"/><path d="M-6 10 q6 -4 12 0 v6 h-12 Z" fill="#e85a7a"/><path d="M-24 -26 l10 4 M24 -26 l-10 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'ghost'), 320 - Math.min(110, t * 11) + Math.sin(t * 2) * 10, 260 + Math.sin(t * 3) * 14);
      spin(ctx, 'pend', `rotate(${Math.sin(t * 3) * 16} 0 -98)`);
    },
    async win(ctx) {
      const v = ctx.tool('vacuum', 180, 380, 0.7);
      const gh = q(ctx, 'ghost');
      ctx.sfx.whoosh();
      await ctx.T(0.8, (k) => place(gh, 260 - k * 60, 270 + k * 110, k * 360, 1 - k));
      ctx.puff(200, 380, '#f6f8ff', 12, 40);
      await ctx.wait(0.2); v.remove();
    },
    fails: {
      async scared(ctx) {
        const gh = q(ctx, 'ghost');
        await ctx.T(0.3, (k) => place(gh, 260 - k * 60, 270, 0, 1 + k * 0.8));
        ctx.say('BÖÖ!'); ctx.sfx.roar(); ctx.shake(0.3);
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 130, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- 7. snowstorm
  cold: {
    correct: 'campfire',
    wrong: { icecream: 'freeze', fan: 'freeze', ice: 'freeze' },
    bg: () => sky('#9fb8d8', '#e6f0fa', 'co') + `
      <path d="M-20 430 L60 250 L110 330 L170 220 L250 340 L300 260 L420 430 Z" fill="#b8c8e0" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/><path d="M60 250 L44 286 l12 -6 l10 10 l10 -12 Z M170 220 L150 264 l12 -8 l10 12 l12 -10 l10 4 Z M300 260 L284 290 l10 -4 l8 8 l12 -10 Z" fill="#fff"/>` + ground('#f6f9ff') + `
      <path d="M0 430 L80 320 L160 430 Z M220 430 L320 290 L420 430 Z" fill="#dfe8f5" stroke="${INK}" stroke-width="4"/><path d="M80 320 L62 346 l10 -4 l8 8 l8 -8 l10 4 Z M320 290 L298 322 l12 -6 l10 10 l10 -10 l12 6 Z" fill="#fff" ${S3}/><path d="M40 400 l20 -24 M110 410 l14 -20 M280 400 l20 -30 M350 410 l16 -24" stroke="#b8c8e0" stroke-width="3" stroke-linecap="round"/>
      ${pine(36, 432, 0.7, '#3f7a5a', '#fff')}${pine(360, 434, 0.85, '#3f7a5a', '#fff')}
      <ellipse cx="300" cy="476" rx="70" ry="14" fill="#bfe6ff" ${S3}/><path d="M262 472 l16 -4 M300 480 l22 -6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <g transform="translate(110 432)"><path d="M0 0 v-60" stroke="#8a5a32" stroke-width="6"/><path d="M-30 -66 h52 l12 10 l-12 10 h-52 Z" fill="#c9893b" ${S3}/><path d="M-30 -66 h64 l-4 -4 h-56 Z" fill="#fff"/><path d="M-20 -56 h28" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><ellipse cy="0" rx="14" ry="5" fill="#fff"/></g>
      <g transform="translate(270 432)"><circle cy="-18" r="20" fill="#fff" ${S3}/><circle cy="-50" r="14" fill="#fff" ${S3}/><path d="M0 -50 l12 3 l-12 3 Z" fill="#ff8a2e" ${S3}/><circle cx="-5" cy="-54" r="2" fill="${INK}"/><circle cx="5" cy="-54" r="2" fill="${INK}"/><path d="M-12 -38 h24" stroke="#e8453c" stroke-width="5" stroke-linecap="round"/><path d="M-18 -26 l-16 -14 M18 -26 l16 -14" stroke="#8a5a32" stroke-width="3" stroke-linecap="round"/></g>
      <g class="snow"></g>`,
    setup(ctx) {
      place(ctx.hero, 200, 430); setArms(ctx.hero, 'down'); setFace(ctx.hero, 'scared');
      const s = q(ctx, 'snow');
      for (let i = 0; i < 40; i++) s.insertAdjacentHTML('beforeend', `<circle r="${3 + (i % 3)}" fill="#fff" opacity="0.9"/>`);
    },
    idle(ctx, t) {
      [...q(ctx, 'snow').children].forEach((c, i) => { c.setAttribute('cx', ((i * 53 + t * (60 + i % 5 * 10)) % 420) - 10); c.setAttribute('cy', ((i * 37 + t * (90 + i % 4 * 20)) % 440)); });
      place(ctx.hero, 200 + Math.sin(t * 30) * 1.5, 430);
      ctx.hero.style.filter = `saturate(${Math.max(0.3, 1 - t * 0.08)})`;
    },
    async win(ctx) {
      const f = ctx.tool('campfire', 270, 360, 0.9);
      ctx.puff(270, 380, '#ffbe2e', 14, 50);
      await ctx.T(0.8, (k) => { q(ctx, 'snow').style.opacity = 1 - k; ctx.hero.style.filter = `saturate(${0.3 + k * 0.7})`; });
      f.dataset.keep = '1';
    },
    fails: {
      async freeze(ctx) { await ctx.wait(0.3); ctx.freeze(); await ctx.wait(0.3); },
    },
  },

  // ---------------------------------------------------------------- 8. flooding room
  flood: {
    correct: 'ring',
    wrong: { anchor: 'sink', sponge: 'sink', rocket: 'sink' },
    bg: () => sky('#d9c8b4', '#e8dccd', 'fl') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `M${30 + i * 50} 0 V430`).join(' ')}" stroke="#d0bca4" stroke-width="12"/>
      <path d="M0 430 H400 V520 H0 Z" fill="#b8956a"/><rect y="414" width="400" height="16" fill="#f3e6d4" ${S3}/>
      <path d="M150 0 l10 30 l-8 14 l12 22" fill="none" stroke="#8a7a6a" stroke-width="3"/><circle class="drip" cx="164" cy="66" r="4" fill="#2f8fd8" ${S3}/>
      <rect x="250" y="80" width="90" height="70" fill="#7fd3ff" stroke="${INK}" stroke-width="4"/><path d="M262 96 l14 -10 M310 136 l16 -12" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M295 80 v70 M250 115 h90" stroke="${INK}" stroke-width="4"/><rect x="242" y="148" width="106" height="10" rx="3" fill="#f3e6d4" ${S3}/><path d="M278 148 q-4 -14 6 -18 q6 8 0 18 Z" fill="#2eb872" ${S3}/><rect x="274" y="140" width="16" height="10" fill="#c9653a" ${S3}/>
      <g transform="translate(175 120) rotate(-4)"><rect x="-28" y="-22" width="56" height="44" fill="#c9893b" ${S4}/><rect x="-20" y="-14" width="40" height="28" fill="#bfeaff"/><path d="M-20 14 l12 -14 l8 8 l8 -10 l12 16 Z" fill="#2eb872"/><circle cx="10" cy="-6" r="4" fill="#ffd34d"/></g>
      <rect x="250" y="210" width="110" height="10" fill="#8a5a32" ${S3}/><g ${S3}><rect x="258" y="178" width="12" height="32" fill="#e8453c"/><rect x="270" y="184" width="10" height="26" fill="#2f7cf6"/><rect x="282" y="176" width="14" height="34" fill="#ffbe2e"/><rect x="300" y="186" width="10" height="24" fill="#2eb872" transform="rotate(14 305 210)"/></g><circle cx="340" cy="198" r="12" fill="#f6efe0" ${S3}/><path d="M340 198 v-7 M340 198 l5 3" stroke="${INK}" stroke-width="2"/>
      <rect x="40" y="250" width="80" height="180" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><path d="M52 264 h56 v66 h-56 Z M52 344 h56 v72 h-56 Z" fill="none" stroke="#6b3f22" stroke-width="3"/><circle cx="106" cy="340" r="5" fill="#ffd34d" ${S3}/>
      <g class="water"><rect x="0" y="0" width="400" height="520" fill="#2f8fd8" opacity="0.75"/><path d="M0 0 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5"/><path d="M30 40 h40 M180 70 h30 M300 50 h50 M90 110 h40" stroke="#bfeaff" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
        <g class="duck" transform="translate(330 -6)"><path d="M-16 0 q0 -14 16 -12 q4 -14 14 -8 q6 4 0 10 q10 2 4 10 Z" fill="#ffd34d" ${S3}/><path d="M18 -14 l8 2 l-8 3 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="2"/><circle cx="10" cy="-16" r="1.8" fill="${INK}"/></g>
        <g transform="translate(90 -4) rotate(-8)"><rect x="-14" y="-6" width="28" height="10" rx="2" fill="#e8453c" ${S3}/><path d="M-10 -6 v10" stroke="${INK}" stroke-width="2"/></g></g>`,
    setup(ctx) { place(ctx.hero, 220, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); this.idle(ctx, 0); },
    idle(ctx, t) {
      place(q(ctx, 'water'), Math.sin(t * 2) * 8, 440 - Math.min(150, t * 14));
      spin(ctx, 'duck', `translate(${330 - Math.sin(t * 0.6) * 30} ${-6 + Math.sin(t * 3) * 2}) rotate(${Math.sin(t * 3) * 8})`);
      const d = q(ctx, 'drip'); if (d) { const k = (t * 0.8) % 1; d.setAttribute('cy', (66 + k * k * 300).toFixed(1)); d.setAttribute('opacity', k < 0.95 ? 1 : 0); }
    },
    async win(ctx) {
      const r = ctx.tool('ring', 220, 340, 0.9);
      const w = q(ctx, 'water');
      const y0 = Number(w.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)/)[2]);
      await ctx.T(0.9, (k) => { const wy = y0 - k * 80; place(w, 0, wy); place(ctx.hero, 220, Math.min(430, wy + 30)); place(r, 220, Math.min(430, wy + 30) - 50, 0, 0.9); });
    },
    fails: {
      async sink(ctx) { const w = q(ctx, 'water'); await ctx.T(0.9, (k) => { place(w, 0, 300 - k * 260); place(ctx.hero, 220, 430 + k * 40); }); ctx.bubbles(220, 300); },
    },
  },

  // ---------------------------------------------------------------- 9. bomb with a burning fuse
  bomb: {
    correct: 'water',
    wrong: { hammer: 'boom', match: 'boom', fan: 'boom' },
    bg: () => sky('#cfd8e6', '#eef2f8', 'bo') + `
      <rect y="180" width="400" height="250" fill="#b8a08a" stroke="${INK}" stroke-width="4"/>
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((r) => `M0 ${210 + r * 30} H400 ` + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => `M${c * 50 + (r % 2) * 25} ${180 + r * 30} v30`).join(' ')).join(' ')}" stroke="#a08a74" stroke-width="3"/>
      <rect y="170" width="400" height="14" fill="#8a7464" ${S3}/>
      <g transform="translate(70 270)"><path d="M0 -40 L40 30 H-40 Z" fill="#ffd34d" ${S4}/><rect x="-4" y="-14" width="8" height="26" rx="3" fill="${INK}"/><circle cy="20" r="4.5" fill="${INK}"/></g>
      <g transform="translate(180 236)"><rect x="-44" y="-18" width="88" height="36" rx="4" fill="#e8453c" ${S3}/><text y="8" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="#fff">DANGER</text></g>` + ground('#9aa6b8') + `
      <path d="M0 460 h400 M0 492 h400 M60 430 v30 M180 430 v30 M300 430 v30 M120 460 v32 M240 460 v32 M360 460 v32" stroke="#8a96a8" stroke-width="3"/>
      <g transform="translate(360 432)"><rect x="-26" y="-76" width="52" height="76" rx="6" fill="#e8453c" ${S4}/><path d="M-26 -60 h52 M-26 -16 h52" stroke="${INK}" stroke-width="3"/><text y="-30" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="18" fill="#fff">TNT</text></g>
      <g transform="translate(30 432)"><rect x="-30" y="-56" width="60" height="56" fill="#c9893b" ${S4}/><path d="M-30 -56 L30 0 M30 -56 L-30 0" stroke="#8a5a32" stroke-width="5"/><rect x="-30" y="-56" width="60" height="56" fill="none" ${S4}/></g>
      <g class="bomb" transform="translate(270 400)"><ellipse cy="34" rx="44" ry="8" fill="${INK}" opacity="0.2"/><circle r="44" fill="#2b2140" stroke="${INK}" stroke-width="4"/><path d="M30 -20 a40 40 0 0 1 -6 52" fill="none" stroke="#4a3a6a" stroke-width="6" stroke-linecap="round"/><circle cx="-14" cy="-14" r="10" fill="#fff" opacity="0.3"/><circle cx="-22" cy="-6" r="4" fill="#fff" opacity="0.3"/>
        <g class="bombface"><path d="M-22 -2 l14 6 M22 -2 l-14 6" stroke="#ff6f5e" stroke-width="4" stroke-linecap="round"/><circle cx="-12" cy="8" r="4" fill="#ff6f5e"/><circle cx="12" cy="8" r="4" fill="#ff6f5e"/><path d="M-12 24 q12 -8 24 0" fill="none" stroke="#ff6f5e" stroke-width="3" stroke-linecap="round"/></g>
        <rect x="-10" y="-56" width="20" height="14" fill="#6a7f9e" stroke="${INK}" stroke-width="4"/><path d="M-10 -50 h20" stroke="${INK}" stroke-width="2"/><path class="fuse" d="M0 -56 q20 -30 46 -20" fill="none" stroke="#c9a06b" stroke-width="5"/><g class="spark"><g class="sparkle" transform="translate(46 -84)"><path d="M0 -16 v8 M0 16 v-8 M-16 0 h8 M16 0 h-8 M-11 -11 l5 5 M11 11 l-5 -5 M11 -11 l-5 5 M-11 11 l5 -5" stroke="#ffd34d" stroke-width="3" stroke-linecap="round"/></g>${flame(46, -74, 0.3)}</g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const k = Math.min(1, t / 10); place(q(ctx, 'spark'), -k * 40, k * 16, 0, 1 + Math.sin(t * 20) * 0.15); q(ctx, 'bomb').setAttribute('transform', `translate(270 400) scale(${1 + Math.sin(t * 9) * 0.02 * (1 + t / 4)})`);
      spin(ctx, 'sparkle', `translate(46 -84) rotate(${t * 400}) scale(${0.8 + Math.abs(Math.sin(t * 15)) * 0.5})`);
    },
    async win(ctx) { ctx.pour(260, 330); await ctx.wait(0.5); q(ctx, 'spark').style.display = 'none'; ctx.puff(262, 340, '#e8e8f0', 10, 40); },
    fails: { async boom(ctx) { await ctx.wait(0.25); q(ctx, 'bomb').style.display = 'none'; ctx.boom(270, 380); ctx.burn(); await ctx.T(0.6, (k) => place(ctx.hero, 120 - k * 70, 430 - Math.sin(k * Math.PI) * 140, -k * 200)); } },
  },

  // ---------------------------------------------------------------- 10. thief at night
  thief: {
    correct: 'dog',
    wrong: { cat: 'bonk', paper: 'bonk', candle: 'bonk' },
    bg: () => sky('#1a2348', '#3a4a7a', 'th') + `
      <path d="M0 430 V330 h30 v-40 h26 v60 h34 v-30 h30 v40 H400 V430 Z" fill="#26305a" opacity="0.8"/><path d="M220 430 V300 h40 v-30 h30 v50 h40 v-40 h36 v60 h34 V430 Z" fill="#26305a" opacity="0.8"/><g fill="#ffe680" opacity="0.6"><rect x="38" y="300" width="8" height="8"/><rect x="232" y="316" width="8" height="8"/><rect x="300" y="330" width="8" height="8"/><rect x="342" y="296" width="8" height="8"/></g>` + ground('#2e4a3a') + `
      <circle cx="320" cy="70" r="30" fill="#fff6d0"/><circle cx="332" cy="62" r="28" fill="#1a2348"/>
      <g transform="translate(120 430)"><rect x="30" y="-196" width="22" height="40" fill="#5a4a6a" ${S4}/><rect x="-90" y="-140" width="180" height="140" fill="#6a5a7a" stroke="${INK}" stroke-width="4"/><path d="M-90 -112 h180 M-90 -84 h180 M-90 -56 h180 M-90 -28 h180" stroke="#5e4e6e" stroke-width="3"/><path d="M-110 -140 L0 -210 L110 -140 Z" fill="#3a2a4a" stroke="${INK}" stroke-width="4"/><path d="M-80 -158 h160 M-50 -180 h100" stroke="#2a1a3a" stroke-width="3"/>
        <path d="M-70 -60 L-110 0 H0 Z" fill="#ffd34d" opacity="0.12"/><rect x="-60" y="-100" width="40" height="40" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><path d="M-40 -100 v40 M-60 -80 h40" stroke="${INK}" stroke-width="3"/><path d="M-58 -98 q8 20 0 36 M-22 -98 q-8 20 0 36" fill="#e8453c" opacity="0.7"/><rect x="-66" y="-62" width="52" height="8" rx="2" fill="#4a3a5a" ${S3}/>
        <rect x="20" y="-76" width="40" height="76" fill="#4a3a2a" ${S4}/><circle cx="52" cy="-38" r="3.5" fill="#ffd34d"/><rect x="62" y="-104" width="18" height="12" rx="3" fill="#ffd34d" ${S3}/></g>
      <g fill="#c9a06b" ${S3}>${[230, 262, 294, 326, 358, 390].map((x) => `<path d="M${x - 8} 432 v-50 l8 -10 l8 10 v50 Z"/>`).join('')}</g><path d="M222 400 H400 M222 420 H400" stroke="#a0804e" stroke-width="5"/>
      <g class="thief"><path d="M18 -86 l14 -10 l10 14 l-6 30 h-18 Z" fill="#c9a06b" ${S3}/><rect x="-22" y="-90" width="44" height="54" rx="16" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><path d="M-20 -78 h40 M-22 -64 h44 M-20 -50 h40" stroke="#f6efe0" stroke-width="4" opacity="0.85"/><rect x="-22" y="-90" width="44" height="54" rx="16" fill="none" stroke="${INK}" stroke-width="4"/><rect x="-16" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><circle cy="-114" r="24" fill="#ffd2b0" stroke="${INK}" stroke-width="4"/><rect x="-26" y="-124" width="52" height="14" fill="${INK}"/><circle cx="-9" cy="-117" r="3" fill="#fff"/><circle cx="9" cy="-117" r="3" fill="#fff"/><g class="tlid" opacity="0"><circle cx="-9" cy="-117" r="3.6" fill="${INK}"/><circle cx="9" cy="-117" r="3.6" fill="${INK}"/><path d="M-13 -117 h8 M5 -117 h8" stroke="#fff" stroke-width="2"/></g>
        <path d="M-24 -124 q0 -28 24 -28 q24 0 24 28 Z" fill="#2b2b38" ${S3}/><rect x="-25" y="-130" width="50" height="8" rx="3" fill="#3a3a4a" ${S3}/><circle cy="-154" r="6" fill="#3a3a4a" ${S3}/><path d="M-8 -100 q8 4 16 -2" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M-12 -104 l2 2 M-4 -100 l1 2 M6 -101 l1 2 M12 -104 l-1 2" stroke="#8a7a7a" stroke-width="1.5"/><path d="M14 -60 l40 -6 l-2 30 Z" fill="#e8e8e8" stroke="${INK}" stroke-width="3"/><text x="34" y="-40" font-size="16" font-weight="800" text-anchor="middle" fill="${INK}">$</text></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'thief'), 380 - Math.min(110, t * 10), 430 + Math.abs(Math.sin(t * 6)) * -4); setLids(ctx, 'tlid', blink(t, 1)); },
    async win(ctx) {
      const d = ctx.tool('dog', 200, 400, 0.8);
      ctx.say('HAV HAV!'); ctx.sfx.bark();
      await ctx.T(0.2, (k) => place(d, 200 + k * 20, 400 - k * 20, 0, 0.8));
      await ctx.T(0.7, (k) => { place(q(ctx, 'thief'), 270 + k * 200, 430 - Math.abs(Math.sin(k * 14)) * 14); place(d, 220 + k * 120, 390, 0, 0.8); });
    },
    fails: { async bonk(ctx) { const th = q(ctx, 'thief'); await ctx.T(0.3, (k) => place(th, 270 - k * 70, 430)); ctx.say('BONK!'); ctx.sfx.hit(); ctx.shake(0.3); ctx.faint(); await ctx.T(0.4, (k) => place(ctx.hero, 140, 430, -k * 90)); await ctx.T(0.6, (k) => place(th, 200 + k * 220, 430)); } },
  },

  // ---------------------------------------------------------------- 11. dragon breath
  dragon: {
    correct: 'shield',
    wrong: { paper: 'roast', umbrella: 'roast', water: 'roast' },
    bg: () => sky('#ffb27a', '#ffd9c4', 'dr') + `
      <path d="M-10 430 L60 300 L90 330 L150 250 L210 340 L240 310 L290 430 Z" fill="#c88a70" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <g transform="translate(110 250)" fill="#a87a6a" ${S3}><rect x="-30" y="-50" width="60" height="70"/><rect x="-44" y="-80" width="22" height="100"/><rect x="22" y="-70" width="22" height="90"/><path d="M-48 -80 l15 -24 l15 24 Z M18 -70 l15 -22 l15 22 Z" fill="#8a4a4a"/><path d="M-30 -50 v-8 h10 v8 h10 v-8 h10 v8 h10 v-8 h10 v8" fill="none"/><path d="M-8 20 v-18 q8 -10 16 0 v18 Z" fill="#5a3a3a"/><rect x="-37" y="-62" width="8" height="12" fill="#ffd34d"/></g>
      <path d="M-33 -84 v-20" stroke="${INK}" stroke-width="2" transform="translate(110 250)"/><path class="pennant" d="M77 146 l18 4 l-18 6 Z" fill="#e8453c" stroke="${INK}" stroke-width="2"/>` + ground('#9c7a5b') + `
      <path d="M0 452 q30 -6 60 0 M120 470 q40 -8 80 0 M260 456 q30 -6 60 0 M40 496 q40 -8 80 0 M300 500 q30 -6 60 0" fill="none" stroke="#8a6a4b" stroke-width="3" stroke-linecap="round"/>
      ${stone(30, 434, 1.2, '#8a7a6a')}${stone(380, 436, 1.4, '#8a7a6a')}<g transform="translate(200 440)"><path d="M-12 -4 q-4 -10 6 -10 h14 q10 0 6 10 Z" fill="#f6efe0" ${S3}/><circle cx="-4" cy="-8" r="2" fill="${INK}"/><circle cx="4" cy="-8" r="2" fill="${INK}"/></g>
      <g class="dragon" transform="translate(320 260)"><path d="M50 100 C110 110 120 60 100 40 l20 -10 l-6 24 C130 80 110 130 40 124 Z" fill="#2eb872" ${S4}/>
        <path d="M-60 40 C-60 -20 20 -40 60 0 C90 30 70 120 0 130 C-50 130 -70 90 -60 40 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/><path d="M-44 40 C-40 0 -10 -6 4 0 C-14 30 -10 90 4 124 C-30 124 -50 90 -44 40 Z" fill="#ffe08a" ${S3}/><path d="M-46 60 h32 M-42 80 h30 M-34 100 h28" stroke="#d8b060" stroke-width="3"/>
        <path d="M-10 -12 l6 -14 l8 12 M10 -14 l10 -12 l4 14" fill="#ff8a2e" ${S3}/>
        <path d="M-50 10 C-90 -40 -110 -60 -70 -90 C-50 -100 -30 -80 -30 -60 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/><path d="M-56 -94 l-6 -18 l16 10 M-40 -90 l2 -18 l10 14" fill="#f6efe0" ${S3}/>
        <path d="M-60 -10 l-8 -10 l10 -2 M-46 -34 l-10 -8 l12 -4" fill="#ff8a2e" ${S3}/>${eye(-70, -74, 7, 'dlid', '#2eb872')}<path d="M-80 -86 l16 6" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M-104 -62 l4 6 l4 -5 l4 6 l4 -5" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <path d="M0 0 L40 -70 L70 -10 Z" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M14 -6 L40 -60 M30 -6 L48 -54 M46 -8 L58 -36" stroke="#2eb872" stroke-width="3"/><path d="M-100 -70 l-10 -6" stroke="${INK}" stroke-width="4"/>
        <g class="dsmoke" fill="#c8c0b8" opacity="0.7"><circle r="5"/><circle r="4"/></g></g>
      <g class="breath" style="display:none"><path d="M220 196 C160 180 120 220 80 230 C120 250 160 270 220 230 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="4"/><path d="M200 206 C160 200 140 222 120 230 C150 240 170 246 200 226 Z" fill="#ffd34d"/></g>`,
    setup(ctx) { place(ctx.hero, 100, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      q(ctx, 'dragon').setAttribute('transform', `translate(${320 - Math.min(30, t * 3)} ${260 + Math.sin(t * 3) * 6})`);
      setLids(ctx, 'dlid', blink(t, 0.5));
      const sm = q(ctx, 'dsmoke'); if (sm) [...sm.children].forEach((c, i) => { const k = (t * 0.9 + i * 0.5) % 1; c.setAttribute('cx', (-108 - k * 14).toFixed(1)); c.setAttribute('cy', (-80 - k * 40).toFixed(1)); c.setAttribute('r', (3 + k * 8).toFixed(1)); c.setAttribute('opacity', (1 - k).toFixed(2)); });
      spin(ctx, 'pennant', `translate(77 150) scale(1 ${1 + Math.sin(t * 6) * 0.3}) translate(-77 -150)`);
    },
    async win(ctx) {
      const s = ctx.tool('shield', 150, 330, 0.9);
      const b = q(ctx, 'breath'); b.style.display = '';
      ctx.sfx.whoosh();
      await ctx.T(0.8, (k) => { b.style.opacity = Math.sin(k * Math.PI); });
      b.style.display = 'none';
      ctx.puff(160, 320, '#ffbe2e', 14, 50);
      await ctx.T(0.6, (k) => q(ctx, 'dragon').setAttribute('transform', `translate(${290 + k * 200} ${260 - k * 200})`));
      s.dataset.keep = '1';
    },
    fails: { async roast(ctx) { const b = q(ctx, 'breath'); b.style.display = ''; ctx.sfx.whoosh(); await ctx.T(0.5, (k) => { b.style.opacity = k; }); ctx.burn(); await ctx.wait(0.3); b.style.display = 'none'; } },
  },

  // ---------------------------------------------------------------- 12. vampire in the graveyard
  vampire: {
    correct: 'garlic',
    wrong: { ketchup: 'bite', mirror: 'bite', teddy: 'bite' },
    bg: () => sky('#2a1a3a', '#5a3a6a', 'va') + `
      <circle cx="80" cy="80" r="34" fill="#fff6d0"/><circle cx="70" cy="72" r="7" fill="#e8dcb0"/><circle cx="92" cy="92" r="5" fill="#e8dcb0"/>
      <g transform="translate(300 330)" fill="#2a1e3a" opacity="0.9"><rect x="-40" y="-60" width="80" height="160"/><rect x="-60" y="-120" width="30" height="220"/><rect x="30" y="-100" width="26" height="200"/><path d="M-64 -120 l19 -36 l19 36 Z M27 -100 l16 -30 l16 30 Z"/><rect x="-50" y="-96" width="10" height="14" fill="#ffd34d"/></g>` + ground('#3a4a3a') + `
      ${deadTree(200, 432, 1, '#2a1e2a')}<path d="M172 330 q-6 20 0 34 l4 -2 q-4 -14 0 -30" fill="none" stroke="#2a1e2a" stroke-width="3"/>
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `M${6 + i * 34} 432 v-56 l-5 -8 h10 l-5 8`).join(' ')}" fill="#4a4258" ${S3}/><path d="M0 390 H400 M0 414 H400" stroke="#4a4258" stroke-width="5"/>
      <g fill="#8a8698" stroke="${INK}" stroke-width="4"><path d="M30 430 v-60 q0 -24 24 -24 q24 0 24 24 v60 Z"/><path d="M330 430 v-50 q0 -20 20 -20 q20 0 20 20 v50 Z"/></g><path d="M44 378 h20 M54 368 v24 M340 394 h20 M350 384 v22" stroke="${INK}" stroke-width="4" opacity="0.5"/><path d="M30 430 q8 -12 16 0 M362 430 q6 -10 12 0" fill="#4a6a3a" ${S3}/>
      ${tomb(250, 436, 0.7)}<path d="M150 446 q30 -14 60 0 Z" fill="#4a3a2a" ${S3}/>
      ${bat('bat1')}${bat('bat2')}
      <g class="vamp">${VAMP}</g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'vamp'), 340 - Math.min(110, t * 11), 430 + Math.sin(t * 2) * -6);
      flyBat(ctx, 'bat1', t, 200, 120, 120, 26, 0.9); flyBat(ctx, 'bat2', t + 2, 250, 170, 90, 20, 1.2);
    },
    async win(ctx) {
      ctx.tool('garlic', 175, 340, 0.6).dataset.keep = '1';
      const v = q(ctx, 'vamp');
      ctx.say('IYY!');
      v.innerHTML = `<path d="M-50 0 q25 -30 50 0 q25 -30 50 0 q-25 -10 -50 14 q-25 -24 -50 -14 Z" fill="#1a1a24" stroke="${INK}" stroke-width="4"/><circle cx="-6" cy="-2" r="3" fill="#e8453c"/><circle cx="6" cy="-2" r="3" fill="#e8453c"/>`;
      await ctx.T(0.9, (k) => place(v, 250 + k * 180, 300 - k * 260 + Math.sin(k * 20) * 10));
    },
    fails: { async bite(ctx) { const v = q(ctx, 'vamp'); await ctx.T(0.3, (k) => place(v, 250 - k * 80, 430)); ctx.say('ISIRDI!'); ctx.sfx.chomp(); paintHero(ctx.hero, 'frozen'); ctx.faint(); await ctx.T(0.4, (k) => place(ctx.hero, 120, 430, -k * 90)); } },
  },

  // ---------------------------------------------------------------- 13. desert, out of water
  desert: {
    correct: 'bottle',
    wrong: { salt: 'thirst', icecream: 'thirst', banana: 'thirst' },
    bg: () => sky('#ffcf7a', '#ffeccb', 'de') + `
      <path d="M60 380 L120 300 L180 380 Z M150 380 L190 330 L230 380 Z" fill="#e8b868" stroke="${INK}" stroke-width="3" stroke-opacity="0.4"/><path d="M120 300 L150 380 H180 Z M190 330 L210 380 H230 Z" fill="#d09a50" opacity="0.7"/>
      <path d="M0 400 Q80 350 170 384 T340 370 T400 380 V430 H0 Z" fill="#f6d690" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>` + ground('#f0c77a') + `
      <path d="M20 456 q30 -10 60 0 M150 476 q40 -12 80 0 M280 452 q30 -10 60 0 M60 500 q40 -12 80 0 M300 498 q30 -10 60 0" fill="none" stroke="#d8a85a" stroke-width="3" stroke-linecap="round"/>
      <g class="heat" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.5"><path d="M100 300 q8 -8 0 -16 q-8 -8 0 -16"/><path d="M290 280 q8 -8 0 -16 q-8 -8 0 -16"/><path d="M340 340 q8 -8 0 -16 q-8 -8 0 -16"/></g>
      <g class="sun" transform="translate(320 80)"><g class="sunrays"><path d="M0 -54 v-16 M0 54 v16 M-54 0 h-16 M54 0 h16 M38 38 l11 11 M-38 -38 l-11 -11 M38 -38 l11 -11 M-38 38 l-11 11" stroke="#ff9a2e" stroke-width="6" stroke-linecap="round"/></g><circle r="44" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><circle cx="-24" cy="10" r="7" fill="#ff8a6e" opacity="0.6"/><circle cx="24" cy="10" r="7" fill="#ff8a6e" opacity="0.6"/><circle cx="-14" cy="-6" r="5" fill="${INK}"/><circle cx="14" cy="-6" r="5" fill="${INK}"/><circle cx="-15.5" cy="-7.5" r="1.6" fill="#fff"/><circle cx="12.5" cy="-7.5" r="1.6" fill="#fff"/><path d="M-22 -18 l10 4 M22 -18 l-10 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path class="sun-mouth" d="M-14 14 q14 -10 28 0" fill="none" stroke="${INK}" stroke-width="4"/></g>
      <path d="M60 430 v-70 M60 380 h-18 v-24 M60 396 h18 v-30" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M60 430 v-70 M60 380 h-18 v-24 M60 396 h18 v-30" fill="none" stroke="#2eb872" stroke-width="14" stroke-linecap="round"/><path d="M58 420 v-50 M44 372 v-12 M76 388 v-16" stroke="#1f9a5a" stroke-width="2"/><circle cx="60" cy="356" r="5" fill="#ff6f9e" ${S3}/>
      ${stone(340, 434, 1.1, '#c89a6a')}<g transform="translate(300 440)"><path d="M-14 -2 q-6 -16 8 -18 q14 -2 16 12 q2 8 -6 8 Z" fill="#f6efe0" ${S3}/><circle cx="-4" cy="-10" r="3" fill="${INK}"/><circle cx="6" cy="-10" r="3" fill="${INK}"/><path d="M14 0 l16 -6 m-16 6 l18 2" stroke="#f6efe0" stroke-width="4" stroke-linecap="round"/></g>
      <g class="tumble"><circle r="16" fill="none" stroke="#a8804a" stroke-width="3"/><path d="M-14 -6 Q0 12 14 -6 M-10 10 Q0 -14 10 10 M-16 2 h32" fill="none" stroke="#a8804a" stroke-width="2.5"/></g>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'down'); setFace(ctx.hero, 'hurt'); },
    idle(ctx, t) {
      place(ctx.hero, 200, 430, Math.sin(t * 2) * 6); q(ctx, 'sun').setAttribute('transform', `translate(320 80) scale(${1 + Math.min(0.4, t * 0.04)})`);
      spin(ctx, 'sunrays', `rotate(${t * 20})`);
      spin(ctx, 'heat', `translate(${Math.sin(t * 4) * 3} ${-((t * 20) % 20)})`);
      const tx = ((t * 50) % 560) - 80; spin(ctx, 'tumble', `translate(${tx.toFixed(1)} ${(418 - Math.abs(Math.sin(t * 4)) * 14).toFixed(1)}) rotate(${(t * 240) % 360})`);
    },
    async win(ctx) {
      const b = ctx.tool('bottle', 230, 330, 0.6);
      setArms(ctx.hero, 'hold');
      await ctx.T(0.6, (k) => place(b, 230 - k * 20, 330 - k * 10, -k * 120, 0.6));
      b.remove();
      q(ctx, 'sun-mouth').setAttribute('d', 'M-16 8 q16 16 32 0');
      ctx.say('OH BE!');
    },
    fails: { async thirst(ctx) { await ctx.wait(0.4); ctx.say('SU...'); ctx.faint(); await ctx.T(0.6, (k) => place(ctx.hero, 200, 430, -k * 90)); } },
  },

  // ---------------------------------------------------------------- 14. meteor from the sky
  meteor: {
    correct: 'rocket',
    wrong: { umbrella: 'crush', magnet: 'crush', paper: 'crush' },
    bg: () => sky('#1a1530', '#5a3a6a', 'me') + `
      <ellipse cx="200" cy="420" rx="320" ry="90" fill="#ff8a2e" opacity="0.12"/>
      <path d="M0 430 V360 L50 320 L90 350 L150 300 L210 350 L260 316 L330 350 L400 310 V430 Z" fill="#3a2a4a" stroke="${INK}" stroke-width="3" stroke-opacity="0.4"/>
      <g fill="#4a3a5a" ${S3}><rect x="20" y="370" width="50" height="60"/><path d="M14 370 l31 -26 l31 26 Z"/><rect x="290" y="360" width="64" height="70"/><path d="M284 360 l38 -30 l38 30 Z"/><rect x="250" y="388" width="34" height="42"/></g>
      <g fill="#ffe680"><rect x="32" y="384" width="10" height="10"/><rect x="50" y="384" width="10" height="10"/><rect x="302" y="376" width="12" height="12"/><rect x="330" y="376" width="12" height="12"/><rect x="302" y="400" width="12" height="12"/><rect x="260" y="398" width="8" height="8"/></g>` + ground('#6a5a4a') + `
      <path d="M0 456 q40 -8 80 0 M130 486 q50 -10 100 0 M290 460 q40 -8 80 0" fill="none" stroke="#5a4a3a" stroke-width="3" stroke-linecap="round"/>${stone(120, 436, 0.9, '#7a6a5a')}${stone(360, 440, 1.1, '#7a6a5a')}
      <g class="stars"><circle cx="40" cy="40" r="2" fill="#fff"/><circle cx="120" cy="90" r="2" fill="#fff"/><circle cx="260" cy="30" r="2" fill="#fff"/><circle cx="360" cy="120" r="2" fill="#fff"/></g>
      <g class="meteor"><g class="mtrail"><path d="M44 -36 L-90 -170 L-40 -176 L-60 -150 L-10 -160 L64 -56 Z" fill="#ff6a1e" opacity="0.7"/><path d="M40 -40 L-60 -140 L-30 -150 L60 -60 Z" fill="#ffbe2e" opacity="0.85"/><path d="M30 -40 L-24 -100 L-6 -104 L44 -50 Z" fill="#fff6c0" opacity="0.8"/></g>
        <circle r="50" fill="#ff8a2e" opacity="0.35"/><circle r="46" fill="#8a6a5a" stroke="${INK}" stroke-width="4"/><path d="M-30 30 A40 40 0 0 0 40 20 A46 46 0 0 1 -30 30 Z" fill="#6a4a3a"/><circle cx="-14" cy="-8" r="10" fill="#6a4a3a"/><circle cx="16" cy="14" r="7" fill="#6a4a3a"/><circle cx="20" cy="-22" r="5" fill="#6a4a3a"/><path d="M-30 -24 l12 10 l-4 12 M4 20 l-8 14 M28 -4 l10 6" fill="none" stroke="#ff8a2e" stroke-width="3" stroke-linecap="round"/><circle cx="-20" cy="-24" r="7" fill="#fff" opacity="0.2"/></g>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const k = Math.min(1, t / 11); place(q(ctx, 'meteor'), 60 + k * 120, -40 + k * 260);
      spin(ctx, 'mtrail', `scale(${1 + Math.sin(t * 14) * 0.06})`);
    },
    async win(ctx) {
      const r = ctx.tool('rocket', 200, 340, 0.9);
      ctx.sfx.whoosh(); ctx.puff(200, 430, '#ff8a2e', 16, 60);
      await ctx.T(0.9, (k) => { place(r, 200 + k * 160, 340 - k * 420, 30 * k, 0.9); place(ctx.hero, 200 + k * 160, 430 - k * 420, 30 * k); });
      ctx.boom(200, 420);
    },
    fails: {
      async crush(ctx) {
        const m = q(ctx, 'meteor');
        await ctx.T(0.35, (k) => place(m, 180 + k * 20, 220 + k * 160));
        ctx.boom(200, 400); ctx.shake(0.6);
        place(ctx.hero, 200, 430, 0, 1.3, 0.25); setFace(ctx.hero, 'hurt');
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- 15. dino at the cliff edge
  dino: {
    correct: 'parachute',
    wrong: { skateboard: 'fall', drumstick: 'eaten', balloon: 'fall' },
    bg: () => sky('#9fe3ff', '#e2f6ff', 'di') + `
      <path d="M250 330 L300 230 L320 250 L340 220 L400 330 Z" fill="#b89a8a" stroke="${INK}" stroke-width="3" stroke-opacity="0.4"/><path d="M300 230 l8 16 l8 -6 l8 10 l8 -14 l8 4 L340 220 Z" fill="#e8453c" opacity="0.8"/><g fill="#c8c0b8" opacity="0.7"><circle cx="330" cy="200" r="12"/><circle cx="342" cy="178" r="16"/><circle cx="330" cy="150" r="20"/></g>
      <path d="M250 520 V360 Q300 330 340 350 T400 340 V520 Z" fill="#8ec49a" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <rect x="0" y="430" width="250" height="90" fill="#9c7a5b"/><path d="M0 466 h250 M0 494 h250" stroke="#8a6a4b" stroke-width="4"/><path d="M40 446 v20 M120 466 v28 M200 446 v20 M80 494 v26 M180 494 v26" stroke="#8a6a4b" stroke-width="3"/><rect y="430" width="250" height="14" fill="#7cc35a"/><path d="M0 444 h250" stroke="${INK}" stroke-width="2" opacity="0.3"/><path d="M250 430 L250 520" stroke="${INK}" stroke-width="4"/><circle cx="70" cy="480" r="5" fill="#f6efe0" ${S3}/><path d="M150 506 l14 -4 l2 6 Z" fill="#f6efe0" ${S3}/>
      <path d="M260 520 L300 470 L340 520 Z M320 520 L370 460 L420 520 Z" fill="#2e7d4a"/>
      <g transform="translate(30 432)"><path d="M0 0 q-6 -40 -26 -50 M0 0 q4 -44 22 -54 M0 0 q-2 -50 -4 -64" fill="none" stroke="#2e7d4a" stroke-width="5" stroke-linecap="round"/><path d="M-26 -50 l6 6 M-18 -36 l6 4 M22 -54 l-6 8 M14 -38 l-6 4 M-4 -64 l-6 6 M-4 -64 l6 6" stroke="#2e7d4a" stroke-width="4" stroke-linecap="round"/></g>
      <g transform="translate(150 436)"><path d="M-30 0 q0 -14 30 -14 q30 0 30 14 Z" fill="#c9a06b" ${S3}/><ellipse cx="-10" cy="-18" rx="9" ry="12" fill="#f6efe0" ${S3}/><ellipse cx="10" cy="-18" rx="9" ry="12" fill="#f6efe0" ${S3}/><circle cx="-12" cy="-22" r="2" fill="#2eb872"/><circle cx="8" cy="-14" r="2.5" fill="#2eb872"/></g>
      <g class="dino"><g class="dtail"><path d="M-70 0 L-120 -20 L-60 -40 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/><path d="M-110 -18 l8 -8 l4 6 M-96 -24 l8 -8 l4 8" fill="#1f9a5a" stroke="${INK}" stroke-width="2"/></g><path d="M-70 0 L-50 -60 C-60 -110 -20 -140 20 -130 L60 -120 C80 -110 70 -90 50 -92 L20 -94 L10 -60 L40 -40 L30 0 L10 0 L10 -30 L-20 -30 L-30 0 Z" fill="#2eb872" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M14 -90 L6 -60 L30 -44 L24 -30 Q-10 -40 -20 -30 Q-30 -60 -6 -90 Z" fill="#9adf6a" opacity="0.9"/><path d="M-50 -64 l-10 -10 l14 -4 M-42 -96 l-12 -10 l16 -4 M-24 -122 l-8 -14 l16 2 M2 -132 l-2 -14 l12 6" fill="#ff8a2e" ${S3}/>
        <circle cx="-30" cy="-60" r="6" fill="#1f9a5a"/><circle cx="-40" cy="-40" r="4" fill="#1f9a5a"/><circle cx="-14" cy="-100" r="5" fill="#1f9a5a"/>${eye(24, -116, 7, 'dnlid', '#2eb872')}<path d="M14 -126 l18 4" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="62" cy="-114" r="2.5" fill="${INK}"/>
        <path d="M30 -100 l6 6 l6 -6 l6 6" fill="none" stroke="#fff" stroke-width="3"/><path d="M40 -40 l6 4 M40 -40 l4 6 M28 0 l6 0 M8 0 l-6 0" stroke="#f6efe0" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 210, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'dino'), -40 + Math.min(130, t * 13), 430 - Math.abs(Math.sin(t * 6)) * 6, 0, -1, 1);
      spin(ctx, 'dtail', `rotate(${Math.sin(t * 6) * 8} -66 -20)`);
      setLids(ctx, 'dnlid', blink(t, 1.7));
    },
    async win(ctx) {
      const p = ctx.tool('parachute', 210, 300, 1.1);
      await ctx.T(1.2, (k) => { const x = 210 + k * 170; const y = 430 + Math.sin(k * Math.PI * 0.5) * 30 - k * 10; place(ctx.hero, x, y); place(p, x, y - 160, Math.sin(k * 10) * 6, 1.1); });
    },
    fails: {
      async fall(ctx) { await ctx.T(0.3, (k) => place(ctx.hero, 210 + k * 50, 430)); ctx.sfx.whoosh(); await ctx.T(0.6, (k) => place(ctx.hero, 260 + k * 30, 430 + k * k * 160, k * 120)); ctx.say('AAAA!'); },
      async eaten(ctx) { const d = q(ctx, 'dino'); await ctx.T(0.3, (k) => place(d, 90 + k * 80, 430, 0, -1, 1)); ctx.sfx.chomp(); ctx.say('CHOMP!'); ctx.hero.style.display = 'none'; await ctx.wait(0.4); },
    },
  },
  // ================================================================ second batch
  // ---------------------------------------------------------------- 16. snake in the jungle
  snake: {
    correct: 'flute',
    wrong: { drum: 'snakebite', stick: 'snakebite', cheese: 'snakebite' },
    bg: () => sky('#9fe3a0', '#e2f6d0', 'sn') + `
      <g fill="#8ac88a" opacity="0.8"><rect x="120" y="0" width="26" height="430"/><rect x="250" y="0" width="34" height="430"/><circle cx="133" cy="60" r="60"/><circle cx="267" cy="90" r="70"/><circle cx="200" cy="30" r="50"/></g>
      <path d="M180 0 q-10 80 6 150 M300 0 q14 70 -4 130" fill="none" stroke="#3f9a4a" stroke-width="5" stroke-linecap="round"/><path d="M186 150 l-10 6 l12 2 Z M296 130 l10 6 l-12 2 Z M182 90 l-10 4 l10 4 Z" fill="#3f9a4a"/>
      ${hills('#7cbc6a', '#6ab05a')}` + ground('#5aa84a') + `
      <path d="M0 430 C10 330 40 300 60 260 M30 330 q-30 -10 -40 -40 M50 290 q30 -20 50 -10" fill="none" stroke="#2e7d4a" stroke-width="14" stroke-linecap="round"/>
      <g fill="#3f9a4a" ${S3}><path d="M60 260 q-30 -30 -10 -60 q20 30 10 60 Z"/><path d="M100 280 q30 -30 50 -10 q-30 20 -50 10 Z"/><path d="M-10 290 q-10 -30 10 -46 q10 30 -10 46 Z"/></g>
      <g transform="translate(110 432)"><path d="M0 0 q-10 -30 -30 -40 q24 6 30 30 q4 -30 26 -44 q-16 24 -20 54" fill="#3f9a4a" ${S3}/></g>
      <g transform="translate(260 436)"><path d="M0 0 v-30" stroke="#2e7d4a" stroke-width="4"/><g fill="#ff6f9e" ${S3}><ellipse cx="-8" cy="-34" rx="8" ry="5"/><ellipse cx="8" cy="-34" rx="8" ry="5"/><ellipse cy="-42" rx="5" ry="8"/></g><circle cy="-34" r="4" fill="#ffd34d"/></g>
      <path d="M330 430 q20 -60 70 -80 v80 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/><path d="M350 400 q16 -20 36 -26 M360 420 q12 -12 30 -18" fill="none" stroke="#1f6a3a" stroke-width="3"/>
      <g class="snake"><path class="sbody" d="M70 0 C50 -20 30 20 10 0 C-10 -20 -30 20 -40 -10 C-46 -30 -44 -56 -40 -70" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path class="sbody2" d="M70 0 C50 -20 30 20 10 0 C-10 -20 -30 20 -40 -10 C-46 -30 -44 -56 -40 -70" fill="none" stroke="#7cc35a" stroke-width="15" stroke-linecap="round" stroke-dasharray="14 6"/>
        <path d="M70 6 C50 -14 30 26 10 6" fill="none" stroke="#e6e08a" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 5" opacity="0.8"/>
        <g class="shead"><ellipse rx="22" ry="15" fill="#7cc35a" stroke="${INK}" stroke-width="4"/><path d="M-6 -12 q10 -4 20 2 M0 -6 l4 -3 l4 3 l4 -3" fill="none" stroke="#4f9a3a" stroke-width="2.5" stroke-linecap="round"/><circle cx="-18" cy="2" r="1.5" fill="${INK}"/><path d="M-20 8 q10 4 22 2" fill="none" stroke="${INK}" stroke-width="2"/><g class="seyes"><circle cx="-8" cy="-5" r="4.5" fill="#fff6a0" stroke="${INK}" stroke-width="2"/><path d="M-8 -9 v8" stroke="${INK}" stroke-width="2"/><circle cx="-9.5" cy="-7" r="1.2" fill="#fff"/></g><path class="stongue" d="M-21 5 l-14 2 m14 -2 l-13 -5" stroke="#e8453c" stroke-width="3" stroke-linecap="round"/></g></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'snake'), 380 - Math.min(130, t * 13), 430);
      place(q(ctx, 'shead'), -40 + Math.sin(t * 3) * 4, -78 + Math.sin(t * 4) * 6);
      q(ctx, 'stongue').style.display = Math.sin(t * 9) > 0 ? '' : 'none';
    },
    async win(ctx) {
      const f = ctx.tool('flute', 158, 340, 0.45);
      setArms(ctx.hero, 'hold');
      ctx.notes(170, 320);
      const sn = q(ctx, 'snake');
      const x0 = 380 - Math.min(130, ctx.t() * 13);
      await ctx.T(1.0, (k) => place(sn, x0, 430, Math.sin(k * Math.PI * 4) * 8));
      q(ctx, 'seyes').innerHTML = `<path d="M-13 -5 q5 4 10 0" fill="none" stroke="${INK}" stroke-width="3"/>`;
      q(ctx, 'stongue').style.display = 'none';
      ctx.say('Zzz');
      await ctx.T(0.8, (k) => place(sn, x0 + k * 200, 430));
      f.remove();
    },
    fails: {
      async snakebite(ctx) {
        const sn = q(ctx, 'snake');
        const x0 = 380 - Math.min(130, ctx.t() * 13);
        ctx.say('TSSS!'); ctx.sfx.buzz();
        await ctx.T(0.25, (k) => place(sn, x0 - k * (x0 - 200), 430));
        ctx.sfx.chomp(); ctx.faint(); ctx.hero.style.setProperty('--skin', '#b8e08a');
        await ctx.T(0.5, (k) => place(ctx.hero, 130 - k * 30, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- 17. UFO beam
  alien: {
    correct: 'mirror',
    wrong: { magnet: 'abduct', balloon: 'abduct', kite: 'abduct' },
    bg: () => sky('#141a3a', '#3a3a7a', 'al') + `
      <circle cx="330" cy="60" r="22" fill="#e8e4d0"/><circle cx="324" cy="54" r="5" fill="#c8c4b0"/>
      ${hills('#2a3a5a', '#2e4a4a')}<g fill="#2a2a48" ${S3}><rect x="300" y="350" width="70" height="80"/><path d="M294 350 l41 -36 l41 36 Z"/></g><path d="M320 430 v-40 h30 v40 M320 390 l30 40 M350 390 l-30 40" fill="none" stroke="#4a4a6a" stroke-width="3"/><rect x="326" y="334" width="18" height="12" fill="#ffe680"/>
      <g transform="translate(40 430)"><path d="M0 0 V-110" stroke="#4a4a6a" stroke-width="5"/><g class="mill" transform="translate(0 -110)"><path d="M0 0 l-4 -40 h8 Z M0 0 l40 -4 v8 Z M0 0 l4 40 h-8 Z M0 0 l-40 4 v-8 Z" fill="#6a6a8a" ${S3}/></g></g>` + ground('#3a5a4a') + `
      <path d="M0 450 h400 M0 476 h400 M0 502 h400" stroke="#2e4a3e" stroke-width="3" stroke-dasharray="6 10"/>
      <g fill="#8a6a4a" ${S3}>${[230, 270, 380].map((x) => `<rect x="${x - 4}" y="388" width="8" height="44"/>`).join('')}</g><path d="M226 400 H384 M226 416 H384" stroke="#8a6a4a" stroke-width="4"/>
      <g transform="translate(70 432)"><ellipse cy="-26" rx="26" ry="16" fill="#f6f6fa" ${S3}/><path d="M-10 -38 q-4 10 6 14 M8 -20 q6 6 12 0" fill="#2b2140"/><path d="M-18 -12 v12 M-6 -12 v12 M8 -12 v12 M18 -12 v12" stroke="${INK}" stroke-width="4"/><ellipse cx="-30" cy="-34" rx="11" ry="9" fill="#f6f6fa" ${S3}/><ellipse cx="-36" cy="-30" rx="5" ry="4" fill="#ffb0c0"/><circle cx="-28" cy="-37" r="1.8" fill="${INK}"/><path d="M-26 -44 l4 -5" stroke="${INK}" stroke-width="2"/></g>
      <g fill="#fff"><circle cx="40" cy="160" r="2"/><circle cx="120" cy="220" r="2"/><circle cx="350" cy="190" r="2"/><circle cx="300" cy="260" r="2"/><circle cx="60" cy="300" r="2"/></g>
      <path class="beam" d="M160 120 L90 440 L310 440 L240 120 Z" fill="#9dff8a" opacity="0.35"/><ellipse cx="200" cy="436" rx="110" ry="12" fill="#9dff8a" opacity="0.3"/>
      <g class="ufo" transform="translate(200 100)"><path d="M-36 -8 C-36 -54 36 -54 36 -8 Z" fill="#bfeaff" stroke="${INK}" stroke-width="4"/><g class="alien"><path d="M0 -42 v-10" stroke="${INK}" stroke-width="2"/><circle cy="-54" r="3" fill="#ff6f9e" stroke="${INK}" stroke-width="1.5"/><ellipse cx="0" cy="-26" rx="14" ry="16" fill="#9adf6a" stroke="${INK}" stroke-width="3"/><ellipse cx="-6" cy="-28" rx="4" ry="6" fill="${INK}"/><ellipse cx="6" cy="-28" rx="4" ry="6" fill="${INK}"/><circle cx="-7" cy="-31" r="1.5" fill="#fff"/><circle cx="5" cy="-31" r="1.5" fill="#fff"/><path d="M-4 -18 q4 3 8 0" fill="none" stroke="${INK}" stroke-width="2"/></g><path d="M-24 -30 q6 -14 18 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
        <ellipse rx="96" ry="24" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><path d="M-90 -6 Q0 -22 90 -6" fill="none" stroke="#c8d2e0" stroke-width="4"/><path d="M-80 12 Q0 30 80 12" fill="none" stroke="#7a8698" stroke-width="4"/><g class="ufolights" fill="#ffd34d" stroke="${INK}" stroke-width="2"><circle cx="-60" cy="4" r="6"/><circle cx="-20" cy="10" r="6"/><circle cx="20" cy="10" r="6"/><circle cx="60" cy="4" r="6"/></g></g>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const lift = Math.min(120, t * 11);
      place(ctx.hero, 200, 430 - lift, Math.sin(t * 2) * 8);
      q(ctx, 'ufo').setAttribute('transform', `translate(${200 + Math.sin(t * 1.5) * 6} ${100 + Math.sin(t * 3) * 5})`);
      q(ctx, 'beam').setAttribute('opacity', 0.3 + Math.sin(t * 10) * 0.06);
      const lights = q(ctx, 'ufolights'); if (lights) [...lights.children].forEach((c, i) => c.setAttribute('fill', ((t * 6) | 0) % 4 === i ? '#fff6c0' : i % 2 ? '#ff6f9e' : '#ffd34d'));
      spin(ctx, 'mill', `translate(0 -110) rotate(${t * 40})`);
    },
    async win(ctx) {
      const y = 430 - Math.min(120, ctx.t() * 11);
      const m = ctx.tool('mirror', 226, y - 110, 0.5);
      const beam = q(ctx, 'beam');
      beam.setAttribute('fill', '#ff6f5e');
      ctx.flash('#9dff8a'); ctx.sfx.whoosh();
      await ctx.T(0.4, (k) => beam.setAttribute('opacity', 0.6 * (1 - k)));
      const u = q(ctx, 'ufo');
      ctx.puff(200, 100, '#5a5a62', 12, 50); ctx.say('ZZAP!');
      await ctx.T(0.5, (k) => place(ctx.hero, 200, y + (430 - y) * k * k));
      m.remove();
      await ctx.T(0.8, (k) => u.setAttribute('transform', `translate(${200 + k * 300} ${100 - k * 60 + Math.sin(k * 20) * 10}) rotate(${k * 30})`));
    },
    fails: {
      async abduct(ctx) {
        const y = 430 - Math.min(120, ctx.t() * 11);
        ctx.sfx.whoosh();
        await ctx.T(0.7, (k) => place(ctx.hero, 200, y - (y - 120) * k, k * 360, 1 - k * 0.8));
        ctx.hero.style.display = 'none';
        q(ctx, 'beam').style.display = 'none';
        ctx.say('BYE!');
        await ctx.T(0.5, (k) => q(ctx, 'ufo').setAttribute('transform', `translate(${200 + k * 320} ${100 - k * 80})`));
      },
    },
  },

  // ---------------------------------------------------------------- 18. tornado
  tornado: {
    correct: 'anchor',
    wrong: { kite: 'blown', umbrella: 'blown', balloon: 'blown' },
    bg: () => sky('#6a7488', '#b8c0cc', 'to') + `
      <g fill="#5a6278" stroke="${INK}" stroke-width="3" stroke-opacity="0.4"><ellipse cx="80" cy="30" rx="120" ry="40"/><ellipse cx="300" cy="20" rx="140" ry="44"/><ellipse cx="200" cy="50" rx="90" ry="30"/></g>
      ${hills('#9aa880', '#86a070')}` + ground('#8aa86a') + `
      <path d="M0 448 l400 -6 M0 470 l400 -8 M0 494 l400 -10" stroke="#7a9a5a" stroke-width="4"/>
      <g fill="#c9a06b" ${S3}><rect x="120" y="396" width="8" height="36" transform="rotate(-12 124 432)"/><rect x="190" y="400" width="8" height="32" transform="rotate(10 194 432)"/></g><path d="M84 410 L126 404 M84 422 L126 418 M126 404 L160 410" stroke="#c9a06b" stroke-width="4"/>
      <g class="windtree" transform="translate(250 430)"><path d="M0 0 v-60 q-10 -10 -6 -24 M0 -50 l14 -14" fill="none" stroke="#6b5a4a" stroke-width="7" stroke-linecap="round"/><circle cx="-8" cy="-86" r="16" fill="#6a8a4a" ${S3}/><circle cx="16" cy="-68" r="12" fill="#6a8a4a" ${S3}/></g>
      <path d="M20 430 v-60 l30 -30 l30 30 v60 Z" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M14 374 l36 -38 l36 38" fill="none" stroke="#8a3a32" stroke-width="7" stroke-linecap="round"/><rect x="40" y="398" width="20" height="32" fill="#8a5a32" ${S3}/><rect x="32" y="372" width="14" height="12" fill="#ffe680" ${S3}/><path d="M30 352 l6 -4" stroke="${INK}" stroke-width="2"/>
      <g class="twister">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<ellipse cy="${-20 - i * 52}" rx="${18 + i * 15}" ry="${10 + i * 3}" fill="${i % 2 ? '#9aa6b8' : '#b5bfcc'}" stroke="${INK}" stroke-width="4"/>`).join('')}
        <path d="M-60 -250 q40 14 90 -6 M-46 -150 q30 10 70 -4 M-30 -70 q20 8 46 -2" fill="none" stroke="#e6ecf4" stroke-width="4" stroke-linecap="round" opacity="0.8"/><ellipse cy="-6" rx="40" ry="10" fill="#a08a6a" opacity="0.5"/>
        <rect class="deb" x="-60" y="-200" width="16" height="10" fill="#8a5a32"/><rect class="deb" x="40" y="-300" width="12" height="12" fill="#e8453c"/><circle class="deb" cx="-30" cy="-120" r="7" fill="#2eb872"/><path class="deb" d="M50 -160 l10 -4 l-2 10 Z" fill="#ffd34d" ${S3}/></g>`,
    setup(ctx) { place(ctx.hero, 150, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const x = 400 - Math.min(110, t * 11);
      const tw = q(ctx, 'twister');
      place(tw, x, 430);
      [...tw.querySelectorAll('ellipse')].forEach((e, i) => e.setAttribute('cx', Math.sin(t * 6 + i * 0.8) * (4 + i * 2)));
      [...tw.querySelectorAll('.deb')].forEach((d, i) => d.setAttribute('transform', `rotate(${t * 300 + i * 120} 0 ${-150 - i * 50})`));
      place(ctx.hero, 150 + Math.min(10, t), 430, Math.min(14, t * 1.5) + Math.sin(t * 12) * 2);
      spin(ctx, 'windtree', `translate(250 430) rotate(${-8 - Math.min(10, t) + Math.sin(t * 9) * 4})`);
    },
    async win(ctx) {
      const a = ctx.tool('anchor', 130, 410, 0.55);
      ctx.sfx.hit(); ctx.shake();
      const line = el('path', { d: 'M130 395 L168 340', stroke: INK, 'stroke-width': 4 });
      ctx.layer.appendChild(line);
      setArms(ctx.hero, 'hold');
      const tw = q(ctx, 'twister');
      const x0 = 400 - Math.min(110, ctx.t() * 11);
      await ctx.T(1.2, (k) => { place(tw, x0 - k * 450, 430); place(ctx.hero, 158, 430, Math.sin(k * Math.PI) * 25); });
      a.dataset.keep = '1';
    },
    fails: {
      async blown(ctx) {
        ctx.sfx.whoosh(); ctx.say('WHOOO!');
        await ctx.T(0.9, (k) => place(ctx.hero, 160 + k * 140, 430 - k * 460, k * 720, 1 - k * 0.5));
      },
    },
  },

  // ---------------------------------------------------------------- 19. car sinking in a lake
  carsink: {
    correct: 'hammer',
    wrong: { sponge: 'sink', umbrella: 'sink', banana: 'sink' },
    bg: () => sky('#bfe0ff', '#dff0ff', 'cs') + `
      <path d="M0 152 V110 Q40 86 90 104 T190 100 T300 96 T400 108 V152 Z" fill="#8ec49a" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>${[30, 70, 330, 370].map((x, i) => pine(x, 140 + (i % 2) * 6, 0.45, '#4a8a5a')).join('')}
      <g transform="translate(150 150)"><rect x="-50" y="-10" width="100" height="8" fill="#c9893b" ${S3}/><path d="M-40 -2 v14 M0 -2 v14 M40 -2 v14" stroke="${INK}" stroke-width="4"/></g>
      <rect y="150" width="400" height="370" fill="#2f8fd8"/><rect y="300" width="400" height="220" fill="#2a7cc0"/><rect y="420" width="400" height="100" fill="#246cb0"/>
      <path d="M40 150 L10 520 H70 L90 150 Z M220 150 L200 520 H250 L250 150 Z M340 150 L360 520 H400 V150 Z" fill="#fff" opacity="0.07"/>
      <path d="M0 150 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
      <path d="M0 520 q60 -30 120 -10 q80 -30 160 0 q60 -20 120 -10 V520 Z" fill="#c9a06b" opacity="0.6"/>
      <g class="weed" fill="none" stroke="#2eb872" stroke-width="6" stroke-linecap="round"><path d="M30 520 q-10 -30 4 -60 q12 -30 -2 -60"/><path d="M50 520 q8 -24 -2 -48"/><path d="M370 520 q10 -30 -4 -60 q-12 -30 2 -50"/></g>
      ${stone(340, 512, 1.2, '#6a7a8a')}${stone(90, 516, 0.9, '#6a7a8a')}
      <g class="fish1"><path d="M-12 0 q12 -12 24 0 q-12 12 -24 0 Z M12 0 l8 -6 v12 Z" fill="#ffbe2e" ${S3}/><circle cx="-5" cy="-2" r="1.6" fill="${INK}"/></g>
      <g class="bub" fill="#bfeaff" stroke="${INK}" stroke-width="2"><circle cx="120" cy="300" r="6"/><circle cx="300" cy="260" r="8"/><circle cx="260" cy="200" r="5"/></g>`,
    setup(ctx) {
      place(ctx.hero, 200, 440); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="car">
        <rect class="cabin" x="122" y="330" width="156" height="0" fill="#1d6bb8" opacity="0.85"/>
        <rect class="glass" x="122" y="250" width="156" height="80" fill="#bfeaff" opacity="0.35"/>
        <path d="M110 340 L130 240 H270 L290 340" fill="none" stroke="#e8453c" stroke-width="14" stroke-linejoin="round"/><path d="M110 340 L130 240 H270 L290 340" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="70" y="330" width="260" height="90" rx="22" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M84 384 h232" stroke="#b8302a" stroke-width="5"/><path d="M200 334 v82" stroke="${INK}" stroke-width="3"/><rect x="176" y="350" width="18" height="6" rx="3" fill="#b8302a" stroke="${INK}" stroke-width="2"/><rect x="286" y="300" width="16" height="11" rx="3" fill="#e8453c" stroke="${INK}" stroke-width="3"/><path d="M90 344 q20 -8 40 -6" stroke="#ff8a7e" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="70" y="392" width="20" height="10" rx="3" fill="#ff8a2e" stroke="${INK}" stroke-width="2"/><rect x="290" y="350" width="34" height="18" rx="6" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
        <circle cx="120" cy="424" r="26" fill="${INK}"/><circle cx="280" cy="424" r="26" fill="${INK}"/><circle cx="120" cy="424" r="10" fill="#9aa6b8"/><circle cx="280" cy="424" r="10" fill="#9aa6b8"/></g>`);
    },
    idle(ctx, t) {
      const h = Math.min(80, t * 8);
      const c = q(ctx, 'cabin');
      c.setAttribute('y', 330 - h); c.setAttribute('height', h);
      [...q(ctx, 'bub').children].forEach((b, i) => b.setAttribute('cy', 330 - ((t * 40 + i * 70) % 180)));
      const fx = ((t * 40) % 520) - 60; spin(ctx, 'fish1', `translate(${(400 - fx).toFixed(1)} ${(470 + Math.sin(t * 3) * 6).toFixed(1)})`);
      spin(ctx, 'weed', `translate(0 520) skewX(${Math.sin(t * 1.5) * 6}) translate(0 -520)`);
    },
    async win(ctx) {
      const hm = ctx.tool('hammer', 240, 270, 0.5);
      await ctx.T(0.25, (k) => place(hm, 240, 270, -60 + k * 90, 0.5));
      ctx.sfx.boom(); ctx.say('KRAK!');
      q(ctx, 'glass').style.display = 'none';
      ctx.puff(200, 290, '#e6f6ff', 16, 70);
      hm.remove();
      await ctx.T(0.4, (k) => q(ctx, 'cabin').setAttribute('opacity', 0.85 * (1 - k)));
      setArms(ctx.hero, 'up');
      ctx.bubbles(200, 260);
      await ctx.T(0.9, (k) => place(ctx.hero, 200, 440 - k * 260));
      setFace(ctx.hero, 'happy'); ctx.say('PUH!');
    },
    fails: {
      async sink(ctx) {
        const c = q(ctx, 'cabin');
        const h0 = Number(c.getAttribute('height'));
        await ctx.T(0.8, (k) => { const h = h0 + (92 - h0) * k; c.setAttribute('y', 330 - h); c.setAttribute('height', h); });
        setFace(ctx.hero, 'hurt'); ctx.bubbles(200, 260);
        await ctx.T(0.6, (k) => q(ctx, 'car').setAttribute('transform', `translate(0 ${k * 60})`));
      },
    },
  },

  // ---------------------------------------------------------------- 20. hot air balloon going down
  airballoon: {
    correct: 'scissors',
    wrong: { anchor: 'crash', steak: 'crash', drum: 'crash' },
    bg: () => sky('#8fd3ff', '#e0f4ff', 'ab') + `
      <path d="M0 520 V400 L60 330 L100 370 L160 290 L230 380 L290 320 L340 360 L400 300 V520 Z" fill="#b0bcd8" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/><path d="M60 330 L48 346 l8 -2 l6 6 l8 -8 Z M160 290 L144 312 l8 -4 l8 8 l8 -8 l6 4 Z M290 320 L278 336 l8 -2 l6 6 l6 -6 Z M400 300 L386 318 l8 -2 l6 4 Z" fill="#fff"/>
      <path d="M0 520 V450 Q100 410 200 440 T400 430 V520 Z" fill="#8ec49a" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>${[40, 140, 270, 360].map((x, i) => pine(x, 452 - (i % 2) * 8, 0.5, '#4a8a5a')).join('')}
      <path d="M0 520 L0 470 L40 440 L70 470 L110 430 L150 470 L190 440 L230 470 L270 430 L310 470 L350 440 L400 470 V520 Z" fill="#8a6a5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M40 440 l-8 10 l8 -2 l6 6 l4 -8 Z M110 430 l-10 12 l10 -4 l8 6 l4 -8 Z M190 440 l-8 10 l8 -2 l6 6 l4 -8 Z M270 430 l-10 12 l10 -4 l8 6 l4 -8 Z M350 440 l-8 10 l8 -2 l6 6 l4 -8 Z" fill="#fff"/>
      <g fill="#fff" stroke="${INK}" stroke-width="3"><ellipse cx="70" cy="90" rx="40" ry="16"/><ellipse cx="330" cy="150" rx="34" ry="14"/></g>
      <g class="env"><path d="M-80 0 C-80 -110 80 -110 80 0 C80 50 30 80 20 100 h-40 C-30 80 -80 50 -80 0 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M-30 -86 C-40 -40 -30 40 -12 100 h24 C30 40 40 -40 30 -86 C10 -94 -10 -94 -30 -86 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/>
        <path d="M-80 0 Q0 22 80 0 M-74 -40 Q0 -24 74 -40" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-66 -50 Q-60 -80 -36 -88" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.6"/><path d="M50 30 Q70 0 70 -30" fill="none" stroke="#b8302a" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
        <path d="M-6 -20 a10 10 0 1 0 12 0" fill="#e8453c" stroke="${INK}" stroke-width="3"/><path d="M-20 92 h40" stroke="${INK}" stroke-width="3"/><path d="M58 -2 l10 14 l6 -16 M-60 -4 l-6 18" fill="none" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) {
      setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="front"><path d="M-34 -60 L-20 -200 M34 -60 L20 -200" stroke="${INK}" stroke-width="3"/>
        <path d="M-14 -200 h28 v-10 h-28 Z" fill="#6a7488" stroke="${INK}" stroke-width="3"/><path class="burner" d="M0 -210 q-8 -10 0 -22 q8 12 0 22 Z" fill="#7fb8ff" stroke="${INK}" stroke-width="2"/>
        <rect x="-38" y="-62" width="76" height="66" rx="8" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M-38 -40 h76 M-38 -18 h76" stroke="${INK}" stroke-width="2"/><path d="M-24 -62 v66 M-8 -62 v66 M8 -62 v66 M24 -62 v66" stroke="#a8702e" stroke-width="2"/><rect x="-42" y="-66" width="84" height="10" rx="5" fill="#8a5a32" stroke="${INK}" stroke-width="3"/>
        <g class="bags"><path d="M-38 -56 l-14 14 M38 -56 l14 14" stroke="${INK}" stroke-width="3"/><g fill="#b58a5a" stroke="${INK}" stroke-width="3"><path d="M-62 -44 h20 l4 28 h-28 Z"/><path d="M42 -44 h20 l4 28 h-28 Z"/></g></g></g>`);
      this.pos(ctx, 300);
    },
    pos(ctx, y, rot = 0) { place(ctx.hero, 200, y - 4, rot); place(q(ctx, 'front'), 200, y, rot); place(q(ctx, 'env'), 200, y - 300, rot); ctx.by = y; },
    idle(ctx, t) {
      this.pos(ctx, 300 + Math.min(120, t * 12) + Math.sin(t * 2) * 3, Math.sin(t * 1.6) * 3);
      spin(ctx, 'burner', `translate(0 -210) scale(${Math.max(0.15, 1 - t * 0.07) * (0.8 + Math.abs(Math.sin(t * 11)) * 0.3)}) translate(0 210)`);
    },
    async win(ctx) {
      const sc = ctx.tool('scissors', 200, ctx.by - 80, 0.45);
      ctx.sfx.whoosh();
      const bags = q(ctx, 'bags');
      await ctx.T(0.5, (k) => bags.setAttribute('transform', `translate(0 ${k * k * 200})`));
      sc.remove(); bags.style.display = 'none';
      const y0 = ctx.by;
      await ctx.T(1.0, (k) => this.pos(ctx, y0 - k * 160));
    },
    fails: {
      async crash(ctx) {
        const y0 = ctx.by;
        ctx.sfx.whoosh();
        await ctx.T(0.5, (k) => this.pos(ctx, y0 + (470 - y0) * k * k));
        ctx.sfx.boom(); ctx.shake(); ctx.puff(200, 470, '#b58a5a', 18, 80);
        ctx.faint();
        await ctx.T(0.3, (k) => this.pos(ctx, 470, k * 25));
      },
    },
  },

  // ---------------------------------------------------------------- 21. rolling boulder
  boulder: {
    correct: 'skateboard',
    wrong: { banana: 'crush', broccoli: 'crush', umbrella: 'crush' },
    bg: () => sky('#ffd9a0', '#fff0d8', 'bd') + `
      <path d="M220 430 V330 h30 l10 -20 h60 l10 20 h20 V430 Z M330 430 V280 h20 l6 -14 h30 l6 14 h8 V430 Z" fill="#e8b88a" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/><path d="M230 350 h100 M340 300 h56 M226 380 h110" stroke="#d8a070" stroke-width="3"/>
      <path d="M0 200 L260 430 H400 V520 H0 Z" fill="#c9a06b" stroke="${INK}" stroke-width="4"/><rect y="430" width="400" height="90" fill="#c9a06b"/>
      <path d="M0 250 L210 436 M0 300 L150 432 M0 360 L80 430" stroke="#b58a52" stroke-width="5" stroke-linecap="round"/><path d="M0 464 h400 M0 496 h400" stroke="#b58a52" stroke-width="3" stroke-dasharray="20 14"/>
      <path d="M40 300 l10 -16 l10 16 M120 380 l8 -12 l8 12" fill="none" stroke="#8a6a3a" stroke-width="4"/>
      ${stone(70, 270, 0.6, '#a8906a')}${stone(180, 360, 0.5, '#a8906a')}${stone(110, 470, 0.8, '#a8906a')}
      <g transform="translate(370 432)"><path d="M0 0 v-70 M0 -40 h-16 v-20 M0 -30 h14 v-22" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M0 0 v-70 M0 -40 h-16 v-20 M0 -30 h14 v-22" fill="none" stroke="#2eb872" stroke-width="12" stroke-linecap="round"/><circle cy="-74" r="4" fill="#ff6f9e" ${S3}/></g>
      <g transform="translate(250 432)"><path d="M0 0 v-60" stroke="#8a5a32" stroke-width="5"/><path d="M0 -94 l30 26 l-30 26 l-30 -26 Z" fill="#ffd34d" ${S4}/><circle cx="-6" cy="-64" r="7" fill="#9aa6b8" stroke="${INK}" stroke-width="2"/><circle cx="7" cy="-76" r="5" fill="#9aa6b8" stroke="${INK}" stroke-width="2"/><path d="M-12 -56 l20 -6" stroke="${INK}" stroke-width="2"/></g>
      <g class="rock"><circle r="58" fill="#9aa6b8" stroke="${INK}" stroke-width="5"/><circle cx="18" cy="16" r="40" fill="#8a96a8"/><circle cx="-18" cy="-24" r="14" fill="#c8d2e0"/><circle cx="-34" cy="22" r="8" fill="#7a8698"/><circle cx="30" cy="-30" r="6" fill="#7a8698"/><path d="M-30 -20 l20 10 l-6 20 M10 -40 l16 18 M20 20 l14 10" fill="none" stroke="${INK}" stroke-width="4"/><path d="M-50 -10 q-4 -14 6 -22 M36 40 q10 -4 14 -14" fill="none" stroke="#5aa84a" stroke-width="5" stroke-linecap="round"/><circle r="58" fill="none" stroke="${INK}" stroke-width="5"/></g>`,
    setup(ctx) { place(ctx.hero, 310, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    rock(ctx, x) { const y = x < 260 ? 200 + (x * 230) / 260 : 430; place(q(ctx, 'rock'), x + 10, y - 58, x * 1.6); },
    idle(ctx, t) { this.rock(ctx, -30 + Math.min(150, t * t * 2.2 + t * 4)); },
    async win(ctx) {
      const sb = ctx.tool('skateboard', 310, 446, 0.7);
      setArms(ctx.hero, 'hold');
      const x0 = -30 + Math.min(150, ctx.t() * ctx.t() * 2.2 + ctx.t() * 4);
      ctx.sfx.whoosh(); ctx.say('YIHUU!');
      await ctx.T(1.0, (k) => { place(ctx.hero, 310 + k * 200, 430); place(sb, 310 + k * 200, 446, 0, 0.7); this.rock(ctx, x0 + k * 300); });
    },
    fails: {
      async crush(ctx) {
        const x0 = -30 + Math.min(150, ctx.t() * ctx.t() * 2.2 + ctx.t() * 4);
        await ctx.T(0.45, (k) => this.rock(ctx, x0 + (300 - x0) * k));
        ctx.shake(); ctx.sfx.boom();
        place(ctx.hero, 310, 430, 0, 1.4, 0.2); setFace(ctx.hero, 'hurt');
        await ctx.T(0.5, (k) => this.rock(ctx, 300 + k * 200));
      },
    },
  },

  // ---------------------------------------------------------------- 22. giant spider
  spider: {
    correct: 'broom',
    wrong: { honey: 'webbed', teddy: 'webbed', fan: 'webbed' },
    bg: () => sky('#4a3a3a', '#7a6a5a', 'sp') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `M${i * 50} 0 V430`).join(' ')}" stroke="#5a4a42" stroke-width="3"/><path d="M60 0 l-14 110 M60 0 l14 110 M300 0 l-12 110" stroke="#5a4a42" stroke-width="2" opacity="0.6"/>
      <g transform="translate(60 150)"><path d="M-30 -36 L30 -36 L36 36 L-36 36 Z" fill="#2a2030" ${S4}/><path d="M0 -36 v72 M-34 0 h70" stroke="${INK}" stroke-width="4"/><circle cx="-14" cy="-14" r="4" fill="#fff6d0" opacity="0.7"/></g>` + ground('#6a5040') + `
      <path d="M0 450 h400 M0 478 h400 M0 506 h400 M70 430 v20 M190 450 v28 M310 430 v20 M120 478 v28 M260 478 v28" stroke="#5a4232" stroke-width="3"/>
      <g transform="translate(340 432)"><rect x="-40" y="-60" width="70" height="60" fill="#b58a5a" ${S4}/><path d="M-40 -46 h70 M-5 -60 v14" stroke="${INK}" stroke-width="3"/><rect x="-24" y="-104" width="50" height="44" fill="#c9a06b" ${S4}/><path d="M-24 -92 h50" stroke="${INK}" stroke-width="3"/><path d="M-20 -80 h22" stroke="#8a5a32" stroke-width="3"/></g>
      <g transform="translate(30 432)"><path d="M-10 0 v-60 h40 v60 M-10 -30 h40" fill="none" stroke="#8a5a32" stroke-width="6"/><path d="M-10 -60 q0 -40 20 -40 q20 0 20 40" fill="none" stroke="#8a5a32" stroke-width="6"/></g>
      <g transform="translate(220 432)"><rect x="-14" y="-26" width="28" height="26" rx="4" fill="#6a7488" ${S3}/><path d="M-10 -26 q10 -16 20 0" fill="none" stroke="${INK}" stroke-width="3"/><path class="lantern" d="M0 -6 q-6 -6 0 -14 q6 8 0 14 Z" fill="#ffd34d"/></g>
      <path d="M0 40 H400 M0 100 H400" stroke="#8a5a32" stroke-width="18"/><path d="M0 40 H400 M0 100 H400" stroke="${INK}" stroke-width="2" opacity="0.4"/><path d="M30 36 h20 M140 104 h30 M260 36 h24 M350 98 h20" stroke="#6b3f22" stroke-width="3"/>
      <path d="M330 100 L400 40 M330 100 L360 160 M330 100 L400 130 M346 86 q10 14 24 8 M352 120 q16 -4 22 10" fill="none" stroke="#e6e6f0" stroke-width="2"/><path d="M0 110 L50 110 M0 110 L40 150 M0 110 L10 170 M20 110 q4 14 -4 26 M36 112 q-4 20 -20 28" fill="none" stroke="#e6e6f0" stroke-width="2" opacity="0.8"/>
      <g class="spider"><path d="M0 -900 V-20" stroke="#e6e6f0" stroke-width="2"/>
        <g class="slegs" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round">${[-1, 1].map((s) => [0, 1, 2, 3].map((i) => `<path d="M${s * 20} ${-4 + i * 8} q${s * 30} ${-30 + i * 12} ${s * 52} ${-6 + i * 22}"/>`).join('')).join('')}</g>
        <g stroke="#6a5a7a" stroke-width="2">${[-1, 1].map((s) => [0, 1, 2, 3].map((i) => `<path d="M${s * (36 + i * 2)} ${-18 + i * 12} l${s * 4} -5"/>`).join('')).join('')}</g>
        <ellipse cy="0" rx="30" ry="34" fill="#2b2140"/><path d="M-6 -20 l6 10 l6 -10 l-6 22 Z" fill="#e8453c"/><ellipse cx="-12" cy="-14" rx="6" ry="10" fill="#4a3a6a" transform="rotate(20 -12 -14)"/><circle cy="36" r="18" fill="#2b2140"/>
        <circle cx="-7" cy="38" r="5" fill="#e8453c"/><circle cx="7" cy="38" r="5" fill="#e8453c"/><circle cx="-3" cy="30" r="3" fill="#e8453c"/><circle cx="3" cy="30" r="3" fill="#e8453c"/><circle cx="-8.5" cy="36.5" r="1.6" fill="#fff"/><circle cx="5.5" cy="36.5" r="1.6" fill="#fff"/>
        <path d="M-6 50 q-2 8 2 10 M6 50 q2 8 -2 10" fill="none" stroke="#f6efe0" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 150, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'spider'), 250 + Math.sin(t * 1.5) * 8, 60 + Math.min(170, t * 16), Math.sin(t * 2) * 6);
      [...q(ctx, 'slegs').children].forEach((l, i) => l.setAttribute('transform', `rotate(${Math.sin(t * 8 + i) * 5} ${i < 4 ? -20 : 20} ${-4 + (i % 4) * 8})`));
      spin(ctx, 'lantern', `translate(0 -6) scale(${0.9 + Math.sin(t * 13) * 0.12} ${0.9 + Math.sin(t * 9) * 0.15}) translate(0 6)`);
    },
    async win(ctx) {
      const b = ctx.tool('broom', 210, 300, 0.8);
      await ctx.T(0.3, (k) => place(b, 210, 300, -50 + k * 110, 0.8));
      ctx.sfx.hit(); ctx.say('ŞAK!');
      const sp = q(ctx, 'spider');
      const y0 = 60 + Math.min(170, ctx.t() * 16);
      sp.firstElementChild.style.display = 'none';
      await ctx.T(0.8, (k) => place(sp, 250 + k * 220, y0 - Math.sin(k * Math.PI) * 120, k * 540, 1 - k * 0.4));
      b.remove();
    },
    fails: {
      async webbed(ctx) {
        const sp = q(ctx, 'spider');
        const y0 = 60 + Math.min(170, ctx.t() * 16);
        const web = el('path', { d: `M250 ${y0 + 30} L150 330 M250 ${y0 + 30} L140 360 M250 ${y0 + 30} L160 300`, stroke: '#fff', 'stroke-width': 4 });
        ctx.layer.appendChild(web); ctx.sfx.whoosh();
        await ctx.wait(0.3);
        web.remove();
        ctx.hero.fx.innerHTML = `<ellipse cx="0" cy="-74" rx="40" ry="86" fill="#f6f6fa" stroke="${INK}" stroke-width="4"/><path d="M-38 -110 q38 14 76 0 M-40 -70 q40 14 80 0 M-36 -30 q36 14 72 0" fill="none" stroke="#c8c8d8" stroke-width="4"/><circle cx="-9" cy="-120" r="4" fill="${INK}"/><circle cx="9" cy="-120" r="4" fill="${INK}"/>`;
        ctx.say('MMPH!');
        await ctx.T(0.6, (k) => place(sp, 250 - k * 60, y0 + k * 40));
      },
    },
  },

  // ---------------------------------------------------------------- 23. mice in the kitchen
  mice: {
    correct: 'cat',
    wrong: { cheese: 'mice', ketchup: 'mice', icecream: 'mice' },
    bg: () => `<rect width="400" height="520" fill="#fff2dc"/><path d="${[0, 1, 2, 3, 4, 5].map((i) => `M0 ${60 + i * 60} H400`).join(' ')} ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `M${i * 60} 0 V430`).join(' ')}" stroke="#ecd9cb" stroke-width="3"/>` + ground('#c9a06b') + `
      <rect x="0" y="400" width="400" height="30" fill="#f3e6d4" ${S3}/><path d="M340 430 v-18 q14 -18 28 0 v18 Z" fill="${INK}"/><path d="M60 426 l6 -4 l4 4 Z M100 428 l5 -3 l3 3 Z" fill="#ffd34d" stroke="${INK}" stroke-width="1.5"/>
      <rect x="250" y="120" width="130" height="90" fill="#7fd3ff" stroke="${INK}" stroke-width="4"/><path d="M262 136 l18 -12 M330 196 l20 -14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M315 120 v90" stroke="${INK}" stroke-width="4"/><path d="M244 116 q36 30 0 60 Z M386 116 q-36 30 0 60 Z" fill="#ff8a6e" ${S3}/><rect x="240" y="206" width="150" height="10" rx="3" fill="#f3e6d4" ${S3}/><path d="M276 206 q-4 -16 8 -20 q6 10 0 20 Z" fill="#2eb872" ${S3}/>
      <path d="M14 60 h120" stroke="#6a7488" stroke-width="6" stroke-linecap="round"/>
      <g ${S3}><path d="M34 60 v26" stroke-width="4"/><circle cx="34" cy="104" r="20" fill="#2b2140"/><circle cx="30" cy="100" r="12" fill="#4a3a6a"/><path d="M74 60 v40" stroke-width="4"/><ellipse cx="74" cy="110" rx="10" ry="12" fill="#c8d2e0"/><path d="M110 60 v56" stroke-width="5"/><rect x="100" y="114" width="20" height="24" rx="4" fill="#e8453c"/></g>
      <rect x="20" y="230" width="100" height="10" rx="3" fill="#c9893b" ${S3}/><g ${S3}><rect x="28" y="200" width="22" height="30" rx="4" fill="#ffe680"/><rect x="56" y="206" width="20" height="24" rx="4" fill="#ff8a6e"/><rect x="82" y="196" width="26" height="34" rx="4" fill="#bfeaff"/></g><path d="M28 210 h22 M56 214 h20 M82 206 h26" stroke="${INK}" stroke-width="2"/>
      <g fill="#8a5a32" stroke="${INK}" stroke-width="4"><rect x="138" y="352" width="124" height="14" rx="4"/><rect x="146" y="366" width="12" height="64"/><rect x="242" y="366" width="12" height="64"/><rect x="242" y="250" width="12" height="102"/><rect x="234" y="250" width="28" height="20" rx="4"/></g>
      <g class="mice"></g>`,
    mouse: `<g><path d="M18 0 q16 -2 18 -14" fill="none" stroke="${INK}" stroke-width="3"/><ellipse rx="18" ry="11" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="-12" cy="-10" r="7" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="-12" cy="-10" r="3.5" fill="#ffb0c0"/><circle cx="-17" cy="-1" r="2.5" fill="${INK}"/><circle cx="-17.8" cy="-1.8" r="0.9" fill="#fff"/><circle cx="-26" cy="2" r="3" fill="#ff6f9e"/><path d="M-24 4 l-8 3 M-24 0 l-8 -2" stroke="${INK}" stroke-width="1.2"/></g>`,
    setup(ctx) {
      place(ctx.hero, 196, 354); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const m = q(ctx, 'mice');
      for (let i = 0; i < 6; i++) m.insertAdjacentHTML('beforeend', this.mouse);
      this.idle(ctx, 0); // start positions, so a pick before the first frame still finds them placed
    },
    idle(ctx, t) {
      [...q(ctx, 'mice').children].forEach((m, i) => {
        const a = t * (1.2 + i * 0.15) + i * 1.3;
        const x = 200 + Math.sin(a) * (80 + i * 18);
        place(m, x, 420 - (i % 2) * 6, 0, Math.cos(a) > 0 ? 1 : -1, 1);
      });
    },
    async win(ctx) {
      const c = ctx.tool('cat', 70, 400, 0.8);
      ctx.say('MİYAV!');
      const ms = [...q(ctx, 'mice').children];
      const xs = ms.map((m) => Number(m.getAttribute('transform').match(/translate\(([-\d.]+)/)[1]));
      await ctx.T(0.9, (k) => { ms.forEach((m, i) => place(m, xs[i] + k * (460 - xs[i]), 420, 0, -1, 1)); place(c, 70 + k * 120, 400, 0, 0.8); });
      c.dataset.keep = '1';
    },
    fails: {
      async mice(ctx) {
        const m = q(ctx, 'mice');
        for (let i = 0; i < 8; i++) m.insertAdjacentHTML('beforeend', this.mouse);
        const ms = [...m.children];
        ctx.say('İİİK!');
        await ctx.T(0.7, (k) => ms.forEach((x, i) => place(x, 140 + (i * 37) % 130, 420 - k * (i % 3) * 30, 0, i % 2 ? 1 : -1, 1)));
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 196 - k * 120, 354 + k * 76, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- 24. zombie
  zombie: {
    correct: 'brain',
    wrong: { garlic: 'zombie', flower: 'zombie', mirror: 'zombie' },
    bg: () => sky('#3a4a3a', '#8a9a6a', 'zo') + `
      <circle cx="320" cy="80" r="30" fill="#e6f0c0"/><circle cx="312" cy="72" r="6" fill="#ccd8a8"/><circle cx="330" cy="92" r="4" fill="#ccd8a8"/>
      ${hills('#4a5a4a', '#3e4e3e')}${deadTree(60, 400, 0.8, '#2a3a2a')}${deadTree(250, 396, 0.6, '#2a3a2a')}` + ground('#4a5a3a') + `
      <path d="M0 456 q30 -6 60 0 M140 476 q40 -8 80 0 M280 460 q30 -6 60 0" fill="none" stroke="#3a4a2e" stroke-width="3" stroke-linecap="round"/>
      <g fill="#7a7a88" stroke="${INK}" stroke-width="4"><path d="M30 430 v-50 q0 -20 20 -20 q20 0 20 20 v50 Z"/></g><path d="M40 382 h20 M50 372 v24" stroke="${INK}" stroke-width="4" opacity="0.5"/><path d="M34 400 l8 -10 l4 8" fill="none" stroke="${INK}" stroke-width="2" opacity="0.4"/>
      ${tomb(220, 434, 0.75, '#6a6a78')}<path d="M190 448 q34 -16 68 0 Z" fill="#5a4a32" ${S3}/>
      <g class="zhand" transform="translate(246 446) scale(1.5)"><path d="M-6 2 V-14 L-9 -23 Q-8 -27 -5 -25 L-3 -19 L-3 -29 Q-1 -32 1 -29 L1 -19 L3 -28 Q6 -30 6 -26 L5 -17 L9 -22 Q12 -21 11 -18 L6 -9 V2 Z" fill="#9adf6a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-6 -6 h12" stroke="#5a7a3a" stroke-width="2"/></g>
      <g class="zom"><rect x="-22" y="-90" width="44" height="54" rx="14" fill="#6a8a5a" stroke="${INK}" stroke-width="4"/><path d="M-10 -86 l6 10 l-4 10 M12 -80 l-6 8" fill="none" stroke="#4a6a3a" stroke-width="3"/><rect x="-4" y="-76" width="12" height="10" fill="#9adf6a" stroke="${INK}" stroke-width="2"/><path d="M-22 -50 l8 8 l8 -8 l8 8 l8 -8 l8 8 l4 -4" fill="none" stroke="${INK}" stroke-width="3"/>
        <rect x="-16" y="-44" width="12" height="44" rx="5" fill="#4a4a6a" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#4a4a6a" stroke="${INK}" stroke-width="4"/><path d="M4 -14 h12 M-16 -24 h12" stroke="#f6efe0" stroke-width="3"/>
        <rect x="-70" y="-86" width="52" height="13" rx="6" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><rect x="-66" y="-68" width="48" height="13" rx="6" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M-50 -86 v13 M-44 -86 v13" stroke="#f6efe0" stroke-width="3"/>
        <circle cy="-114" r="24" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M10 -132 a22 22 0 0 1 4 32 a24 24 0 0 0 -4 -32 Z" fill="#7cc35a"/><path d="M-20 -128 l-4 -14 l8 6 l2 -12 l6 8 l6 -10 l2 10" fill="#4a3a2e" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 -128 l10 4 M10 -132 v8 M14 -130 v8" stroke="${INK}" stroke-width="2"/>
        <circle cx="-9" cy="-118" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-10" cy="-118" r="2" fill="${INK}"/><circle cx="8" cy="-116" r="3" fill="${INK}"/><path d="M-12 -100 h18" stroke="${INK}" stroke-width="3"/><path d="M-8 -100 v4 M-2 -100 v3 M4 -100 v4" stroke="${INK}" stroke-width="2"/><path class="zdrool" d="M2 -99 q2 6 0 10" fill="none" stroke="#bfeaff" stroke-width="3" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    zx: (t) => 380 - Math.min(120, t * 10),
    idle(ctx, t) {
      place(q(ctx, 'zom'), this.zx(t), 430, Math.sin(t * 4) * 4);
      spin(ctx, 'zhand', `translate(246 446) rotate(${Math.sin(t * 5) * 14}) scale(1.5)`);
      spin(ctx, 'zdrool', `translate(2 -99) scale(1 ${1 + Math.abs(Math.sin(t * 2)) * 0.8}) translate(-2 99)`);
    },
    async win(ctx) {
      const b = ctx.tool('brain', 150, 330, 0.45);
      const z = q(ctx, 'zom');
      const x0 = this.zx(ctx.t());
      await ctx.T(0.6, (k) => place(b, 150 + k * 230, 330 - Math.sin(k * Math.PI) * 140 + k * 90, k * 400, 0.45));
      ctx.say('BEYİİN!');
      place(z, x0, 430, 0, -1, 1);
      await ctx.T(0.9, (k) => place(z, x0 + k * 160, 430, Math.sin(k * 16) * 4, -1, 1));
      b.remove();
    },
    fails: {
      async zombie(ctx) {
        const z = q(ctx, 'zom');
        const x0 = this.zx(ctx.t());
        await ctx.T(0.3, (k) => place(z, x0 - k * (x0 - 200), 430));
        ctx.sfx.chomp(); ctx.say('HAM!');
        ctx.hero.style.setProperty('--skin', '#9adf6a');
        setArms(ctx.hero, 'hold'); setFace(ctx.hero, 'hurt');
        await ctx.T(0.8, (k) => place(ctx.hero, 130, 430, Math.sin(k * 12) * 6));
      },
    },
  },

  // ---------------------------------------------------------------- 25. lion on the savanna
  lion: {
    correct: 'yarn',
    wrong: { broccoli: 'lion', teddy: 'lion', flower: 'lion' },
    bg: () => sky('#ffb04a', '#ffe0a0', 'li') + `
      <circle cx="90" cy="120" r="50" fill="#ffd34d" opacity="0.8"/><circle cx="90" cy="120" r="70" fill="#ffd34d" opacity="0.2"/>
      <path d="M100 430 L190 330 L220 350 L260 320 L360 430 Z" fill="#d89a70" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/><path d="M190 330 l-12 14 l10 -2 l6 6 l8 -8 l10 6 l8 -12 l12 4 L260 320 l-18 8 l-10 -6 l-8 10 Z" fill="#fff6e0"/>
      <path d="M0 430 V390 Q100 360 200 392 T400 386 V430 Z" fill="#e8c070" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <g transform="translate(60 392)"><path d="M0 0 v-30" stroke="#6b3f22" stroke-width="4"/><ellipse cy="-32" rx="26" ry="7" fill="#7cb85a"/></g>` + ground('#d8b45a') + `
      <path d="M10 452 l6 -12 l4 12 M150 470 l6 -14 l4 14 l6 -10 l4 10 M260 452 l6 -12 l4 12 M60 500 l6 -14 l4 14 M350 490 l6 -12 l4 12" fill="none" stroke="#b8943a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M320 430 V300" stroke="#6b3f22" stroke-width="14"/><path d="M320 330 L290 300 M320 320 L350 296" stroke="#6b3f22" stroke-width="8" stroke-linecap="round"/><ellipse cx="320" cy="290" rx="80" ry="22" fill="#5aa84a" stroke="${INK}" stroke-width="4"/><path d="M262 284 q20 -8 40 0 M320 278 q22 -8 44 0" fill="none" stroke="#3f8a3a" stroke-width="3" stroke-linecap="round"/>
      ${stone(210, 436, 1.3, '#c89a6a')}
      <g class="lion"><g class="ltail"><path d="M60 -60 q40 -10 40 -50" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="100" cy="-112" r="8" fill="#8a4a1a" stroke="${INK}" stroke-width="2.5"/></g>
        <ellipse cx="20" cy="-56" rx="62" ry="34" fill="#e8b060" stroke="${INK}" stroke-width="4"/><path d="M-30 -48 Q20 -10 76 -44 Q60 -26 20 -24 Q-14 -26 -30 -48 Z" fill="#f6d8a0"/>
        <g fill="#e8b060" stroke="${INK}" stroke-width="4"><rect x="-26" y="-36" width="16" height="36" rx="6"/><rect x="40" y="-36" width="16" height="36" rx="6"/></g><path d="M-24 -2 v-5 M-18 -2 v-5 M42 -2 v-5 M48 -2 v-5" stroke="${INK}" stroke-width="2"/>
        <path d="M-40 -150 l12 14 l14 -18 l6 20 l18 -8 l-4 20 l18 4 l-12 14 l12 14 l-18 4 l4 20 l-18 -8 l-6 20 l-14 -18 l-12 14 l-6 -18 l-18 6 l4 -20 l-16 -8 l14 -12 l-12 -16 l20 0 l-2 -20 l16 10 Z" fill="#a8551e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="-34" cy="-98" r="34" fill="#c8682a"/>
        <circle cx="-58" cy="-122" r="9" fill="#e8b060" ${S3}/><circle cx="-10" cy="-122" r="9" fill="#e8b060" ${S3}/><circle cx="-58" cy="-122" r="4" fill="#c8682a"/><circle cx="-10" cy="-122" r="4" fill="#c8682a"/>
        <circle cx="-34" cy="-98" r="28" fill="#e8b060" stroke="${INK}" stroke-width="4"/><ellipse cx="-34" cy="-86" rx="14" ry="10" fill="#f6d8a0"/>${eye(-44, -104, 5, 'llid', '#e8b060')}${eye(-24, -104, 5, 'llid', '#e8b060')}<path d="M-52 -113 l9 3 M-16 -113 l-9 3" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path d="M-40 -92 h12 l-6 6 Z" fill="${INK}"/><path d="M-46 -88 l-14 -2 M-46 -85 l-13 3 M-22 -88 l14 -2 M-22 -85 l13 3" stroke="${INK}" stroke-width="1.5"/><circle cx="-42" cy="-87" r="1" fill="${INK}"/><circle cx="-26" cy="-87" r="1" fill="${INK}"/><path class="lmouth" d="M-44 -82 q10 6 20 0" fill="none" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    lx: (t) => 400 - Math.min(130, t * 13),
    idle(ctx, t) {
      place(q(ctx, 'lion'), this.lx(t), 430 - Math.abs(Math.sin(t * 5)) * 4);
      spin(ctx, 'ltail', `rotate(${Math.sin(t * 4) * 12} 60 -60)`);
      setLids(ctx, 'llid', blink(t, 2.2));
    },
    async win(ctx) {
      const y = ctx.tool('yarn', 140, 410, 0.45);
      const l = q(ctx, 'lion');
      const x0 = this.lx(ctx.t());
      await ctx.T(0.5, (k) => place(y, 140 + k * 60, 410, k * 300, 0.45));
      ctx.heart(x0 - 40, 300);
      q(ctx, 'lmouth').setAttribute('d', 'M-46 -84 q12 12 24 0');
      await ctx.T(1.0, (k) => { place(y, 200 + k * 260, 410, 300 + k * 600, 0.45); place(l, x0 + k * 220, 430 - Math.abs(Math.sin(k * 14)) * 12, 0, -1, 1); });
    },
    fails: {
      async lion(ctx) {
        const l = q(ctx, 'lion');
        const x0 = this.lx(ctx.t());
        q(ctx, 'lmouth').setAttribute('d', 'M-46 -86 q12 -10 24 0 q-12 18 -24 0 Z');
        ctx.sfx.roar(); ctx.shake(); ctx.say('ROAAR!');
        await ctx.T(0.25, (k) => place(l, x0 - k * (x0 - 220), 430));
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 110 - k * 80, 430 - Math.sin(k * Math.PI) * 70, -k * 90));
      },
    },
  },
  // ================================================================ third batch
  // ---------------------------------------------------------------- 26. gorilla
  gorilla: {
    correct: 'banana',
    wrong: { drum: 'toss', mirror: 'toss', broccoli: 'toss' },
    bg: () => sky('#8fd9a0', '#d8f4d0', 'go') + `
      <g fill="#7cc88a" opacity="0.85"><rect x="150" y="0" width="30" height="430"/><rect x="270" y="0" width="22" height="430"/><circle cx="165" cy="40" r="70"/><circle cx="281" cy="70" r="56"/><circle cx="230" cy="10" r="50"/></g>
      ${hills('#6ab87a', '#5aa86a')}` + ground('#4a8a3a') + `
      <path d="M0 456 q30 -6 60 0 M150 476 q40 -8 80 0 M290 460 q30 -6 60 0" fill="none" stroke="#3a7a2e" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 0 q-10 120 10 220 M90 0 q14 90 -6 160 M330 0 q-12 100 8 180" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/>
      <g fill="#3f9a4a" ${S3}><path d="M36 80 q-24 -6 -30 10 q20 8 30 -10 Z M44 140 q24 -10 34 4 q-20 10 -34 -4 Z M94 60 q22 -10 32 4 q-20 10 -32 -4 Z M328 60 q-24 -8 -32 6 q20 10 32 -6 Z M332 120 q24 -10 34 4 q-20 10 -34 -4 Z"/></g>
      <circle cx="60" cy="230" r="10" fill="#2eb872"/><circle cx="84" cy="160" r="10" fill="#2eb872"/><circle cx="338" cy="180" r="10" fill="#2eb872"/>
      <g transform="translate(345 120)"><path d="M0 -20 q-10 10 0 20 q10 -10 0 -20 Z" fill="#e8453c" ${S3}/><path d="M0 -20 q10 -6 18 2 q-10 6 -18 -2 Z" fill="#ff8a2e" ${S3}/><path d="M0 -20 q-10 -6 -18 2 q10 6 18 -2 Z" fill="#ff8a2e" ${S3}/></g>
      <g transform="translate(30 432)" fill="#3f9a4a" ${S3}><path d="M0 0 q-20 -40 -40 -40 q30 -6 40 30 q0 -50 20 -66 q-6 40 0 76 Z"/></g>${stone(220, 436, 1, '#6a7a6a')}
      <g class="gor"><g class="g-arm-l"><rect x="-80" y="-120" width="26" height="100" rx="13" fill="#4a4a58" stroke="${INK}" stroke-width="4"/></g><g class="g-arm-r"><rect x="40" y="-120" width="26" height="100" rx="13" fill="#4a4a58" stroke="${INK}" stroke-width="4"/></g>
        <ellipse cx="-6" cy="-70" rx="56" ry="62" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><ellipse cx="-10" cy="-66" rx="32" ry="36" fill="#7a6a6a"/><path d="M-36 -84 q12 10 24 0 q12 10 24 0 M-28 -60 q8 6 16 0 M2 -60 q8 6 16 0" fill="none" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round"/><path d="M34 -110 l6 8 M40 -90 l6 6 M-54 -100 l-6 8" stroke="#3a3a46" stroke-width="3" stroke-linecap="round"/>
        <rect x="-44" y="-24" width="28" height="26" rx="10" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><rect x="6" y="-24" width="28" height="26" rx="10" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><path d="M-38 2 v-6 M-30 2 v-6 M-22 2 v-6 M12 2 v-6 M20 2 v-6 M28 2 v-6" stroke="${INK}" stroke-width="2"/>
        <circle cx="-14" cy="-142" r="32" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><path d="M-30 -172 l4 -8 l4 6 l4 -8 l4 8" fill="#4a4a58" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="-22" cy="-134" rx="22" ry="18" fill="#9a8a7a" stroke="${INK}" stroke-width="3"/><path d="M-42 -158 q20 -10 40 0 v6 q-20 -8 -40 0 Z" fill="#3a3a46"/>
        ${eye(-30, -148, 4.5, 'glid', '#9a8a7a')}${eye(-12, -148, 4.5, 'glid', '#9a8a7a')}<circle cx="-26" cy="-136" r="2" fill="${INK}"/><circle cx="-18" cy="-136" r="2" fill="${INK}"/><path class="g-mouth" d="M-34 -126 q12 -6 24 0" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-38 -156 l12 4 M-4 -156 l-12 4" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    gx: (t) => 390 - Math.min(110, t * 11),
    idle(ctx, t) {
      place(q(ctx, 'gor'), this.gx(t), 430);
      const k = Math.sin(t * 12) * 10;
      q(ctx, 'g-arm-l').setAttribute('transform', `rotate(${-40 + k} -67 -110)`);
      q(ctx, 'g-arm-r').setAttribute('transform', `rotate(${40 - k} 53 -110)`);
      setLids(ctx, 'glid', blink(t, 0.9));
    },
    async win(ctx) {
      const x0 = this.gx(ctx.t());
      const b = ctx.tool('banana', 150, 340, 0.45);
      await ctx.T(0.5, (k) => place(b, 150 + (x0 - 190) * k, 340 - Math.sin(k * Math.PI) * 70 - k * 20, k * 360, 0.45));
      q(ctx, 'g-arm-l').setAttribute('transform', 'rotate(0)'); q(ctx, 'g-arm-r').setAttribute('transform', 'rotate(0)');
      q(ctx, 'g-mouth').setAttribute('d', 'M-36 -128 q14 12 28 0');
      ctx.heart(x0 - 20, 240); ctx.say('UH UH!');
      await ctx.T(0.8, (k) => place(q(ctx, 'gor'), x0, 430 + k * 14, 0, 1, 1 - k * 0.1));
      b.dataset.keep = '1';
    },
    fails: {
      async toss(ctx) {
        const g0 = q(ctx, 'gor');
        const x0 = this.gx(ctx.t());
        ctx.sfx.roar(); ctx.shake();
        await ctx.T(0.3, (k) => place(g0, x0 - k * (x0 - 200), 430));
        ctx.say('UGH!'); ctx.faint();
        await ctx.T(0.8, (k) => place(ctx.hero, 120 + k * 300, 430 - Math.sin(k * Math.PI) * 300 - k * 100, k * 720));
      },
    },
  },

  // ---------------------------------------------------------------- 27. witch on a broom
  witch: {
    correct: 'water',
    wrong: { cat: 'frog', candle: 'frog', broom: 'frog' },
    bg: () => sky('#2a1a4a', '#6a4a8a', 'wi') + `
      <circle cx="80" cy="90" r="40" fill="#fff6d0"/><circle cx="70" cy="80" r="8" fill="#e8dcb0"/><circle cx="96" cy="104" r="6" fill="#e8dcb0"/>
      ${hills('#3a2a5a', '#33284a')}` + ground('#3a3a4a') + `
      ${deadTree(40, 432, 0.9, '#22182e')}
      <path d="M260 430 V340 L300 300 L340 340 V430 Z" fill="#4a3a5a" stroke="${INK}" stroke-width="4"/><path d="M252 346 L300 296 L348 346" fill="none" stroke="#2a1a3a" stroke-width="8" stroke-linecap="round"/><path d="M314 316 v-26 h12 v38" fill="#4a3a5a" ${S3}/><rect x="288" y="350" width="24" height="24" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><path d="M300 350 v24 M288 362 h24" stroke="${INK}" stroke-width="2"/><path d="M276 430 v-26 q8 -10 16 0 v26 Z" fill="#2a1a3a" ${S3}/>
      <g transform="translate(200 432)"><path d="M-30 -36 q-6 30 10 36 h40 q16 -6 10 -36 Z" fill="#2b2140" ${S4}/><ellipse cy="-36" rx="32" ry="8" fill="#7cdf5a" ${S3}/><path d="M-22 0 l-6 6 M22 0 l6 6" stroke="${INK}" stroke-width="4"/><path d="M-14 6 q4 -10 8 0 q4 -10 8 0 q4 -10 8 0" fill="#ff8a2e"/><g class="cbub" fill="#9dff8a" ${S3}><circle r="5"/><circle r="4"/><circle r="3"/></g></g>
      ${[[120, 436], [350, 438]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><ellipse cy="-12" rx="17" ry="13" fill="#ff8a2e" ${S3}/><path d="M0 -24 q0 -8 5 -10" fill="none" stroke="#2e7d4a" stroke-width="4" stroke-linecap="round"/><path d="M-8 -22 q-4 10 0 20 M8 -22 q4 10 0 20" fill="none" stroke="#d8641e" stroke-width="2"/><path class="pglow${i}" d="M-9 -16 l3 -5 l3 5 Z M3 -16 l3 -5 l3 5 Z M-8 -6 q8 6 16 0" fill="#ffe680" stroke="${INK}" stroke-width="1.5"/></g>`).join('')}
      ${bat('wbat')}
      <g class="witch"><path d="M-60 10 L50 -6" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/><path d="M40 -12 l30 -10 l-4 18 l6 14 Z" fill="#c9a06b" stroke="${INK}" stroke-width="3"/>
        <path d="M-20 -46 q-30 20 -36 50 q20 -10 34 -6 Z" fill="#6a2a8a" ${S3}/><path d="M-20 0 L0 -50 L20 0 Z" fill="#4a2a6a" stroke="${INK}" stroke-width="4"/><path d="M-4 0 l-4 10 M8 0 l4 10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <path d="M10 -70 q12 20 4 40 M14 -68 q16 12 14 34" fill="none" stroke="#e8453c" stroke-width="5" stroke-linecap="round"/><circle cy="-60" r="16" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M-12 -62 q-16 6 -10 10" fill="#9adf6a" stroke="${INK}" stroke-width="3"/>
        <path d="M-26 -70 h52 L4 -116 Z" fill="#2b2140" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-16 -76 h34 l-2 6 h-30 Z" fill="#9b5ae0"/>${eye(-6, -62, 3.5)}<path d="M-12 -68 l8 2" stroke="${INK}" stroke-width="2"/><path d="M-8 -50 q6 3 12 0" stroke="${INK}" stroke-width="2" fill="none"/></g>
      <g class="sparks"></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    wpos: (t) => [220 + Math.cos(t * 1.4) * 110, 170 + Math.sin(t * 2.8) * 30, Math.sin(t * 1.4) > 0 ? 1 : -1],
    idle(ctx, t) {
      const [x, y, d] = this.wpos(t);
      place(q(ctx, 'witch'), x, y, 0, -d, 1);
      const sp = q(ctx, 'sparks');
      if (sp.childElementCount < 6 && Math.random() < 0.15) sp.insertAdjacentHTML('beforeend', `<circle r="4" fill="#d9a0ff" cx="${x + 40 * d}" cy="${y}"/>`);
      [...sp.children].forEach((c) => { c.setAttribute('cy', Number(c.getAttribute('cy')) + 1.5); if (Number(c.getAttribute('cy')) > 430) c.remove(); });
      const cb = q(ctx, 'cbub'); if (cb) [...cb.children].forEach((c, i) => { const k = (t * 0.8 + i / 3) % 1; c.setAttribute('cx', (Math.sin(k * 8 + i * 2) * 14).toFixed(1)); c.setAttribute('cy', (-40 - k * 40).toFixed(1)); c.setAttribute('opacity', (1 - k).toFixed(2)); });
      [0, 1].forEach((i) => { const p = q(ctx, 'pglow' + i); if (p) p.setAttribute('fill', Math.sin(t * 9 + i * 2) > -0.3 ? '#ffe680' : '#ffbe2e'); });
      flyBat(ctx, 'wbat', t, 260, 240, 80, 20, 1.1);
    },
    async win(ctx) {
      const [x, y, d] = this.wpos(ctx.t());
      const b = ctx.tool('water', 160, 330, 0.5);
      await ctx.T(0.5, (k) => place(b, 160 + (x - 160) * k, 330 + (y - 330) * k - Math.sin(k * Math.PI) * 60, k * 300, 0.5));
      b.remove();
      ctx.splash(x, y);
      ctx.say('ERİYORUM!');
      const w = q(ctx, 'witch');
      await ctx.T(0.9, (k) => place(w, x, y + k * 40, 0, -d * (1 - k * 0.3), 1 - k));
      ctx.puff(x, y + 40, '#9adf6a', 12, 40);
    },
    fails: {
      async frog(ctx) {
        const [x, y] = this.wpos(ctx.t());
        const bolt = el('path', { d: `M${x} ${y} L${(x + 140) / 2 + 20} ${(y + 360) / 2} L${(x + 140) / 2 - 10} ${(y + 360) / 2 + 10} L140 360`, stroke: '#d9a0ff', 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'round' });
        ctx.layer.appendChild(bolt); ctx.flash('#d9a0ff'); ctx.sfx.whoosh();
        await ctx.wait(0.25);
        bolt.remove();
        ctx.puff(140, 380, '#d9a0ff', 18, 60);
        ctx.hero.style.display = 'none';
        const frog = g({}, `<ellipse cy="-18" rx="26" ry="18" fill="#7cc35a" stroke="${INK}" stroke-width="4"/><circle cx="-12" cy="-36" r="9" fill="#7cc35a" stroke="${INK}" stroke-width="4"/><circle cx="12" cy="-36" r="9" fill="#7cc35a" stroke="${INK}" stroke-width="4"/><circle cx="-12" cy="-36" r="3" fill="${INK}"/><circle cx="12" cy="-36" r="3" fill="${INK}"/><path d="M-12 -14 q12 8 24 0" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-18 -50 l6 -10 l6 10 Z" fill="#6b3f22"/>`);
        place(frog, 140, 430);
        ctx.layer.appendChild(frog);
        ctx.say('VRAK!');
        await ctx.T(0.6, (k) => place(frog, 140, 430 - Math.abs(Math.sin(k * Math.PI * 2)) * 30));
      },
    },
  },

  // ---------------------------------------------------------------- 28. robot
  robot: {
    correct: 'magnet',
    wrong: { hammer: 'zap', paper: 'zap', teddy: 'zap' },
    bg: () => sky('#9aa6b8', '#dfe6ef', 'rb') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `M${i * 56 + 10} 0 V430`).join(' ')}" stroke="#aab4c4" stroke-width="3"/><path d="M0 150 H400" stroke="#aab4c4" stroke-width="3"/>
      <path d="M0 60 H260 Q280 60 280 80 V140" fill="none" stroke="#6a7488" stroke-width="16"/><path d="M0 60 H260 Q280 60 280 80 V140" fill="none" stroke="#8a96a8" stroke-width="8"/><rect x="270" y="136" width="20" height="10" fill="#5a6278" ${S3}/><circle cx="160" cy="60" r="10" fill="#e8453c" ${S3}/>
      <g class="gear" transform="translate(220 230)"><path d="M-6 -30 h12 l2 8 l8 4 l7 -5 l8 8 l-5 7 l4 8 l8 2 v12 l-8 2 l-4 8 l5 7 l-8 8 l-7 -5 l-8 4 l-2 8 h-12 l-2 -8 l-8 -4 l-7 5 l-8 -8 l5 -7 l-4 -8 l-8 -2 v-12 l8 -2 l4 -8 l-5 -7 l8 -8 l7 5 l8 -4 Z" fill="#b5bfcc" ${S3}/><circle r="9" fill="#8a96a8" ${S3}/></g>
      <path d="M140 380 h260 v20 h-260 Z" fill="#ffd34d" ${S3}/><path d="M150 380 l-10 20 M180 380 l-10 20 M210 380 l-10 20 M240 380 l-10 20 M270 380 l-10 20 M300 380 l-10 20 M330 380 l-10 20 M360 380 l-10 20 M390 380 l-10 20" stroke="${INK}" stroke-width="7"/>` + ground('#6a7488') + `
      <path d="M0 460 h400 M0 492 h400 M100 430 v30 M260 430 v30 M180 460 v32 M340 460 v32" stroke="#5a6278" stroke-width="3"/>
      <rect x="20" y="200" width="90" height="230" fill="#b5bfcc" stroke="${INK}" stroke-width="4"/><rect x="34" y="216" width="62" height="16" rx="3" fill="#2b2140"/><path class="scope" d="M36 224 l6 -5 l6 8 l6 -8 l6 6 l6 -4 l6 6 l6 -4 l6 2 l6 -2" fill="none" stroke="#9dff8a" stroke-width="2"/><circle cx="65" cy="250" r="20" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><path class="dial" d="M65 250 l12 -8" stroke="#e8453c" stroke-width="3" stroke-linecap="round"/><path d="M50 300 h30 M50 320 h30 M50 340 h30" stroke="${INK}" stroke-width="4"/>
      <g class="leds">${[0, 1, 2, 3].map((i) => `<circle cx="${38 + i * 18}" cy="372" r="5" ${S3}/>`).join('')}</g><rect x="34" y="392" width="62" height="20" rx="4" fill="#8a96a8" ${S3}/>
      <g class="robot"><g class="r-body"><rect x="-14" y="-40" width="12" height="40" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><rect x="8" y="-40" width="12" height="40" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><path d="M-14 -24 h12 M8 -24 h12" stroke="${INK}" stroke-width="2"/><rect x="-20" y="-6" width="22" height="8" rx="3" fill="#6a7488" ${S3}/><rect x="4" y="-6" width="22" height="8" rx="3" fill="#6a7488" ${S3}/>
        <rect x="-40" y="-130" width="84" height="92" rx="10" fill="#c8d2e0" stroke="${INK}" stroke-width="4"/><path d="M30 -126 v84" stroke="#aab4c4" stroke-width="8"/><g fill="${INK}"><circle cx="-32" cy="-122" r="2.5"/><circle cx="36" cy="-122" r="2.5"/><circle cx="-32" cy="-46" r="2.5"/><circle cx="36" cy="-46" r="2.5"/></g><circle cx="2" cy="-86" r="14" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><circle class="core" cx="2" cy="-86" r="7" fill="#fff6c0"/><path d="M-24 -62 h52" stroke="${INK}" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="M-40 -110 L-80 -100 L-86 -80 M-90 -84 l8 -10 M-90 -76 l10 4" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <rect x="-26" y="-176" width="56" height="42" rx="8" fill="#c8d2e0" stroke="${INK}" stroke-width="4"/><path d="M2 -176 v-14" stroke="${INK}" stroke-width="4"/><circle cx="2" cy="-194" r="6" fill="#e8453c" stroke="${INK}" stroke-width="3"/>
        <g class="r-eyes"><rect x="-18" y="-164" width="14" height="10" rx="3" fill="#e8453c"/><rect x="6" y="-164" width="14" height="10" rx="3" fill="#e8453c"/></g><path d="M-14 -144 h30" stroke="${INK}" stroke-width="3"/></g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    rx: (t) => 380 - Math.min(110, t * 11),
    idle(ctx, t) {
      place(q(ctx, 'robot'), this.rx(t), 430, Math.sin(t * 8) * 2); q(ctx, 'r-eyes').style.opacity = Math.sin(t * 6) > -0.8 ? 1 : 0.2;
      spin(ctx, 'gear', `translate(220 230) rotate(${t * 30})`);
      spin(ctx, 'dial', `rotate(${Math.sin(t * 3) * 60} 65 250)`);
      spin(ctx, 'scope', `translate(0 224) scale(1 ${Math.sin(t * 7).toFixed(2)}) translate(0 -224)`);
      const leds = q(ctx, 'leds'); if (leds) [...leds.children].forEach((c, i) => c.setAttribute('fill', ((t * 4 + i) | 0) % 3 === 0 ? ['#e8453c', '#9dff8a', '#ffd34d', '#7fd3ff'][i] : '#5a6278'));
      const core = q(ctx, 'core'); if (core) core.setAttribute('r', (5 + Math.abs(Math.sin(t * 5)) * 4).toFixed(1));
    },
    async win(ctx) {
      const x0 = this.rx(ctx.t());
      const m = ctx.tool('magnet', 165, 330, 0.5);
      setArms(ctx.hero, 'hold');
      ctx.sfx.buzz();
      for (let i = 0; i < 3; i++) { ctx.puff(x0, 280 + i * 30, '#ffd34d', 4, 40); await ctx.wait(0.15); }
      q(ctx, 'r-eyes').innerHTML = `<path d="M-18 -164 l12 10 m0 -10 l-12 10 M6 -164 l12 10 m0 -10 l-12 10" stroke="${INK}" stroke-width="3"/>`;
      ctx.say('BZZT!');
      await ctx.T(0.6, (k) => place(q(ctx, 'robot'), x0, 430, k * 90));
      ctx.sfx.boom(); ctx.shake(); ctx.puff(x0 + 80, 420, '#c8d2e0', 12, 50);
      m.remove();
    },
    fails: {
      async zap(ctx) {
        const x0 = this.rx(ctx.t());
        const bolt = el('path', { d: `M${x0 - 86} 350 L${x0 - 120} 330 L${x0 - 130} 360 L150 340`, stroke: '#ffd34d', 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'round' });
        ctx.layer.appendChild(bolt); ctx.flash('#ffd34d'); ctx.sfx.buzz();
        await ctx.wait(0.3);
        bolt.remove();
        ctx.burn();
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- 29. charging bull
  bull: {
    correct: 'cape',
    wrong: { flower: 'gored', steak: 'gored', drum: 'gored' },
    bg: () => sky('#ffcf9a', '#fff0d8', 'bu') + `
      <path d="M0 210 Q200 170 400 210 V300 H0 Z" fill="#c8a07a" stroke="${INK}" stroke-width="3"/><path d="M0 240 Q200 204 400 240 M0 270 Q200 238 400 270" fill="none" stroke="#a8805a" stroke-width="3"/>
      <g class="crowd">${[[40, 222, '#e8453c'], [104, 214, '#2f7cf6'], [168, 210, '#2eb872'], [262, 211, '#ff6f9e'], [326, 216, '#7a5ae0'], [384, 226, '#ff8a2e'], [72, 254, '#ffd34d'], [140, 246, '#7a5ae0'], [290, 247, '#2eb872'], [354, 254, '#e8453c']].map(([x, y, c]) => `<path d="M${x - 11} ${y + 22} v-8 q11 -12 22 0 v8 Z" fill="${c}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="8" fill="#ffd2b0" stroke="${INK}" stroke-width="2.5"/>`).join('')}</g>
      <g transform="translate(200 170)"><path d="M0 0 V-60" stroke="${INK}" stroke-width="4"/><path class="bflag" d="M2 -60 h34 l-8 10 l8 10 h-34 Z" fill="#e8453c" ${S3}/></g>
      <path d="M0 300 h400 v30 h-400 Z" fill="#f6efe0" ${S3}/><path d="M0 330 h400 v30 h-400 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M0 300 h400" stroke="${INK}" stroke-width="3"/><rect y="360" width="400" height="70" fill="#c8302a"/><path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `M${20 + i * 50} 360 v70`).join(' ')}" stroke="#8a2020" stroke-width="3"/><path d="M0 360 h400" stroke="${INK}" stroke-width="3"/>
      <g fill="#ffbe2e" stroke="${INK}" stroke-width="3">${[30, 90, 150, 210, 270, 330, 390].map((x) => `<circle cx="${x}" cy="300" r="14"/>`).join('')}</g>` + ground('#e8c07a') + `
      <g class="bull"><g class="btail"><path d="M78 -76 q20 -10 18 20" fill="none" stroke="${INK}" stroke-width="5"/><path d="M96 -58 l-6 10 l8 -2 l4 8 l2 -14 Z" fill="${INK}"/></g><ellipse cx="20" cy="-60" rx="60" ry="38" fill="#6b3f22" stroke="${INK}" stroke-width="4"/><path d="M-10 -36 Q20 -26 70 -44" fill="none" stroke="#4a2a14" stroke-width="5" stroke-linecap="round"/><path d="M20 -92 q20 -6 40 4" fill="none" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/>
        <g fill="#6b3f22" stroke="${INK}" stroke-width="4"><rect x="-26" y="-36" width="14" height="36" rx="5"/><rect x="50" y="-36" width="14" height="36" rx="5"/></g><path d="M-26 -4 h14 M50 -4 h14" stroke="${INK}" stroke-width="7"/>
        <ellipse cx="-44" cy="-74" rx="30" ry="26" fill="#6b3f22" stroke="${INK}" stroke-width="4"/><path d="M-68 -86 q-14 -4 -16 -14 q12 0 18 8 M-22 -88 q12 -6 14 -16 q-12 0 -16 10" fill="#6b3f22" ${S3}/><path d="M-60 -96 q-16 -20 -4 -30 M-30 -98 q8 -22 -6 -30" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M-60 -96 q-16 -20 -4 -30 M-30 -98 q8 -22 -6 -30" fill="none" stroke="#f6efe0" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="-62" cy="-62" rx="14" ry="10" fill="#e0a088" stroke="${INK}" stroke-width="3"/><circle cx="-67" cy="-64" r="2.5" fill="${INK}"/><circle cx="-57" cy="-64" r="2.5" fill="${INK}"/><circle cx="-62" cy="-52" r="6" fill="none" stroke="#ffd34d" stroke-width="3"/><circle cx="-46" cy="-82" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-47" cy="-81" r="3" fill="#e8453c"/><circle cx="-47" cy="-81" r="1.4" fill="${INK}"/><path d="M-56 -92 l16 6" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    bx: (t) => 360 - Math.min(40, t * 4),
    idle(ctx, t) {
      place(q(ctx, 'bull'), this.bx(t), 430 + Math.abs(Math.sin(t * 7)) * -3);
      spin(ctx, 'btail', `rotate(${Math.sin(t * 6) * 14} 78 -72)`);
      spin(ctx, 'crowd', `translate(0 ${-Math.abs(Math.sin(t * 5)) * 3})`);
      spin(ctx, 'bflag', `translate(2 -50) scale(${1 + Math.sin(t * 5) * 0.12} 1) translate(-2 50)`);
      if (Math.random() < 0.04) ctx.puff(this.bx(t) - 80, 370, '#fff', 2, 20);
    },
    async win(ctx) {
      const x0 = this.bx(ctx.t());
      const c = ctx.tool('cape', 190, 360, 0.8);
      setArms(ctx.hero, 'hold');
      await ctx.wait(0.2);
      ctx.sfx.roar();
      await ctx.T(0.8, (k) => { place(q(ctx, 'bull'), x0 - k * 560, 430); place(ctx.hero, 140 - Math.min(1, k * 3) * 30, 430); place(c, 190 + Math.sin(k * Math.PI) * 40, 360, -Math.sin(k * Math.PI) * 40, 0.8); });
      ctx.say('OLE!');
      c.dataset.keep = '1';
    },
    fails: {
      async gored(ctx) {
        const x0 = this.bx(ctx.t());
        ctx.sfx.roar();
        await ctx.T(0.3, (k) => place(q(ctx, 'bull'), x0 - k * (x0 - 210), 430));
        ctx.shake(); ctx.say('AAAA!'); ctx.faint();
        await ctx.T(0.8, (k) => place(ctx.hero, 140 - k * 60, 430 - Math.sin(k * Math.PI * 0.9) * 360, -k * 540));
      },
    },
  },

  // ---------------------------------------------------------------- 30. avalanche
  avalanche: {
    correct: 'skis',
    wrong: { umbrella: 'buried', fan: 'buried', sponge: 'buried' },
    bg: () => sky('#9fc8f0', '#e6f2ff', 'av') + `
      <path d="M180 330 L290 150 L330 200 L380 120 L420 200 V330 Z" fill="#b8cce6" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/><path d="M290 150 L274 178 l10 -4 l8 8 l10 -10 Z M380 120 L362 150 l10 -4 l8 8 l12 -10 Z" fill="#fff"/>
      <path d="M0 120 L120 40 L260 220 L400 330 V520 H0 Z" fill="#f6f9ff" stroke="${INK}" stroke-width="4"/><path d="M120 40 L100 120 L140 200 L120 280 M60 80 L50 180 L80 260" fill="none" stroke="#d8e4f2" stroke-width="5" stroke-linecap="round"/><path d="M0 120 L120 40 L150 80 L70 130 Z" fill="#dfe8f5"/>
      <path d="M0 430 L400 430" stroke="${INK}" stroke-width="0"/><rect y="430" width="400" height="90" fill="#eef4fb"/><path d="M20 460 q40 -6 80 0 M160 486 q50 -8 100 0 M300 462 q40 -6 80 0" fill="none" stroke="#d8e4f2" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 300 l14 -30 l14 30 Z M300 400 l14 -30 l14 30 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="3"/><path d="M66 286 l8 -12 l8 12 Z M306 386 l8 -12 l8 12 Z" fill="#fff"/>
      ${pine(370, 432, 0.7, '#3f7a5a', '#fff')}${pine(160, 260, 0.45, '#3f7a5a', '#fff')}
      <g transform="translate(330 432)"><rect x="-26" y="-36" width="52" height="36" fill="#8a5a32" ${S3}/><path d="M-26 -24 h52 M-26 -12 h52" stroke="#6b3f22" stroke-width="3"/><path d="M-34 -34 L0 -60 L34 -34 Z" fill="#fff" ${S3}/><rect x="-14" y="-28" width="12" height="12" fill="#ffe680" ${S3}/><rect x="6" y="-24" width="12" height="24" fill="#6b3f22" ${S3}/><rect x="10" y="-62" width="8" height="16" fill="#8a5a32" ${S3}/></g>
      <g class="snowwave"><path d="M-160 0 C-150 -80 -80 -110 -20 -80 C10 -110 60 -90 60 -40 C90 -40 90 0 60 10 Z" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M-140 -10 C-130 -60 -80 -84 -30 -70" fill="none" stroke="#dfe8f5" stroke-width="8" stroke-linecap="round"/><circle cx="-60" cy="-60" r="16" fill="#eef4fb"/><circle cx="10" cy="-50" r="12" fill="#eef4fb"/>
        <g class="chunks" fill="#fff" ${S3}><circle cx="70" cy="-60" r="9"/><circle cx="40" cy="-110" r="7"/><circle cx="-20" cy="-120" r="10"/><rect x="66" y="-20" width="14" height="10" rx="3" fill="#8a5a32"/></g></g>`,
    setup(ctx) { place(ctx.hero, 250, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    wp: (t) => Math.min(1, t / 12) * 0.55,
    wave(ctx, k) { place(q(ctx, 'snowwave'), -40 + k * 300, 200 + k * 230, 0, 1 + k * 0.8); },
    idle(ctx, t) {
      this.wave(ctx, this.wp(t)); ctx.hero.setAttribute('transform', `translate(250 430) rotate(${Math.sin(t * 20) * 1.5})`);
      const ch = q(ctx, 'chunks'); if (ch) [...ch.children].forEach((c, i) => c.setAttribute('transform', `translate(${Math.sin(t * 4 + i * 2) * 8} ${Math.abs(Math.sin(t * 5 + i)) * -10})`));
    },
    async win(ctx) {
      const k0 = this.wp(ctx.t());
      const sk = ctx.tool('skis', 250, 440, 0.7);
      ctx.sfx.whoosh(); ctx.say('YIHUU!');
      await ctx.T(1.0, (k) => { place(ctx.hero, 250 + k * 220, 430); place(sk, 250 + k * 220, 440, 0, 0.7); this.wave(ctx, k0 + (0.85 - k0) * k); });
    },
    fails: {
      async buried(ctx) {
        const k0 = this.wp(ctx.t());
        ctx.sfx.whoosh();
        await ctx.T(0.5, (k) => this.wave(ctx, k0 + (0.75 - k0) * k));
        ctx.shake();
        ctx.hero.style.display = 'none';
        q(ctx, 'snowwave').style.display = 'none';
        const mound = g({}, `<path d="M-90 0 C-80 -70 80 -70 90 0 Z" fill="#fff" stroke="${INK}" stroke-width="4"/><g transform="translate(10 -50) rotate(-10)"><rect x="-6" y="-30" width="12" height="32" rx="6" fill="#2f7cf6" stroke="${INK}" stroke-width="3"/><circle cy="-34" r="8" fill="#ffd2b0" stroke="${INK}" stroke-width="3"/></g>`);
        place(mound, 250, 432);
        ctx.layer.appendChild(mound);
        ctx.puff(250, 400, '#fff', 14, 60);
        await ctx.T(0.6, (k) => mound.lastElementChild && mound.querySelector('g').setAttribute('transform', `translate(10 -50) rotate(${Math.sin(k * 12) * 20})`));
      },
    },
  },

  // ---------------------------------------------------------------- 31. quicksand
  quicksand: {
    correct: 'rope',
    wrong: { anchor: 'sunk', broccoli: 'sunk', skateboard: 'sunk' },
    bg: () => sky('#ffd9a0', '#fff2d8', 'qs') + `
      <path d="M0 430 V380 Q60 330 130 370 T260 360 T400 372 V430 Z" fill="#f0d098" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <g transform="translate(60 380)"><path d="M0 0 q4 -30 -4 -60" fill="none" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/><path d="M-4 -60 q-20 -6 -30 8 M-4 -60 q16 -14 30 -2 M-4 -60 q-4 -16 -18 -20 M-4 -60 q10 -16 24 -14" fill="none" stroke="#3f9a4a" stroke-width="5" stroke-linecap="round"/></g>` + ground('#e8c07a') + `
      <path d="M10 456 q30 -6 60 0 M290 470 q40 -8 80 0 M20 500 q40 -8 80 0 M300 504 q30 -6 60 0" fill="none" stroke="#d0a460" stroke-width="3" stroke-linecap="round"/>
      <path d="M330 430 V200" stroke="#6b3f22" stroke-width="16"/><path d="M322 400 q8 -30 0 -60 M336 300 q-6 -30 2 -60" fill="none" stroke="#4a2a14" stroke-width="3"/><path d="M314 430 q-10 -2 -16 4 M346 430 q10 -2 16 4" fill="none" stroke="#6b3f22" stroke-width="7" stroke-linecap="round"/><path d="M330 220 Q300 200 240 196" stroke="#6b3f22" stroke-width="10" fill="none" stroke-linecap="round"/>
      <ellipse cx="350" cy="190" rx="50" ry="26" fill="#5aa84a" stroke="${INK}" stroke-width="4"/><ellipse cx="300" cy="200" rx="26" ry="14" fill="#5aa84a" stroke="${INK}" stroke-width="4"/><path d="M320 180 q12 -6 24 0 M350 196 q12 -6 24 0" fill="none" stroke="#3f8a3a" stroke-width="3" stroke-linecap="round"/>
      <g class="parrot" transform="translate(372 168)"><path d="M0 0 q-10 -4 -8 -18 q8 -8 16 0 q4 12 -8 18 Z" fill="#e8453c" ${S3}/><path d="M-6 -2 l-4 16 l6 -4 l4 6 Z" fill="#2f7cf6" ${S3}/><path d="M6 -14 l7 4 l-6 3 Z" fill="#ffd34d" stroke="${INK}" stroke-width="2"/><circle cx="2" cy="-12" r="1.8" fill="${INK}"/></g>
      ${stone(40, 436, 1.1, '#c89a6a')}<g transform="translate(360 440)"><path d="M-14 -2 q-6 -16 8 -18 q14 -2 16 12 q2 8 -6 8 Z" fill="#f6efe0" ${S3}/><circle cx="-4" cy="-10" r="3" fill="${INK}"/><circle cx="6" cy="-10" r="3" fill="${INK}"/></g>
      <ellipse cx="180" cy="436" rx="90" ry="16" fill="#b58a4a" stroke="${INK}" stroke-width="4"/><path d="M120 436 q60 8 120 0 M140 430 q40 4 80 0" fill="none" stroke="#9a7038" stroke-width="3"/>`,
    setup(ctx) {
      place(ctx.hero, 180, 440); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="sandfront"><rect x="0" y="440" width="400" height="80" fill="#e8c07a"/><path d="M90 440 q90 18 180 0" fill="#b58a4a" stroke="${INK}" stroke-width="4"/><g class="qbub" fill="#c89a5a" stroke="${INK}" stroke-width="2"><circle cx="120" cy="444" r="4"/><circle cx="236" cy="446" r="3"/></g></g>`);
    },
    sy: (t) => 440 + Math.min(80, t * 8),
    idle(ctx, t) {
      place(ctx.hero, 180 + Math.sin(t * 3) * 2, this.sy(t));
      const qb = q(ctx, 'qbub'); if (qb) [...qb.children].forEach((c, i) => { const k = (t * 0.9 + i * 0.5) % 1; c.setAttribute('r', (k * 6).toFixed(1)); c.setAttribute('opacity', (1 - k).toFixed(2)); });
      spin(ctx, 'parrot', `translate(372 168) rotate(${Math.sin(t * 2) * 8})`);
    },
    async win(ctx) {
      const y0 = this.sy(ctx.t());
      const r = el('path', { d: `M240 196 L195 ${y0 - 120}`, stroke: '#c9a06b', 'stroke-width': 6 });
      ctx.layer.appendChild(r);
      setArms(ctx.hero, 'up');
      ctx.sfx.whoosh(); ctx.say('ÇEK!');
      await ctx.T(0.8, (k) => { const y = y0 - (y0 - 430) * k; place(ctx.hero, 180, y); r.setAttribute('d', `M240 196 L195 ${y - 120}`); });
      await ctx.T(0.5, (k) => { place(ctx.hero, 180 + k * 110, 430 - Math.sin(k * Math.PI) * 30); r.setAttribute('d', `M240 196 L${195 + k * 110} ${310}`); });
      r.remove();
    },
    fails: {
      async sunk(ctx) {
        const y0 = this.sy(ctx.t());
        ctx.sfx.whoosh();
        await ctx.T(0.8, (k) => place(ctx.hero, 180, y0 + (600 - y0) * k));
        ctx.bubbles(180, 440); ctx.say('BLUP!');
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- 32. tsunami
  tsunami: {
    correct: 'surfboard',
    wrong: { umbrella: 'washed', sponge: 'washed', water: 'washed' },
    bg: () => sky('#8fd3ff', '#e0f4ff', 'ts') + `
      <g fill="#c8d8ec" stroke="${INK}" stroke-width="3" stroke-opacity="0.3"><rect x="250" y="250" width="40" height="130"/><rect x="296" y="220" width="50" height="160"/><rect x="352" y="270" width="48" height="110"/></g><path d="${[0, 1, 2, 3, 4].map((r) => `M258 ${264 + r * 22} h8 v10 h-8 Z M274 ${264 + r * 22} h8 v10 h-8 Z M306 ${236 + r * 26} h10 v12 h-10 Z M326 ${236 + r * 26} h10 v12 h-10 Z M362 ${284 + r * 18} h10 v8 h-10 Z`).join(' ')}" fill="#8fd3ff"/>
      <rect y="380" width="400" height="140" fill="#f0d090"/><rect y="380" width="400" height="6" fill="${INK}" opacity="0.12"/><path d="M20 420 q30 -6 60 0 M150 470 q40 -8 80 0 M300 430 q30 -6 60 0 M40 500 q40 -8 80 0" fill="none" stroke="#d8b46a" stroke-width="3" stroke-linecap="round"/>
      <path d="M300 380 v-80 M300 300 q-30 -10 -50 10 M300 300 q30 -16 50 4 M300 300 q-10 -30 -30 -34 M300 300 q14 -30 34 -30" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/><path d="M300 380 v-80" stroke="#8a5a32" stroke-width="10"/><path d="M296 370 h8 M296 350 h8 M296 330 h8 M296 310 h8" stroke="#6b3f22" stroke-width="3"/><circle cx="296" cy="304" r="5" fill="#8a5a32" ${S3}/><circle cx="306" cy="306" r="5" fill="#8a5a32" ${S3}/>
      <g transform="translate(110 400)"><path d="M0 0 V-76" stroke="${INK}" stroke-width="4"/><path d="M-44 -64 Q0 -104 44 -64 Z" fill="#e8453c" ${S3}/><path d="M-14 -64 Q0 -100 14 -64 Z" fill="#fff"/></g><rect x="70" y="398" width="60" height="16" rx="4" fill="#2f7cf6" ${S3}/><path d="M80 398 v16 M100 398 v16 M120 398 v16" stroke="#fff" stroke-width="4"/>
      <g transform="translate(360 408)"><path d="M-22 0 v-14 h8 v-6 h8 v6 h8 v-6 h8 v6 h8 v14 Z" fill="#e8c070" ${S3}/><path d="M-4 -20 v-10 l10 4 l-10 4" fill="#e8453c" stroke="${INK}" stroke-width="2"/></g>
      <g class="ball" transform="translate(160 430)"><circle r="12" fill="#fff" ${S3}/><path d="M-12 0 a12 12 0 0 1 12 -12 v12 Z" fill="#e8453c"/><path d="M0 12 a12 12 0 0 1 12 -12 h-12 Z" fill="#2f7cf6"/><circle r="12" fill="none" ${S3}/></g>
      <g class="tsu"><path d="M-400 140 V-60 C-300 -140 -120 -150 -40 -60 C0 -20 -10 30 -50 30 C-40 0 -70 -20 -90 0 C-60 40 -10 80 40 140 Z" fill="#2f8fd8" stroke="${INK}" stroke-width="4"/><path d="M-400 140 V-20 C-300 -90 -160 -90 -110 -30 C-90 20 -40 80 0 140 Z" fill="#2a7cc0"/><path d="M-200 -110 C-140 -130 -80 -110 -50 -70" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
        <path d="M-60 -64 q10 -14 24 -4 q-4 -16 12 -14 q-2 -14 14 -6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M-320 0 q20 -10 40 0 M-250 50 q20 -10 40 0 M-180 10 q20 -10 40 0" fill="none" stroke="#8fd3ff" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(-210 -40) rotate(-20)"><path d="M-12 0 q12 -12 24 0 q-12 12 -24 0 Z M12 0 l8 -6 v12 Z" fill="#ffbe2e" ${S3}/><circle cx="-5" cy="-2" r="1.6" fill="${INK}"/></g></g>`,
    setup(ctx) { place(ctx.hero, 230, 400); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    tp: (t) => Math.min(1, t / 11),
    wave(ctx, k) { place(q(ctx, 'tsu'), -60 + k * 200, 380, 0, 0.6 + k * 0.6); },
    idle(ctx, t) { this.wave(ctx, this.tp(t) * 0.7); spin(ctx, 'ball', `translate(160 ${430 - Math.abs(Math.sin(t * 3)) * 16}) rotate(${t * 90})`); },
    async win(ctx) {
      const k0 = this.tp(ctx.t()) * 0.7;
      const sb = ctx.tool('surfboard', 230, 400, 0.8);
      ctx.say('YIHUU!');
      await ctx.T(1.2, (k) => {
        this.wave(ctx, k0 + k * (1.6 - k0));
        const x = 230 + k * 250, y = 400 - Math.sin(Math.min(1, k * 2) * Math.PI * 0.5) * 140;
        place(ctx.hero, x, y - 10, -10); place(sb, x, y, 60, 0.8);
      });
    },
    fails: {
      async washed(ctx) {
        const k0 = this.tp(ctx.t()) * 0.7;
        ctx.sfx.splash();
        await ctx.T(1.0, (k) => { this.wave(ctx, k0 + k * (1.8 - k0)); if (k > 0.35) place(ctx.hero, 230 + (k - 0.35) * 400, 400 - (k - 0.35) * 200, (k - 0.35) * 900); });
        ctx.say('BLUP!');
      },
    },
  },

  // ---------------------------------------------------------------- 33. skunk
  skunk: {
    correct: 'clothespin',
    wrong: { flower: 'stink', cheese: 'stink', fan: 'stink' },
    bg: () => sky('#bfe8c0', '#ecf8e8', 'sk2') + hills('#a8d8a0', '#8cc884') + `${pine(170, 396, 0.6, '#5a9a6a')}${pine(240, 392, 0.7, '#5a9a6a')}` + ground('#6ab04a') + `
      <path d="M40 430 L80 300 L120 430 Z M330 430 L360 320 L390 430 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/><path d="M60 380 l20 -12 l20 12 M56 410 l24 -14 l24 14 M346 380 l14 -10 l14 10 M342 410 l18 -12 l18 12" fill="none" stroke="#1f6a3a" stroke-width="3"/>
      <g transform="translate(220 434)"><rect x="-40" y="-20" width="80" height="20" rx="10" fill="#8a5a32" ${S3}/><ellipse cx="-40" cy="-10" rx="7" ry="10" fill="#c9a06b" ${S3}/><path d="M-30 -14 h30 M-10 -6 h40" stroke="#6b3f22" stroke-width="2"/><path d="M10 -20 v-8 q8 -4 10 4" fill="none" stroke="#2e7d4a" stroke-width="3"/></g>
      ${[[140, 436, '#ff6f9e'], [280, 438, '#ffd34d'], [300, 440, '#fff']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M0 0 v-14" stroke="#2e7d4a" stroke-width="3"/><circle cy="-18" r="6" fill="${c}" ${S3}/><circle cy="-18" r="2.4" fill="#ffbe2e"/></g>`).join('')}
      <g transform="translate(180 440)"><path d="M-3 0 v-10" stroke="#f6efe0" stroke-width="5"/><path d="M-12 -10 q12 -16 24 0 Z" fill="#e8453c" ${S3}/></g>
      <g class="skunk"><path class="tail" d="M30 -20 C70 -40 70 -110 30 -120 C10 -110 20 -70 10 -40 Z" fill="#2b2140" stroke="${INK}" stroke-width="3"/><path d="M28 -30 C50 -60 50 -100 32 -110" fill="none" stroke="#fff" stroke-width="7"/>
        <ellipse cx="0" cy="-24" rx="36" ry="22" fill="#2b2140"/><path d="M-30 -36 C-10 -46 20 -46 34 -34" stroke="#fff" stroke-width="8" fill="none"/><g fill="#2b2140"><rect x="-26" y="-10" width="10" height="12" rx="4"/><rect x="14" y="-10" width="10" height="12" rx="4"/></g>
        <circle cx="-36" cy="-34" r="16" fill="#2b2140"/><path d="M-36 -50 q-6 10 -14 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>${eye(-42, -36, 4.5, 'sklid', '#2b2140')}<circle cx="-52" cy="-30" r="3" fill="#ff9ac8"/><circle cx="-38" cy="-26" r="3" fill="#ff6f9e" opacity="0.6"/><path d="M-30 -48 l-4 -8 l8 4 Z" fill="#2b2140"/><path d="M-46 -24 q4 3 8 0" fill="none" stroke="#fff" stroke-width="1.5"/></g>
      <g class="stinkc" opacity="0"><circle cx="0" cy="0" r="40" fill="#b8d860" opacity="0.6"/><circle cx="40" cy="-20" r="30" fill="#b8d860" opacity="0.6"/><circle cx="-30" cy="-30" r="30" fill="#b8d860" opacity="0.6"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const turn = t > 3;
      place(q(ctx, 'skunk'), 300 - Math.min(40, t * 4), 430, 0, turn ? -1 : 1, 1);
      q(ctx, 'tail').setAttribute('transform', `rotate(${Math.sin(t * 6) * 8} 30 -20)`);
      setLids(ctx, 'sklid', blink(t, 0.3));
    },
    async win(ctx) {
      const cp = ctx.tool('clothespin', 120, 314, 0.22);
      cp.dataset.keep = '1';
      const c = q(ctx, 'stinkc');
      ctx.sfx.whoosh();
      await ctx.T(0.8, (k) => { c.setAttribute('opacity', Math.sin(k * Math.PI)); place(c, 230 - k * 100, 340, 0, 1 + k); });
      setFace(ctx.hero, 'happy'); ctx.say('MİS!');
      await ctx.T(0.6, (k) => place(q(ctx, 'skunk'), 260 + k * 200, 430, 0, -1, 1));
    },
    fails: {
      async stink(ctx) {
        const c = q(ctx, 'stinkc');
        ctx.sfx.whoosh();
        await ctx.T(0.7, (k) => { c.setAttribute('opacity', k); place(c, 230 - k * 100, 340, 0, 1 + k * 1.2); });
        ctx.hero.style.setProperty('--skin', '#c8e0a0');
        ctx.say('PÖFF!'); ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 130, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- 34. lightning storm
  lightning: {
    correct: 'boots',
    wrong: { umbrella: 'zap', kite: 'zap', sword: 'zap' },
    bg: () => sky('#3a3e5a', '#6a6e8a', 'lt') + hills('#4a5a6a', '#46604e') + `
      <g transform="translate(330 400)" fill="#3a3e50" ${S3}><rect x="-30" y="-40" width="60" height="40"/><path d="M-38 -40 l38 -30 l38 30 Z"/><rect x="-10" y="-30" width="12" height="12" fill="#ffe680"/></g>
      <g transform="translate(60 432)"><path d="M0 0 v-80 M0 -50 l-20 -20 M0 -64 l18 -18" fill="none" stroke="#3a2a2a" stroke-width="8" stroke-linecap="round"/><g class="ltree" fill="#3e5a44" ${S3}><circle cx="-14" cy="-92" r="22"/><circle cx="16" cy="-96" r="20"/><circle cy="-116" r="20"/></g></g>` + ground('#4a6a4a') + `
      <g fill="#6a7488" ${S3}>${[230, 300, 370].map((x) => `<rect x="${x - 4}" y="392" width="8" height="40"/>`).join('')}</g><path d="M226 404 H400 M226 418 H400" stroke="#9aa6b8" stroke-width="3"/>
      <ellipse cx="150" cy="470" rx="50" ry="8" fill="#6a8aa8" ${S3}/><ellipse cx="300" cy="490" rx="40" ry="7" fill="#6a8aa8" ${S3}/><g class="ripples" fill="none" stroke="#bfeaff" stroke-width="2"><ellipse cx="140" cy="470" rx="6" ry="2"/><ellipse cx="310" cy="490" rx="6" ry="2"/></g>
      <g class="rain" stroke="#9fc8f0" stroke-width="3" opacity="0.6"></g>
      <g class="clouds" fill="#5a5e78" stroke="${INK}" stroke-width="4"><ellipse cx="100" cy="70" rx="90" ry="40"/><ellipse cx="220" cy="60" rx="100" ry="46"/><ellipse cx="330" cy="80" rx="80" ry="36"/></g><g fill="#4a4e66"><ellipse cx="100" cy="90" rx="70" ry="16"/><ellipse cx="220" cy="86" rx="80" ry="18"/><ellipse cx="330" cy="98" rx="60" ry="14"/></g><path d="M40 60 q20 -14 40 -6 M180 40 q24 -16 50 -6 M300 64 q16 -10 34 -4" fill="none" stroke="#7a7e98" stroke-width="4" stroke-linecap="round"/>
      <path class="bolt" d="M220 100 L190 220 L230 220 L200 340" fill="none" stroke="#ffd34d" stroke-width="10" stroke-linejoin="round" opacity="0"/>`,
    setup(ctx) {
      place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const r = q(ctx, 'rain');
      for (let i = 0; i < 30; i++) r.insertAdjacentHTML('beforeend', '<path d="M0 0 l-6 18"/>');
    },
    idle(ctx, t) {
      [...q(ctx, 'rain').children].forEach((d, i) => d.setAttribute('transform', `translate(${(i * 47) % 420} ${(i * 31 + t * 400) % 440})`));
      q(ctx, 'bolt').setAttribute('opacity', Math.sin(t * 7) > 0.97 ? 0.8 : 0);
      const rp = q(ctx, 'ripples'); if (rp) [...rp.children].forEach((e, i) => { const k = (t * 1.2 + i * 0.5) % 1; e.setAttribute('rx', (4 + k * 22).toFixed(1)); e.setAttribute('ry', (1.5 + k * 4).toFixed(1)); e.setAttribute('opacity', (1 - k).toFixed(2)); });
      spin(ctx, 'ltree', `rotate(${Math.sin(t * 3) * 4 - 3} 0 -60)`);
    },
    async strike(ctx) {
      const b = q(ctx, 'bolt');
      b.setAttribute('d', 'M220 100 L190 220 L230 220 L200 300');
      b.setAttribute('opacity', 1);
      ctx.flash('#fff6a0'); ctx.sfx.bigBoom(); ctx.shake();
      await ctx.wait(0.3);
      b.setAttribute('opacity', 0);
    },
    async win(ctx) {
      const bt = ctx.tool('boots', 200, 420, 0.42);
      bt.dataset.keep = '1';
      await ctx.wait(0.3);
      await this.strike(ctx);
      ctx.puff(200, 430, '#ffd34d', 10, 50);
      setFace(ctx.hero, 'happy'); ctx.say('PFF!');
    },
    fails: {
      async zap(ctx) {
        await ctx.wait(0.2);
        await this.strike(ctx);
        ctx.burn();
        ctx.hero.fx.insertAdjacentHTML('beforeend', `<path d="M-24 -150 l-8 -16 M0 -152 v-20 M24 -150 l8 -16" stroke="${INK}" stroke-width="4"/>`);
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- 35. piranha river
  piranha: {
    correct: 'plank',
    wrong: { steak: 'nibbled', banana: 'nibbled', ring: 'nibbled' },
    bg: () => sky('#a8e0a0', '#e0f4d8', 'pi') + `
      <g fill="#7cc88a" opacity="0.85"><circle cx="40" cy="300" r="50"/><circle cx="110" cy="290" r="44"/><circle cx="180" cy="306" r="40"/><circle cx="250" cy="296" r="46"/><rect x="0" y="300" width="300" height="70"/></g>
      <path d="M0 360 h300" stroke="#5aa84a" stroke-width="10"/><path d="M60 360 v-20 M70 360 v-28 M80 360 v-18 M220 360 v-24 M230 360 v-32" stroke="#3f9a4a" stroke-width="4" stroke-linecap="round"/><path d="M70 332 v-8 M230 328 v-8" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/>
      <path d="M300 330 h100 v190 h-100 Z" fill="#7a5a3a" stroke="${INK}" stroke-width="4"/><path d="M300 380 h100 M300 430 h100 M300 480 h100" stroke="#6a4a2e" stroke-width="3"/>${stone(340, 404, 0.6, '#9a8a7a')}${stone(372, 460, 0.5, '#9a8a7a')}<rect x="300" y="322" width="100" height="14" fill="#5aa84a" stroke="${INK}" stroke-width="3"/>
      <path d="M340 322 V240 M340 250 q-20 -30 -40 -20 M340 250 q20 -30 40 -20" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/><path d="M300 230 l-8 8 M300 230 l4 10 M380 230 l8 8 M380 230 l-4 10" stroke="#2e7d4a" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(372 322)"><path d="M0 0 v-20" stroke="#2e7d4a" stroke-width="3"/><g fill="#ff6f9e" ${S3}><ellipse cx="-6" cy="-24" rx="6" ry="4"/><ellipse cx="6" cy="-24" rx="6" ry="4"/><ellipse cy="-30" rx="4" ry="6"/></g><circle cy="-24" r="3" fill="#ffd34d"/></g>`,
    fish: `<g><path d="M-16 0 C-10 -14 10 -14 16 0 C10 14 -10 14 -16 0 Z M16 0 l10 -8 v16 Z" fill="#e8453c" stroke="${INK}" stroke-width="3"/><path d="M-2 -10 l6 -8 l4 8 Z" fill="#b8302a" stroke="${INK}" stroke-width="2"/><path d="M-6 4 C0 10 10 8 14 2" fill="none" stroke="#ff9a7e" stroke-width="3"/><circle cx="-8" cy="-3" r="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="-8.5" cy="-3" r="1.6" fill="${INK}"/><path d="M-12 -7 l7 2" stroke="${INK}" stroke-width="2"/><path d="M-16 2 l3 -3 l2 4 l3 -4 l2 3" fill="#fff" stroke="${INK}" stroke-width="1.2"/></g>`,
    setup(ctx) {
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="log"><rect x="-56" y="0" width="112" height="22" rx="11" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-50" cy="11" r="7" fill="#c9a06b" stroke="${INK}" stroke-width="2"/></g>`);
      place(ctx.hero, 170, 352); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.appendChild(ctx.hero);
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="riv"><rect x="0" y="370" width="300" height="150" fill="#2f8fd8" opacity="0.92"/><path d="M0 370 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="4" opacity="0.7"/><path d="M20 420 h40 M240 450 h36 M90 480 h30" stroke="#8fd3ff" stroke-width="4" stroke-linecap="round" opacity="0.6"/><path d="M262 372 a16 5 0 1 1 1 0 Z" fill="#3f9a4a" stroke="${INK}" stroke-width="2.5"/><circle cx="270" cy="368" r="4" fill="#ff9ac8" stroke="${INK}" stroke-width="2"/></g><g class="fishes"></g>`);
      for (let i = 0; i < 4; i++) q(ctx, 'fishes').insertAdjacentHTML('beforeend', this.fish);
    },
    sink: (t) => Math.min(30, t * 3),
    idle(ctx, t) {
      const s = this.sink(t);
      place(q(ctx, 'log'), 170, 352 + s);
      place(ctx.hero, 170, 352 + s, Math.sin(t * 2) * 4);
      [...q(ctx, 'fishes').children].forEach((f, i) => {
        const ph = (t * 0.9 + i * 0.27) % 1;
        place(f, 30 + i * 70 + ph * 40, 400 - Math.sin(ph * Math.PI) * 70, ph * 160 - 80, i % 2 ? -1 : 1, 1);
      });
    },
    async win(ctx) {
      const s = this.sink(ctx.t());
      const pl = g({}, `<rect x="0" y="-8" width="140" height="16" rx="3" fill="#c9893b" stroke="${INK}" stroke-width="4"/>`);
      ctx.layer.appendChild(pl);
      await ctx.T(0.4, (k) => place(pl, 200, 340 + s / 2, -k * 4 + 4, k, 1));
      setArms(ctx.hero, 'down');
      await ctx.T(0.8, (k) => place(ctx.hero, 170 + k * 190, 352 + s - (352 + s - 324) * k - Math.abs(Math.sin(k * Math.PI * 4)) * 8));
    },
    fails: {
      async nibbled(ctx) {
        const s = this.sink(ctx.t());
        const fs = [...q(ctx, 'fishes').children];
        await ctx.T(0.4, (k) => fs.forEach((f, i) => place(f, 140 + i * 20, 380 - k * 20 - i * 6, 0, i % 2 ? -1 : 1, 1)));
        ctx.sfx.chomp(); ctx.say('NOM NOM!');
        await ctx.T(0.8, (k) => { place(ctx.hero, 170, 352 + s + k * 160, k * 20); place(q(ctx, 'log'), 170, 352 + s + k * 30, k * 20); });
        ctx.bubbles(170, 380);
      },
    },
  },
  // ================================================================ trick dangers: the obvious answer is the wrong one
  // ---------------------------------------------------------------- grease fire in the kitchen (water = fireball)
  grease: {
    trick: 'fire',
    correct: 'lid',
    wrong: { water: 'flare', ice: 'flare', fan: 'flare' },
    bg: () => `<rect width="400" height="520" fill="#fff2dc"/><path d="${[0, 1, 2, 3, 4, 5].map((i) => `M0 ${60 + i * 60} H400`).join(' ')} ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `M${i * 60} 0 V430`).join(' ')}" stroke="#ecd9cb" stroke-width="3"/>` + ground('#c9a06b') + `
      <path d="M210 120 h170 l-20 -50 h-130 Z" fill="#c8d2e0" ${S4}/><rect x="270" y="0" width="50" height="70" fill="#b5bfcc" ${S4}/><path d="M220 112 h150" stroke="#9aa6b8" stroke-width="4"/><circle cx="360" cy="104" r="3" fill="#e8453c"/>
      <g class="gsmoke" fill="#8a8698" opacity="0.5"><circle r="10"/><circle r="14"/><circle r="12"/></g>
      <g ${S4}><rect x="20" y="40" width="80" height="90" rx="4" fill="#e8b878"/><rect x="104" y="40" width="80" height="90" rx="4" fill="#e8b878"/></g><path d="M86 70 v30 M118 70 v30" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <rect x="20" y="240" width="140" height="8" rx="3" fill="#c9893b" ${S3}/><g ${S3}><rect x="28" y="214" width="16" height="26" rx="3" fill="#e8453c"/><rect x="50" y="218" width="16" height="22" rx="3" fill="#2eb872"/><rect x="72" y="212" width="16" height="28" rx="3" fill="#ffbe2e"/></g><path d="M28 222 h16 M50 226 h16 M72 220 h16" stroke="${INK}" stroke-width="2"/>
      <rect x="196" y="322" width="198" height="12" rx="3" fill="#8a96a8" ${S3}/>
      <rect x="200" y="330" width="190" height="100" fill="#dfe6ef" stroke="${INK}" stroke-width="4"/><rect x="264" y="360" width="62" height="56" rx="6" fill="#2b2140" opacity="0.85"/><rect x="272" y="368" width="46" height="40" rx="4" fill="#ff8a2e" opacity="0.35"/><path d="M270 350 h50" stroke="#9aa6b8" stroke-width="5" stroke-linecap="round"/><circle cx="240" cy="380" r="10" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="350" cy="380" r="10" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="240" cy="342" r="5" fill="#9aa6b8" stroke="${INK}" stroke-width="2"/><circle cx="350" cy="342" r="5" fill="#9aa6b8" stroke="${INK}" stroke-width="2"/>
      <rect x="320" y="200" width="44" height="64" rx="8" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><rect x="332" y="186" width="20" height="16" rx="3" fill="#e8b030" stroke="${INK}" stroke-width="3"/><text x="342" y="240" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="13" fill="${INK}">OIL</text>
      <g class="pan"><path d="M220 330 h100 l-8 -24 h-84 Z" fill="#2b2140" stroke="${INK}" stroke-width="4"/><path d="M220 318 h-50" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><ellipse cx="270" cy="308" rx="44" ry="6" fill="#ffbe2e"/></g>
      <g class="fires">${flame(250, 304, 0.7)}${flame(285, 300, 0.9)}${flame(268, 296, 0.6)}</g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.6 + i * 0.12) * (1 + Math.min(0.6, t * 0.06)) * (1 + Math.sin(t * 9 + i) * 0.08)})`)));
      const sm = q(ctx, 'gsmoke'); if (sm) [...sm.children].forEach((c, i) => { const k = (t * 0.5 + i / 3) % 1; c.setAttribute('cx', (268 + Math.sin(k * 7 + i) * 12).toFixed(1)); c.setAttribute('cy', (240 - k * 120).toFixed(1)); c.setAttribute('r', (8 + k * 14).toFixed(1)); c.setAttribute('opacity', (0.7 * (1 - k)).toFixed(2)); });
    },
    async win(ctx) {
      const lid = ctx.tool('lid', 270, 200, 0.9);
      await ctx.T(0.45, (k) => place(lid, 270, 200 + k * 92, 0, 0.9));
      ctx.sfx.hit();
      q(ctx, 'fires').style.display = 'none';
      ctx.puff(270, 290, '#c8c8d0', 12, 40);
      lid.dataset.keep = '1';
      ctx.say('PUF!');
    },
    fails: {
      async flare(ctx) {
        ctx.sfx.splash(); await ctx.wait(0.2);
        ctx.boom(270, 280);
        const fires = [...q(ctx, 'fires').children];
        await ctx.T(0.4, (k) => fires.forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${1 + k * 2.4 + i * 0.2})`))));
        ctx.burn();
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- electrical fire (water = shock)
  electric: {
    trick: 'fire',
    correct: 'breaker',
    wrong: { water: 'zap', sponge: 'zap', fan: 'zap' },
    bg: () => sky('#cfc8e0', '#e8e2f2', 'el') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `M${20 + i * 40} 0 V430`).join(' ')}" stroke="#ddd6ea" stroke-width="10"/><rect y="404" width="400" height="26" fill="#f6efe0" ${S3}/>
      <g transform="translate(300 130) rotate(-3)"><rect x="-44" y="-34" width="88" height="68" fill="#c9893b" ${S4}/><rect x="-34" y="-24" width="68" height="48" fill="#ffe0a0"/><circle cx="12" cy="-6" r="9" fill="#ff8a2e"/><path d="M-34 24 l20 -24 l14 14 l10 -10 l24 20 Z" fill="#7a9a5a"/></g>
      <g transform="translate(40 430)"><path d="M0 0 v-150" stroke="${INK}" stroke-width="5"/><path d="M-16 0 h32" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-22 -150 l10 -40 h24 l10 40 Z" fill="#ffd34d" ${S3}/></g>
      <g transform="translate(380 430)"><path d="M-14 0 l-4 -30 h36 l-4 30 Z" fill="#c9653a" ${S3}/><path d="M0 -30 q-20 -30 -10 -60 M0 -30 q4 -40 20 -54 M0 -30 q-6 -20 -24 -26" fill="none" stroke="#2e7d4a" stroke-width="6" stroke-linecap="round"/></g>` + ground('#8a6a5a') + `
      <path d="M0 456 h400 M0 484 h400 M0 510 h400 M90 430 v26 M240 456 v28 M140 484 v26 M330 430 v26" stroke="#7a5a4a" stroke-width="3"/>
      <ellipse cx="200" cy="474" rx="140" ry="20" fill="#2f7cf6" opacity="0.8" ${S3}/><ellipse cx="200" cy="474" rx="110" ry="12" fill="none" stroke="#7fd3ff" stroke-width="3" stroke-dasharray="10 6"/>
      <g class="tvsmoke" fill="#5a5e78" opacity="0.5"><circle r="10"/><circle r="12"/></g>
      <rect x="250" y="250" width="120" height="90" rx="8" fill="#2b2140" stroke="${INK}" stroke-width="4"/><rect class="tvscreen" x="262" y="262" width="96" height="66" rx="4" fill="#5a5e78"/><path d="M270 270 l20 -10 M320 290 l-12 18 l10 4" fill="none" stroke="#9aa0b8" stroke-width="3"/><path d="M300 250 l-20 -24 M310 250 l18 -26" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><rect x="300" y="340" width="20" height="40" fill="#8a6a5a" stroke="${INK}" stroke-width="3"/><rect x="270" y="380" width="80" height="50" fill="#a07a5a" stroke="${INK}" stroke-width="4"/>
      <rect x="196" y="350" width="34" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="207" cy="366" r="3" fill="${INK}"/><circle cx="219" cy="366" r="3" fill="${INK}"/>
      <path d="M213 376 C220 410 260 400 262 330" fill="none" stroke="${INK}" stroke-width="6"/>
      <g class="sparks"></g><g class="fires">${flame(230, 360, 0.55)}${flame(250, 344, 0.45)}</g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const sp = q(ctx, 'sparks');
      sp.innerHTML = [0, 1, 2, 3].map((i) => { const a = t * 9 + i * 1.7; return `<path d="M213 368 l${Math.cos(a) * 20} ${Math.sin(a) * 20}" stroke="#ffd34d" stroke-width="4" stroke-linecap="round"/>`; }).join('');
      [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.45 + i * 0.1) * (1 + Math.min(0.8, t * 0.08)) * (1 + Math.sin(t * 8 + i) * 0.08)})`)));
      const ts = q(ctx, 'tvscreen'); if (ts) ts.setAttribute('fill', Math.sin(t * 23) > 0.6 ? '#9aa0c8' : '#5a5e78');
      const sm = q(ctx, 'tvsmoke'); if (sm) [...sm.children].forEach((c, i) => { const k = (t * 0.45 + i / 2) % 1; c.setAttribute('cx', (330 + Math.sin(k * 6 + i) * 10).toFixed(1)); c.setAttribute('cy', (250 - k * 110).toFixed(1)); c.setAttribute('r', (8 + k * 16).toFixed(1)); c.setAttribute('opacity', (0.6 * (1 - k)).toFixed(2)); });
    },
    async win(ctx) {
      const b = ctx.tool('breaker', 150, 300, 0.6);
      setArms(ctx.hero, 'hold');
      ctx.sfx.hit(); ctx.say('KLİK!');
      await ctx.wait(0.2);
      q(ctx, 'sparks').style.display = 'none';
      await ctx.T(0.5, (k) => { q(ctx, 'fires').style.opacity = 1 - k; });
      ctx.puff(240, 350, '#c8c8d0', 10, 30);
      b.remove();
    },
    fails: {
      async zap(ctx) {
        ctx.sfx.splash(); await ctx.wait(0.15);
        const bolt = el('path', { d: 'M213 368 L170 340 L180 320 L130 330', stroke: '#ffd34d', 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'round' });
        ctx.layer.appendChild(bolt); ctx.flash('#ffd34d'); ctx.sfx.buzz();
        await ctx.wait(0.3);
        bolt.remove();
        ctx.burn();
        ctx.hero.fx.insertAdjacentHTML('beforeend', `<path d="M-24 -150 l-8 -16 M0 -152 v-20 M24 -150 l8 -16" stroke="${INK}" stroke-width="4"/>`);
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- sleeping bear (honey wakes him up)
  sleepbear: {
    trick: 'bear',
    correct: 'slippers',
    wrong: { honey: 'wake', drum: 'wake', steak: 'wake' },
    bg: () => sky('#3a3e5a', '#5a5e78', 'sb') + ground('#4a4a58') + `
      <path d="M0 0 H400 V430 H360 C360 300 300 220 200 220 C100 220 40 300 40 430 H0 Z" fill="#2b2a38"/>
      <path d="M60 430 C60 320 110 250 200 250 C290 250 340 320 340 430 Z" fill="#232230"/>
      <path d="M40 430 C40 300 100 220 200 220 C300 220 360 300 360 430" fill="none" stroke="${INK}" stroke-width="6"/>
      <path d="M20 60 l20 30 l-10 20 M90 30 l-14 26 l12 14 M300 40 l16 24 l-8 18 M370 120 l-20 20 l10 22 M10 260 l18 14 l-6 20 M380 300 l-16 16 l8 16" fill="none" stroke="#3a3a4c" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 222 l8 26 l8 -24 Z M170 218 l6 34 l7 -33 Z M240 220 l7 22 l7 -20 Z M290 236 l6 18 l6 -15 Z" fill="#2b2a38" ${S3}/>
      <g class="crystals"><path d="M20 432 l8 -40 l10 40 Z M34 432 l10 -26 l8 26 Z" fill="#9b5ae0" ${S3}/><path d="M374 432 l8 -34 l10 34 Z" fill="#7fd3ff" ${S3}/></g>
      ${[[66, 436], [268, 438], [388, 434]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path d="M-2 0 v-12" stroke="#e6e0c8" stroke-width="4"/><path class="shroom${i}" d="M-10 -12 q10 -14 20 0 Z" fill="#9dff8a" ${S3}/></g>`).join('')}
      <g transform="translate(250 444)"><path d="M-16 0 l32 -6" stroke="#f6efe0" stroke-width="5" stroke-linecap="round"/><circle cx="-18" cy="-2" r="4" fill="#f6efe0"/><circle cx="18" cy="-8" r="4" fill="#f6efe0"/></g>
      <g class="sbear"><ellipse cx="0" cy="-34" rx="80" ry="38" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><path d="M-30 -66 q30 -10 60 -4 q20 6 34 20" fill="none" stroke="#a8744a" stroke-width="8" stroke-linecap="round"/><path d="M-20 -46 q4 4 8 0 M10 -40 q4 4 8 0 M40 -50 q4 4 8 0" fill="none" stroke="#6b4022" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="-40" cy="-6" rx="22" ry="10" fill="#8a5a32" ${S4}/><path d="M-60 -6 v-5 M-54 -2 v-6 M-48 0 v-6" stroke="#f6efe0" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="66" cy="-14" rx="16" ry="9" fill="#8a5a32" ${S4}/><ellipse cx="80" cy="-46" rx="10" ry="8" fill="#a8744a" ${S3}/>
        <circle cx="-70" cy="-46" r="30" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-84" cy="-72" r="10" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-84" cy="-72" r="4.5" fill="#e0b08a"/><circle cx="-50" cy="-70" r="10" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-50" cy="-70" r="4.5" fill="#e0b08a"/><circle cx="-70" cy="-46" r="26" fill="#8a5a32"/>
        <ellipse cx="-88" cy="-40" rx="14" ry="10" fill="#e0b08a" stroke="${INK}" stroke-width="3"/><circle cx="-96" cy="-44" r="4" fill="${INK}"/><circle cx="-97" cy="-45.5" r="1.3" fill="#fff"/><path d="M-90 -32 q6 3 10 -1" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="-62" cy="-40" r="5" fill="#ff8a8a" opacity="0.5"/><path class="eyes" d="M-80 -56 q6 4 12 0" fill="none" stroke="${INK}" stroke-width="3"/>
        <circle class="snot" cx="-104" cy="-40" r="4" fill="#bfeaff" stroke="${INK}" stroke-width="1.5" opacity="0.85"/></g>
      <g class="zzz" font-family="Baloo 2, sans-serif" font-weight="800" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke"><text font-size="26">Z</text><text font-size="20">z</text><text font-size="16">z</text></g>`,
    setup(ctx) { place(ctx.hero, 320, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); place(q(ctx, 'sbear'), 170, 430); },
    idle(ctx, t) {
      [...q(ctx, 'zzz').children].forEach((z, i) => { const k = (t * 0.6 + i * 0.33) % 1; z.setAttribute('x', 90 + k * 40 + i * 6); z.setAttribute('y', 360 - k * 70 - i * 10); z.setAttribute('opacity', 1 - k); });
      place(q(ctx, 'sbear'), 170, 430, 0, 1, 1 + Math.sin(t * 2) * 0.04);
      const sn = q(ctx, 'snot'); if (sn) sn.setAttribute('r', (3 + (Math.sin(t * 2) + 1) * 3.5).toFixed(1));
      [0, 1, 2].forEach((i) => { const m = q(ctx, 'shroom' + i); if (m) m.setAttribute('opacity', (0.65 + Math.sin(t * 2 + i * 2) * 0.35).toFixed(2)); });
    },
    async win(ctx) {
      const s = ctx.tool('slippers', 320, 440, 0.45);
      setArms(ctx.hero, 'down'); ctx.say('ŞŞŞ...');
      await ctx.T(1.2, (k) => { place(ctx.hero, 320 + k * 150, 430 - Math.abs(Math.sin(k * 12)) * 4); place(s, 320 + k * 150, 440, 0, 0.45); });
    },
    fails: {
      async wake(ctx) {
        await ctx.wait(0.2);
        q(ctx, 'zzz').style.display = 'none';
        q(ctx, 'eyes').setAttribute('d', 'M-84 -58 a5 5 0 1 0 0.1 0 M-70 -58 a5 5 0 1 0 0.1 0');
        ctx.sfx.roar(); ctx.shake(); ctx.say('GRRR!');
        await ctx.T(0.3, (k) => place(q(ctx, 'sbear'), 170 + k * 90, 430 - Math.sin(k * Math.PI) * 40));
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 320 + k * 60, 430 - Math.sin(k * Math.PI) * 60, k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- vampire wearing garlic (sunlight + mirror)
  vampsun: {
    trick: 'vampire',
    correct: 'mirror',
    wrong: { garlic: 'bite', ketchup: 'bite', teddy: 'bite' },
    bg: () => sky('#4a3a5a', '#6a5a7a', 'vs') + `
      <path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((r) => `M0 ${50 + r * 50} H400 ` + [0, 1, 2, 3, 4].map((c) => `M${c * 90 + (r % 2) * 45} ${r * 50} v50`).join(' ')).join(' ')}" stroke="#5a4a6a" stroke-width="3"/>
      <g transform="translate(290 150)"><rect x="-46" y="-56" width="92" height="112" fill="#c9a03a" ${S4}/><rect x="-34" y="-44" width="68" height="88" fill="#3a2a4a"/><circle cy="-10" r="16" fill="#d8d8e8"/><path d="M-16 -16 q16 -16 32 0 L0 -10 Z" fill="#1a1a24"/><path d="M-30 44 q30 -50 60 0 Z" fill="#1a1a24"/><path d="M-14 6 l-10 14 M14 6 l10 14" stroke="#9b1c2c" stroke-width="5"/><circle cx="-5" cy="-10" r="2" fill="#e8453c"/><circle cx="5" cy="-10" r="2" fill="#e8453c"/></g>
      <g transform="translate(220 430)"><path d="M-6 0 h12 l-2 -56 h-8 Z" fill="#c9a03a" ${S3}/><path d="M-22 -60 q22 14 44 0 M0 -56 v-12" fill="none" stroke="#c9a03a" stroke-width="5"/><path d="M-26 -60 h8 v-18 h-8 Z M18 -60 h8 v-18 h-8 Z M-4 -68 h8 v-18 h-8 Z" fill="#f6efe0" ${S3}/><g class="cflames" fill="#ffbe2e"><path d="M-22 -80 q-4 -8 0 -14 q4 6 0 14 Z"/><path d="M22 -80 q-4 -8 0 -14 q4 6 0 14 Z"/><path d="M0 -88 q-4 -8 0 -14 q4 6 0 14 Z"/></g></g>` + ground('#5a4a4a') + `
      <path d="M0 456 h400 M0 484 h400 M0 510 h400 M80 430 v26 M210 456 v28 M330 430 v26 M140 484 v26 M290 484 v26" stroke="#4a3a3a" stroke-width="3"/>
      <path d="M30 470 h340 l-20 30 h-300 Z" fill="#9b1c2c" ${S3}/><path d="M50 478 h300" stroke="#ffd34d" stroke-width="3" stroke-dasharray="10 6"/>
      <rect x="30" y="80" width="130" height="150" fill="#ffe680" stroke="${INK}" stroke-width="5"/><path d="M40 222 l30 -40 l20 20 l24 -34 l36 54 Z" fill="#9adf6a" opacity="0.7"/><circle cx="95" cy="150" r="34" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/><path d="M95 80 v150 M30 155 h130" stroke="${INK}" stroke-width="5"/>
      <path d="M30 80 q30 70 0 150 Z M160 80 q-30 70 0 150 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="4"/>
      <path class="beam" d="M60 230 L130 230 L200 430 L40 430 Z" fill="#ffe680" opacity="0.28"/>
      <g class="vamp">${VAMP}
        <path d="M-22 -100 q22 22 44 0" fill="none" stroke="#c9a06b" stroke-width="3"/>${[-16, -6, 6, 16].map((x, i) => `<ellipse cx="${x}" cy="${-92 + (i === 1 || i === 2 ? 6 : 0)}" rx="6" ry="7" fill="#fff6e8" stroke="${INK}" stroke-width="2"/>`).join('')}</g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    vx: (t) => 360 - Math.min(100, t * 10),
    idle(ctx, t) {
      place(q(ctx, 'vamp'), this.vx(t), 430 + Math.sin(t * 2) * -6);
      const cf = q(ctx, 'cflames'); if (cf) [...cf.children].forEach((f, i) => f.setAttribute('transform', `translate(${i === 2 ? 0 : i ? 22 : -22} ${i === 2 ? -88 : -80}) scale(${1 + Math.sin(t * 12 + i * 2) * 0.15} ${1 + Math.sin(t * 9 + i) * 0.2}) translate(${i === 2 ? 0 : i ? -22 : 22} ${i === 2 ? 88 : 80})`));
    },
    async win(ctx) {
      const x0 = this.vx(ctx.t());
      const m = ctx.tool('mirror', 160, 350, 0.55);
      setArms(ctx.hero, 'hold');
      const ray = el('path', { d: `M160 340 L${x0} 330`, stroke: '#ffe680', 'stroke-width': 18, opacity: 0.85, 'stroke-linecap': 'round' });
      ctx.layer.appendChild(ray); ctx.flash('#ffe680'); ctx.sfx.whoosh();
      ctx.say('IYY!');
      const v = q(ctx, 'vamp');
      await ctx.T(0.8, (k) => { place(v, x0, 430, 0, 1 - k * 0.6, 1 - k); v.style.opacity = 1 - k; });
      ctx.puff(x0, 400, '#8a8698', 16, 50);
      ray.remove(); m.remove();
    },
    fails: {
      async bite(ctx) {
        const v = q(ctx, 'vamp');
        const x0 = this.vx(ctx.t());
        await ctx.T(0.3, (k) => place(v, x0 - k * (x0 - 210), 430));
        ctx.say('HAM!'); ctx.sfx.chomp(); paintHero(ctx.hero, 'frozen'); ctx.faint();
        await ctx.T(0.4, (k) => place(ctx.hero, 130, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- thief with a bone (the dog switches sides)
  thiefbone: {
    trick: 'thief',
    correct: 'whistle',
    wrong: { dog: 'bonk', cat: 'bonk', candle: 'bonk' },
    bg: () => sky('#1a2348', '#3a4a7a', 'tb') + `
      <circle cx="80" cy="70" r="28" fill="#fff6d0"/><circle cx="72" cy="62" r="6" fill="#e8dcb0"/>
      <path d="M0 430 V320 h40 v-30 h30 v40 h40 v-60 h36 V430 Z M300 430 V300 h30 v-40 h36 v50 h34 V430 Z" fill="#26305a" opacity="0.85"/><g fill="#ffe680" opacity="0.6"><rect x="48" y="300" width="8" height="8"/><rect x="120" y="290" width="8" height="8"/><rect x="340" y="276" width="8" height="8"/><rect x="314" y="320" width="8" height="8"/></g>` + ground('#2e4a3a') + `
      <rect y="430" width="400" height="22" fill="#5a6278"/><path d="M0 430 h400 M0 452 h400" stroke="${INK}" stroke-width="3"/><path d="M40 430 v22 M120 430 v22 M200 430 v22 M280 430 v22 M360 430 v22" stroke="${INK}" stroke-width="2" opacity="0.5"/>
      <g transform="translate(40 430)"><path d="M-30 0 v-50 q30 -40 60 0 v50 Z" fill="#c9893b" ${S4}/><path d="M-12 0 v-30 q12 -18 24 0 v30 Z" fill="#1a1424"/><rect x="-14" y="-62" width="28" height="10" rx="3" fill="#f6efe0" ${S3}/><text y="-54" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="9" fill="${INK}">REX</text></g>
      <g transform="translate(350 432)"><path d="M-18 0 l-4 -50 h44 l-4 50 Z" fill="#6a7488" ${S3}/><path d="M-24 -52 h48 v-8 h-48 Z" fill="#8a96a8" ${S3}/><path d="M-10 -40 v32 M0 -40 v32 M10 -40 v32" stroke="#5a6278" stroke-width="3"/><path d="M-6 -60 q6 -8 12 0" fill="none" stroke="${INK}" stroke-width="3"/></g>
      <rect x="250" y="250" width="16" height="180" fill="#6a7488" stroke="${INK}" stroke-width="3"/><path d="M244 430 h28 v-14 h-28 Z" fill="#5a6278" ${S3}/><circle class="lamp" cx="258" cy="244" r="16" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><path d="M236 242 h44 l-8 -16 h-28 Z" fill="#3a3e50" ${S3}/><path class="lamplight" d="M258 260 L200 430 H316 Z" fill="#ffd34d" opacity="0.18"/>
      <g class="moth" fill="#f6efe0"><circle r="2.5"/></g>
      <g class="thief"><rect x="-22" y="-90" width="44" height="54" rx="16" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><path d="M-20 -78 h40 M-22 -64 h44 M-20 -50 h40" stroke="#e8453c" stroke-width="4" opacity="0.85"/><rect x="-22" y="-90" width="44" height="54" rx="16" fill="none" stroke="${INK}" stroke-width="4"/><rect x="-16" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><circle cy="-114" r="24" fill="#ffd2b0" stroke="${INK}" stroke-width="4"/><rect x="-26" y="-124" width="52" height="14" fill="${INK}"/><circle cx="-9" cy="-117" r="3" fill="#fff"/><circle cx="9" cy="-117" r="3" fill="#fff"/><path d="M-24 -124 q0 -26 24 -26 q24 0 24 26 Z" fill="#e8453c" ${S3}/><rect x="-25" y="-130" width="50" height="8" rx="3" fill="#b8302a" ${S3}/><path d="M24 -128 q12 -2 14 8" fill="none" stroke="#e8453c" stroke-width="5" stroke-linecap="round"/><path d="M-8 -100 q8 4 16 -2" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <g transform="translate(-40 -70) rotate(-20)"><rect x="-16" y="-4" width="32" height="8" rx="4" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="-16" cy="-4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="-16" cy="4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="16" cy="-4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="16" cy="4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/></g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    tx: (t) => 380 - Math.min(110, t * 10),
    idle(ctx, t) {
      place(q(ctx, 'thief'), this.tx(t), 430 + Math.abs(Math.sin(t * 6)) * -4);
      spin(ctx, 'moth', `translate(${(258 + Math.cos(t * 3.1) * 26).toFixed(1)} ${(252 + Math.sin(t * 4.3) * 14).toFixed(1)})`);
      const ll = q(ctx, 'lamplight'); if (ll) ll.setAttribute('opacity', Math.sin(t * 17) > 0.95 ? 0.06 : 0.18);
    },
    async win(ctx) {
      const w = ctx.tool('whistle', 150, 330, 0.45);
      ctx.sfx.buzz(); ctx.say('FIIIT!');
      const th = q(ctx, 'thief');
      const x0 = this.tx(ctx.t());
      await ctx.T(0.8, (k) => place(th, x0 + k * 200, 430 - Math.abs(Math.sin(k * 14)) * 14));
      w.remove();
    },
    fails: {
      async bonk(ctx) {
        const th = q(ctx, 'thief');
        const x0 = this.tx(ctx.t());
        const d = ctx.tool('dog', 170, 410, 0.7);
        await ctx.T(0.4, (k) => place(d, 170 + k * (x0 - 230), 410, 0, 0.7));
        ctx.heart(x0 - 50, 330);
        await ctx.T(0.3, (k) => place(th, x0 - k * (x0 - 200), 430));
        ctx.say('BONK!'); ctx.sfx.hit(); ctx.shake(); ctx.faint();
        await ctx.T(0.4, (k) => place(ctx.hero, 120, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- crying baby ghost (comfort, don't vacuum)
  ghostbaby: {
    trick: 'ghost',
    correct: 'teddy',
    wrong: { vacuum: 'wail', candle: 'wail', mirror: 'wail' },
    bg: () => sky('#2b2140', '#4b3a6b', 'gb') + `
      <g fill="#5a4a80" opacity="0.6">${[[40, 40], [130, 90], [200, 30], [70, 200], [170, 250], [370, 230], [330, 330], [30, 330]].map(([x, y]) => `<path d="M${x} ${y - 8} l2.5 5.5 l6 0.8 l-4.4 4 l1.2 6 l-5.3 -3 l-5.3 3 l1.2 -6 l-4.4 -4 l6 -0.8 Z"/>`).join('')}</g>` + ground('#5a4a3a') + `
      <path d="M0 456 h400 M0 484 h400 M0 510 h400 M80 430 v26 M210 456 v28 M330 430 v26 M140 484 v26 M290 484 v26" stroke="#4a3a2e" stroke-width="3"/>
      <rect x="250" y="70" width="90" height="110" fill="#1a1530" stroke="${INK}" stroke-width="4"/><path d="M250 125 h90 M295 70 v110" stroke="${INK}" stroke-width="4"/><circle cx="315" cy="100" r="14" fill="#fff6d0"/><path d="M240 64 h110" stroke="#c9893b" stroke-width="6" stroke-linecap="round"/><path d="M244 66 q10 60 -2 120 h16 q-8 -60 4 -120 Z M346 66 q-10 60 2 120 h-16 q8 -60 -4 -120 Z" fill="#7aa0e0" ${S3}/>
      <g transform="translate(330 430)"><path d="M-50 0 V-70 M50 0 V-70 M-50 -70 H50 M-50 -20 H50" stroke="#e8b878" stroke-width="7" stroke-linecap="round"/><path d="M-34 -66 v44 M-18 -66 v44 M-2 -66 v44 M14 -66 v44 M30 -66 v44" stroke="#e8b878" stroke-width="4"/><path d="M-44 -26 q44 -18 88 0" fill="#bfeaff" ${S3}/></g>
      <g class="mobile" transform="translate(150 0)"><path d="M0 0 v60 M-34 60 h68 M-34 60 v18 M34 60 v22 M0 60 v30" stroke="#c8c0e0" stroke-width="2.5"/><path d="M-34 86 l3 6 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 Z" fill="#ffd34d" ${S3}/><path d="M34 86 a8 8 0 1 0 6 12 a6 6 0 1 1 -6 -12 Z" fill="#fff6c0" ${S3}/><circle cy="96" r="7" fill="#ff8a9e" ${S3}/></g>
      <g ${S3}><rect x="40" y="406" width="24" height="24" rx="3" fill="#e8453c"/><rect x="66" y="410" width="20" height="20" rx="3" fill="#2f7cf6"/><rect x="50" y="384" width="22" height="22" rx="3" fill="#ffd34d"/></g><text x="52" y="424" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="14" fill="#fff">A</text><text x="61" y="401" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="13" fill="${INK}">B</text>
      <g class="bghost"><path d="M-26 0 C-26 -52 26 -52 26 0 L26 32 L17 24 L9 32 L0 24 L-9 32 L-17 24 L-26 32 Z" fill="#f6f8ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-14 -12 q5 -5 10 0 M4 -12 q5 -5 10 0" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-8 6 q8 -8 16 0" fill="none" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="-17" cy="0" rx="5" ry="3" fill="#ff9ac8" opacity="0.6"/><ellipse cx="17" cy="0" rx="5" ry="3" fill="#ff9ac8" opacity="0.6"/><g><path d="M2 -34 q6 -10 -2 -14" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>
        <g class="tears"><path d="M-12 -6 q-3 8 0 12 q3 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="1.5"/><path d="M12 -6 q-3 8 0 12 q3 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="1.5"/></g></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'bghost'), 270 + Math.sin(t * 1.6) * 20, 300 + Math.sin(t * 3) * 10, Math.sin(t * 8) * 4);
      q(ctx, 'tears').setAttribute('transform', `translate(0 ${(t * 30) % 14})`);
      spin(ctx, 'mobile', `translate(150 0) rotate(${Math.sin(t * 1.3) * 5})`);
    },
    async win(ctx) {
      const tb = ctx.tool('teddy', 160, 340, 0.5);
      const g0 = q(ctx, 'bghost');
      await ctx.T(0.5, (k) => place(tb, 160 + k * 110, 340 - Math.sin(k * Math.PI) * 60 - k * 20, 0, 0.5));
      q(ctx, 'tears').style.display = 'none';
      g0.querySelector('path:nth-of-type(3)').setAttribute('d', 'M-8 2 q8 8 16 0');
      ctx.heart(270, 260); ctx.heart(250, 280); ctx.say('...');
      await ctx.T(0.9, (k) => { place(g0, 270 + k * 60, 300 - k * 240, 0, 1 - k * 0.4); place(tb, 270 + k * 60, 320 - k * 240, 0, 0.5 - k * 0.2); });
    },
    fails: {
      async wail(ctx) {
        const g0 = q(ctx, 'bghost');
        ctx.say('UAAAA!'); ctx.sfx.roar(); ctx.shake();
        await ctx.T(0.4, (k) => place(g0, 270, 300, 0, 1 + k * 1.2));
        ctx.puff(300, 120, '#bfeaff', 10, 50);
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 130, 430, -k * 90));
      },
    },
  },
};

// background sound for each danger (sfx.amb kinds)
const AMB = {"lava": "bubble", "shark": "wave", "bees": "buzz", "fire": "crackle", "bear": "growl", "ghost": "wail", "cold": "wind", "flood": "wave", "bomb": "fuse", "thief": "steps", "dragon": "growl", "vampire": "wail", "desert": "wind", "meteor": "rumble", "dino": "stomp", "snake": "hiss", "alien": "ufo", "tornado": "wind", "carsink": "bubble", "airballoon": "wind", "boulder": "rumble", "spider": "hiss", "mice": "squeak", "zombie": "growl", "lion": "growl", "gorilla": "drum", "witch": "cackle", "robot": "beep", "bull": "snort", "avalanche": "rumble", "quicksand": "bubble", "tsunami": "wave", "skunk": "hiss", "lightning": "thunder", "piranha": "splash", "grease": "sizzle", "electric": "zap", "sleepbear": "snore", "vampsun": "wail", "thiefbone": "steps", "ghostbaby": "cry"};
Object.assign(HAZARDS, PACK_HAZARDS);
Object.assign(AMB, PACK_AMB);
for (const [id, kind] of Object.entries(AMB)) if (HAZARDS[id]) HAZARDS[id].amb = kind;

export const HAZARD_IDS = Object.keys(HAZARDS);
