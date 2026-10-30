// Every danger the hero can be in. Each one draws its scene, names the tool that saves him and
// gives every wrong tool its own (comic) ending. Scene coordinates: 400 x 520, ground near y 430.
// The ctx passed in comes from main.js: layer, hero, T (tween), wait, tool(), puff(), helpers.
import { el, g, place, setFace, setArms, paintHero } from './art.js';

const INK = '#2b2140';
const q = (ctx, cls) => ctx.layer.querySelector('.' + cls);

// little helpers used by many scenes
const sky = (top, bottom, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="520" fill="url(#${id})"/>`;
const ground = (color, y = 430) => `<rect y="${y}" width="400" height="${520 - y}" fill="${color}"/><rect y="${y}" width="400" height="8" fill="${INK}" opacity="0.15"/>`;
const flame = (x, y, s = 1, cls = '') => `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 C-26 -30 -24 0 0 4 C24 0 26 -30 0 -60 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="4"/><path d="M0 -30 C-10 -18 -10 -4 0 -2 C10 -4 10 -18 0 -30 Z" fill="#ffd34d"/></g>`;

export const HAZARDS = {
  // ---------------------------------------------------------------- 1. hanging over lava
  lava: {
    correct: 'water',
    wrong: { gasoline: 'flare', sword: 'cut', fan: 'flare' },
    bg: () => sky('#3a1e2e', '#7a2e1e', 'lv') + `
      <path d="M0 0 h400 v60 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 q-40 20 -80 0 Z" fill="#2b1a22"/>
      <rect class="rope" x="197" y="0" width="6" height="200" fill="#c9a06b" stroke="${INK}" stroke-width="2"/>
      <g class="lava"><path d="M0 420 q25 -14 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V520 H0 Z" fill="#ff6a1e" stroke="${INK}" stroke-width="4"/>
      <circle class="bub" cx="80" cy="450" r="8" fill="#ffd34d"/><circle class="bub" cx="300" cy="470" r="6" fill="#ffd34d"/></g>
      ${flame(200, 70, 0.45, 'ropefire')}`,
    setup(ctx) { place(ctx.hero, 200, 340); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const l = q(ctx, 'lava'); place(l, Math.sin(t * 2) * 6, -Math.min(30, t * 3));
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
      <circle cx="330" cy="70" r="34" fill="#ffd34d" stroke="${INK}" stroke-width="4"/>
      <rect y="300" width="400" height="220" fill="#2f8fd8"/>
      <path d="M0 300 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
      <g class="raft"><rect x="140" y="300" width="120" height="22" rx="6" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M160 300 v22 M180 300 v22 M200 300 v22 M220 300 v22 M240 300 v22" stroke="${INK}" stroke-width="2"/></g>
      <g class="shark"><path d="M0 0 L22 -46 L40 0 Z" fill="#6a7f9e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>`,
    setup(ctx) { place(ctx.hero, 200, 302); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const r = Math.max(90, 160 - t * 6);
      place(q(ctx, 'shark'), 180 + Math.cos(t * 1.4) * r, 330 + Math.sin(t * 1.4) * 30, 0, Math.sin(t * 1.4) > 0 ? -1 : 1, 1);
      place(q(ctx, 'raft'), 0, Math.sin(t * 2) * 3);
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
    bg: () => sky('#9fe3ff', '#e2f6ff', 'be') + ground('#7cc35a') + `
      <rect x="300" y="120" width="34" height="310" fill="#8a5a32" stroke="${INK}" stroke-width="4"/>
      <circle cx="320" cy="110" r="70" fill="#2eb872" stroke="${INK}" stroke-width="4"/>
      <g class="hive" transform="translate(280 190)"><ellipse rx="34" ry="40" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/><path d="M-30 -14 h60 M-34 4 h68 M-28 22 h56" stroke="${INK}" stroke-width="3"/><circle cy="10" r="7" fill="${INK}"/></g>
      <g class="swarm"></g>`,
    setup(ctx) {
      place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const sw = q(ctx, 'swarm');
      for (let i = 0; i < 9; i++) sw.insertAdjacentHTML('beforeend', `<g class="bee"><ellipse rx="9" ry="7" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><path d="M-2 -7 v14 M3 -7 v14" stroke="${INK}" stroke-width="2"/><ellipse cx="-2" cy="-9" rx="6" ry="4" fill="#fff" opacity="0.8" stroke="${INK}" stroke-width="1.5"/></g>`);
    },
    idle(ctx, t) {
      const near = Math.min(1, t / 9);
      [...q(ctx, 'swarm').children].forEach((b, i) => {
        const a = t * 3 + i * 0.7;
        place(b, 280 - near * 120 + Math.cos(a) * (40 + i * 3), 200 + near * 120 + Math.sin(a * 1.3) * 30);
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
    bg: () => sky('#ffb27a', '#ffe0c4', 'fi') + ground('#9adf6a') + `
      <g transform="translate(250 430)"><rect x="-90" y="-150" width="180" height="150" fill="#f3dcc0" stroke="${INK}" stroke-width="4"/><path d="M-110 -150 L0 -230 L110 -150 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><rect x="-60" y="-110" width="40" height="40" fill="#7fd3ff" stroke="${INK}" stroke-width="4"/><rect x="20" y="-70" width="40" height="70" fill="#8a5a32" stroke="${INK}" stroke-width="4"/></g>
      <g class="fires">${flame(200, 300, 0.9)}${flame(260, 250, 1.1)}${flame(320, 300, 0.8)}${flame(250, 200, 0.7)}</g>`,
    setup(ctx) { place(ctx.hero, 90, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.8 + i * 0.1) * (1 + Math.min(0.5, t * 0.05)) * (1 + Math.sin(t * 8 + i) * 0.06)})`))); },
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
    bg: () => sky('#bfe0ff', '#e6f4ff', 'br') + ground('#5aa84a') + `
      <path d="M0 430 L40 300 L80 430 Z M330 430 L370 280 L410 430 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/>
      <g class="bear"><ellipse cx="0" cy="-60" rx="56" ry="62" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-6" cy="-138" r="38" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-32" cy="-168" r="12" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="20" cy="-168" r="12" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><ellipse cx="-18" cy="-128" rx="16" ry="12" fill="#e0b08a" stroke="${INK}" stroke-width="3"/><circle cx="-22" cy="-132" r="5" fill="${INK}"/><circle cx="-24" cy="-148" r="4" fill="${INK}"/><circle cx="8" cy="-148" r="4" fill="${INK}"/><path class="bear-mouth" d="M-28 -118 q10 8 20 0" fill="none" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'bear'), 360 - Math.min(110, t * 12), 430 + Math.abs(Math.sin(t * 5)) * -4); },
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
    bg: () => sky('#2b2140', '#4b3a6b', 'gh') + ground('#5a4a3a') + `
      <rect x="40" y="60" width="90" height="120" fill="#1a1530" stroke="${INK}" stroke-width="4"/><path d="M40 120 h90 M85 60 v120" stroke="${INK}" stroke-width="4"/><circle cx="105" cy="90" r="16" fill="#fff6d0"/>
      <g class="ghost"><path d="M-40 0 C-40 -80 40 -80 40 0 L40 50 L26 38 L13 50 L0 38 L-13 50 L-26 38 L-40 50 Z" fill="#f6f8ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="-14" cy="-10" rx="7" ry="10" fill="${INK}"/><ellipse cx="14" cy="-10" rx="7" ry="10" fill="${INK}"/><ellipse cx="0" cy="16" rx="9" ry="12" fill="${INK}"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'ghost'), 320 - Math.min(110, t * 11) + Math.sin(t * 2) * 10, 260 + Math.sin(t * 3) * 14); },
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
    bg: () => sky('#9fb8d8', '#e6f0fa', 'co') + ground('#f6f9ff') + `
      <path d="M0 430 L80 320 L160 430 Z M220 430 L320 290 L420 430 Z" fill="#dfe8f5" stroke="${INK}" stroke-width="4"/>
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
      <rect x="250" y="80" width="90" height="70" fill="#7fd3ff" stroke="${INK}" stroke-width="4"/><path d="M295 80 v70 M250 115 h90" stroke="${INK}" stroke-width="4"/>
      <rect x="40" y="250" width="80" height="180" fill="#8a5a32" stroke="${INK}" stroke-width="4"/>
      <g class="water"><rect x="0" y="0" width="400" height="520" fill="#2f8fd8" opacity="0.75"/><path d="M0 0 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5"/></g>`,
    setup(ctx) { place(ctx.hero, 220, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'water'), Math.sin(t * 2) * 8, 440 - Math.min(150, t * 14)); },
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
    bg: () => sky('#cfd8e6', '#eef2f8', 'bo') + ground('#9aa6b8') + `
      <g class="bomb" transform="translate(270 400)"><circle r="44" fill="#2b2140" stroke="${INK}" stroke-width="4"/><circle cx="-14" cy="-14" r="10" fill="#fff" opacity="0.3"/><rect x="-10" y="-56" width="20" height="14" fill="#6a7f9e" stroke="${INK}" stroke-width="4"/><path class="fuse" d="M0 -56 q20 -30 46 -20" fill="none" stroke="#c9a06b" stroke-width="5"/><g class="spark">${flame(46, -74, 0.3)}</g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { const k = Math.min(1, t / 10); place(q(ctx, 'spark'), -k * 40, k * 16, 0, 1 + Math.sin(t * 20) * 0.15); q(ctx, 'bomb').setAttribute('transform', `translate(270 400) scale(${1 + Math.sin(t * 9) * 0.02 * (1 + t / 4)})`); },
    async win(ctx) { ctx.pour(260, 330); await ctx.wait(0.5); q(ctx, 'spark').style.display = 'none'; ctx.puff(262, 340, '#e8e8f0', 10, 40); },
    fails: { async boom(ctx) { await ctx.wait(0.25); q(ctx, 'bomb').style.display = 'none'; ctx.boom(270, 380); ctx.burn(); await ctx.T(0.6, (k) => place(ctx.hero, 120 - k * 70, 430 - Math.sin(k * Math.PI) * 140, -k * 200)); } },
  },

  // ---------------------------------------------------------------- 10. thief at night
  thief: {
    correct: 'dog',
    wrong: { cat: 'bonk', paper: 'bonk', candle: 'bonk' },
    bg: () => sky('#1a2348', '#3a4a7a', 'th') + ground('#2e4a3a') + `
      <circle cx="320" cy="70" r="30" fill="#fff6d0"/><circle cx="332" cy="62" r="28" fill="#1a2348"/>
      <g transform="translate(120 430)"><rect x="-90" y="-140" width="180" height="140" fill="#6a5a7a" stroke="${INK}" stroke-width="4"/><path d="M-110 -140 L0 -210 L110 -140 Z" fill="#3a2a4a" stroke="${INK}" stroke-width="4"/><rect x="-60" y="-100" width="40" height="40" fill="#ffd34d" stroke="${INK}" stroke-width="4"/></g>
      <g class="thief"><rect x="-22" y="-90" width="44" height="54" rx="16" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="-16" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><circle cy="-114" r="24" fill="#ffd2b0" stroke="${INK}" stroke-width="4"/><rect x="-26" y="-124" width="52" height="14" fill="${INK}"/><circle cx="-9" cy="-117" r="3" fill="#fff"/><circle cx="9" cy="-117" r="3" fill="#fff"/><path d="M14 -60 l40 -6 l-2 30 Z" fill="#e8e8e8" stroke="${INK}" stroke-width="3"/><text x="34" y="-40" font-size="16" font-weight="800" text-anchor="middle" fill="${INK}">$</text></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'thief'), 380 - Math.min(110, t * 10), 430 + Math.abs(Math.sin(t * 6)) * -4); },
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
    bg: () => sky('#ffb27a', '#ffd9c4', 'dr') + ground('#9c7a5b') + `
      <g class="dragon" transform="translate(320 260)"><path d="M-60 40 C-60 -20 20 -40 60 0 C90 30 70 120 0 130 C-50 130 -70 90 -60 40 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/><path d="M-50 10 C-90 -40 -110 -60 -70 -90 C-50 -100 -30 -80 -30 -60 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/><circle cx="-70" cy="-74" r="6" fill="${INK}"/><path d="M0 0 L40 -70 L70 -10 Z" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M-100 -70 l-10 -6" stroke="${INK}" stroke-width="4"/></g>
      <g class="breath" style="display:none"><path d="M220 196 C160 180 120 220 80 230 C120 250 160 270 220 230 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="4"/><path d="M200 206 C160 200 140 222 120 230 C150 240 170 246 200 226 Z" fill="#ffd34d"/></g>`,
    setup(ctx) { place(ctx.hero, 100, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { q(ctx, 'dragon').setAttribute('transform', `translate(${320 - Math.min(30, t * 3)} ${260 + Math.sin(t * 3) * 6})`); },
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
    bg: () => sky('#2a1a3a', '#5a3a6a', 'va') + ground('#3a4a3a') + `
      <circle cx="80" cy="80" r="34" fill="#fff6d0"/>
      <g fill="#8a8698" stroke="${INK}" stroke-width="4"><path d="M30 430 v-60 q0 -24 24 -24 q24 0 24 24 v60 Z"/><path d="M330 430 v-50 q0 -20 20 -20 q20 0 20 20 v50 Z"/></g>
      <g class="vamp"><path d="M-46 0 L-30 -100 L30 -100 L46 0 Z" fill="#1a1a24" stroke="${INK}" stroke-width="4"/><path d="M-46 -100 L-60 -140 L-20 -110 Z M46 -100 L60 -140 L20 -110 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="4"/><circle cy="-124" r="24" fill="#d8d8e8" stroke="${INK}" stroke-width="4"/><path d="M-24 -134 q24 -24 48 0 L0 -126 Z" fill="#1a1a24"/><circle cx="-9" cy="-124" r="4" fill="#e8453c"/><circle cx="9" cy="-124" r="4" fill="#e8453c"/><path d="M-6 -110 l3 6 l3 -6 M2 -110 l3 6 l3 -6" fill="#fff" stroke="${INK}" stroke-width="2"/></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'vamp'), 340 - Math.min(110, t * 11), 430 + Math.sin(t * 2) * -6); },
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
    bg: () => sky('#ffcf7a', '#ffeccb', 'de') + ground('#f0c77a') + `
      <g class="sun" transform="translate(320 80)"><circle r="44" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><circle cx="-14" cy="-6" r="5" fill="${INK}"/><circle cx="14" cy="-6" r="5" fill="${INK}"/><path class="sun-mouth" d="M-14 14 q14 -10 28 0" fill="none" stroke="${INK}" stroke-width="4"/></g>
      <path d="M60 430 v-70 M60 380 h-18 v-24 M60 396 h18 v-30" fill="none" stroke="#2eb872" stroke-width="14" stroke-linecap="round"/>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'down'); setFace(ctx.hero, 'hurt'); },
    idle(ctx, t) { place(ctx.hero, 200, 430, Math.sin(t * 2) * 6); q(ctx, 'sun').setAttribute('transform', `translate(320 80) scale(${1 + Math.min(0.4, t * 0.04)})`); },
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
    bg: () => sky('#1a1530', '#5a3a6a', 'me') + ground('#6a5a4a') + `
      <g class="stars"><circle cx="40" cy="40" r="2" fill="#fff"/><circle cx="120" cy="90" r="2" fill="#fff"/><circle cx="260" cy="30" r="2" fill="#fff"/><circle cx="360" cy="120" r="2" fill="#fff"/></g>
      <g class="meteor"><path d="M40 -40 L-60 -140 L-30 -150 L60 -60 Z" fill="#ffbe2e" opacity="0.7"/><circle r="46" fill="#8a6a5a" stroke="${INK}" stroke-width="4"/><circle cx="-14" cy="-8" r="10" fill="#6a4a3a"/><circle cx="16" cy="14" r="7" fill="#6a4a3a"/></g>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { const k = Math.min(1, t / 11); place(q(ctx, 'meteor'), 60 + k * 120, -40 + k * 260); },
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
      <rect x="0" y="430" width="250" height="90" fill="#9c7a5b"/><rect y="430" width="250" height="14" fill="#7cc35a"/><path d="M250 430 L250 520" stroke="${INK}" stroke-width="4"/>
      <path d="M260 520 L300 470 L340 520 Z M320 520 L370 460 L420 520 Z" fill="#2e7d4a"/>
      <g class="dino"><path d="M-70 0 L-50 -60 C-60 -110 -20 -140 20 -130 L60 -120 C80 -110 70 -90 50 -92 L20 -94 L10 -60 L40 -40 L30 0 L10 0 L10 -30 L-20 -30 L-30 0 Z" fill="#2eb872" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="24" cy="-118" r="5" fill="${INK}"/><path d="M30 -100 l6 6 l6 -6 l6 6" fill="none" stroke="#fff" stroke-width="3"/><path d="M-70 0 L-120 -20 L-60 -40 Z" fill="#2eb872" stroke="${INK}" stroke-width="4"/></g>`,
    setup(ctx) { place(ctx.hero, 210, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'dino'), -40 + Math.min(130, t * 13), 430 - Math.abs(Math.sin(t * 6)) * 6, 0, -1, 1); },
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
    bg: () => sky('#9fe3a0', '#e2f6d0', 'sn') + ground('#5aa84a') + `
      <path d="M0 430 C10 330 40 300 60 260 M30 330 q-30 -10 -40 -40 M50 290 q30 -20 50 -10" fill="none" stroke="#2e7d4a" stroke-width="14" stroke-linecap="round"/>
      <path d="M330 430 q20 -60 70 -80 v80 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/>
      <g class="snake"><path class="sbody" d="M70 0 C50 -20 30 20 10 0 C-10 -20 -30 20 -40 -10 C-46 -30 -44 -56 -40 -70" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path class="sbody2" d="M70 0 C50 -20 30 20 10 0 C-10 -20 -30 20 -40 -10 C-46 -30 -44 -56 -40 -70" fill="none" stroke="#7cc35a" stroke-width="15" stroke-linecap="round" stroke-dasharray="14 6"/>
        <g class="shead"><ellipse rx="22" ry="15" fill="#7cc35a" stroke="${INK}" stroke-width="4"/><g class="seyes"><circle cx="-8" cy="-5" r="4.5" fill="#fff6a0" stroke="${INK}" stroke-width="2"/><path d="M-8 -9 v8" stroke="${INK}" stroke-width="2"/></g><path class="stongue" d="M-21 5 l-14 2 m14 -2 l-13 -5" stroke="#e8453c" stroke-width="3" stroke-linecap="round"/></g></g>`,
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
    bg: () => sky('#141a3a', '#3a3a7a', 'al') + ground('#3a5a4a') + `
      <g fill="#fff"><circle cx="40" cy="160" r="2"/><circle cx="120" cy="220" r="2"/><circle cx="350" cy="190" r="2"/><circle cx="300" cy="260" r="2"/><circle cx="60" cy="300" r="2"/></g>
      <path class="beam" d="M160 120 L90 440 L310 440 L240 120 Z" fill="#9dff8a" opacity="0.35"/>
      <g class="ufo" transform="translate(200 100)"><path d="M-36 -8 C-36 -54 36 -54 36 -8 Z" fill="#bfeaff" stroke="${INK}" stroke-width="4"/><g class="alien"><ellipse cx="0" cy="-26" rx="14" ry="16" fill="#9adf6a" stroke="${INK}" stroke-width="3"/><ellipse cx="-6" cy="-28" rx="4" ry="6" fill="${INK}"/><ellipse cx="6" cy="-28" rx="4" ry="6" fill="${INK}"/></g><ellipse rx="96" ry="24" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><g fill="#ffd34d" stroke="${INK}" stroke-width="2"><circle cx="-60" cy="4" r="6"/><circle cx="-20" cy="10" r="6"/><circle cx="20" cy="10" r="6"/><circle cx="60" cy="4" r="6"/></g></g>`,
    setup(ctx) { place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const lift = Math.min(120, t * 11);
      place(ctx.hero, 200, 430 - lift, Math.sin(t * 2) * 8);
      q(ctx, 'ufo').setAttribute('transform', `translate(${200 + Math.sin(t * 1.5) * 6} ${100 + Math.sin(t * 3) * 5})`);
      q(ctx, 'beam').setAttribute('opacity', 0.3 + Math.sin(t * 10) * 0.06);
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
    bg: () => sky('#6a7488', '#b8c0cc', 'to') + ground('#8aa86a') + `
      <path d="M20 430 v-60 l30 -30 l30 30 v60 Z" fill="#c9893b" stroke="${INK}" stroke-width="4"/>
      <g class="twister">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<ellipse cy="${-20 - i * 52}" rx="${18 + i * 15}" ry="${10 + i * 3}" fill="${i % 2 ? '#9aa6b8' : '#b5bfcc'}" stroke="${INK}" stroke-width="4"/>`).join('')}
        <rect class="deb" x="-60" y="-200" width="16" height="10" fill="#8a5a32"/><rect class="deb" x="40" y="-300" width="12" height="12" fill="#e8453c"/><circle class="deb" cx="-30" cy="-120" r="7" fill="#2eb872"/></g>`,
    setup(ctx) { place(ctx.hero, 150, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const x = 400 - Math.min(110, t * 11);
      const tw = q(ctx, 'twister');
      place(tw, x, 430);
      [...tw.querySelectorAll('ellipse')].forEach((e, i) => e.setAttribute('cx', Math.sin(t * 6 + i * 0.8) * (4 + i * 2)));
      [...tw.querySelectorAll('.deb')].forEach((d, i) => d.setAttribute('transform', `rotate(${t * 300 + i * 120} 0 ${-150 - i * 50})`));
      place(ctx.hero, 150 + Math.min(10, t), 430, Math.min(14, t * 1.5) + Math.sin(t * 12) * 2);
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
      <rect y="150" width="400" height="370" fill="#2f8fd8"/><path d="M0 150 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>
      <path d="M0 520 q60 -30 120 -10 q80 -30 160 0 q60 -20 120 -10 V520 Z" fill="#c9a06b" opacity="0.6"/>
      <g class="bub" fill="#bfeaff" stroke="${INK}" stroke-width="2"><circle cx="120" cy="300" r="6"/><circle cx="300" cy="260" r="8"/><circle cx="260" cy="200" r="5"/></g>`,
    setup(ctx) {
      place(ctx.hero, 200, 440); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="car">
        <rect class="cabin" x="122" y="330" width="156" height="0" fill="#1d6bb8" opacity="0.85"/>
        <rect class="glass" x="122" y="250" width="156" height="80" fill="#bfeaff" opacity="0.35"/>
        <path d="M110 340 L130 240 H270 L290 340" fill="none" stroke="#e8453c" stroke-width="14" stroke-linejoin="round"/><path d="M110 340 L130 240 H270 L290 340" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="70" y="330" width="260" height="90" rx="22" fill="#e8453c" stroke="${INK}" stroke-width="4"/><rect x="290" y="350" width="34" height="18" rx="6" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
        <circle cx="120" cy="424" r="26" fill="${INK}"/><circle cx="280" cy="424" r="26" fill="${INK}"/><circle cx="120" cy="424" r="10" fill="#9aa6b8"/><circle cx="280" cy="424" r="10" fill="#9aa6b8"/></g>`);
    },
    idle(ctx, t) {
      const h = Math.min(80, t * 8);
      const c = q(ctx, 'cabin');
      c.setAttribute('y', 330 - h); c.setAttribute('height', h);
      [...q(ctx, 'bub').children].forEach((b, i) => b.setAttribute('cy', 330 - ((t * 40 + i * 70) % 180)));
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
      <path d="M0 520 L0 470 L40 440 L70 470 L110 430 L150 470 L190 440 L230 470 L270 430 L310 470 L350 440 L400 470 V520 Z" fill="#8a6a5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <g fill="#fff" stroke="${INK}" stroke-width="3"><ellipse cx="70" cy="90" rx="40" ry="16"/><ellipse cx="330" cy="150" rx="34" ry="14"/></g>
      <g class="env"><path d="M-80 0 C-80 -110 80 -110 80 0 C80 50 30 80 20 100 h-40 C-30 80 -80 50 -80 0 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M-30 -86 C-40 -40 -30 40 -12 100 h24 C30 40 40 -40 30 -86 C10 -94 -10 -94 -30 -86 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/></g>`,
    setup(ctx) {
      setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="front"><path d="M-34 -60 L-20 -200 M34 -60 L20 -200" stroke="${INK}" stroke-width="3"/>
        <rect x="-38" y="-62" width="76" height="66" rx="8" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M-38 -40 h76 M-38 -18 h76" stroke="${INK}" stroke-width="2"/>
        <g class="bags"><path d="M-38 -56 l-14 14 M38 -56 l14 14" stroke="${INK}" stroke-width="3"/><g fill="#b58a5a" stroke="${INK}" stroke-width="3"><path d="M-62 -44 h20 l4 28 h-28 Z"/><path d="M42 -44 h20 l4 28 h-28 Z"/></g></g></g>`);
      this.pos(ctx, 300);
    },
    pos(ctx, y, rot = 0) { place(ctx.hero, 200, y - 4, rot); place(q(ctx, 'front'), 200, y, rot); place(q(ctx, 'env'), 200, y - 300, rot); ctx.by = y; },
    idle(ctx, t) { this.pos(ctx, 300 + Math.min(120, t * 12) + Math.sin(t * 2) * 3, Math.sin(t * 1.6) * 3); },
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
      <path d="M0 200 L260 430 H400 V520 H0 Z" fill="#c9a06b" stroke="${INK}" stroke-width="4"/><rect y="430" width="400" height="90" fill="#c9a06b"/>
      <path d="M40 300 l10 -16 l10 16 M120 380 l8 -12 l8 12" fill="none" stroke="#8a6a3a" stroke-width="4"/>
      <g class="rock"><circle r="58" fill="#9aa6b8" stroke="${INK}" stroke-width="5"/><path d="M-30 -20 l20 10 l-6 20 M10 -40 l16 18 M20 20 l14 10" fill="none" stroke="${INK}" stroke-width="4"/></g>`,
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
    bg: () => sky('#4a3a3a', '#7a6a5a', 'sp') + ground('#6a5040') + `
      <path d="M0 40 H400 M0 100 H400" stroke="#8a5a32" stroke-width="18"/><path d="M0 40 H400 M0 100 H400" stroke="${INK}" stroke-width="2" opacity="0.4"/>
      <path d="M330 100 L400 40 M330 100 L360 160 M330 100 L400 130 M346 86 q10 14 24 8 M352 120 q16 -4 22 10" fill="none" stroke="#e6e6f0" stroke-width="2"/>
      <g class="spider"><path d="M0 -900 V-20" stroke="#e6e6f0" stroke-width="2"/>
        <g fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round">${[-1, 1].map((s) => [0, 1, 2, 3].map((i) => `<path d="M${s * 20} ${-4 + i * 8} q${s * 30} ${-30 + i * 12} ${s * 52} ${-6 + i * 22}"/>`).join('')).join('')}</g>
        <ellipse cy="0" rx="30" ry="34" fill="#2b2140"/><circle cy="36" r="18" fill="#2b2140"/><circle cx="-7" cy="38" r="5" fill="#e8453c"/><circle cx="7" cy="38" r="5" fill="#e8453c"/><circle cx="-3" cy="30" r="3" fill="#e8453c"/><circle cx="3" cy="30" r="3" fill="#e8453c"/></g>`,
    setup(ctx) { place(ctx.hero, 150, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { place(q(ctx, 'spider'), 250 + Math.sin(t * 1.5) * 8, 60 + Math.min(170, t * 16), Math.sin(t * 2) * 6); },
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
      <rect x="250" y="120" width="130" height="90" fill="#7fd3ff" stroke="${INK}" stroke-width="4"/><path d="M315 120 v90" stroke="${INK}" stroke-width="4"/>
      <g fill="#8a5a32" stroke="${INK}" stroke-width="4"><rect x="138" y="352" width="124" height="14" rx="4"/><rect x="146" y="366" width="12" height="64"/><rect x="242" y="366" width="12" height="64"/><rect x="242" y="250" width="12" height="102"/><rect x="234" y="250" width="28" height="20" rx="4"/></g>
      <g class="mice"></g>`,
    mouse: `<g><ellipse rx="18" ry="11" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="-12" cy="-10" r="7" fill="#ffb0c0" stroke="${INK}" stroke-width="3"/><circle cx="-17" cy="-1" r="2.5" fill="${INK}"/><circle cx="-26" cy="2" r="3" fill="#ff6f9e"/><path d="M18 0 q16 -2 18 -14" fill="none" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) {
      place(ctx.hero, 196, 354); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const m = q(ctx, 'mice');
      for (let i = 0; i < 6; i++) m.insertAdjacentHTML('beforeend', this.mouse);
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
    bg: () => sky('#3a4a3a', '#8a9a6a', 'zo') + ground('#4a5a3a') + `
      <circle cx="320" cy="80" r="30" fill="#e6f0c0"/>
      <g fill="#7a7a88" stroke="${INK}" stroke-width="4"><path d="M30 430 v-50 q0 -20 20 -20 q20 0 20 20 v50 Z"/></g>
      <g class="zom"><rect x="-22" y="-90" width="44" height="54" rx="14" fill="#6a8a5a" stroke="${INK}" stroke-width="4"/><path d="M-22 -50 l8 8 l8 -8 l8 8 l8 -8 l8 8 l4 -4" fill="none" stroke="${INK}" stroke-width="3"/>
        <rect x="-16" y="-44" width="12" height="44" rx="5" fill="#4a4a6a" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#4a4a6a" stroke="${INK}" stroke-width="4"/>
        <rect x="-70" y="-86" width="52" height="13" rx="6" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><rect x="-66" y="-68" width="48" height="13" rx="6" fill="#9adf6a" stroke="${INK}" stroke-width="4"/>
        <circle cy="-114" r="24" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><circle cx="-9" cy="-118" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-10" cy="-118" r="2" fill="${INK}"/><circle cx="8" cy="-116" r="3" fill="${INK}"/><path d="M-12 -100 h18" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    zx: (t) => 380 - Math.min(120, t * 10),
    idle(ctx, t) { place(q(ctx, 'zom'), this.zx(t), 430, Math.sin(t * 4) * 4); },
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
    bg: () => sky('#ffb04a', '#ffe0a0', 'li') + ground('#d8b45a') + `
      <circle cx="90" cy="120" r="50" fill="#ffd34d" opacity="0.8"/>
      <path d="M320 430 V300" stroke="#6b3f22" stroke-width="14"/><ellipse cx="320" cy="290" rx="80" ry="22" fill="#5aa84a" stroke="${INK}" stroke-width="4"/>
      <g class="lion"><path d="M60 -60 q40 -10 40 -50" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="100" cy="-112" r="8" fill="#8a4a1a"/>
        <ellipse cx="20" cy="-56" rx="62" ry="34" fill="#e8b060" stroke="${INK}" stroke-width="4"/>
        <g fill="#e8b060" stroke="${INK}" stroke-width="4"><rect x="-26" y="-36" width="16" height="36" rx="6"/><rect x="40" y="-36" width="16" height="36" rx="6"/></g>
        <path d="M-40 -150 l12 14 l14 -18 l6 20 l18 -8 l-4 20 l18 4 l-12 14 l12 14 l-18 4 l4 20 l-18 -8 l-6 20 l-14 -18 l-12 14 l-6 -18 l-18 6 l4 -20 l-16 -8 l14 -12 l-12 -16 l20 0 l-2 -20 l16 10 Z" fill="#a8551e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="-34" cy="-98" r="28" fill="#e8b060" stroke="${INK}" stroke-width="4"/><circle cx="-44" cy="-104" r="4" fill="${INK}"/><circle cx="-24" cy="-104" r="4" fill="${INK}"/><path d="M-40 -92 h12 l-6 6 Z" fill="${INK}"/><path class="lmouth" d="M-44 -82 q10 6 20 0" fill="none" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    lx: (t) => 400 - Math.min(130, t * 13),
    idle(ctx, t) { place(q(ctx, 'lion'), this.lx(t), 430 - Math.abs(Math.sin(t * 5)) * 4); },
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
    bg: () => sky('#8fd9a0', '#d8f4d0', 'go') + ground('#4a8a3a') + `
      <path d="M40 0 q-10 120 10 220 M90 0 q14 90 -6 160 M330 0 q-12 100 8 180" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/>
      <circle cx="60" cy="230" r="10" fill="#2eb872"/><circle cx="84" cy="160" r="10" fill="#2eb872"/><circle cx="338" cy="180" r="10" fill="#2eb872"/>
      <g class="gor"><g class="g-arm-l"><rect x="-80" y="-120" width="26" height="100" rx="13" fill="#4a4a58" stroke="${INK}" stroke-width="4"/></g><g class="g-arm-r"><rect x="40" y="-120" width="26" height="100" rx="13" fill="#4a4a58" stroke="${INK}" stroke-width="4"/></g>
        <ellipse cx="-6" cy="-70" rx="56" ry="62" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><ellipse cx="-10" cy="-66" rx="32" ry="36" fill="#7a6a6a"/>
        <rect x="-44" y="-24" width="28" height="26" rx="10" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><rect x="6" y="-24" width="28" height="26" rx="10" fill="#4a4a58" stroke="${INK}" stroke-width="4"/>
        <circle cx="-14" cy="-142" r="32" fill="#4a4a58" stroke="${INK}" stroke-width="4"/><ellipse cx="-22" cy="-134" rx="22" ry="18" fill="#9a8a7a" stroke="${INK}" stroke-width="3"/>
        <circle cx="-30" cy="-150" r="4" fill="${INK}"/><circle cx="-12" cy="-150" r="4" fill="${INK}"/><path class="g-mouth" d="M-34 -126 q12 -6 24 0" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-38 -156 l12 4 M-4 -156 l-12 4" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    gx: (t) => 390 - Math.min(110, t * 11),
    idle(ctx, t) {
      place(q(ctx, 'gor'), this.gx(t), 430);
      const k = Math.sin(t * 12) * 10;
      q(ctx, 'g-arm-l').setAttribute('transform', `rotate(${-40 + k} -67 -110)`);
      q(ctx, 'g-arm-r').setAttribute('transform', `rotate(${40 - k} 53 -110)`);
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
    bg: () => sky('#2a1a4a', '#6a4a8a', 'wi') + ground('#3a3a4a') + `
      <circle cx="80" cy="90" r="40" fill="#fff6d0"/>
      <path d="M260 430 V340 L300 300 L340 340 V430 Z" fill="#4a3a5a" stroke="${INK}" stroke-width="4"/><rect x="288" y="350" width="24" height="24" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
      <g class="witch"><path d="M-60 10 L50 -6" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/><path d="M40 -12 l30 -10 l-4 18 l6 14 Z" fill="#c9a06b" stroke="${INK}" stroke-width="3"/>
        <path d="M-20 0 L0 -50 L20 0 Z" fill="#4a2a6a" stroke="${INK}" stroke-width="4"/><circle cy="-60" r="16" fill="#9adf6a" stroke="${INK}" stroke-width="4"/><path d="M-12 -62 q-16 6 -10 10" fill="#9adf6a" stroke="${INK}" stroke-width="3"/>
        <path d="M-26 -70 h52 L4 -116 Z" fill="#2b2140" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="-6" cy="-62" r="2.5" fill="${INK}"/><path d="M-8 -50 q6 3 12 0" stroke="${INK}" stroke-width="2" fill="none"/></g>
      <g class="sparks"></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    wpos: (t) => [220 + Math.cos(t * 1.4) * 110, 170 + Math.sin(t * 2.8) * 30, Math.sin(t * 1.4) > 0 ? 1 : -1],
    idle(ctx, t) {
      const [x, y, d] = this.wpos(t);
      place(q(ctx, 'witch'), x, y, 0, -d, 1);
      const sp = q(ctx, 'sparks');
      if (sp.childElementCount < 6 && Math.random() < 0.15) sp.insertAdjacentHTML('beforeend', `<circle r="4" fill="#d9a0ff" cx="${x + 40 * d}" cy="${y}"/>`);
      [...sp.children].forEach((c) => { c.setAttribute('cy', Number(c.getAttribute('cy')) + 1.5); if (Number(c.getAttribute('cy')) > 430) c.remove(); });
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
    bg: () => sky('#9aa6b8', '#dfe6ef', 'rb') + ground('#6a7488') + `
      <rect x="20" y="200" width="90" height="230" fill="#b5bfcc" stroke="${INK}" stroke-width="4"/><circle cx="65" cy="250" r="20" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><path d="M50 300 h30 M50 320 h30 M50 340 h30" stroke="${INK}" stroke-width="4"/>
      <g class="robot"><g class="r-body"><rect x="-14" y="-40" width="12" height="40" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/><rect x="8" y="-40" width="12" height="40" fill="#9aa6b8" stroke="${INK}" stroke-width="4"/>
        <rect x="-40" y="-130" width="84" height="92" rx="10" fill="#c8d2e0" stroke="${INK}" stroke-width="4"/><circle cx="2" cy="-86" r="14" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
        <path d="M-40 -110 L-80 -100 L-86 -80 M-90 -84 l8 -10 M-90 -76 l10 4" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <rect x="-26" y="-176" width="56" height="42" rx="8" fill="#c8d2e0" stroke="${INK}" stroke-width="4"/><path d="M2 -176 v-14" stroke="${INK}" stroke-width="4"/><circle cx="2" cy="-194" r="6" fill="#e8453c" stroke="${INK}" stroke-width="3"/>
        <g class="r-eyes"><rect x="-18" y="-164" width="14" height="10" rx="3" fill="#e8453c"/><rect x="6" y="-164" width="14" height="10" rx="3" fill="#e8453c"/></g><path d="M-14 -144 h30" stroke="${INK}" stroke-width="3"/></g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    rx: (t) => 380 - Math.min(110, t * 11),
    idle(ctx, t) { place(q(ctx, 'robot'), this.rx(t), 430, Math.sin(t * 8) * 2); q(ctx, 'r-eyes').style.opacity = Math.sin(t * 6) > -0.8 ? 1 : 0.2; },
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
    bg: () => sky('#ffcf9a', '#fff0d8', 'bu') + ground('#e8c07a') + `
      <path d="M0 330 h400 v30 h-400 Z" fill="#e8453c" stroke="${INK}" stroke-width="4"/><path d="M0 300 h400" stroke="${INK}" stroke-width="3"/>
      <g fill="#ffbe2e" stroke="${INK}" stroke-width="3">${[30, 90, 150, 210, 270, 330, 390].map((x) => `<circle cx="${x}" cy="300" r="14"/>`).join('')}</g>
      <g class="bull"><ellipse cx="20" cy="-60" rx="60" ry="38" fill="#6b3f22" stroke="${INK}" stroke-width="4"/>
        <g fill="#6b3f22" stroke="${INK}" stroke-width="4"><rect x="-26" y="-36" width="14" height="36" rx="5"/><rect x="50" y="-36" width="14" height="36" rx="5"/></g>
        <path d="M78 -76 q20 -10 18 20" fill="none" stroke="${INK}" stroke-width="5"/>
        <ellipse cx="-44" cy="-74" rx="30" ry="26" fill="#6b3f22" stroke="${INK}" stroke-width="4"/><path d="M-60 -96 q-16 -20 -4 -30 M-30 -98 q8 -22 -6 -30" fill="none" stroke="#f6efe0" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="-62" cy="-62" rx="14" ry="10" fill="#e0a088" stroke="${INK}" stroke-width="3"/><circle cx="-62" cy="-52" r="6" fill="none" stroke="#c9a06b" stroke-width="3"/><circle cx="-46" cy="-82" r="4" fill="${INK}"/><path d="M-54 -90 l12 4" stroke="${INK}" stroke-width="3"/></g>`,
    setup(ctx) { place(ctx.hero, 140, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    bx: (t) => 360 - Math.min(40, t * 4),
    idle(ctx, t) {
      place(q(ctx, 'bull'), this.bx(t), 430 + Math.abs(Math.sin(t * 7)) * -3);
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
      <path d="M0 120 L120 40 L260 220 L400 330 V520 H0 Z" fill="#f6f9ff" stroke="${INK}" stroke-width="4"/>
      <path d="M0 430 L400 430" stroke="${INK}" stroke-width="0"/><rect y="430" width="400" height="90" fill="#eef4fb"/>
      <path d="M60 300 l14 -30 l14 30 Z M300 400 l14 -30 l14 30 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="3"/>
      <g class="snowwave"><path d="M-160 0 C-150 -80 -80 -110 -20 -80 C10 -110 60 -90 60 -40 C90 -40 90 0 60 10 Z" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="-60" cy="-60" r="16" fill="#eef4fb"/><circle cx="10" cy="-50" r="12" fill="#eef4fb"/></g>`,
    setup(ctx) { place(ctx.hero, 250, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    wp: (t) => Math.min(1, t / 12) * 0.55,
    wave(ctx, k) { place(q(ctx, 'snowwave'), -40 + k * 300, 200 + k * 230, 0, 1 + k * 0.8); },
    idle(ctx, t) { this.wave(ctx, this.wp(t)); ctx.hero.setAttribute('transform', `translate(250 430) rotate(${Math.sin(t * 20) * 1.5})`); },
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
    bg: () => sky('#ffd9a0', '#fff2d8', 'qs') + ground('#e8c07a') + `
      <path d="M330 430 V200" stroke="#6b3f22" stroke-width="16"/><path d="M330 220 Q300 200 240 196" stroke="#6b3f22" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="350" cy="190" rx="50" ry="26" fill="#5aa84a" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="180" cy="436" rx="90" ry="16" fill="#b58a4a" stroke="${INK}" stroke-width="4"/>`,
    setup(ctx) {
      place(ctx.hero, 180, 440); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="sandfront"><rect x="0" y="440" width="400" height="80" fill="#e8c07a"/><path d="M90 440 q90 18 180 0" fill="#b58a4a" stroke="${INK}" stroke-width="4"/></g>`);
    },
    sy: (t) => 440 + Math.min(80, t * 8),
    idle(ctx, t) { place(ctx.hero, 180 + Math.sin(t * 3) * 2, this.sy(t)); },
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
    bg: () => sky('#8fd3ff', '#e0f4ff', 'ts') + `<rect y="380" width="400" height="140" fill="#f0d090"/><rect y="380" width="400" height="6" fill="${INK}" opacity="0.12"/>
      <path d="M300 380 v-80 M300 300 q-30 -10 -50 10 M300 300 q30 -16 50 4 M300 300 q-10 -30 -30 -34 M300 300 q14 -30 34 -30" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/><path d="M300 380 v-80" stroke="#8a5a32" stroke-width="10"/>
      <g class="tsu"><path d="M-400 140 V-60 C-300 -140 -120 -150 -40 -60 C0 -20 -10 30 -50 30 C-40 0 -70 -20 -90 0 C-60 40 -10 80 40 140 Z" fill="#2f8fd8" stroke="${INK}" stroke-width="4"/><path d="M-200 -110 C-140 -130 -80 -110 -50 -70" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></g>`,
    setup(ctx) { place(ctx.hero, 230, 400); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    tp: (t) => Math.min(1, t / 11),
    wave(ctx, k) { place(q(ctx, 'tsu'), -60 + k * 200, 380, 0, 0.6 + k * 0.6); },
    idle(ctx, t) { this.wave(ctx, this.tp(t) * 0.7); },
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
    bg: () => sky('#bfe8c0', '#ecf8e8', 'sk2') + ground('#6ab04a') + `
      <path d="M40 430 L80 300 L120 430 Z M330 430 L360 320 L390 430 Z" fill="#2e7d4a" stroke="${INK}" stroke-width="4"/>
      <g class="skunk"><path class="tail" d="M30 -20 C70 -40 70 -110 30 -120 C10 -110 20 -70 10 -40 Z" fill="#2b2140" stroke="${INK}" stroke-width="3"/><path d="M28 -30 C50 -60 50 -100 32 -110" fill="none" stroke="#fff" stroke-width="7"/>
        <ellipse cx="0" cy="-24" rx="36" ry="22" fill="#2b2140"/><path d="M-30 -36 C-10 -46 20 -46 34 -34" stroke="#fff" stroke-width="8" fill="none"/>
        <circle cx="-36" cy="-34" r="16" fill="#2b2140"/><circle cx="-42" cy="-38" r="3" fill="#fff"/><circle cx="-52" cy="-30" r="3" fill="#ff9ac8"/><path d="M-30 -48 l-4 -8 l8 4 Z" fill="#2b2140"/></g>
      <g class="stinkc" opacity="0"><circle cx="0" cy="0" r="40" fill="#b8d860" opacity="0.6"/><circle cx="40" cy="-20" r="30" fill="#b8d860" opacity="0.6"/><circle cx="-30" cy="-30" r="30" fill="#b8d860" opacity="0.6"/></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const turn = t > 3;
      place(q(ctx, 'skunk'), 300 - Math.min(40, t * 4), 430, 0, turn ? -1 : 1, 1);
      q(ctx, 'tail').setAttribute('transform', `rotate(${Math.sin(t * 6) * 8} 30 -20)`);
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
    bg: () => sky('#3a3e5a', '#6a6e8a', 'lt') + ground('#4a6a4a') + `
      <g class="rain" stroke="#9fc8f0" stroke-width="3" opacity="0.6"></g>
      <g class="clouds" fill="#5a5e78" stroke="${INK}" stroke-width="4"><ellipse cx="100" cy="70" rx="90" ry="40"/><ellipse cx="220" cy="60" rx="100" ry="46"/><ellipse cx="330" cy="80" rx="80" ry="36"/></g>
      <path class="bolt" d="M220 100 L190 220 L230 220 L200 340" fill="none" stroke="#ffd34d" stroke-width="10" stroke-linejoin="round" opacity="0"/>`,
    setup(ctx) {
      place(ctx.hero, 200, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      const r = q(ctx, 'rain');
      for (let i = 0; i < 30; i++) r.insertAdjacentHTML('beforeend', '<path d="M0 0 l-6 18"/>');
    },
    idle(ctx, t) {
      [...q(ctx, 'rain').children].forEach((d, i) => d.setAttribute('transform', `translate(${(i * 47) % 420} ${(i * 31 + t * 400) % 440})`));
      q(ctx, 'bolt').setAttribute('opacity', Math.sin(t * 7) > 0.97 ? 0.8 : 0);
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
      <path d="M300 330 h100 v190 h-100 Z" fill="#7a5a3a" stroke="${INK}" stroke-width="4"/><rect x="300" y="322" width="100" height="14" fill="#5aa84a" stroke="${INK}" stroke-width="3"/>
      <path d="M340 322 V240 M340 250 q-20 -30 -40 -20 M340 250 q20 -30 40 -20" fill="none" stroke="#2e7d4a" stroke-width="8" stroke-linecap="round"/>`,
    fish: `<g><path d="M-16 0 C-10 -14 10 -14 16 0 C10 14 -10 14 -16 0 Z M16 0 l10 -8 v16 Z" fill="#e8453c" stroke="${INK}" stroke-width="3"/><circle cx="-8" cy="-3" r="2.5" fill="${INK}"/><path d="M-16 2 l4 -2 l2 3 l3 -3" fill="#fff" stroke="${INK}" stroke-width="1"/></g>`,
    setup(ctx) {
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="log"><rect x="-56" y="0" width="112" height="22" rx="11" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-50" cy="11" r="7" fill="#c9a06b" stroke="${INK}" stroke-width="2"/></g>`);
      place(ctx.hero, 170, 352); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.appendChild(ctx.hero);
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="riv"><rect x="0" y="370" width="300" height="150" fill="#2f8fd8" opacity="0.92"/><path d="M0 370 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="4" opacity="0.7"/></g><g class="fishes"></g>`);
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
      <rect x="200" y="330" width="190" height="100" fill="#dfe6ef" stroke="${INK}" stroke-width="4"/><circle cx="240" cy="380" r="10" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/><circle cx="350" cy="380" r="10" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/>
      <rect x="320" y="200" width="44" height="64" rx="8" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><rect x="332" y="186" width="20" height="16" rx="3" fill="#e8b030" stroke="${INK}" stroke-width="3"/><text x="342" y="240" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="13" fill="${INK}">OIL</text>
      <g class="pan"><path d="M220 330 h100 l-8 -24 h-84 Z" fill="#2b2140" stroke="${INK}" stroke-width="4"/><path d="M220 318 h-50" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><ellipse cx="270" cy="308" rx="44" ry="6" fill="#ffbe2e"/></g>
      <g class="fires">${flame(250, 304, 0.7)}${flame(285, 300, 0.9)}${flame(268, 296, 0.6)}</g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) { [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.6 + i * 0.12) * (1 + Math.min(0.6, t * 0.06)) * (1 + Math.sin(t * 9 + i) * 0.08)})`))); },
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
    bg: () => sky('#cfc8e0', '#e8e2f2', 'el') + ground('#8a6a5a') + `
      <rect x="250" y="250" width="120" height="90" rx="8" fill="#2b2140" stroke="${INK}" stroke-width="4"/><rect x="262" y="262" width="96" height="66" rx="4" fill="#5a5e78"/><rect x="300" y="340" width="20" height="40" fill="#8a6a5a" stroke="${INK}" stroke-width="3"/><rect x="270" y="380" width="80" height="50" fill="#a07a5a" stroke="${INK}" stroke-width="4"/>
      <rect x="196" y="350" width="34" height="44" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="207" cy="366" r="3" fill="${INK}"/><circle cx="219" cy="366" r="3" fill="${INK}"/>
      <path d="M213 376 C220 410 260 400 262 330" fill="none" stroke="${INK}" stroke-width="6"/>
      <g class="sparks"></g><g class="fires">${flame(230, 360, 0.55)}${flame(250, 344, 0.45)}</g>`,
    setup(ctx) { place(ctx.hero, 110, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      const sp = q(ctx, 'sparks');
      sp.innerHTML = [0, 1, 2, 3].map((i) => { const a = t * 9 + i * 1.7; return `<path d="M213 368 l${Math.cos(a) * 20} ${Math.sin(a) * 20}" stroke="#ffd34d" stroke-width="4" stroke-linecap="round"/>`; }).join('');
      [...q(ctx, 'fires').children].forEach((f, i) => f.setAttribute('transform', f.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.45 + i * 0.1) * (1 + Math.min(0.8, t * 0.08)) * (1 + Math.sin(t * 8 + i) * 0.08)})`)));
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
      <path d="M40 430 C40 300 100 220 200 220 C300 220 360 300 360 430" fill="none" stroke="${INK}" stroke-width="6"/>
      <g class="sbear"><ellipse cx="0" cy="-34" rx="80" ry="38" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-70" cy="-46" r="30" fill="#8a5a32" stroke="${INK}" stroke-width="4"/><circle cx="-84" cy="-72" r="10" fill="#8a5a32" stroke="${INK}" stroke-width="4"/>
        <ellipse cx="-88" cy="-40" rx="14" ry="10" fill="#e0b08a" stroke="${INK}" stroke-width="3"/><circle cx="-96" cy="-44" r="4" fill="${INK}"/><path class="eyes" d="M-80 -56 q6 4 12 0" fill="none" stroke="${INK}" stroke-width="3"/></g>
      <g class="zzz" font-family="Baloo 2, sans-serif" font-weight="800" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke"><text font-size="26">Z</text><text font-size="20">z</text><text font-size="16">z</text></g>`,
    setup(ctx) { place(ctx.hero, 320, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); place(q(ctx, 'sbear'), 170, 430); },
    idle(ctx, t) {
      [...q(ctx, 'zzz').children].forEach((z, i) => { const k = (t * 0.6 + i * 0.33) % 1; z.setAttribute('x', 90 + k * 40 + i * 6); z.setAttribute('y', 360 - k * 70 - i * 10); z.setAttribute('opacity', 1 - k); });
      place(q(ctx, 'sbear'), 170, 430, 0, 1, 1 + Math.sin(t * 2) * 0.04);
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
    bg: () => sky('#4a3a5a', '#6a5a7a', 'vs') + ground('#5a4a4a') + `
      <rect x="30" y="80" width="130" height="150" fill="#ffe680" stroke="${INK}" stroke-width="5"/><circle cx="95" cy="150" r="34" fill="#ffbe2e" stroke="${INK}" stroke-width="4"/><path d="M95 80 v150 M30 155 h130" stroke="${INK}" stroke-width="5"/>
      <path d="M30 80 q30 70 0 150 Z M160 80 q-30 70 0 150 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="4"/>
      <path class="beam" d="M60 230 L130 230 L200 430 L40 430 Z" fill="#ffe680" opacity="0.28"/>
      <g class="vamp"><path d="M-46 0 L-30 -100 L30 -100 L46 0 Z" fill="#1a1a24" stroke="${INK}" stroke-width="4"/><path d="M-46 -100 L-60 -140 L-20 -110 Z M46 -100 L60 -140 L20 -110 Z" fill="#9b1c2c" stroke="${INK}" stroke-width="4"/><circle cy="-124" r="24" fill="#d8d8e8" stroke="${INK}" stroke-width="4"/><path d="M-24 -134 q24 -24 48 0 L0 -126 Z" fill="#1a1a24"/><circle cx="-9" cy="-124" r="4" fill="#e8453c"/><circle cx="9" cy="-124" r="4" fill="#e8453c"/><path d="M-6 -110 l3 6 l3 -6 M2 -110 l3 6 l3 -6" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <path d="M-22 -100 q22 22 44 0" fill="none" stroke="#c9a06b" stroke-width="3"/>${[-16, -6, 6, 16].map((x, i) => `<ellipse cx="${x}" cy="${-92 + (i === 1 || i === 2 ? 6 : 0)}" rx="6" ry="7" fill="#fff6e8" stroke="${INK}" stroke-width="2"/>`).join('')}</g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    vx: (t) => 360 - Math.min(100, t * 10),
    idle(ctx, t) { place(q(ctx, 'vamp'), this.vx(t), 430 + Math.sin(t * 2) * -6); },
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
    bg: () => sky('#1a2348', '#3a4a7a', 'tb') + ground('#2e4a3a') + `
      <circle cx="80" cy="70" r="28" fill="#fff6d0"/>
      <rect x="250" y="250" width="16" height="180" fill="#6a7488" stroke="${INK}" stroke-width="3"/><circle cx="258" cy="244" r="16" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><path d="M258 260 L200 430 H316 Z" fill="#ffd34d" opacity="0.18"/>
      <g class="thief"><rect x="-22" y="-90" width="44" height="54" rx="16" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="-16" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><rect x="4" y="-44" width="12" height="44" rx="5" fill="#2b2b38" stroke="${INK}" stroke-width="4"/><circle cy="-114" r="24" fill="#ffd2b0" stroke="${INK}" stroke-width="4"/><rect x="-26" y="-124" width="52" height="14" fill="${INK}"/><circle cx="-9" cy="-117" r="3" fill="#fff"/><circle cx="9" cy="-117" r="3" fill="#fff"/>
        <g transform="translate(-40 -70) rotate(-20)"><rect x="-16" y="-4" width="32" height="8" rx="4" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="-16" cy="-4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="-16" cy="4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="16" cy="-4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/><circle cx="16" cy="4" r="6" fill="#f6efe0" stroke="${INK}" stroke-width="3"/></g></g>`,
    setup(ctx) { place(ctx.hero, 120, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    tx: (t) => 380 - Math.min(110, t * 10),
    idle(ctx, t) { place(q(ctx, 'thief'), this.tx(t), 430 + Math.abs(Math.sin(t * 6)) * -4); },
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
    bg: () => sky('#2b2140', '#4b3a6b', 'gb') + ground('#5a4a3a') + `
      <rect x="250" y="70" width="90" height="110" fill="#1a1530" stroke="${INK}" stroke-width="4"/><path d="M250 125 h90 M295 70 v110" stroke="${INK}" stroke-width="4"/><circle cx="315" cy="100" r="14" fill="#fff6d0"/>
      <g class="bghost"><path d="M-26 0 C-26 -52 26 -52 26 0 L26 32 L17 24 L9 32 L0 24 L-9 32 L-17 24 L-26 32 Z" fill="#f6f8ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-14 -12 q5 -5 10 0 M4 -12 q5 -5 10 0" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-8 6 q8 -8 16 0" fill="none" stroke="${INK}" stroke-width="3"/>
        <g class="tears"><path d="M-12 -6 q-3 8 0 12 q3 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="1.5"/><path d="M12 -6 q-3 8 0 12 q3 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="1.5"/></g></g>`,
    setup(ctx) { place(ctx.hero, 130, 430); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); },
    idle(ctx, t) {
      place(q(ctx, 'bghost'), 270 + Math.sin(t * 1.6) * 20, 300 + Math.sin(t * 3) * 10, Math.sin(t * 8) * 4);
      q(ctx, 'tears').setAttribute('transform', `translate(0 ${(t * 30) % 14})`);
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
for (const [id, kind] of Object.entries(AMB)) if (HAZARDS[id]) HAZARDS[id].amb = kind;

export const HAZARD_IDS = Object.keys(HAZARDS);
