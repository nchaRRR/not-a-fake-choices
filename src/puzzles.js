// Puzzle levels for Not a Fake Ad: Choices, on top of the classic one-tap dangers:
//   clue  - the same danger with a small scene detail that changes the answer (the bear is asleep…)
//   two   - a danger that needs two items in the right order; the first one plays a partial rescue
//   combo - two cards merge into a new item, and some dangers only give in to the merged one
//   chain - two or three dangers in a row with one bag of items; what you do sets flags for later
//   inv   - three dangers at once and four items, each used once; exactly one plan saves everyone
// Rules and scene code live here; main.js deals the cards, runs the clock and the level flow.
// Scene functions are called with `this` set to the base danger (so this.lx(), this.tx() work).
import { el, g, place, setFace, setArms, paintHero } from './art.js';
import { HAZARDS } from './hazards.js';

const INK = '#2b2140';
const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
const q = (ctx, cls) => ctx.layer.querySelector('.' + cls);
const H = (id) => HAZARDS[id];
const base = (id, fn) => (ctx) => fn.call(H(id), ctx);
const pos = (n) => { const m = ((n && n.getAttribute('transform')) || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)/); return m ? [Number(m[1]), Number(m[2])] : [200, 430]; };
const lids = (ctx, cls, on) => ctx.layer.querySelectorAll('.' + cls).forEach((n) => n.setAttribute('opacity', on ? 1 : 0));
const firstType = (hz) => Object.values(hz.wrong)[0];

// ================================================================ recipes (combine two cards)
export const RECIPES = [
  ['umbrella', 'fan', 'glider'],
  ['candle', 'bottle', 'lantern'],
  ['rope', 'magnet', 'grabber'],
  ['plank', 'rope', 'raft'],
  ['skateboard', 'rocket', 'jetboard'],
  ['ice', 'fan', 'cooler'],
];
export function combine(a, b) {
  const r = RECIPES.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return r ? r[2] : null;
}

// ================================================================ scene variants (clue states and two-step scenes)
// mark(ctx) draws the detail after the danger's own setup; idle replaces the danger's idle, more runs after it.
// Clue variants have one `correct` item, two-step variants have `steps` with a `part` animation for the first.
export const VARIANTS = {
  // ---------------------------------------------------------------- clue: the bear is asleep (tiptoe, don't feed)
  'bear~asleep': {
    base: 'bear', kind: 'clue', correct: 'slippers',
    mark(ctx) {
      q(ctx, 'bear').insertAdjacentHTML('beforeend', `<path d="M-48 -156 C-42 -198 10 -216 54 -202 L32 -158 Z" fill="#7a8cf0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-50 -158 Q-8 -174 34 -156" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M-50 -158 Q-8 -174 34 -156" fill="none" stroke="${INK}" stroke-width="2" opacity="0.4"/><circle cx="56" cy="-202" r="10" fill="#fff" ${S3}/>
        <g class="vz" font-family="Baloo 2, sans-serif" font-weight="800" fill="#fff" stroke="${INK}" stroke-width="4" paint-order="stroke"><text font-size="36">Z</text><text font-size="28">z</text><text font-size="22">z</text></g>`);
      q(ctx, 'bear-mouth').setAttribute('d', 'M-26 -119 q8 4 16 0');
      q(ctx, 'bpaw').setAttribute('transform', 'rotate(50 -40 -70)');
      lids(ctx, 'blid', true);
      setArms(ctx.hero, 'down');
    },
    idle(ctx, t) {
      place(q(ctx, 'bear'), 296, 430, 0, 1, 1 + Math.sin(t * 2) * 0.03);
      lids(ctx, 'blid', true);
      [...q(ctx, 'vz').children].forEach((z, i) => { const k = (t * 0.55 + i * 0.33) % 1; z.setAttribute('x', -96 - k * 30 - i * 10); z.setAttribute('y', -170 - k * 60 - i * 8); z.setAttribute('opacity', (1 - k).toFixed(2)); });
    },
    async win(ctx) {
      const s = ctx.tool('slippers', 110, 442, 0.45);
      setFace(ctx.hero, 'happy'); ctx.say('ŞŞŞ...');
      await ctx.T(1.3, (k) => { const x = 110 - k * 200; place(ctx.hero, x, 430 - Math.abs(Math.sin(k * 14)) * 4); place(s, x, 442, 0, 0.45); });
    },
    async failAll(ctx) {
      q(ctx, 'vz').style.display = 'none';
      lids(ctx, 'blid', false);
      ctx.say('GRRR!');
      await ctx.wait(0.35);
      await H('bear').fails.swipe.call(H('bear'), ctx);
    },
  },

  // ---------------------------------------------------------------- clue: the ghost is crying (comfort, don't vacuum)
  'ghost~cry': {
    base: 'ghost', kind: 'clue', correct: 'teddy',
    mark(ctx) {
      q(ctx, 'ghost').insertAdjacentHTML('beforeend', `<g class="gcry"><path d="M-24 -26 l10 4 M24 -26 l-10 4" stroke="#f6f8ff" stroke-width="7" stroke-linecap="round"/><path d="M-26 -22 l11 -6 M26 -22 l-11 -6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="0" cy="16" rx="12" ry="14" fill="#f6f8ff"/><path class="gmouth" d="M-10 24 q10 -12 20 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <g class="gtears"><path d="M-15 2 q-5 10 0 15 q5 -5 0 -15 Z M15 2 q-5 10 0 15 q5 -5 0 -15 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="2"/></g>
        <ellipse cx="-24" cy="6" rx="6" ry="4" fill="#ff9ac8" opacity="0.6"/><ellipse cx="24" cy="6" rx="6" ry="4" fill="#ff9ac8" opacity="0.6"/></g>`);
    },
    more(ctx, t) { q(ctx, 'gtears').setAttribute('transform', `translate(0 ${((t * 26) % 16).toFixed(1)})`); },
    async win(ctx) {
      const gh = q(ctx, 'ghost');
      const [x, y] = pos(gh);
      const tb = ctx.tool('teddy', 160, 340, 0.5);
      await ctx.T(0.5, (k) => place(tb, 160 + (x - 160) * k, 340 + (y + 10 - 340) * k - Math.sin(k * Math.PI) * 60, 0, 0.5));
      q(ctx, 'gtears').style.display = 'none';
      q(ctx, 'gmouth').setAttribute('d', 'M-10 16 q10 12 20 0');
      ctx.heart(x, y - 60); ctx.heart(x - 30, y - 40); ctx.say('...');
      await ctx.T(0.9, (k) => { place(gh, x + k * 60, y - k * 260, 0, 1 - k * 0.4); place(tb, x + k * 60, y + 10 - k * 260, 0, 0.5 - k * 0.2); });
    },
    fails: {
      async vacuum(ctx) {
        const v = ctx.tool('vacuum', 180, 380, 0.7);
        const gh = q(ctx, 'ghost');
        const [x, y] = pos(gh);
        ctx.sfx.whoosh(); await ctx.wait(0.3);
        ctx.say('UAAAA!'); ctx.sfx.roar(); ctx.shake();
        await ctx.T(0.45, (k) => place(gh, x, y, Math.sin(k * 30) * 4, 1 + k * 1.1));
        ctx.puff(x, y - 40, '#bfeaff', 12, 60); v.remove();
        ctx.faint();
        await ctx.T(0.5, (k) => place(ctx.hero, 130, 430, -k * 90));
      },
    },
  },

  // ---------------------------------------------------------------- clue: a thorn in the lion's paw (bandage, not yarn)
  'lion~thorn': {
    base: 'lion', kind: 'clue', correct: 'tape', t0: 5,
    mark(ctx) {
      q(ctx, 'lion').insertAdjacentHTML('beforeend', `<g class="lpaw"><path d="M-30 -30 q-20 -6 -30 -22" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M-30 -30 q-20 -6 -30 -22" fill="none" stroke="#e8b060" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="-64" cy="-58" rx="13" ry="11" fill="#e8b060" ${S3}/><ellipse cx="-66" cy="-58" rx="6" ry="5" fill="#f6b8a0"/>
        <path class="lthorn" d="M-70 -62 l-18 -14 l8 18 Z" fill="#6a7f5a" ${S3}/><circle class="lthorn" cx="-72" cy="-52" r="3" fill="#e8453c"/></g>
        <path d="M-50 -112 l10 4 M-18 -112 l-10 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path class="ltear" d="M-47 -96 q-4 8 0 12 q4 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="1.5"/>`);
      q(ctx, 'lmouth').setAttribute('d', 'M-44 -82 q10 -8 20 0');
    },
    more(ctx, t) {
      spin(q(ctx, 'lpaw'), `rotate(${(Math.sin(t * 6) * 6).toFixed(1)} -30 -30)`);
      const tr = q(ctx, 'ltear'); if (tr) tr.setAttribute('transform', `translate(0 ${((t * 18) % 10).toFixed(1)})`);
    },
    async win(ctx) {
      const l = q(ctx, 'lion');
      const x0 = this.lx(ctx.t());
      const tp = ctx.tool('tape', 150, 330, 0.45);
      await ctx.T(0.5, (k) => place(tp, 150 + (x0 - 64 - 150) * k, 330 + (372 - 330) * k - Math.sin(k * Math.PI) * 50, k * 360, 0.45));
      tp.remove();
      l.querySelectorAll('.lthorn, .ltear').forEach((n) => n.remove());
      q(ctx, 'lpaw').insertAdjacentHTML('beforeend', `<path d="M-76 -64 l20 12 M-74 -52 l20 -8" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M-76 -64 l20 12 M-74 -52 l20 -8" stroke="#c8c8d0" stroke-width="2" stroke-dasharray="2 3"/>`);
      q(ctx, 'lmouth').setAttribute('d', 'M-46 -84 q12 12 24 0');
      ctx.heart(x0 - 40, 300); ctx.say('PHEW!');
      await ctx.wait(0.3);
      await ctx.T(0.9, (k) => place(l, x0 + k * 230, 430 - Math.abs(Math.sin(k * 14)) * 10, 0, -1, 1));
    },
    fails: {
      async yarn(ctx) {
        const y = ctx.tool('yarn', 140, 410, 0.45);
        await ctx.T(0.5, (k) => place(y, 140 + k * 80, 410, k * 300, 0.45));
        ctx.say('...');
        await H('lion').fails.lion.call(H('lion'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- clue: the zombie is vegan (carrot in hand, sprout on top)
  'zombie~vegan': {
    base: 'zombie', kind: 'clue', correct: 'broccoli', t0: 6,
    mark(ctx) {
      q(ctx, 'zom').insertAdjacentHTML('beforeend', `<g transform="translate(-74 -80) rotate(18)"><path d="M0 -9 L-34 0 L0 9 Z" fill="#ff8a2e" ${S3}/><path d="M-10 -5 l4 3 M-18 -3 l4 3 M-24 0 l3 2" stroke="#c9653a" stroke-width="2"/><path d="M2 -4 l12 -8 M2 0 l14 0 M2 4 l12 8" stroke="#2eb872" stroke-width="5" stroke-linecap="round"/></g>
        <path d="M0 -136 q-6 -16 -18 -16 q8 12 18 16 q4 -18 18 -22 q-6 14 -18 22" fill="#2eb872" ${S3}/><path d="M0 -136 v-10" stroke="#2e7d4a" stroke-width="3"/>`);
    },
    async win(ctx) {
      const z = q(ctx, 'zom');
      const x0 = this.zx(ctx.t());
      const b = ctx.tool('broccoli', 150, 330, 0.45);
      await ctx.T(0.6, (k) => place(b, 150 + (x0 - 80 - 150) * k, 330 - Math.sin(k * Math.PI) * 120 + k * 20, k * 360, 0.45));
      ctx.sfx.chomp(); ctx.say('NOM NOM!');
      ctx.heart(x0 - 30, 280);
      place(z, x0, 430, 0, -1, 1);
      await ctx.T(0.9, (k) => { place(z, x0 + k * 170, 430, Math.sin(k * 16) * 4, -1, 1); place(b, x0 - 80 + k * 170, 350, 0, 0.45); });
      b.remove();
    },
    fails: {
      async brain(ctx) {
        const x0 = this.zx(ctx.t());
        const b = ctx.tool('brain', 150, 330, 0.45);
        await ctx.T(0.5, (k) => place(b, 150 + (x0 - 70 - 150) * k, 330 + k * 30, k * 300, 0.45));
        ctx.say('IYY!');
        await ctx.T(0.35, (k) => place(b, x0 - 70 - k * 240, 360 - Math.sin(k * Math.PI) * 90, -k * 300, 0.45));
        b.remove();
        await H('zombie').fails.zombie.call(H('zombie'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- clue: wind-up robot mice (magnet, not the cat)
  'mice~robot': {
    base: 'mice', kind: 'clue', correct: 'magnet',
    mark(ctx) {
      for (const m of q(ctx, 'mice').children) {
        const body = m.querySelector('ellipse'); if (body) body.setAttribute('fill', '#c8d2e0');
        m.insertAdjacentHTML('beforeend', `<circle cx="-8" cy="0" r="2" fill="${INK}"/><circle cx="8" cy="2" r="2" fill="${INK}"/><g transform="translate(0 -6) scale(1.45)"><g class="mkey"><rect x="-2" y="-18" width="4" height="10" fill="${INK}"/><ellipse cx="-7" cy="-22" rx="7" ry="5" fill="#ffd34d" ${S3}/><ellipse cx="7" cy="-22" rx="7" ry="5" fill="#ffd34d" ${S3}/></g></g><path d="M-14 -12 l-6 -12" stroke="${INK}" stroke-width="2"/><circle cx="-20" cy="-25" r="3" fill="#e8453c" stroke="${INK}" stroke-width="1.5"/>`);
      }
    },
    more(ctx, t) { ctx.layer.querySelectorAll('.mkey').forEach((k, i) => k.setAttribute('transform', `scale(${Math.cos(t * 6 + i).toFixed(2)} 1)`)); },
    async win(ctx) {
      const m = ctx.tool('magnet', 236, 290, 0.6);
      setArms(ctx.hero, 'hold');
      const ms = [...q(ctx, 'mice').children];
      const xs = ms.map((n) => pos(n)[0]);
      ctx.sfx.whoosh();
      await ctx.T(0.7, (k) => ms.forEach((n, i) => place(n, xs[i] + (226 + (i % 3) * 16 - xs[i]) * k * k, 420 - (420 - (330 + Math.floor(i / 3) * 16)) * k * k, k * 80, 1)));
      ctx.sfx.hit(); ctx.say('KLİK!');
      m.dataset.keep = '1';
    },
    fails: {
      async cat(ctx) {
        const c = ctx.tool('cat', 70, 400, 0.8);
        ctx.say('MİYAV!');
        await ctx.T(0.45, (k) => place(c, 70 + k * 90, 400, 0, 0.8));
        ctx.sfx.hit(); ctx.flash('#ffd34d'); ctx.say('ZZT!');
        await ctx.T(0.45, (k) => place(c, 160 - k * 260, 400 - Math.sin(k * Math.PI) * 90, -k * 200, 0.8));
        c.remove();
        await H('mice').fails.mice.call(H('mice'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- clue: the aliens come in peace (white flag, pink beam)
  'alien~peace': {
    base: 'alien', kind: 'clue', correct: 'flower',
    mark(ctx) {
      q(ctx, 'ufo').insertAdjacentHTML('beforeend', `<g class="wflag"><path d="M62 14 L82 74" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path class="wf" d="M80 64 h40 q-6 11 0 24 h-40 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>
        <path d="M0 18 c-8 -10 -22 -2 -11 9 l11 10 l11 -10 c11 -11 -3 -19 -11 -9 Z" fill="#ff6f9e" ${S3}/>`);
      q(ctx, 'beam').setAttribute('fill', '#ffaee0');
    },
    more(ctx, t) { const f = q(ctx, 'wf'); if (f) f.setAttribute('transform', `translate(80 76) scale(${(1 + Math.sin(t * 7) * 0.08).toFixed(2)} ${(1 + Math.sin(t * 9) * 0.15).toFixed(2)}) translate(-80 -76)`); },
    async win(ctx) {
      const y = 430 - Math.min(120, ctx.t() * 11);
      const f = ctx.tool('flower', 226, y - 110, 0.5);
      setArms(ctx.hero, 'hold'); setFace(ctx.hero, 'happy');
      await ctx.T(0.6, (k) => place(f, 226 - k * 26, y - 110 - (y - 240) * k, k * 40, 0.5 - k * 0.2));
      f.remove();
      ctx.heart(200, 160); ctx.heart(170, 190); ctx.sfx.pop();
      await ctx.T(0.7, (k) => place(ctx.hero, 200, y + (430 - y) * k));
      q(ctx, 'beam').style.display = 'none';
      const u = q(ctx, 'ufo');
      await ctx.T(0.8, (k) => u.setAttribute('transform', `translate(${200 + k * 300} ${100 - k * 60 + Math.sin(k * 12) * 8})`));
    },
    fails: {
      async mirror(ctx) {
        const y = 430 - Math.min(120, ctx.t() * 11);
        const m = ctx.tool('mirror', 226, y - 110, 0.5);
        q(ctx, 'beam').setAttribute('fill', '#ff6f5e');
        ctx.flash('#ff6f5e'); ctx.sfx.whoosh();
        q(ctx, 'wflag').style.display = 'none';
        ctx.say('?!');
        await ctx.wait(0.45);
        m.remove();
        await H('alien').fails.abduct.call(H('alien'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- clue: the meteor is tiny (umbrella, no rocket)
  'meteor~tiny': {
    base: 'meteor', kind: 'clue', correct: 'umbrella',
    mark() {},
    mpos: (t) => { const k = Math.min(1, t / 11); return [118 + k * 82, 140 + k * 116]; },
    idle(ctx, t) {
      const [x, y] = VARIANTS['meteor~tiny'].mpos(t);
      place(q(ctx, 'meteor'), x, y, 0, 0.3);
      const tr = q(ctx, 'mtrail'); if (tr) tr.setAttribute('transform', `scale(${(1 + Math.sin(t * 14) * 0.06).toFixed(3)})`);
    },
    async win(ctx) {
      const m = q(ctx, 'meteor');
      const [mx, my] = VARIANTS['meteor~tiny'].mpos(ctx.t());
      ctx.tool('umbrella', 206, 286, 0.95).dataset.keep = '1';
      setArms(ctx.hero, 'hold');
      await ctx.T(0.4, (k) => place(m, mx + (204 - mx) * k, my + (258 - my) * k, 0, 0.3));
      ctx.sfx.hit(); ctx.say('TINK!'); ctx.puff(204, 258, '#ffbe2e', 6, 30);
      await ctx.T(0.7, (k) => place(m, 204 + k * 220, 258 - Math.sin(k * Math.PI) * 120 + k * 160, k * 360, 0.3));
    },
    fails: {
      async rocket(ctx) {
        const r = ctx.tool('rocket', 200, 340, 0.9);
        ctx.sfx.whoosh(); ctx.puff(200, 430, '#ff8a2e', 16, 60);
        await ctx.T(0.8, (k) => { place(r, 200 - k * 60, 340 - k * 440, -12 * k, 0.9); place(ctx.hero, 200 - k * 60, 430 - k * 440, -12 * k); });
        ctx.say('AAAA!');
        const m = q(ctx, 'meteor');
        const [mx, my] = pos(m);
        await ctx.T(0.4, (k) => place(m, mx + (210 - mx) * k, my + (424 - my) * k, 0, 0.3));
        ctx.sfx.hit(); ctx.puff(210, 424, '#8a6a5a', 6, 30);
      },
    },
    async failAll(ctx) {
      const m = q(ctx, 'meteor');
      const [mx, my] = pos(m);
      await ctx.T(0.4, (k) => place(m, mx + (200 - mx) * k, my + (296 - my) * k, 0, 0.3));
      ctx.sfx.hit(); ctx.say('TONK!'); ctx.shake();
      ctx.faint();
      await ctx.T(0.5, (k) => { place(m, 200 + k * 60, 296 + k * 130, k * 200, 0.3); place(ctx.hero, 200, 430, -k * 90); });
    },
  },

  // ---------------------------------------------------------------- clue: the thief brought a bone (the dog would switch sides)
  'thief~bone': {
    base: 'thief', kind: 'clue', correct: 'whistle', t0: 5,
    mark(ctx) {
      q(ctx, 'thief').insertAdjacentHTML('beforeend', `<g transform="translate(-42 -72) rotate(-20) scale(1.3)"><rect x="-16" y="-4" width="32" height="8" rx="4" fill="#f6efe0" ${S3}/><circle cx="-16" cy="-4" r="6" fill="#f6efe0" ${S3}/><circle cx="-16" cy="4" r="6" fill="#f6efe0" ${S3}/><circle cx="16" cy="-4" r="6" fill="#f6efe0" ${S3}/><circle cx="16" cy="4" r="6" fill="#f6efe0" ${S3}/></g>`);
    },
    win: (ctx) => H('thiefbone').win.call(H('thiefbone'), ctx),
    fails: { dog: (ctx) => H('thiefbone').fails.bonk.call(H('thiefbone'), ctx) },
  },

  // ---------------------------------------------------------------- two steps: frozen in a block of ice (hammer, then fire)
  'cold~ice': {
    base: 'cold', kind: 'two', steps: ['hammer', 'campfire'],
    mark(ctx) {
      paintHero(ctx.hero, 'frozen'); setFace(ctx.hero, 'hurt');
      ctx.hero.fx.innerHTML = `<rect x="-48" y="-164" width="96" height="170" rx="12" fill="#bfeaff" opacity="0.6" stroke="${INK}" stroke-width="4"/><path d="M-32 -142 l22 10 M12 -104 l26 -8 M-30 -40 l14 8" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M40 -150 l-10 18 l8 6" fill="none" stroke="#7fb8e0" stroke-width="3"/>`;
    },
    async part(ctx) {
      const hm = ctx.tool('hammer', 252, 330, 0.55);
      await ctx.T(0.25, (k) => place(hm, 252, 330, -60 + k * 90, 0.55));
      ctx.sfx.boom(); ctx.say('KRAK!'); ctx.shake();
      ctx.hero.fx.innerHTML = '';
      ctx.puff(200, 360, '#bfeaff', 18, 80); ctx.puff(200, 300, '#fff', 8, 60);
      hm.remove();
      setFace(ctx.hero, 'scared');
      await ctx.wait(0.3);
      ctx.say('BRRR!');
    },
    async win(ctx) {
      await H('cold').win.call(H('cold'), ctx);
      paintHero(ctx.hero, '');
    },
    fails: {
      async campfire(ctx) {
        const f = ctx.tool('campfire', 270, 360, 0.9);
        ctx.puff(270, 380, '#ffbe2e', 10, 40);
        await ctx.wait(0.5);
        ctx.hero.fx.innerHTML = '';
        ctx.splash(220, 400);
        await ctx.wait(0.25);
        f.remove(); ctx.puff(270, 360, '#8a8698', 12, 40); ctx.sfx.splash();
        await ctx.wait(0.3);
        ctx.freeze();
        await ctx.wait(0.3);
      },
    },
  },

  // ---------------------------------------------------------------- two steps: tied to the cupboard in a flood (scissors, then ring)
  'flood~tied': {
    base: 'flood', kind: 'two', steps: ['scissors', 'ring'],
    mark(ctx) {
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="tie"><path d="M212 424 Q170 450 116 404" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M212 424 Q170 450 116 404" fill="none" stroke="#c9a06b" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 4"/>
        <ellipse cx="216" cy="424" rx="16" ry="6" fill="none" stroke="${INK}" stroke-width="8"/><ellipse cx="216" cy="424" rx="16" ry="6" fill="none" stroke="#c9a06b" stroke-width="4"/><circle cx="116" cy="404" r="8" fill="#c9a06b" ${S3}/></g>`);
    },
    async part(ctx) {
      const sc = ctx.tool('scissors', 170, 400, 0.5);
      await ctx.T(0.3, (k) => place(sc, 170, 400 + k * 30, Math.sin(k * 20) * 20, 0.5));
      ctx.sfx.whoosh(); ctx.say('SNIP!');
      const tie = q(ctx, 'tie');
      await ctx.T(0.4, (k) => { tie.setAttribute('opacity', 1 - k); tie.setAttribute('transform', `translate(0 ${k * 30})`); });
      tie.remove(); sc.remove();
    },
    win: (ctx) => H('flood').win.call(H('flood'), ctx),
    fails: {
      async ring(ctx) {
        const r = ctx.tool('ring', 220, 380, 0.9);
        await ctx.T(0.4, (k) => { place(ctx.hero, 220, 430 - k * 34); place(r, 220, 380 - k * 34, 0, 0.9); });
        ctx.say('?!'); ctx.sfx.hit();
        await ctx.T(0.2, (k) => { place(ctx.hero, 220, 396 + k * 34); place(r, 220, 346 + k * 34, 0, 0.9); });
        r.remove();
        await H('flood').fails.sink.call(H('flood'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- two steps: stuck in a seatbelt in a sinking car (scissors, then hammer)
  'carsink~belt': {
    base: 'carsink', kind: 'two', steps: ['scissors', 'hammer'],
    mark(ctx) {
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="belt"><path d="M156 262 L238 336" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M156 262 L238 336" stroke="#5a5e78" stroke-width="9" stroke-linecap="round"/><path d="M162 270 l8 7 M196 300 l8 7" stroke="#8a8ea8" stroke-width="3"/><rect x="226" y="322" width="28" height="22" rx="5" fill="#e8453c" stroke="${INK}" stroke-width="4"/><rect x="234" y="329" width="12" height="8" rx="2" fill="#ffd34d"/></g>`);
    },
    async part(ctx) {
      const sc = ctx.tool('scissors', 230, 380, 0.45);
      await ctx.T(0.3, (k) => place(sc, 230, 380, Math.sin(k * 20) * 20, 0.45));
      ctx.sfx.whoosh(); ctx.say('SNIP!');
      const b = q(ctx, 'belt');
      await ctx.T(0.35, (k) => { b.setAttribute('opacity', 1 - k); b.setAttribute('transform', `translate(0 ${k * 24})`); });
      b.remove(); sc.remove();
      setArms(ctx.hero, 'up');
    },
    win: (ctx) => H('carsink').win.call(H('carsink'), ctx),
    fails: {
      async hammer(ctx) {
        const hm = ctx.tool('hammer', 240, 270, 0.5);
        await ctx.T(0.25, (k) => place(hm, 240, 270, -60 + k * 90, 0.5));
        ctx.sfx.boom(); ctx.say('KRAK!');
        q(ctx, 'glass').style.display = 'none';
        ctx.puff(200, 290, '#e6f6ff', 16, 70); hm.remove();
        await ctx.T(0.25, (k) => place(ctx.hero, 200, 440 - k * 16));
        ctx.say('?!');
        await ctx.T(0.2, (k) => place(ctx.hero, 200, 424 + k * 16));
        await H('carsink').fails.sink.call(H('carsink'), ctx);
      },
    },
  },

  // ---------------------------------------------------------------- two steps: a hungry dragon (block the fire, then feed it)
  'dragon~hungry': {
    base: 'dragon', kind: 'two', steps: ['shield', 'steak'],
    mark(ctx) {
      q(ctx, 'dragon').insertAdjacentHTML('beforeend', `<g class="dthink"><circle cx="-118" cy="-96" r="6" fill="#fff" ${S3}/><circle cx="-136" cy="-114" r="9" fill="#fff" ${S3}/><ellipse cx="-176" cy="-140" rx="40" ry="30" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <g transform="translate(-176 -140) scale(0.46) translate(-50 -50)">${''}<path d="M18 52 C18 26 60 18 78 34 C92 46 84 74 62 80 C40 86 18 76 18 52 Z" fill="#c9443a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M34 46 q14 -10 30 0 M32 60 q16 -8 34 2" fill="none" stroke="#f6c8b0" stroke-width="6" stroke-linecap="round"/><circle cx="74" cy="44" r="7" fill="#f6efe0" stroke="${INK}" stroke-width="5"/></g></g>
        <path class="ddrool" d="M-98 -56 q-4 12 0 18 q4 -6 0 -18 Z" fill="#bfeaff" stroke="${INK}" stroke-width="2"/>`);
    },
    more(ctx, t) {
      const d = q(ctx, 'ddrool'); if (d) d.setAttribute('transform', `translate(-98 -56) scale(1 ${(1 + Math.abs(Math.sin(t * 2)) * 0.9).toFixed(2)}) translate(98 56)`);
      const th = q(ctx, 'dthink'); if (th) th.setAttribute('transform', `translate(0 ${(Math.sin(t * 3) * 3).toFixed(1)})`);
    },
    async part(ctx) {
      const s = ctx.tool('shield', 150, 330, 0.9);
      const b = q(ctx, 'breath'); b.style.display = '';
      ctx.sfx.whoosh();
      await ctx.T(0.8, (k) => { b.style.opacity = Math.sin(k * Math.PI); });
      b.style.display = 'none';
      ctx.puff(160, 320, '#ffbe2e', 14, 50);
      await ctx.T(0.3, (k) => place(s, 150 - k * 40, 330 + k * 60, -k * 30, 0.9 - k * 0.3));
      ctx.say('PHEW!');
    },
    async win(ctx) {
      const d = q(ctx, 'dragon');
      const [dx, dy] = pos(d);
      const st = ctx.tool('steak', 160, 330, 0.6);
      await ctx.T(0.6, (k) => place(st, 160 + (dx - 110 - 160) * k, 330 - Math.sin(k * Math.PI) * 90 + (dy - 70 - 330) * k, k * 360, 0.6));
      st.remove(); ctx.sfx.chomp(); ctx.say('NOM NOM!');
      q(ctx, 'dthink').style.display = 'none'; q(ctx, 'ddrool').style.display = 'none';
      ctx.heart(dx - 70, dy - 90);
      await ctx.wait(0.3);
      await ctx.T(0.6, (k) => d.setAttribute('transform', `translate(${dx + k * 210} ${dy - k * 200})`));
    },
    fails: {
      async steak(ctx) {
        const st = ctx.tool('steak', 150, 330, 0.6);
        await ctx.wait(0.2);
        await H('dragon').fails.roast.call(H('dragon'), ctx);
        st.innerHTML = st.innerHTML.replace(/#c9443a/g, '#3a2a2a');
      },
    },
  },

  // ---------------------------------------------------------------- two steps: a cracked helmet and a snapped tether (tape, then rope)
  'oxygen~tether': {
    base: 'oxygen', kind: 'two', steps: ['tape', 'rope'],
    mark(ctx) {
      q(ctx, 'tether').style.display = 'none';
      ctx.layer.insertAdjacentHTML('beforeend', `<path class="tstub" d="M270 190 q-14 26 -2 50 q8 12 -4 22" fill="none" stroke="#ffd34d" stroke-width="5" stroke-dasharray="10 6"/>`);
      ctx.hero.fx.insertAdjacentHTML('beforeend', `<path d="M12 -60 q26 0 30 -22 l6 4 M42 -82 l-6 -6" fill="none" stroke="#ffd34d" stroke-width="5" stroke-dasharray="10 6"/>`);
    },
    hxy: (t) => [170 + Math.sin(t * 0.8) * 10 - Math.min(70, t * 6), 360 + Math.sin(t * 1.3) * 10 + Math.min(30, t * 2.5)],
    idle(ctx, t) {
      const [x, y] = VARIANTS['oxygen~tether'].hxy(t);
      place(ctx.hero, x, y, Math.sin(t * 0.9) * 8 - Math.min(20, t * 2));
      const fixed = ctx.step > 0;
      [...ctx.hero.querySelectorAll('.leak circle')].forEach((c, i) => {
        const k = (t * 1.6 + i * 0.25) % 1;
        c.setAttribute('cx', 18 + k * 50); c.setAttribute('cy', -150 - k * 40 + Math.sin(k * 9) * 6); c.setAttribute('r', 4 + k * 8); c.setAttribute('opacity', 0.9 - k);
      });
      if (!fixed && t > 6) paintHero(ctx.hero, t > 9 ? 'frozen' : '');
    },
    async part(ctx) {
      const [x, y] = pos(ctx.hero);
      const tp = ctx.tool('tape', x - 50, y - 110, 0.5);
      await ctx.T(0.4, (k) => place(tp, x - 50 + k * 70, y - 110 - k * 30, k * 360, 0.5));
      tp.remove();
      ctx.hero.querySelector('.leak').style.display = 'none';
      ctx.hero.querySelector('.crack').setAttribute('stroke', '#9aa6b8');
      ctx.hero.querySelector('.helmet').insertAdjacentHTML('beforeend', `<path d="M8 -156 l24 18 M16 -160 l22 16" stroke="#c8c8d0" stroke-width="9" stroke-linecap="round"/>`);
      paintHero(ctx.hero, ''); ctx.say('PHEW!');
    },
    async win(ctx) {
      const [x, y] = pos(ctx.hero);
      const line = el('path', { d: `M${x + 20} ${y - 80} L270 190`, stroke: '#c9a06b', 'stroke-width': 6, fill: 'none' });
      ctx.layer.appendChild(line);
      setArms(ctx.hero, 'hold'); ctx.say('ÇEK!'); ctx.sfx.whoosh();
      await ctx.T(1.0, (k) => { const nx = x + (250 - x) * k, ny = y + (300 - y) * k; place(ctx.hero, nx, ny, -k * 10); line.setAttribute('d', `M${nx + 20} ${ny - 80} L270 190`); });
    },
    async failAll(ctx) {
      const [x, y] = pos(ctx.hero);
      if (ctx.step > 0) { ctx.say('BYE!'); ctx.sfx.whoosh(); await ctx.T(1.2, (k) => place(ctx.hero, x - k * 200, y - k * 240, -k * 280, 1 - k * 0.6)); return; }
      await ctx.T(0.5, (k) => [...ctx.hero.querySelectorAll('.leak circle')].forEach((c, i) => c.setAttribute('r', 8 + k * 14 + i * 2)));
      paintHero(ctx.hero, 'frozen'); ctx.say('UGH!'); ctx.faint();
      await ctx.T(0.8, (k) => place(ctx.hero, x - k * 30, y + k * 10, k * 40));
    },
    fails: {
      async rope(ctx) {
        const [x, y] = pos(ctx.hero);
        const line = el('path', { d: `M${x + 20} ${y - 80} L270 190`, stroke: '#c9a06b', 'stroke-width': 6, fill: 'none' });
        ctx.layer.appendChild(line); ctx.say('ÇEK!');
        await ctx.T(0.6, (k) => { const nx = x + (220 - x) * k * 0.6, ny = y + (300 - y) * k * 0.6; place(ctx.hero, nx, ny); line.setAttribute('d', `M${nx + 20} ${ny - 80} L270 190`); });
        await ctx.T(0.5, (k) => [...ctx.hero.querySelectorAll('.leak circle')].forEach((c, i) => c.setAttribute('r', 8 + k * 14 + i * 2)));
        paintHero(ctx.hero, 'frozen'); ctx.say('UGH!'); ctx.faint();
        await ctx.wait(0.5);
      },
    },
  },

  // ---------------------------------------------------------------- two steps: more mice behind the hole (cat, then tape the hole)
  'mice~hole': {
    base: 'mice', kind: 'two', steps: ['cat', 'tape'],
    mark(ctx) {
      ctx.layer.insertAdjacentHTML('beforeend', `<g class="mhole"><path d="M322 431 v-30 q32 -40 64 0 v30 Z" fill="#1a1424" stroke="${INK}" stroke-width="4"/><g class="meyes">${[[338, 414], [362, 404], [366, 422]].map(([x, y]) => `<circle cx="${x - 4}" cy="${y}" r="3.5" fill="#ffd34d"/><circle cx="${x + 4}" cy="${y}" r="3.5" fill="#ffd34d"/>`).join('')}</g></g>`);
    },
    more(ctx, t) { const e = q(ctx, 'meyes'); if (e) e.setAttribute('opacity', (t * 1.3) % 2.2 > 2.05 ? 0 : 1); },
    part: (ctx) => H('mice').win.call(H('mice'), ctx),
    async win(ctx) {
      const tp = ctx.tool('tape', 220, 330, 0.5);
      await ctx.T(0.5, (k) => place(tp, 220 + k * 134, 330 + k * 82 - Math.sin(k * Math.PI) * 60, k * 360, 0.5));
      tp.remove(); ctx.sfx.hit(); ctx.say('KLİK!');
      q(ctx, 'meyes').style.display = 'none';
      q(ctx, 'mhole').insertAdjacentHTML('beforeend', `<path d="M324 400 l60 30 M324 430 l60 -30" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M324 400 l60 30 M324 430 l60 -30" stroke="#c8c8d0" stroke-width="10" stroke-linecap="round"/>`);
    },
    fails: {
      async tape(ctx) {
        const tp = ctx.tool('tape', 220, 330, 0.5);
        await ctx.T(0.5, (k) => place(tp, 220 + k * 134, 330 + k * 82 - Math.sin(k * Math.PI) * 60, k * 360, 0.5));
        tp.remove(); ctx.sfx.hit();
        q(ctx, 'meyes').style.display = 'none';
        ctx.say('?');
        await ctx.wait(0.3);
        await H('mice').fails.mice.call(H('mice'), ctx);
      },
    },
  },
};
for (const [id, v] of Object.entries(VARIANTS)) v.id = id;
const spin = (n, tf) => { if (n) n.setAttribute('transform', tf); };
export const CLUE_IDS = Object.keys(VARIANTS).filter((id) => VARIANTS[id].kind === 'clue');
export const TWO_IDS = Object.keys(VARIANTS).filter((id) => VARIANTS[id].kind === 'two');
// the clue item for a danger in its normal state (wrong there), e.g. bear -> slippers
export const clueItemFor = (h) => { const v = CLUE_IDS.map((id) => VARIANTS[id]).find((x) => x.base === h); return v ? v.correct : null; };

// ================================================================ wins with a combined item (combo stages)
export const CRAFT = {
  dino: {
    async glider(ctx) {
      const p = ctx.tool('glider', 210, 290, 1.1);
      ctx.sfx.whoosh(); ctx.say('YIHUU!');
      await ctx.T(1.3, (k) => { const x = 210 + k * 200; const y = 430 - k * 150 + Math.sin(k * Math.PI) * 24; place(ctx.hero, x, y, Math.sin(k * 8) * 4); place(p, x, y - 150, Math.sin(k * 8) * 4, 1.1); });
    },
  },
  cold: {
    async lantern(ctx) {
      const glow = el('circle', { cx: 252, cy: 386, r: 10, fill: '#ffe680', opacity: 0.5 });
      ctx.layer.appendChild(glow);
      ctx.tool('lantern', 252, 386, 0.8).dataset.keep = '1';
      setArms(ctx.hero, 'hold'); ctx.puff(252, 380, '#ffe680', 10, 40);
      await ctx.T(0.9, (k) => { glow.setAttribute('r', 10 + k * 110); q(ctx, 'snow').style.opacity = 1 - k * 0.7; ctx.hero.style.filter = `saturate(${0.3 + k * 0.7})`; });
      ctx.say('OH BE!');
    },
  },
  moon: {
    async grabber(ctx) {
      const [x, y] = pos(ctx.hero);
      const m = ctx.tool('magnet', x + 30, y - 90, 0.35);
      const line = el('path', { d: `M${x + 20} ${y - 80} L${x + 30} ${y - 90}`, stroke: '#c9a06b', 'stroke-width': 5, fill: 'none' });
      ctx.layer.appendChild(line);
      setArms(ctx.hero, 'hold'); ctx.sfx.whoosh();
      await ctx.T(0.5, (k) => { const mx = x + 30 + (306 - x - 30) * k, my = y - 90 + (356 - y + 90) * k; place(m, mx, my, 0, 0.35); line.setAttribute('d', `M${x + 20} ${y - 80} L${mx} ${my}`); });
      ctx.sfx.hit(); ctx.say('KLİK!');
      await ctx.T(0.6, (k) => { const nx = x + (270 - x) * k, ny = y + (412 - y) * k; place(ctx.hero, nx, ny); line.setAttribute('d', `M${nx + 20} ${ny - 80} L306 356`); });
      ctx.puff(270, 412, '#e6e6ee', 10, 40); setArms(ctx.hero, 'down'); ctx.say('PHEW!');
    },
  },
  avalanche: {
    async jetboard(ctx) {
      const k0 = this.wp(ctx.t());
      const sk = ctx.tool('jetboard', 250, 444, 0.8);
      ctx.sfx.whoosh(); ctx.say('YIHUU!');
      await ctx.T(0.8, (k) => { const x = 250 + k * 280; place(ctx.hero, x, 430 - Math.sin(k * Math.PI) * 24); place(sk, x, 444 - Math.sin(k * Math.PI) * 24, 0, 0.8); if (k < 0.6) ctx.puff(x - 40, 440, '#ff8a2e', 1, 20); this.wave(ctx, k0 + (0.85 - k0) * k); });
    },
  },
  desert: {
    async cooler(ctx) {
      ctx.tool('cooler', 290, 392, 0.75).dataset.keep = '1';
      ctx.sfx.whoosh();
      for (let i = 0; i < 4; i++) { ctx.puff(250 - i * 14, 360 - i * 6, '#bfeaff', 4, 30); await ctx.wait(0.18); }
      ctx.hero.style.filter = '';
      const m = q(ctx, 'sun-mouth'); if (m) m.setAttribute('d', 'M-16 14 q16 -14 32 0');
      setFace(ctx.hero, 'happy'); ctx.say('OH BE!');
    },
  },
  flood: {
    async raft(ctx) {
      const w = q(ctx, 'water');
      const y0 = pos(w)[1];
      const r = ctx.tool('raft', 220, 440, 1.05);
      await ctx.T(0.9, (k) => { const wy = y0 - k * 80; place(w, 0, wy); const hy = Math.min(430, wy + 20); place(ctx.hero, 220, hy - 18); place(r, 220, hy + 8, Math.sin(k * 9) * 3, 1.05); });
      setArms(ctx.hero, 'up');
    },
  },
};

// ================================================================ alternatives in chains and inventory puzzles
// The classic answer still works; these are the other items that save the same scene. needs/sets are flags.
export const ALTS = {
  fire: {
    water: { async win(ctx) { ctx.pour(250, 290); await ctx.wait(0.5); const fires = [...q(ctx, 'fires').children]; await ctx.T(0.7, (k) => fires.forEach((f) => { f.style.opacity = 1 - k; })); ctx.puff(260, 260, '#e8e8f0', 14, 50); } },
  },
  bomb: {
    scissors: {
      async win(ctx) {
        const sc = ctx.tool('scissors', 200, 330, 0.5);
        await ctx.T(0.35, (k) => place(sc, 200 + k * 90, 330 + k * 20, Math.sin(k * 24) * 20, 0.5));
        ctx.sfx.whoosh(); ctx.say('SNIP!');
        q(ctx, 'spark').style.display = 'none';
        q(ctx, 'fuse').setAttribute('d', 'M0 -56 q6 -10 14 -10');
        ctx.puff(300, 340, '#c8c8d0', 6, 30);
        await ctx.wait(0.3); sc.remove();
      },
    },
  },
  quicksand: {
    plank: {
      async win(ctx) {
        const y0 = this.sy(ctx.t());
        const pl = g({}, `<rect x="-90" y="-8" width="180" height="16" rx="4" fill="#c9893b" stroke="${INK}" stroke-width="4"/><path d="M-70 -2 h40 M10 2 h50" stroke="#8a5a32" stroke-width="3"/>`);
        ctx.layer.appendChild(pl);
        await ctx.T(0.4, (k) => place(pl, 230, 300 + k * 138, 0, 1));
        ctx.sfx.hit(); setArms(ctx.hero, 'hold');
        await ctx.T(0.7, (k) => place(ctx.hero, 180 + k * 30, y0 - (y0 - 432) * k));
        setArms(ctx.hero, 'down');
        await ctx.T(0.6, (k) => place(ctx.hero, 210 + k * 120, 432 - Math.abs(Math.sin(k * Math.PI * 4)) * 6));
      },
    },
  },
  piranha: {
    surfboard: {
      async win(ctx) {
        const s = this.sink(ctx.t());
        const sb = ctx.tool('surfboard', 170, 380, 0.95);
        ctx.sfx.whoosh(); ctx.say('YIHUU!');
        await ctx.T(0.3, (k) => place(sb, 170, 380 - k * 6, 50, 0.95));
        await ctx.T(0.9, (k) => { const x = 170 + k * 260; place(ctx.hero, x, 352 + s - 10 - Math.sin(k * Math.PI) * 14); place(sb, x, 374 - Math.sin(k * Math.PI) * 14, 50, 0.95); });
      },
    },
  },
  moon: {
    anchor: {
      async win(ctx) {
        const y0 = this.hy(ctx.t());
        const [x] = pos(ctx.hero);
        const a = ctx.tool('anchor', x + 30, 180, 0.5);
        await ctx.T(0.35, (k) => place(a, x + 30, 180 + k * (y0 - 140), 0, 0.5));
        setArms(ctx.hero, 'hold'); ctx.sfx.hit();
        await ctx.T(0.4, (k) => { place(ctx.hero, x, y0 + k * k * (412 - y0)); place(a, x + 30, y0 + 40 + k * k * (412 - y0), 0, 0.5); });
        ctx.shake(); ctx.puff(x, 412, '#e6e6ee', 12, 50); ctx.say('PHEW!');
        a.dataset.keep = '1';
      },
    },
  },
  vampsun: {
    scissors: {
      async win(ctx) {
        const x0 = this.vx(ctx.t());
        const sc = ctx.tool('scissors', 150, 300, 0.5);
        await ctx.T(0.4, (k) => place(sc, 150 - k * 40, 300 - k * 210, Math.sin(k * 20) * 20, 0.5));
        ctx.sfx.whoosh(); ctx.say('SNIP!');
        const sun = el('path', { d: `M30 80 L160 80 L${x0 + 60} 430 L40 430 Z`, fill: '#ffe680', opacity: 0 });
        ctx.layer.appendChild(sun);
        ctx.flash('#ffe680');
        const v = q(ctx, 'vamp');
        await ctx.T(0.8, (k) => { sun.setAttribute('opacity', 0.55 * k); place(v, x0, 430, 0, 1 - k * 0.6, 1 - k); v.style.opacity = 1 - k; });
        ctx.say('IYY!'); ctx.puff(x0, 400, '#8a8698', 16, 50);
        sc.remove();
      },
    },
  },
  electric: {
    extinguisher: {
      async win(ctx) {
        ctx.spray(140, 330, 230, 350, '#ffffff');
        await ctx.wait(0.6);
        q(ctx, 'sparks').style.display = 'none';
        await ctx.T(0.5, (k) => { q(ctx, 'fires').style.opacity = 1 - k; });
        ctx.puff(240, 350, '#c8c8d0', 10, 30);
      },
    },
  },
  bear: {
    drumstick: {
      async win(ctx) {
        const h = ctx.tool('drumstick', 150, 340, 0.5);
        const bear = q(ctx, 'bear');
        await ctx.T(0.5, (k) => place(h, 150 + k * 80, 340 - Math.sin(k * Math.PI) * 60 + k * 30, k * 300, 0.5));
        q(ctx, 'bear-mouth').setAttribute('d', 'M-30 -120 q12 14 26 0');
        ctx.sfx.chomp(); ctx.heart(260, 230);
        await ctx.T(0.8, (k) => { place(bear, 250 + k * 160, 430, 0, -1, 1); place(h, 230 + k * 160, 370, 0, 0.5); });
      },
    },
  },
  mice: {
    broom: {
      async win(ctx) {
        const b = ctx.tool('broom', 120, 396, 0.8);
        const ms = [...q(ctx, 'mice').children];
        const xs = ms.map((n) => pos(n)[0]);
        ctx.sfx.whoosh(); ctx.say('ŞAK!');
        await ctx.T(0.9, (k) => { ms.forEach((m, i) => place(m, xs[i] + k * (470 - xs[i]), 420, 0, -1, 1)); place(b, 120 + k * 210, 396, Math.sin(k * 24) * 22, 0.8); });
      },
    },
  },
  thiefbone: {
    // a bigger bone for the dog: he picks your side and stays with you
    drumstick: {
      sets: 'dog',
      async win(ctx) {
        const th = q(ctx, 'thief');
        const x0 = this.tx(ctx.t());
        const ds = ctx.tool('drumstick', 150, 330, 0.5);
        await ctx.T(0.4, (k) => place(ds, 150 - k * 60, 330 + k * 90 - Math.sin(k * Math.PI) * 50, -k * 200, 0.5));
        const d = ctx.tool('dog', 40, 414, 0.7);
        ctx.sfx.bark(); ctx.say('HAV HAV!');
        await ctx.T(0.35, (k) => place(d, 40 + k * 44, 414, 0, 0.7));
        ds.remove(); ctx.sfx.chomp(); ctx.heart(90, 360);
        await ctx.wait(0.2);
        ctx.sfx.bark();
        await ctx.T(0.4, (k) => place(d, 84 + k * (x0 - 160), 414, 0, 0.7));
        await ctx.T(0.7, (k) => { place(th, x0 + k * 200, 430 - Math.abs(Math.sin(k * 14)) * 14); place(d, x0 - 76 + k * 60, 414, 0, 0.7); });
        await ctx.T(0.4, (k) => place(d, x0 - 16 - k * (x0 - 156), 414, 0, -0.7, 0.7));
      },
    },
  },
  thief: {
    // only with your own dog (from the bone-thief stage before)
    whistle: {
      needs: 'dog',
      async win(ctx) {
        ctx.say('FIIIT!');
        const p = ctx.hero.querySelector('.h-pet'); if (p) p.style.display = 'none';
        await ctx.wait(0.25);
        await H('thief').win.call(H('thief'), ctx);
      },
    },
  },
};
// classic answers that also set a flag (only in chains)
const SETS = { electric: { breaker: 'dark' } };
// classic answers that stop working while a flag is set
const BLOCK = {
  ghost: {
    vacuum: {
      flag: 'dark', sid: 'ghost~dark',
      async fail(ctx) {
        const v = ctx.tool('vacuum', 180, 380, 0.7);
        ctx.say('...'); await ctx.wait(0.5);
        ctx.puff(160, 380, '#5a5a62', 4, 20); ctx.say('?');
        await ctx.wait(0.3); v.remove();
        await H('ghost').fails.scared.call(H('ghost'), ctx);
      },
    },
  },
};
// fail type for new (danger, item) pairs; anything else falls back to the danger's first fail
const XFAIL = { dino: { lantern: 'eaten', candle: 'eaten', bottle: 'eaten' }, piranha: { rope: 'nibbled', anchor: 'nibbled' } };
// scene changes from flags, drawn when a later chain stage is built
export function applyFlags(ctx, flags) {
  if (flags.dark) ctx.layer.insertAdjacentHTML('beforeend', '<rect class="darkness" width="400" height="520" fill="#0b0920" opacity="0.5" pointer-events="none"/>');
}

// Does this item save this (classic) scene in a chain or inventory puzzle, given the flags so far?
export function rule(hazard, item, flags = {}) {
  const hz = HAZARDS[hazard];
  const blk = BLOCK[hazard] && BLOCK[hazard][item];
  if (blk && flags[blk.flag]) return null;
  if (item === hz.correct) return { win: hz.win, sets: SETS[hazard] && SETS[hazard][item] };
  const a = ALTS[hazard] && ALTS[hazard][item];
  if (a && (!a.needs || flags[a.needs])) return a;
  return null;
}

// What happens when this card is played on this stage. Pure: returns what to run, main.js runs it.
export function judge(stage, id, flags = {}) {
  const hz = HAZARDS[stage.hazard];
  const v = stage.v ? VARIANTS[stage.v] : null;
  let ok = null;
  if (stage.steps) {
    const k = stage.step || 0;
    if (id === stage.steps[k]) ok = { fn: k === stage.steps.length - 1 ? v.win : v.part, last: k === stage.steps.length - 1 };
  } else if (v) { if (id === v.correct) ok = { fn: v.win, last: true }; }
  else if (stage.combo) { if (id === stage.correct) ok = { fn: CRAFT[stage.hazard][id], last: true }; }
  else if (stage.alts) { const r = rule(stage.hazard, id, flags); if (r) ok = { fn: r.win, sets: r.sets, last: true }; }
  else if (id === hz.correct) ok = { fn: hz.win, last: true };
  const sid = v ? stage.v : stage.hazard;
  if (ok) return { ok: true, last: ok.last, sets: ok.sets, sid, run: (ctx) => ok.fn.call(hz, ctx) };
  const blk = stage.alts && BLOCK[stage.hazard] && BLOCK[stage.hazard][id];
  if (blk && flags[blk.flag]) return { ok: false, sid: blk.sid, type: firstType(hz), run: (ctx) => blk.fail.call(hz, ctx) };
  const vf = v && ((v.fails && v.fails[id]) || v.failAll);
  const type = hz.wrong[id] || (XFAIL[stage.hazard] && XFAIL[stage.hazard][id]) || firstType(hz);
  return { ok: false, sid, type, run: (ctx) => (vf ? vf.call(hz, ctx, id) : hz.fails[type].call(hz, ctx)) };
}
// the item a stage wants right now (hints, test bot); chains and inventory use their solution instead
export function wanted(stage, flags = {}) {
  if (stage.steps) return stage.steps[stage.step || 0];
  if (stage.v) return VARIANTS[stage.v].correct;
  if (stage.combo) return stage.correct;
  if (stage.alts) return (stage.options || []).find((o) => rule(stage.hazard, o, flags)) || HAZARDS[stage.hazard].correct;
  return HAZARDS[stage.hazard].correct;
}

// ================================================================ the puzzle sets
// Combo stages: four cards that pair into two recipes, only one of which saves him.
export const COMBOS = {
  cold: { cards: ['candle', 'bottle', 'ice', 'fan'], teach: ['candle', 'bottle', 'ice'], out: 'lantern' },
  desert: { cards: ['ice', 'fan', 'plank', 'rope'], out: 'cooler' },
  dino: { cards: ['umbrella', 'fan', 'candle', 'bottle'], out: 'glider' },
  flood: { cards: ['plank', 'rope', 'magnet', 'anchor'], out: 'raft' },
  avalanche: { cards: ['skateboard', 'rocket', 'umbrella', 'fan'], out: 'jetboard' },
  moon: { cards: ['rope', 'magnet', 'skateboard', 'rocket'], out: 'grabber' },
};
// Chains: one bag for all stages, each item once. Exactly one order of picks gets him through (checked by a test).
export const CHAINS = [
  { id: 'c0', stages: ['bomb', 'lava'], bag: ['water', 'scissors', 'hammer'] },
  { id: 'c1', stages: ['thiefbone', 'thief'], bag: ['whistle', 'drumstick', 'cat', 'candle'] },
  { id: 'c2', stages: ['quicksand', 'piranha', 'blackhole'], bag: ['rope', 'plank', 'surfboard', 'anchor'] },
  { id: 'c3', stages: ['fire', 'bomb', 'lava'], bag: ['extinguisher', 'water', 'scissors', 'fan'] },
  { id: 'c4', stages: ['electric', 'ghost'], bag: ['breaker', 'extinguisher', 'vacuum', 'candle'] },
  { id: 'c5', stages: ['moon', 'lightning'], bag: ['boots', 'anchor', 'balloon', 'kite'] },
  { id: 'c6', stages: ['vampsun', 'alien'], bag: ['mirror', 'scissors', 'garlic', 'magnet'] },
];
// Inventory puzzles: three dangers, four items. Exactly one assignment saves everyone (checked by a test).
export const INV_SETS = [
  { id: 'v1', hz: ['shark', 'bear', 'desert'], items: ['steak', 'honey', 'bottle', 'banana'] },
  { id: 'v2', hz: ['fire', 'bomb', 'lava'], items: ['extinguisher', 'water', 'scissors', 'fan'] },
  { id: 'v3', hz: ['quicksand', 'piranha', 'blackhole'], items: ['rope', 'plank', 'surfboard', 'anchor'] },
  { id: 'v4', hz: ['moon', 'lightning', 'piranha'], items: ['boots', 'anchor', 'plank', 'kite'] },
  { id: 'v5', hz: ['bomb', 'witch', 'blackhole'], items: ['water', 'scissors', 'rope', 'plank'] },
  { id: 'v6', hz: ['vampsun', 'alien', 'vampire'], items: ['mirror', 'scissors', 'garlic', 'teddy'] },
  { id: 'v7', hz: ['fire', 'electric', 'bomb'], items: ['extinguisher', 'water', 'scissors', 'fan'] },
  { id: 'v8', hz: ['bomb', 'witch', 'fire'], items: ['water', 'extinguisher', 'scissors', 'gasoline'] },
];
// Levels per kind; the first entry of each is its teaching level. Clue entries name a danger in its
// normal state or a clue variant; two-step entries name variants; combo entries name danger scenes.
export const PZ_LEVELS = {
  clue: [['bear', 'bear~asleep'], ['ghost~cry', 'ghost', 'meteor~tiny'], ['thief', 'thief~bone', 'mice~robot'], ['meteor', 'bear~asleep', 'meteor~tiny'], ['lion~thorn', 'zombie', 'zombie~vegan'], ['alien', 'alien~peace', 'lion~thorn'], ['mice~robot', 'ghost~cry', 'thief~bone'], ['zombie~vegan', 'alien~peace', 'lion']],
  two: [['cold~ice'], ['flood~tied', 'mice~hole'], ['dragon~hungry', 'carsink~belt'], ['oxygen~tether', 'cold~ice'], ['mice~hole', 'dragon~hungry'], ['carsink~belt', 'flood~tied']],
  combo: [['cold*'], ['desert'], ['dino', 'flood'], ['avalanche'], ['moon', 'desert'], ['flood', 'avalanche'], ['dino', 'moon']],
  chain: CHAINS.map((c) => c.id),
  inv: INV_SETS.map((s) => s.id),
};
// base dangers a level entry needs (so a puzzle only comes once its dangers have been met)
export function hazardsOf(kind, entry) {
  if (kind === 'chain') return CHAINS.find((c) => c.id === entry).stages;
  if (kind === 'inv') return INV_SETS.find((s) => s.id === entry).hz;
  return entry.map((e) => e.replace('*', '').split('~')[0]);
}

// ================================================================ brute force (tests and hints)
// every winning order of picks for a chain: [[item per stage], ...]
export function solveChain(chain) {
  const wins = [];
  const go = (k, bag, flags, path) => {
    if (k === chain.stages.length) { wins.push(path); return; }
    for (const it of bag) {
      const r = rule(chain.stages[k], it, flags);
      if (r) go(k + 1, bag.filter((x) => x !== it), r.sets ? { ...flags, [r.sets]: 1 } : flags, [...path, it]);
    }
  };
  go(0, chain.bag, {}, []);
  return wins;
}
// every assignment of items to the three dangers that saves all of them
export function solveInv(set) {
  const wins = [];
  const go = (k, left, path) => {
    if (k === set.hz.length) { wins.push(path); return; }
    for (const it of left) if (rule(set.hz[k], it)) go(k + 1, left.filter((x) => x !== it), [...path, it]);
  };
  go(0, set.items, []);
  return wins;
}
