// Danger packs that came after the first 41: Space, Ocean and City. Same shape as hazards.js
// (bg, setup, idle, win, fails); the game meets each pack's dangers back to back, with a banner.
import { el, g, place, setFace, setArms, paintHero } from './art.js';

const INK = '#2b2140';
const q = (ctx, cls) => ctx.layer.querySelector('.' + cls);
const sky = (top, bottom, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="520" fill="url(#${id})"/>`;
const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;

// a starfield for the space scenes (fixed, so it doesn't shimmer between rebuilds)
const STARS = Array.from({ length: 34 }, (_, i) => [(i * 97) % 400, (i * 53) % 420, 1 + (i % 3)]);
const starfield = () => STARS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.4 + (r % 3) * 0.2}"/>`).join('');
const spaceSky = (id) => sky('#0b0920', '#2b2156', id) + starfield();
// the sea from the side: sky, sun, water line at y
const seaSky = (id, y = 300) => sky('#8fd3ff', '#cdeeff', id) + `<circle cx="70" cy="80" r="30" fill="#ffd34d" ${S}/>
  <rect y="${y}" width="400" height="${520 - y}" fill="#2f8fd8"/><path d="M0 ${y} q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="5" opacity="0.7"/>`;
// city skyline behind a scene
const skyline = (base = 380) => {
  const b = [[0, 150, 60], [56, 210, 50], [104, 120, 70], [170, 240, 46], [214, 170, 64], [276, 220, 56], [330, 140, 70]];
  return b.map(([x, h, w], i) => `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${i % 2 ? '#8a86b8' : '#a39fcc'}" stroke="${INK}" stroke-width="3"/>` +
    Array.from({ length: Math.floor(h / 34) }, (_, r) => [0, 1].map((c) => `<rect x="${x + 10 + c * (w / 2 - 4)}" y="${base - h + 14 + r * 34}" width="${w / 2 - 16}" height="14" fill="${(r + c + i) % 3 ? '#ffe680' : '#5d5a8a'}"/>`).join('')).join('')).join('');
};
const tentacle = (cls, x, len, flip = 1) => `<g class="${cls}" transform="translate(${x} 330)"><path d="M-16 0 C-20 -${len * 0.4} ${flip * 30} -${len * 0.6} ${flip * 10} -${len} C${flip * 4} -${len + 14} ${flip * -14} -${len + 6} ${flip * -6} -${len - 10} C${flip * 6} -${len * 0.6} -6 -${len * 0.35} 16 0 Z" fill="#c45ab4" ${S}/>
  ${[0.2, 0.38, 0.56, 0.74].map((f, i) => `<circle cx="${flip * (6 + i * 3) - 6}" cy="-${len * f}" r="${5 - i}" fill="#f2b8e6" stroke="${INK}" stroke-width="2"/>`).join('')}</g>`;
const car = (color) => `<g><path d="M-70 -14 L-60 -40 Q-50 -56 -24 -56 H24 Q44 -56 54 -40 L70 -30 V-6 H-70 Z" fill="${color}" ${S}/><path d="M-44 -40 L-36 -50 H-6 V-40 Z M6 -40 V-50 H22 Q34 -50 40 -40 Z" fill="#bfeaff" stroke="${INK}" stroke-width="3"/>
  <circle cx="-40" cy="-4" r="13" fill="${INK}"/><circle cx="-40" cy="-4" r="5" fill="#c8c8d0"/><circle cx="40" cy="-4" r="13" fill="${INK}"/><circle cx="40" cy="-4" r="5" fill="#c8c8d0"/><rect x="62" y="-30" width="10" height="8" rx="2" fill="#ffd34d" stroke="${INK}" stroke-width="2"/></g>`;
const pigeon = `<g><ellipse rx="16" ry="11" fill="#9aa0b8" ${S}/><circle cx="-14" cy="-10" r="8" fill="#9aa0b8" ${S}/><path d="M-24 -10 l-6 3 l6 2 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="2"/><circle cx="-16" cy="-12" r="2" fill="${INK}"/><path d="M-6 -4 q10 -10 22 -2" fill="#7a8098" stroke="${INK}" stroke-width="3"/><path d="M-8 4 q-4 4 -10 3" fill="none" stroke="#6ac0a0" stroke-width="3"/></g>`;
const jelly = `<g><path d="M-22 0 C-22 -30 22 -30 22 0 Q11 -5 0 0 Q-11 -5 -22 0 Z" fill="#f2a6e6" opacity="0.9" ${S}/><path d="M-14 0 q-4 14 2 26 M-4 0 q4 14 -2 28 M8 0 q-4 12 2 24 M16 0 q4 10 0 20" fill="none" stroke="#c45ab4" stroke-width="3" stroke-linecap="round"/><circle cx="-7" cy="-12" r="2.5" fill="${INK}"/><circle cx="7" cy="-12" r="2.5" fill="${INK}"/><ellipse cx="-10" cy="-20" rx="5" ry="3" fill="#fff" opacity="0.6"/></g>`;

export const PACK_HAZARDS = {
  // ================================================================ SPACE
  // ---------------------------------------------------------------- cracked helmet on a spacewalk
  oxygen: {
    pack: 'space',
    correct: 'tape',
    wrong: { scissors: 'drift', fan: 'gasp', balloon: 'gasp' },
    bg: () => spaceSky('ox') + `
      <circle cx="40" cy="520" r="150" fill="#2f8fd8" ${S}/><path d="M-40 430 q40 -30 70 -10 q30 20 60 -6 l20 40 q-60 30 -150 10 Z M60 500 q30 -20 60 0 l-10 30 h-50 Z" fill="#2eb872" stroke="${INK}" stroke-width="3"/>
      <g transform="translate(330 160)"><rect x="-60" y="-40" width="120" height="80" rx="20" fill="#dfe6ef" ${S}/><circle cx="-24" r="16" fill="#7fd3ff" ${S}/><circle cx="24" r="16" fill="#7fd3ff" ${S}/>
        <rect x="-150" y="-20" width="80" height="40" fill="#2f5ac4" ${S}/><path d="M-150 0 h80 M-130 -20 v40 M-110 -20 v40 M-90 -20 v40" stroke="#7fa6f0" stroke-width="3"/><rect x="-70" y="-6" width="12" height="12" fill="#9aa6b8" stroke="${INK}" stroke-width="3"/>
        <rect x="60" y="-20" width="80" height="40" fill="#2f5ac4" ${S}/><path d="M60 0 h80 M80 -20 v40 M100 -20 v40 M120 -20 v40" stroke="#7fa6f0" stroke-width="3"/></g>
      <path class="tether" d="M270 190 C230 260 200 250 180 270" fill="none" stroke="#ffd34d" stroke-width="5" stroke-dasharray="10 6"/>`,
    setup(ctx) {
      place(ctx.hero, 170, 360); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.hero.fx.innerHTML = `<g class="helmet"><circle cx="0" cy="-118" r="40" fill="#bfeaff" opacity="0.3" ${S}/><path class="crack" d="M18 -150 l-8 12 l10 6 l-10 10" fill="none" stroke="${INK}" stroke-width="3"/>
        <g class="leak">${[0, 1, 2, 3].map(() => '<circle r="6" fill="#fff" opacity="0.8"/>').join('')}</g></g>`;
    },
    idle(ctx, t) {
      const x = 170 + Math.sin(t * 0.8) * 10;
      const y = 360 + Math.sin(t * 1.3) * 10;
      place(ctx.hero, x, y, Math.sin(t * 0.9) * 8);
      q(ctx, 'tether').setAttribute('d', `M270 190 C230 ${260 + Math.sin(t) * 10} 200 250 ${x + 10} ${y - 90}`);
      [...ctx.hero.querySelectorAll('.leak circle')].forEach((c, i) => {
        const k = (t * 1.6 + i * 0.25) % 1;
        c.setAttribute('cx', 18 + k * 50); c.setAttribute('cy', -150 - k * 40 + Math.sin(k * 9) * 6); c.setAttribute('r', 4 + k * 8); c.setAttribute('opacity', 0.9 - k);
      });
      if (t > 6) paintHero(ctx.hero, t > 9 ? 'frozen' : '');
    },
    async win(ctx) {
      const tp = ctx.tool('tape', 120, 250, 0.5);
      const [x, y] = [170, 360];
      await ctx.T(0.4, (k) => place(tp, 120 + k * 70, 250 - k * 10, k * 360, 0.5));
      tp.remove();
      ctx.hero.querySelector('.leak').style.display = 'none';
      ctx.hero.querySelector('.crack').setAttribute('stroke', '#9aa6b8');
      ctx.hero.querySelector('.helmet').insertAdjacentHTML('beforeend', `<path d="M8 -156 l24 18 M16 -160 l22 16" stroke="#c8c8d0" stroke-width="9" stroke-linecap="round"/>`);
      paintHero(ctx.hero, ''); ctx.say('PHEW!');
      await ctx.wait(0.3);
      await ctx.T(0.9, (k) => { place(ctx.hero, x + k * 90, y - k * 150, -k * 10); q(ctx, 'tether').setAttribute('d', `M270 190 C250 220 ${260 - k * 20} 220 ${x + 10 + k * 90} ${y - 90 - k * 150}`); });
    },
    fails: {
      async gasp(ctx) {
        await ctx.T(0.5, (k) => [...ctx.hero.querySelectorAll('.leak circle')].forEach((c, i) => c.setAttribute('r', 8 + k * 14 + i * 2)));
        paintHero(ctx.hero, 'frozen'); ctx.say('UGH!'); ctx.faint();
        await ctx.T(0.8, (k) => place(ctx.hero, 170 - k * 30, 360 + k * 10, k * 40));
      },
      async drift(ctx) {
        q(ctx, 'tether').style.display = 'none';
        ctx.sfx.whoosh(); ctx.say('BYE!');
        await ctx.T(1.2, (k) => place(ctx.hero, 170 - k * 230, 360 - k * 260, -k * 300, 1 - k * 0.6));
      },
    },
  },

  // ---------------------------------------------------------------- an asteroid drifting into a black hole
  blackhole: {
    pack: 'space',
    correct: 'rope',
    wrong: { anchor: 'sucked', vacuum: 'sucked', kite: 'sucked' },
    bg: () => spaceSky('bh') + `
      <g class="hole" transform="translate(300 230)"><ellipse rx="110" ry="34" fill="none" stroke="#ff8a2e" stroke-width="16" opacity="0.55"/><ellipse rx="90" ry="26" fill="none" stroke="#ffd34d" stroke-width="8" opacity="0.8"/>
        <circle r="54" fill="#08060f" stroke="#8a78f0" stroke-width="5"/><path d="M-110 0 a110 34 0 0 0 220 0" fill="none" stroke="#ff8a2e" stroke-width="14" opacity="0.8"/></g>
      <g class="ship" transform="translate(70 120)"><ellipse rx="56" ry="18" fill="#c8d2e0" ${S}/><path d="M-28 -8 C-24 -44 24 -44 28 -8 Z" fill="#7fd3ff" opacity="0.85" ${S}/>
        <circle cx="-34" cy="4" r="5" fill="#ffd34d" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="8" r="5" fill="#ff6f5e" stroke="${INK}" stroke-width="2"/><circle cx="34" cy="4" r="5" fill="#2eb872" stroke="${INK}" stroke-width="2"/></g>
      <g class="rock"><path d="M-62 0 C-70 -24 -40 -38 -10 -34 C24 -40 64 -26 60 2 C58 26 20 34 -4 30 C-34 32 -58 22 -62 0 Z" fill="#8a7a6a" ${S}/><circle cx="-26" cy="8" r="9" fill="#6a5a4a"/><circle cx="24" cy="-6" r="6" fill="#6a5a4a"/></g>`,
    setup(ctx) { place(ctx.hero, 120, 370); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); ctx.layer.appendChild(ctx.hero); },
    rx: (t) => 120 + Math.min(70, t * 6),
    idle(ctx, t) {
      const x = this.rx(t);
      place(q(ctx, 'rock'), x, 400, Math.sin(t) * 4);
      place(ctx.hero, x, 372, Math.sin(t) * 4 + Math.min(20, t * 2));
      q(ctx, 'hole').setAttribute('transform', `translate(300 230) rotate(${Math.sin(t * 0.7) * 6})`);
    },
    async win(ctx) {
      const x = this.rx(ctx.t());
      const r = ctx.tool('rope', x - 30, 260, 0.45);
      const line = el('path', { d: `M${x} 260 L70 130`, stroke: '#c9a06b', 'stroke-width': 6, fill: 'none' });
      ctx.layer.appendChild(line);
      ctx.sfx.whoosh(); ctx.say('ÇEK!');
      setArms(ctx.hero, 'hold');
      await ctx.wait(0.3);
      await ctx.T(1, (k) => {
        const nx = x - k * (x - 90), ny = 372 - k * 220;
        place(ctx.hero, nx, ny, -k * 10); place(q(ctx, 'rock'), x + k * 80, 400 - k * 60, k * 90, 1 - k * 0.6);
        line.setAttribute('d', `M${nx} ${ny - 110} L70 130`); place(r, nx - 30, ny - 110, 0, 0.45);
      });
      line.remove(); r.remove();
    },
    fails: {
      async sucked(ctx) {
        const x = this.rx(ctx.t());
        ctx.say('WHOOO!'); ctx.sfx.whoosh();
        await ctx.T(1.3, (k) => {
          const a = k * 8, rad = (1 - k) * (300 - x);
          place(ctx.hero, 300 - Math.cos(a) * rad, 230 + Math.sin(a) * rad * 0.4, k * 720, 1 - k * 0.95);
          place(q(ctx, 'rock'), 300 - Math.cos(a + 0.5) * rad, 260 + Math.sin(a + 0.5) * rad * 0.4, k * 500, 1 - k * 0.95);
        });
        ctx.flash('#8a78f0');
      },
    },
  },

  // ---------------------------------------------------------------- low gravity: every bounce goes higher
  moon: {
    pack: 'space',
    correct: 'boots',
    wrong: { balloon: 'floataway', parachute: 'floataway', skateboard: 'floataway' },
    bg: () => spaceSky('mo') + `
      <circle cx="320" cy="90" r="40" fill="#2f8fd8" ${S}/><path d="M296 74 q14 -10 26 2 q8 14 -6 22 q-12 -2 -20 -24 Z M330 104 q10 -6 18 4 l-10 12 Z" fill="#2eb872" stroke="${INK}" stroke-width="2"/>
      <path d="M0 410 Q100 396 200 410 T400 404 V520 H0 Z" fill="#c8c8d0" ${S}/>
      <ellipse cx="80" cy="450" rx="34" ry="10" fill="#a8a8b4" stroke="${INK}" stroke-width="3"/><ellipse cx="300" cy="470" rx="46" ry="12" fill="#a8a8b4" stroke="${INK}" stroke-width="3"/><ellipse cx="200" cy="500" rx="20" ry="6" fill="#a8a8b4" stroke="${INK}" stroke-width="3"/>
      <g transform="translate(330 410)"><path d="M-30 0 L-20 -40 H20 L30 0 M-24 -20 h48" fill="none" ${S}/><rect x="-26" y="-74" width="52" height="36" rx="6" fill="#e6c34d" ${S}/><circle cy="-56" r="9" fill="#7fd3ff" stroke="${INK}" stroke-width="3"/></g>
      <path d="M60 412 V320" stroke="${INK}" stroke-width="4"/><path d="M60 320 h44 v26 h-44 Z" fill="#e8453c" ${S}/><path d="M74 326 l6 14 l6 -14" fill="none" stroke="#fff" stroke-width="3"/>`,
    setup(ctx) {
      place(ctx.hero, 180, 412); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.hero.fx.innerHTML = `<circle cx="0" cy="-118" r="38" fill="#bfeaff" opacity="0.3" ${S}/><path d="M-20 -146 q10 -6 20 -4" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    },
    hy: (t) => 412 - Math.abs(Math.sin(t * 1.5)) * (30 + t * 16),
    idle(ctx, t) { place(ctx.hero, 180 + Math.sin(t * 0.7) * 14, this.hy(t), Math.sin(t * 1.5) * 10); },
    async win(ctx) {
      const y0 = this.hy(ctx.t());
      const b = ctx.tool('boots', 180, 200, 0.4);
      await ctx.T(0.3, (k) => place(b, 180, 200 + k * (y0 - 210), 0, 0.4));
      b.remove();
      ctx.hero.querySelector('.h-legs').insertAdjacentHTML('beforeend', `<rect x="-24" y="-14" width="22" height="16" rx="4" fill="#ffd34d" stroke="${INK}" stroke-width="3"/><rect x="2" y="-14" width="22" height="16" rx="4" fill="#ffbe2e" stroke="${INK}" stroke-width="3"/>`);
      await ctx.T(0.35, (k) => place(ctx.hero, 180, y0 + k * k * (412 - y0)));
      ctx.sfx.hit(); ctx.shake(); ctx.puff(180, 412, '#e6e6ee', 12, 50);
      setArms(ctx.hero, 'down'); ctx.say('PHEW!');
    },
    fails: {
      async floataway(ctx) {
        const y0 = this.hy(ctx.t());
        ctx.say('BYE!'); ctx.sfx.whoosh();
        await ctx.T(1.4, (k) => place(ctx.hero, 180 + k * 60, y0 - k * 520, k * 120, 1 - k * 0.5));
      },
    },
  },

  // ================================================================ OCEAN
  // ---------------------------------------------------------------- giant octopus around the rowboat
  octopus: {
    pack: 'ocean',
    correct: 'feather',
    wrong: { sword: 'grabbed', rod: 'grabbed', steak: 'grabbed' },
    bg: () => seaSky('oc') + tentacle('tent t1', 90, 170) + tentacle('tent t2', 320, 190, -1) + `
      <g class="boat"><path d="M130 296 h140 l-18 34 h-104 Z" fill="#c9893b" ${S}/><path d="M138 306 h124" stroke="#8a5a32" stroke-width="4"/><path d="M270 296 l20 -26" stroke="#8a5a32" stroke-width="6" stroke-linecap="round"/></g>`,
    setup(ctx) {
      place(ctx.hero, 200, 306); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared');
      ctx.layer.appendChild(ctx.hero);
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="front"><rect y="322" width="400" height="198" fill="#2f8fd8" opacity="0.94"/><path d="M0 322 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#fff" stroke-width="4" opacity="0.7"/>
        <ellipse cx="200" cy="420" rx="90" ry="40" fill="#c45ab4" opacity="0.35"/><circle cx="176" cy="410" r="9" fill="#fff" opacity="0.5"/><circle cx="224" cy="410" r="9" fill="#fff" opacity="0.5"/></g>`);
    },
    reach: (t) => Math.min(1, t / 10),
    idle(ctx, t) {
      const r = this.reach(t);
      place(q(ctx, 't1'), 90 + r * 50, 330 - r * 10, 8 + Math.sin(t * 2) * 10 + r * 16);
      place(q(ctx, 't2'), 320 - r * 50, 330 - r * 10, -8 - Math.sin(t * 2.3) * 10 - r * 16);
      place(q(ctx, 'boat'), 0, Math.sin(t * 2) * 3);
      place(ctx.hero, 200, 306 + Math.sin(t * 2) * 3);
    },
    async win(ctx) {
      const f = ctx.tool('feather', 140, 250, 0.5);
      setArms(ctx.hero, 'hold');
      ctx.say('HEHEHE!');
      await ctx.T(0.9, (k) => place(f, 140 + Math.sin(k * 20) * 10, 250 + Math.cos(k * 20) * 8, Math.sin(k * 24) * 30, 0.5));
      f.remove();
      await ctx.T(0.8, (k) => { place(q(ctx, 't1'), 140, 320 + k * 220, Math.sin(k * 30) * 14); place(q(ctx, 't2'), 270, 320 + k * 220, -Math.sin(k * 30) * 14); });
      ctx.splash(200, 330); paintHero(ctx.hero, ''); setFace(ctx.hero, 'happy');
    },
    fails: {
      async grabbed(ctx) {
        const t1 = q(ctx, 't1');
        await ctx.T(0.35, (k) => place(t1, 140 + k * 40, 320, 8 + k * 40));
        ctx.sfx.whoosh(); ctx.say('BLUP!');
        await ctx.T(0.8, (k) => { place(ctx.hero, 200 - k * 20, 306 - Math.sin(k * Math.PI) * 60 + k * 200, -k * 60); place(t1, 180, 320 + k * 200, 48); });
        ctx.splash(190, 330); ctx.bubbles(190, 360);
      },
    },
  },

  // ---------------------------------------------------------------- a swarm of jellyfish (they think he's one of them)
  jellyfish: {
    pack: 'ocean',
    correct: 'umbrella',
    wrong: { ring: 'zapped', banana: 'zapped', sponge: 'zapped' },
    bg: () => sky('#3fa8e8', '#0e3a6a', 'jf') + `
      <path d="M60 0 L20 520 H90 L110 0 Z M200 0 L190 520 H240 L230 0 Z M330 0 L360 520 H400 V0 Z" fill="#fff" opacity="0.08"/>
      <path d="M0 470 Q100 456 200 470 T400 466 V520 H0 Z" fill="#e6c88a" ${S}/>
      <path d="M40 470 q-14 -40 4 -70 q14 -30 -2 -60 M60 470 q12 -30 -2 -56 M350 470 q14 -40 -4 -80 q-12 -24 4 -50" fill="none" stroke="#2eb872" stroke-width="9" stroke-linecap="round"/>
      <path d="M300 470 l10 -16 l12 16 Z" fill="#ff6f5e" ${S}/><circle cx="130" cy="462" r="7" fill="#fff6d0" stroke="${INK}" stroke-width="3"/>`,
    setup(ctx) {
      place(ctx.hero, 160, 360); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); paintHero(ctx.hero, 'wet');
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="jellies">${[0, 1, 2, 3, 4].map(() => jelly).join('')}</g><g class="bub"></g>`);
    },
    idle(ctx, t) {
      const near = Math.min(1, t / 10);
      place(ctx.hero, 160 + Math.sin(t * 1.2) * 8, 360 + Math.sin(t * 2) * 8, Math.sin(t) * 6);
      [...q(ctx, 'jellies').children].forEach((j, i) => {
        const a = i * 1.3;
        const x = 320 - near * 110 + Math.cos(a) * (60 - near * 20);
        const y = 220 + i * 40 - near * 10 + Math.sin(t * 2 + i) * 14;
        place(j, x, y, Math.sin(t * 2 + i) * 6, 1, 1 + Math.sin(t * 4 + i) * 0.08);
      });
      if ((t * 10 | 0) % 7 === 0) q(ctx, 'bub').innerHTML = `<circle cx="${172 + Math.sin(t) * 6}" cy="${230 - (t * 40) % 60}" r="5" fill="none" stroke="#fff" stroke-width="2"/>`;
    },
    async win(ctx) {
      const u = ctx.tool('umbrella', 160, 196, 0.75);
      setArms(ctx.hero, 'up'); setFace(ctx.hero, 'happy');
      ctx.heart(260, 230); ctx.heart(300, 280); ctx.say('...');
      const js = [...q(ctx, 'jellies').children];
      await ctx.T(1.1, (k) => { place(ctx.hero, 160, 360 - k * 300); place(u, 160, 196 - k * 300, Math.sin(k * 12) * 6, 0.75, 0.75 * (1 + Math.sin(k * 20) * 0.08)); js.forEach((j, i) => place(j, 230 + i * 30, 260 + i * 30 - k * 320)); });
      u.remove();
    },
    fails: {
      async zapped(ctx) {
        const js = [...q(ctx, 'jellies').children];
        await ctx.T(0.4, (k) => js.forEach((j, i) => place(j, 210 - k * 30 + i * 8, 240 + i * 34 - k * 10)));
        const bolt = el('path', { d: 'M190 260 L170 290 L186 296 L160 340', stroke: '#ffd34d', 'stroke-width': 7, fill: 'none', 'stroke-linejoin': 'round' });
        ctx.layer.appendChild(bolt); ctx.flash('#ffd34d'); ctx.sfx.buzz(); ctx.say('ZZT!');
        await ctx.wait(0.3);
        bolt.remove(); paintHero(ctx.hero, 'burnt'); ctx.faint();
        ctx.hero.fx.insertAdjacentHTML('beforeend', `<path d="M-24 -150 l-8 -16 M0 -152 v-20 M24 -150 l8 -16" stroke="${INK}" stroke-width="4"/>`);
        await ctx.T(0.8, (k) => place(ctx.hero, 160, 360 + k * 90, k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- the raft drifts into a whale's mouth
  whale: {
    pack: 'ocean',
    correct: 'pepper',
    wrong: { honey: 'swallowed', torch: 'swallowed', flute: 'swallowed' },
    bg: () => seaSky('wh') + `
      <g class="whale" transform="translate(240 330)">
        <path d="M-40 -10 C-40 -150 120 -170 160 -40 L160 60 H-40 Z" fill="#4a6aa8" ${S}/>
        <path d="M150 -70 q30 -50 0 -100 q-6 40 -24 40" fill="none" stroke="#bfeaff" stroke-width="8" stroke-linecap="round"/>
        <circle cx="40" cy="-70" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="37" cy="-70" r="5" fill="${INK}"/>
        <path d="M-30 0 q60 20 150 4" fill="none" stroke="#bfd0f0" stroke-width="4"/>
        <g class="jaw"><path d="M-44 -4 C-30 40 80 50 140 30 L140 60 H-40 Z" fill="#3a5a98" ${S}/><path d="M-36 6 l8 10 l6 -10 l8 10 l6 -10 l8 10 l6 -10" fill="#fff" stroke="${INK}" stroke-width="2"/></g>
        <path class="mouth" d="M-40 -10 C-30 -40 10 -36 30 -14 C10 0 -20 0 -40 -4 Z" fill="#a33a4a" stroke="${INK}" stroke-width="3"/></g>
      <g class="raft"><rect x="-50" y="-6" width="100" height="18" rx="6" fill="#c9893b" ${S}/><path d="M-30 -6 v18 M-10 -6 v18 M10 -6 v18 M30 -6 v18" stroke="${INK}" stroke-width="2"/></g>`,
    setup(ctx) { place(ctx.hero, 100, 300); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); ctx.layer.appendChild(ctx.hero); },
    rx: (t) => 100 + Math.min(70, t * 6),
    idle(ctx, t) {
      const x = this.rx(t);
      place(q(ctx, 'raft'), x, 306 + Math.sin(t * 2) * 3);
      place(ctx.hero, x, 300 + Math.sin(t * 2) * 3);
      q(ctx, 'jaw').setAttribute('transform', `translate(0 ${10 + Math.min(30, t * 3) + Math.sin(t * 2) * 4})`);
    },
    async win(ctx) {
      const x = this.rx(ctx.t());
      const p = ctx.tool('pepper', x + 20, 230, 0.45);
      await ctx.T(0.5, (k) => place(p, x + 20 + k * 40, 230 + Math.sin(k * 24) * 8, Math.sin(k * 20) * 40, 0.45));
      p.remove();
      await ctx.wait(0.2);
      ctx.say('ACHOO!'); ctx.shake(); ctx.sfx.whoosh();
      ctx.puff(210, 320, '#bfeaff', 20, 120);
      await ctx.T(0.9, (k) => { place(q(ctx, 'raft'), x - k * 280, 306 - Math.sin(k * Math.PI) * 30); place(ctx.hero, x - k * 280, 300 - Math.sin(k * Math.PI) * 30, -k * 20); });
    },
    fails: {
      async swallowed(ctx) {
        const x = this.rx(ctx.t());
        await ctx.T(0.5, (k) => { place(q(ctx, 'raft'), x + k * 70, 310); place(ctx.hero, x + k * 70, 304); });
        await ctx.T(0.25, (k) => q(ctx, 'jaw').setAttribute('transform', `translate(0 ${40 - k * 44})`));
        ctx.hero.style.display = 'none'; q(ctx, 'raft').style.display = 'none';
        ctx.sfx.chomp(); ctx.say('GULP!');
        await ctx.wait(0.5);
        ctx.bubbles(270, 240);
      },
    },
  },

  // ================================================================ CITY
  // ---------------------------------------------------------------- frozen in the middle of the road
  traffic: {
    pack: 'city',
    correct: 'stopsign',
    wrong: { balloon: 'honk', drum: 'honk', banana: 'honk' },
    bg: () => sky('#ffd7a8', '#fff0dc', 'tr') + skyline(380) + `
      <rect y="380" width="400" height="22" fill="#c8c0b8" ${S}/><rect y="402" width="400" height="90" fill="#5a5a68"/><path d="M0 447 h400" stroke="#fff" stroke-width="6" stroke-dasharray="30 22"/>
      <rect y="492" width="400" height="28" fill="#c8c0b8" ${S}/>
      <g transform="translate(350 380)"><rect x="-4" y="-120" width="8" height="120" fill="#5a5e78" stroke="${INK}" stroke-width="3"/><rect x="-16" y="-170" width="32" height="70" rx="8" fill="#2b2140" stroke="${INK}" stroke-width="3"/><circle cy="-156" r="9" fill="#e8453c"/><circle cy="-134" r="9" fill="#5a4a2a"/><circle cy="-112" r="9" fill="#2a4a3a"/></g>
      <g class="car">${car('#e8453c')}</g>`,
    setup(ctx) { place(ctx.hero, 210, 466); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); ctx.layer.appendChild(ctx.hero); },
    cx: (t) => -90 + Math.min(150, t * 14),
    idle(ctx, t) {
      place(q(ctx, 'car'), this.cx(t), 470 + Math.sin(t * 20) * 1.2);
      ctx.hero.setAttribute('transform', `translate(${210 + Math.sin(t * 30) * 1.5} 466)`);
    },
    async win(ctx) {
      const s = ctx.tool('stopsign', 180, 300, 0.7);
      setArms(ctx.hero, 'up');
      ctx.sfx.hit();
      const c = q(ctx, 'car'); const x0 = this.cx(ctx.t());
      await ctx.T(0.5, (k) => place(c, x0 + (1 - (1 - k) * (1 - k)) * 40, 470, -k * 3));
      ctx.puff(x0 + 10, 470, '#c8c0b8', 10, 40);
      await ctx.wait(0.3);
      s.remove(); setArms(ctx.hero, 'down');
      await ctx.T(0.7, (k) => place(ctx.hero, 210 + k * 110, 466 - k * 70 - Math.abs(Math.sin(k * 10)) * 6));
    },
    fails: {
      async honk(ctx) {
        const c = q(ctx, 'car'); const x0 = this.cx(ctx.t());
        ctx.say('HONK!'); ctx.sfx.whoosh();
        await ctx.T(0.35, (k) => place(c, x0 + k * (140 - x0), 470));
        ctx.shake(); ctx.sfx.hit();
        place(ctx.hero, 210, 470, 0, 1.4, 0.25); setFace(ctx.hero, 'hurt');
        await ctx.T(0.6, (k) => place(c, 140 + k * 400, 470));
      },
    },
  },

  // ---------------------------------------------------------------- pigeons after his sandwich
  pigeons: {
    pack: 'city',
    correct: 'bread',
    wrong: { cheese: 'pecked', broccoli: 'pecked', yarn: 'pecked' },
    bg: () => sky('#bfe0ff', '#eaf6ff', 'pg') + skyline(360) + `<rect y="360" width="400" height="160" fill="#9adf6a"/><rect y="400" width="400" height="40" fill="#e0d4c0" ${S}/>
      <g transform="translate(320 400)"><rect x="-50" y="-34" width="100" height="10" rx="3" fill="#c9893b" ${S}/><rect x="-50" y="-58" width="100" height="10" rx="3" fill="#c9893b" ${S}/><path d="M-40 -24 v24 M40 -24 v24" stroke="${INK}" stroke-width="5"/></g>
      <g transform="translate(60 400)"><path d="M0 0 V-90" stroke="#5a5e78" stroke-width="7"/><path d="M-14 -100 h28 l-6 -18 h-16 Z" fill="#ffe680" ${S}/></g>`,
    setup(ctx) {
      place(ctx.hero, 190, 430); setArms(ctx.hero, 'hold'); setFace(ctx.hero, 'scared');
      ctx.hero.fx.innerHTML = `<g class="sandwich" transform="translate(0 -60)"><path d="M-22 -6 h44 l-4 -10 h-36 Z" fill="#e0a868" ${S}/><rect x="-24" y="-6" width="48" height="6" fill="#2eb872"/><rect x="-22" y="0" width="44" height="6" fill="#ff8a6e"/><path d="M-22 6 h44 v6 h-44 Z" fill="#e0a868" ${S}/></g>`;
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="flock">${[0, 1, 2, 3, 4, 5].map(() => pigeon).join('')}</g>`);
    },
    idle(ctx, t) {
      const near = Math.min(1, t / 10);
      [...q(ctx, 'flock').children].forEach((p, i) => {
        const side = i % 2 ? 1 : -1;
        const x = 190 + side * (200 - near * 110 + (i >> 1) * 22) + Math.sin(t * 6 + i) * 4;
        const y = i < 4 ? 432 - Math.abs(Math.sin(t * 7 + i)) * 4 : 300 - i * 10 + Math.sin(t * 3 + i) * 20;
        place(p, x, y, Math.sin(t * 8 + i) * 8, -side, 1);
      });
    },
    async win(ctx) {
      const b = ctx.tool('bread', 190, 340, 0.4);
      ctx.sfx.whoosh();
      await ctx.T(0.6, (k) => place(b, 190 - k * 230, 340 - Math.sin(k * Math.PI) * 110 + k * 90, k * 540, 0.4));
      ctx.say('COO!');
      const ps = [...q(ctx, 'flock').children];
      await ctx.T(0.9, (k) => ps.forEach((p, i) => place(p, 100 + i * 14 - k * 220, 420 - Math.sin(k * Math.PI) * (40 + i * 10), 0, 1, 1)));
      setArms(ctx.hero, 'down'); setFace(ctx.hero, 'happy');
    },
    fails: {
      async pecked(ctx) {
        const ps = [...q(ctx, 'flock').children];
        await ctx.T(0.4, (k) => ps.forEach((p, i) => place(p, 190 + Math.cos(i * 1.1) * (90 - k * 50), 360 + Math.sin(i * 1.1) * (70 - k * 40), 0, i % 2 ? -1 : 1, 1)));
        ctx.say('COO!'); ctx.sfx.chomp(); ctx.shake();
        ctx.hero.querySelector('.sandwich').style.display = 'none';
        for (let i = 0; i < 3; i++) ctx.puff(190, 330 + i * 20, '#fff', 4, 50);
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 190, 430, k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- shoe stuck in the subway rails
  subway: {
    pack: 'city',
    correct: 'butter',
    wrong: { hammer: 'train', magnet: 'train', rope: 'train' },
    bg: () => `<rect width="400" height="520" fill="#d8dce8"/>
      <path d="${Array.from({ length: 9 }, (_, i) => `M0 ${i * 30} H400`).join(' ')} ${Array.from({ length: 11 }, (_, i) => `M${i * 40} 0 V270`).join(' ')}" stroke="#bfc6d8" stroke-width="2"/>
      <rect x="20" y="70" width="110" height="34" rx="6" fill="#2f7cf6" ${S}/><text x="75" y="94" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="18" fill="#fff">M 3</text>
      <path d="M220 270 V150 Q300 70 380 150 V270 Z" fill="#14121e" ${S}/>
      <circle class="light" cx="300" cy="210" r="8" fill="#ffe680"/>
      <rect y="270" width="400" height="250" fill="#6a6470"/>
      <rect x="0" y="370" width="150" height="150" fill="#bfb6a8" ${S}/><rect x="0" y="370" width="150" height="10" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
      <path d="M150 430 L400 430 M150 474 L400 474" stroke="#9aa6b8" stroke-width="8"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${160 + i * 42}" y="424" width="16" height="58" fill="#5a3a2a"/>`).join('')}
      <path d="M150 430 L400 430 M150 474 L400 474" stroke="${INK}" stroke-width="2"/>`,
    setup(ctx) { place(ctx.hero, 250, 476); setArms(ctx.hero, 'up'); setFace(ctx.hero, 'scared'); ctx.layer.appendChild(ctx.hero); ctx.layer.insertAdjacentHTML('beforeend', `<g class="train" transform="translate(500 0)"><rect x="0" y="260" width="380" height="220" rx="30" fill="#e8453c" ${S}/><rect x="20" y="290" width="70" height="70" rx="10" fill="#bfeaff" stroke="${INK}" stroke-width="3"/><circle cx="40" cy="430" r="14" fill="#ffe680" ${S}/><rect x="0" y="380" width="380" height="14" fill="#fff"/></g>`); },
    idle(ctx, t) {
      const L = q(ctx, 'light');
      L.setAttribute('r', 8 + Math.min(40, t * 4)); L.setAttribute('opacity', 0.6 + Math.sin(t * 6) * 0.2);
      ctx.hero.setAttribute('transform', `translate(250 476) rotate(${Math.sin(t * 5) * 6})`);
    },
    async win(ctx) {
      const b = ctx.tool('butter', 250, 420, 0.45);
      await ctx.T(0.4, (k) => place(b, 250 + Math.sin(k * 20) * 10, 420 + k * 40, 0, 0.45));
      b.remove(); ctx.say('YIHUU!');
      await ctx.T(0.6, (k) => place(ctx.hero, 250 - k * 160, 476 - Math.sin(k * Math.PI) * 120 - k * 106, -k * 360));
      setArms(ctx.hero, 'down');
      await ctx.T(0.7, (k) => q(ctx, 'train').setAttribute('transform', `translate(${500 - k * 860} 0)`));
    },
    fails: {
      async train(ctx) {
        ctx.flash('#ffe680'); ctx.say('TOOT!'); ctx.sfx.whoosh();
        await ctx.T(0.35, (k) => q(ctx, 'train').setAttribute('transform', `translate(${500 - k * 280} 0)`));
        ctx.shake(); ctx.sfx.hit(); ctx.faint();
        await ctx.T(0.8, (k) => { q(ctx, 'train').setAttribute('transform', `translate(${220 - k * 600} 0)`); place(ctx.hero, 250 - k * 330, 476 - Math.sin(k * Math.PI) * 260, -k * 540); });
      },
    },
  },
};

export const PACKS = { space: ['oxygen', 'blackhole', 'moon'], ocean: ['octopus', 'jellyfish', 'whale'], city: ['traffic', 'pigeons', 'subway'] };
export const PACK_AMB = { oxygen: 'wind', blackhole: 'rumble', moon: 'ufo', octopus: 'wave', jellyfish: 'bubble', whale: 'wave', traffic: 'steps', pigeons: 'squeak', subway: 'rumble' };
