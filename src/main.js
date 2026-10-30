// Not a Fake Ad: Choices — the "pick the right item to save him" puzzles from the ads, made playable.
// Each level is one to three dangers in a row. For each, tap the one item (of two or three) that saves
// the hero before the bar runs out. Wrong picks end the way the ads always end.
import { el, g, place, makeHero, setFace, setArms, paintHero, toolSvg, toolNode, OUTFITS, setOutfit, PETS, setPet } from './art.js';
import { joke } from './jokes.js';
import { showRewarded } from './ads.js';
import { storeLink, openLink } from './promo.js';
import { HAZARDS, HAZARD_IDS } from './hazards.js';
import { sfx, unlockAudio, setMuted } from './audio.js';
import { startMusic, setMusicEnabled } from './music.js';
import { track } from './analytics.js';
import { t, getLang, setLang, applyStatic, sayWord } from './i18n.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'nfa-choices-v1';
const save = (() => {
  const base = { level: 1, coins: 0, hints: 3, seenIntro: 0, muted: false, music: true, stars: {}, outfit: 'classic', owned: ['classic'], daily: { last: '', streak: 0 }, album: {}, ach: {}, endlessBest: 0, dailyCh: '', dailyCount: 0, pet: 'none', pets: ['none'], chests: {}, vibe: true, streak: 0 };
  try { return { ...base, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') }; } catch (e) { return base; }
})();
const writeSave = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* session only */ } };
setMuted(save.muted);
setOutfit(save.outfit);
setPet(save.pet);
const buzz = (ms) => { if (save.vibe && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* not supported */ } };

// Weekly event: changes every Monday, cycles through four twists.
const EVENTS = ['gold', 'speed', 'freehint', 'album'];
let eventId = EVENTS[Math.floor((Date.now() / 864e5 + 3) / 7) % EVENTS.length];
const coinMult = () => (eventId === 'gold' ? 2 : eventId === 'speed' ? 1.5 : 1);
const timeMult = () => (eventId === 'speed' ? 0.8 : 1);
const HINT_PACK = 100;

// ---------------------------------------------------------------- levels
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
// The order the dangers come in. Levels 1-35 each bring one new danger, easiest first; extra stages
// in multi-stage levels reuse dangers already met. After that it's a mix where none of the last ten
// dangers comes back.
const INTRO = ['fire', 'shark', 'bear', 'cold', 'desert', 'thief', 'bees', 'flood', 'ghost', 'bomb', 'dragon', 'vampire', 'gorilla', 'meteor', 'dino', 'lava', 'mice', 'snake', 'tornado', 'zombie', 'lion', 'spider', 'carsink', 'alien', 'boulder', 'airballoon', 'witch', 'robot', 'bull', 'skunk', 'avalanche', 'quicksand', 'tsunami', 'lightning', 'piranha'].filter((id) => HAZARDS[id]);
for (const id of HAZARD_IDS) if (!INTRO.includes(id)) INTRO.push(id);
const stageCount = (n) => (n >= 30 && n % 5 === 0 ? 3 : n >= 12 && n % 3 === 0 ? 2 : 1);
const seqCache = [[]];
const seqRecent = [];
const seqUses = {};
function levelHazards(n) {
  while (seqCache.length <= n) {
    const m = seqCache.length;
    const r = rng(m * 131 + 7);
    const list = [];
    for (let k = 0; k < stageCount(m); k++) {
      let id;
      if (k === 0 && m <= INTRO.length) id = INTRO[m - 1];
      else {
        const pool = (m <= INTRO.length ? INTRO.slice(0, m) : HAZARD_IDS).filter((h) => !list.includes(h));
        const fresh = pool.filter((h) => !seqRecent.slice(-10).includes(h));
        const from0 = fresh.length ? fresh : pool;
        const least = Math.min(...from0.map((h) => seqUses[h] || 0));
        const from = from0.filter((h) => (seqUses[h] || 0) <= least + 1);
        id = from[Math.floor(r() * from.length)];
      }
      list.push(id);
      seqUses[id] = (seqUses[id] || 0) + 1;
      seqRecent.push(id);
      if (seqRecent.length > 20) seqRecent.shift();
    }
    seqCache.push(list);
  }
  return seqCache[n];
}
export function levelSpec(n) {
  if (n === 0) return { n, stages: [{ hazard: 'lava', options: ['gasoline', 'water'], time: 12 }] };
  const r = rng(n * 7919 + 17);
  const choices = n <= 6 ? 2 : n < 40 ? 3 : 4;
  const time = Math.max(4.5, 10 - n * 0.09);
  const decoy = n < 8 ? 0 : n < 25 ? 0.4 : 0.6;
  const list = levelHazards(n).map((id, k) => {
    const st = makeStage(id, r, choices, time, decoy);
    if (k === 0 && n <= INTRO.length) st.isNew = true;
    const roll = r();
    st.twist = n >= 28 && roll < 0.12 ? 'swap' : n >= 18 && roll < 0.32 ? 'mystery' : null;
    return st;
  });
  return { n, mode: 'level', stages: list };
}
// Silly items that never save anyone; mixed in as wrong answers so the same danger looks different.
const DECOYS = ['teddy', 'broccoli', 'icecream', 'ketchup', 'cheese', 'flower', 'drum', 'paper', 'sponge', 'candle', 'salt', 'clothespin', 'garlic', 'kite'];
const DECOY_SKIP = { cold: ['candle', 'salt'], avalanche: ['salt'], fire: ['sponge'], bomb: ['sponge'], tornado: ['kite'], alien: ['kite'] };
function makeStage(id, r, choices, time, decoy = 0) {
  const hz = HAZARDS[id];
  const wrongs = Object.keys(hz.wrong);
  for (let i = wrongs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [wrongs[i], wrongs[j]] = [wrongs[j], wrongs[i]]; }
  const options = [hz.correct, ...wrongs.slice(0, choices - 1)];
  const pool = DECOYS.filter((d) => d !== hz.correct && !hz.wrong[d] && !(DECOY_SKIP[id] || []).includes(d));
  let swaps = decoy >= 0.5 && choices >= 3 ? 2 : 1;
  for (let i = options.length - 1; i > 0 && swaps > 0; i--) {
    if (r() < decoy && pool.length) {
      options[i] = pool.splice(Math.floor(r() * pool.length), 1)[0];
      swaps--;
    }
  }
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { hazard: id, options, time };
}
// Endless: random dangers, never the same twice in a row, the clock gets shorter every save.
function endlessStage(lv) {
  let id;
  do id = HAZARD_IDS[Math.floor(lv.r() * HAZARD_IDS.length)]; while (id === lv.lastId);
  lv.lastId = id;
  const st = makeStage(id, lv.r, lv.score < 8 ? 3 : 4, Math.max(2.6, 7 - lv.score * 0.18), 0.5);
  const roll = lv.r();
  st.twist = lv.score >= 10 && roll < 0.15 ? 'swap' : lv.score >= 5 && roll < 0.35 ? 'mystery' : null;
  return st;
}
function endlessSpec() {
  const lv = { n: -1, mode: 'endless', stages: [], score: 0, paid: 0, r: rng((Date.now() & 0xffffff) + 1) };
  lv.stages.push(endlessStage(lv));
  return lv;
}
// Daily challenge: the same five dangers for everyone on the same day.
function dailySpec() {
  const d = new Date();
  const r = rng(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
  const ids = HAZARD_IDS.slice();
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return { n: -2, mode: 'daily', stages: ids.slice(0, 5).map((id, k) => makeStage(id, r, k < 3 ? 3 : 4, 6, 0.5)) };
}

// Every distinct fail ending (danger + the way it goes wrong), for the album.
export const ENDINGS = HAZARD_IDS.flatMap((h) => Object.keys(HAZARDS[h].wrong).map((tool) => ({ h, tool, type: HAZARDS[h].wrong[tool], key: h + ':' + tool })));
const albumCoins = () => (eventId === 'album' ? 45 : 15);
// older saves stored one ending per kind of fail; give them the first item of that kind
for (const k of Object.keys(save.album)) {
  if (ENDINGS.some((e) => e.key === k)) continue;
  const [h, type] = k.split(':');
  const e = ENDINGS.find((x) => x.h === h && x.type === type);
  delete save.album[k];
  if (e) save.album[e.key] = 1;
}

// ---------------------------------------------------------------- tweens & particles
let speed = 1;
const tweens = [];
const T = (dur, fn) => new Promise((done) => tweens.push({ t: 0, dur: Math.max(0.001, dur), fn, done }));
const wait = (s) => T(s, () => {});
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const parts = [];
const sceneG = $('scene');
const fxG = $('fx');

function puff(x, y, color, n = 12, spread = 60) {
  for (let i = 0; i < n; i++) {
    const c = el('circle', { r: 6 + Math.random() * 10, fill: color, stroke: '#2b2140', 'stroke-width': 2, opacity: 0.9 });
    fxG.appendChild(c);
    const a = Math.random() * Math.PI * 2;
    parts.push({ node: c, x, y, vx: Math.cos(a) * spread * (0.5 + Math.random()), vy: Math.sin(a) * spread * (0.5 + Math.random()) - 30, life: 0.7 + Math.random() * 0.5, age: 0, grow: 1.5 });
  }
}
function confetti(n = 40) {
  const colors = ['#ffbe2e', '#2f7cf6', '#e8453c', '#2eb872', '#8a78f0'];
  for (let i = 0; i < n; i++) {
    const c = el('rect', { width: 10, height: 6, fill: colors[i % colors.length] });
    fxG.appendChild(c);
    parts.push({ node: c, x: 200 + (Math.random() - 0.5) * 200, y: 120, vx: (Math.random() - 0.5) * 260, vy: -200 - Math.random() * 200, life: 1.6, age: 0, grav: 520, spin: Math.random() * 720 });
  }
}

// ---------------------------------------------------------------- scene helpers handed to the hazards
let hero = null;
let ctx = null;
function say(text) {
  text = sayWord(text);
  const box = g({ class: 'bubble' });
  const w = Math.max(90, text.length * 15 + 30);
  box.innerHTML = `<rect x="${-w / 2}" y="-30" width="${w}" height="44" rx="16" fill="#fff" stroke="#2b2140" stroke-width="4"/><path d="M-8 14 l8 14 l8 -14" fill="#fff" stroke="#2b2140" stroke-width="4" stroke-linejoin="round"/><rect x="-10" y="10" width="20" height="6" fill="#fff"/><text y="2" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="24" fill="#2b2140">${text}</text>`;
  const m = (hero.getAttribute('transform') || '').match(/translate\(([-\d.]+) ([-\d.]+)/);
  const hx = m ? Number(m[1]) : 200;
  const hy = m ? Number(m[2]) : 430;
  place(box, Math.min(330, Math.max(70, hx)), Math.max(50, hy - 190));
  fxG.appendChild(box);
  T(1.6, (k) => { box.style.opacity = k > 0.8 ? (1 - k) * 5 : 1; }).then(() => box.remove());
}
function shake() {
  const s = $('stage');
  s.classList.remove('shaking');
  void s.getBoundingClientRect();
  s.classList.add('shaking');
}
function flash(color) {
  const f = $('flash');
  f.setAttribute('fill', color);
  T(0.35, (k) => f.setAttribute('opacity', (1 - k) * 0.8));
}
function heroXY() {
  const m = (hero.getAttribute('transform') || '').match(/translate\(([-\d.]+) ([-\d.]+)/);
  return m ? [Number(m[1]), Number(m[2])] : [200, 430];
}
function makeCtx(layer) {
  return {
    layer, hero, T, wait, sfx,
    tool(id, x, y, s = 0.6) {
      const n = g({}, '');
      const inner = toolNode(id);
      inner.setAttribute('transform', 'translate(-50 -50)');
      n.appendChild(inner);
      place(n, x, y, 0, s);
      fxG.appendChild(n);
      return n;
    },
    puff, say, shake, flash,
    t: () => stageT,
    notes(x, y) {
      for (let i = 0; i < 6; i++) {
        const n = el('text', { 'font-size': 30, 'font-weight': 800, fill: '#2b2140', 'text-anchor': 'middle' });
        n.textContent = i % 2 ? '♪' : '♫';
        fxG.appendChild(n);
        parts.push({ node: n, x: x + i * 6, y, vx: 30 + Math.random() * 50, vy: -50 - Math.random() * 30, life: 1.2, age: -i * 0.15 });
      }
    },
    pour(x, y) {
      const b = this.tool('water', x - 50, y - 40, 0.7);
      T(0.3, (k) => place(b, x - 50, y - 40, -k * 70, 0.7));
      for (let i = 0; i < 14; i++) {
        const d = el('path', { d: 'M0 -10 q8 12 0 16 q-8 -4 0 -16 Z', fill: '#5aaef0', stroke: '#2b2140', 'stroke-width': 2 });
        fxG.appendChild(d);
        parts.push({ node: d, x: x - 10 + Math.random() * 30, y: y - 20, vx: (Math.random() - 0.3) * 40, vy: 60 + Math.random() * 60, life: 0.9, age: -i * 0.04, grav: 500 });
      }
      sfx.splash();
      T(1, () => {}).then(() => b.remove());
    },
    spray(x1, y1, x2, y2, color) {
      const e = this.tool('extinguisher', x1, y1, 0.7);
      for (let i = 0; i < 26; i++) {
        const c = el('circle', { r: 8 + Math.random() * 8, fill: color, stroke: '#2b2140', 'stroke-width': 2 });
        fxG.appendChild(c);
        parts.push({ node: c, x: x1 + 20, y: y1 - 20, vx: (x2 - x1) * (1.2 + Math.random() * 0.6), vy: (y2 - y1) * (1.2 + Math.random() * 0.6) + (Math.random() - 0.5) * 80, life: 0.8, age: -i * 0.03, grow: 1.8 });
      }
      sfx.whoosh();
      T(1.2, () => {}).then(() => e.remove());
    },
    boom(x, y) {
      sfx.bigBoom(); shake(); flash('#ffbe2e');
      puff(x, y, '#ff8a2e', 18, 140); puff(x, y, '#ffd34d', 12, 100); puff(x, y, '#5a4a4a', 10, 80);
      const t = el('text', { x, y: y - 60, 'text-anchor': 'middle', 'font-family': 'Baloo 2, sans-serif', 'font-weight': 800, 'font-size': 64, fill: '#ffbe2e', stroke: '#2b2140', 'stroke-width': 8, 'paint-order': 'stroke' });
      t.textContent = 'BOOM!';
      fxG.appendChild(t);
      T(0.9, (k) => { t.setAttribute('opacity', 1 - k); t.setAttribute('font-size', 64 + k * 30); }).then(() => t.remove());
    },
    burn() {
      paintHero(hero, 'burnt'); setFace(hero, 'hurt'); setArms(hero, 'up');
      const [x, y] = heroXY();
      puff(x, y - 150, '#5a5a62', 10, 40); sfx.boom(); say('POF!');
    },
    freeze() {
      paintHero(hero, 'frozen'); setFace(hero, 'hurt'); sfx.freeze();
      hero.fx.innerHTML = '<rect x="-46" y="-160" width="92" height="166" rx="12" fill="#bfeaff" opacity="0.55" stroke="#2b2140" stroke-width="4"/><path d="M-30 -140 l20 10 M10 -100 l24 -8" stroke="#fff" stroke-width="5"/>';
      say('BRRR!');
    },
    sting() {
      setFace(hero, 'hurt');
      hero.fx.innerHTML = [[-14, -128], [12, -110], [-4, -98], [20, -132], [-20, -60], [18, -70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff6f5e" stroke="#2b2140" stroke-width="2"/>`).join('');
      hero.head.setAttribute('transform', 'translate(0 -118) scale(1.25) translate(0 118)');
      say('AUU!');
    },
    faint() {
      setFace(hero, 'hurt'); setArms(hero, 'down');
      hero.fx.innerHTML = '<g transform="translate(0 -158)">' + [0, 120, 240].map((a) => `<path transform="rotate(${a}) translate(30 0)" d="M0 -9 l3 6 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 Z" fill="#ffd34d" stroke="#2b2140" stroke-width="2"/>`).join('') + '</g>';
    },
    splash(x, y) { sfx.splash(); puff(x, y, '#7fd3ff', 16, 90); paintHero(hero, 'wet'); setFace(hero, 'hurt'); },
    bubbles(x, y) { for (let i = 0; i < 6; i++) setTimeout(() => puff(x + (Math.random() - 0.5) * 30, y - i * 10, '#bfeaff', 2, 20), i * 120); },
    heart(x, y) {
      const h = g({}, '<path d="M0 10 C-30 -14 -14 -36 0 -20 C14 -36 30 -14 0 10 Z" fill="#ff6f9e" stroke="#2b2140" stroke-width="4"/>');
      fxG.appendChild(h);
      T(1, (k) => place(h, x, y - k * 60, 0, 1 + k * 0.4)).then(() => h.remove());
    },
  };
}

// ---------------------------------------------------------------- level flow
let level = null;
let stageIdx = 0;
let stageT = 0;
let stage = null;
let state = 'home'; // home | choose | acting | won | lost
let gen = 0;
let introAd = false;
let taunt = '';
let paused = false;
let pendingChest = 0;
let run = { fracs: [], hint: false, revived: false };

function startLevel(n, spec) {
  gen++;
  tweens.length = 0;
  level = spec || levelSpec(n);
  stageIdx = 0;
  run = { fracs: [], hint: false, revived: false };
  paused = false;
  showScreen(null);
  $('hud').hidden = false;
  $('bottom').hidden = false;
  $('stamp').hidden = true;
  const ts = t('taunts');
  $('taunt').textContent = n < 0 ? ts[0] : ts[(n * 5) % ts.length].replace('{n}', n);
  updateCoins();
  updateHints();
  buildStage();
  track('level_start', { level: n });
}

function buildStage(quiet = false) {
  stage = level.stages[stageIdx];
  const hz = HAZARDS[stage.hazard];
  sceneG.innerHTML = '';
  fxG.innerHTML = '';
  parts.length = 0;
  const layer = g({});
  layer.innerHTML = hz.bg();
  sceneG.appendChild(layer);
  hero = makeHero();
  layer.appendChild(hero);
  ctx = makeCtx(layer);
  hz.setup(ctx);
  stageT = 0;
  stage.time = stage.baseTime ? stage.baseTime * timeMult() : (stage.baseTime = stage.time) * timeMult();
  state = 'choose';
  levelChip();
  // choices
  const box = $('choices');
  box.innerHTML = '';
  stage.options.forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.dataset.tool = id;
    b.innerHTML = toolSvg(id);
    b.addEventListener('click', () => pick(id, b));
    box.appendChild(b);
  });
  $('timer').classList.remove('low');
  twistDone = false;
  if (stage.twist === 'mystery' && !quiet) {
    const cards = [...box.children];
    const b = cards[(level.n * 3 + stageIdx * 5 + (level.score || 0)) % cards.length];
    b.classList.add('mystery');
    b.innerHTML = '<span class="q">?</span>';
  }
  if (level.n === 1 && stageIdx === 0 && !introAd && !quiet) say(t('quick'));
  else if (stage.isNew && !quiet && !introAd) say(t('new.hazard'));
  else if (stage.twist && !quiet) say(t('twist.' + stage.twist));
}

// Mid-stage twists: the hidden card shows itself, or two cards trade places.
let twistDone = false;
function runTwist() {
  twistDone = true;
  const box = $('choices');
  if (stage.twist === 'mystery') {
    const b = box.querySelector('.mystery');
    if (!b) return;
    b.classList.remove('mystery');
    b.innerHTML = toolSvg(b.dataset.tool);
    b.classList.add('reveal');
    sfx.pop();
  } else if (stage.twist === 'swap') {
    const cards = [...box.children];
    if (cards.length < 2) return;
    const i = (level.n + stageIdx + (level.score || 0)) % cards.length;
    const j = (i + 1 + ((level.n || level.score || 0) % (cards.length - 1))) % cards.length;
    const a = cards[i], b = cards[j];
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const mark = document.createElement('span');
    box.insertBefore(mark, a);
    box.insertBefore(a, b);
    box.insertBefore(b, mark);
    mark.remove();
    for (const [el2, from] of [[a, ra], [b, rb]]) {
      const to = el2.getBoundingClientRect();
      el2.style.transition = 'none';
      el2.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
      void el2.offsetWidth;
      el2.style.transition = 'transform 0.35s cubic-bezier(.3,1.4,.5,1)';
      el2.style.transform = '';
    }
    sfx.whoosh();
  }
}

async function pick(id, btn) {
  if (state !== 'choose' || (introAd && !btn.dataset.auto)) return;
  unlockAudio();
  state = 'acting';
  const my = gen;
  const hz = HAZARDS[stage.hazard];
  for (const b of $('choices').children) { b.disabled = true; if (b !== btn) b.classList.add('dim'); }
  btn.classList.add('picked');
  sfx.tap();
  buzz(12);
  // the item flies up from its card to the hero
  const [hx, hy] = heroXY();
  const flying = ctx.tool(id, 200, 560, 0.5);
  await T(0.35, (k) => place(flying, 200 + (hx + 40 - 200) * ease(k), 560 + (hy - 130 - 560) * ease(k) - Math.sin(k * Math.PI) * 40, k * 360, 0.5 + k * 0.1));
  flying.remove();
  if (my !== gen) return;
  if (id === hz.correct) {
    run.fracs.push(Math.max(0, 1 - stageT / stage.time));
    await hz.win(ctx);
    if (my !== gen) return;
    setFace(hero, 'happy');
    setArms(hero, 'up');
    sfx.win();
    confetti(30);
    stamp(t('saved'), true);
    await T(1.1, (k) => setArms(hero, 'up', Math.sin(k * Math.PI * 6) * 14));
    if (my !== gen) return;
    $('stamp').hidden = true;
    stageIdx++;
    if (level.mode === 'endless') {
      level.score++;
      level.stages.push(endlessStage(level));
    }
    if (stageIdx < level.stages.length) buildStage();
    else won();
  } else {
    const type = hz.wrong[id] || Object.values(hz.wrong)[0];
    const key = stage.hazard + ':' + id;
    const fresh = !introAd && !save.album[key] && ENDINGS.some((e) => e.key === key);
    if (fresh) { save.album[key] = 1; save.coins += albumCoins(); writeSave(); }
    buzz(60);
    await hz.fails[type].call(hz, ctx);
    if (my !== gen) return;
    lost(type, fresh, id);
  }
}

function stamp(text, good) {
  const s = $('stamp');
  s.textContent = text;
  s.className = 'stamp' + (good ? ' good' : '');
  s.hidden = false;
  s.style.animation = 'none';
  void s.offsetWidth;
  s.style.animation = '';
}

async function lost(type, fresh = false, tool = '') {
  if (level.mode === 'level' && level.n > 0 && !introAd) { save.streak = 0; writeSave(); }
  buzz([90, 60, 90]);
  state = 'lost';
  const my = gen;
  sfx.lose();
  stamp('FAIL', false);
  track('level_fail', { level: level.n, hazard: stage.hazard, type });
  await wait(1.2);
  if (my !== gen) return;
  if (introAd) {
    introAd = false;
    $('ad-ribbon').hidden = true;
    showScreen('screen-intro');
    return;
  }
  $('lost-line').textContent = (tool && joke(stage.hazard, tool, getLang())) || t('fail.' + type);
  $('btn-revive').hidden = level.n === 0 || run.revived;
  $('lost-new').hidden = !fresh;
  $('lost-new').textContent = t('album.new', { c: albumCoins() });
  const sc = $('lost-score');
  sc.hidden = level.mode !== 'endless';
  if (level.mode === 'endless') {
    const best = level.score > save.endlessBest;
    save.endlessBest = Math.max(save.endlessBest, level.score);
    save.coins += Math.round((level.score - level.paid) * 3 * coinMult());
    level.paid = level.score;
    writeSave();
    sc.textContent = (best ? t('endless.best') + ' ' : '') + t('endless.score', { n: level.score, b: save.endlessBest });
    track('endless_end', { score: level.score });
  }
  updateCoins();
  showScreen('screen-lost');
}

async function won() {
  state = 'won';
  const my = gen;
  const avg = run.fracs.reduce((a, b) => a + b, 0) / Math.max(1, run.fracs.length);
  let stars = avg >= 0.5 ? 3 : avg >= 0.25 ? 2 : 1;
  if (run.hint) stars = Math.min(stars, 2);
  if (run.revived) stars = 1;
  const today = dayKey(new Date());
  const dailyFirst = level.mode === 'daily' && save.dailyCh !== today;
  const reward = Math.round((level.mode === 'daily' ? (dailyFirst ? 100 : 0) : level.n === 0 ? 20 : 10 + Math.floor(level.n * 1.5) + stars * 5) * (level.n === 0 ? 1 : coinMult()));
  let streakPct = 0;
  if (level.mode === 'level' && level.n > 0) { save.streak = (save.streak || 0) + 1; streakPct = Math.min(50, (save.streak - 1) * 10); }
  const bonus = Math.round(reward * streakPct / 100);
  pendingChest = level.n > 0 && level.n % 10 === 0 && !save.chests[level.n] ? level.n : 0;
  if (dailyFirst) { save.dailyCh = today; save.dailyCount++; save.hints++; }
  save.coins += reward + bonus;
  if (level.n > 0) {
    save.level = Math.max(save.level, level.n + 1);
    save.stars[level.n] = Math.max(save.stars[level.n] || 0, stars);
  }
  writeSave();
  track('level_win', { level: level.n });
  await wait(0.3);
  if (my !== gen) return;
  const daily = level.mode === 'daily';
  $('won-title').textContent = daily ? t('daily.won') : level.n === 0 ? t('intro.won') : t('won.title', { n: level.n });
  $('won-line').textContent = daily ? (dailyFirst ? t('daily.reward') : t('daily.again')) : level.n === 0 ? t('won.line') : t('won.stars' + stars);
  $('btn-next').textContent = daily ? t('home') : t('next');
  $('btn-won-home').hidden = daily;
  buzz(25);
  $('won-coins').textContent = '+' + (reward + bonus);
  $('won-streak').hidden = streakPct <= 0;
  $('won-streak').textContent = t('won.streak', { n: save.streak, p: streakPct });
  updateCoins();
  const box = $('won-stars');
  box.hidden = level.n <= 0;
  box.innerHTML = [0, 1, 2].map(() => `<svg class="star" viewBox="0 0 50 50"><path d="M25 3 l6.5 14 15 1.6 -11.3 10 3.3 14.8 L25 35.8 11.5 43.4 14.8 28.6 3.5 18.6 l15 -1.6 Z"/></svg>`).join('');
  showScreen('screen-won');
  for (let i = 0; i < stars && level.n > 0 && !daily; i++) {
    await wait(0.25);
    if (my !== gen) return;
    box.children[i].classList.add('on', 'pop');
    sfx.coin();
  }
}

// ---------------------------------------------------------------- the "ad" intro: the guy picks wrong
async function startIntro() {
  startLevel(0);
  const my = gen;
  introAd = true;
  $('ad-ribbon').hidden = false;
  $('hud-level').textContent = t('intro.hud');
  $('taunt').textContent = t('intro.taunt');
  await wait(1.2);
  const btns = [...$('choices').children];
  const right = btns.find((b) => b.dataset.tool === 'water');
  const wrong = btns.find((b) => b.dataset.tool !== 'water');
  const f = $('finger');
  const at = (b) => { const r = b.getBoundingClientRect(); f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + r.height / 2 + 'px'; };
  f.hidden = false;
  at(right);
  await wait(0.9);
  at(wrong);
  await wait(0.8);
  if (my !== gen) return;
  f.hidden = true;
  wrong.dataset.auto = '1';
  pick(wrong.dataset.tool, wrong);
}

// ---------------------------------------------------------------- UI
function levelChip() {
  if (!level) return;
  let txt = introAd ? t('intro.hud') : level.mode === 'endless' ? `${t('endless')} · ${level.score}` : level.mode === 'daily' ? t('daily.ch') : level.n === 0 ? t('intro.real') : t('level', { n: level.n });
  if (level.stages.length > 1 && level.mode !== 'endless') txt += ' · ' + t('stage', { a: stageIdx + 1, b: level.stages.length });
  $('hud-level').textContent = txt;
}
const screens = ['screen-chest', 'screen-album', 'screen-ach', 'screen-home', 'screen-won', 'screen-lost', 'screen-intro', 'screen-shop', 'screen-hintbuy', 'screen-settings', 'screen-daily'];
function showScreen(id) { for (const s of screens) $(s).hidden = s !== id; }
function updateCoins() { $('hud-coins').textContent = save.coins; $('home-coins').textContent = save.coins; }
function updateHints() { $('hint-count').textContent = eventId === 'freehint' ? '∞' : save.hints > 0 ? save.hints : '+'; }
function goHome() {
  gen++;
  state = 'home';
  introAd = false;
  $('hud').hidden = true;
  $('stamp').hidden = true;
  $('ad-ribbon').hidden = true;
  $('finger').hidden = true;
  $('btn-play').textContent = t('play', { n: save.level });
  updateCoins();
  // a scene behind the menu
  level = levelSpec(save.level);
  stageIdx = 0;
  buildStage(true);
  state = 'home';
  $('bottom').hidden = true;
  $('choices').innerHTML = '';
  showScreen('screen-home');
  renderMap();
  $('shop-badge').hidden = !OUTFITS.some((o) => !save.owned.includes(o.id) && o.price <= save.coins);
  $('event-chip').textContent = t('event.' + eventId);
  $('dailych-badge').hidden = save.dailyCh === dayKey(new Date()) || !save.seenIntro;
  $('btn-dailych').classList.toggle('done', save.dailyCh === dayKey(new Date()));
  $('ach-badge').hidden = !ACH.some((a) => !save.ach[a.id] && achValue(a) >= a.goal);
  if (save.seenIntro && dailyReady()) openDaily();
  else {
    for (let n = 10; n < save.level; n += 10) if (!save.chests[n]) { pendingChest = n; openChestScreen(() => goHome()); break; }
  }
}

// fail album
const HZ_ICON = { lava: '🌋', shark: '🦈', bees: '🐝', fire: '🔥', bear: '🐻', ghost: '👻', cold: '❄️', flood: '🌊', bomb: '💣', thief: '🦹', dragon: '🐉', vampire: '🧛', desert: '🏜️', meteor: '☄️', dino: '🦖', snake: '🐍', alien: '🛸', tornado: '🌪️', carsink: '🚗', airballoon: '🎈', boulder: '🪨', spider: '🕷️', mice: '🐭', zombie: '🧟', lion: '🦁', gorilla: '🦍', witch: '🧙', robot: '🤖', bull: '🐂', avalanche: '🏔️', quicksand: '⏳', tsunami: '🌊', skunk: '🦨', lightning: '⚡', piranha: '🐟' };
const albumCount = () => ENDINGS.filter((e) => save.album[e.key]).length;
function renderAlbum() {
  const got = albumCount();
  $('album-count').textContent = `${got}/${ENDINGS.length}`;
  $('album-bar').style.width = (got / ENDINGS.length) * 100 + '%';
  $('album-joke').textContent = t('album.help');
  $('album-list').innerHTML = HAZARD_IDS.map((h) => `<div class="alb-row"><span class="hz" style="font-size:28px;line-height:34px;text-align:center">${HZ_ICON[h] || '?'}</span><div class="slots">${ENDINGS.filter((e) => e.h === h).map((e) => `<button type="button" class="slot ${save.album[e.key] ? 'got' : ''}" data-key="${e.key}">${save.album[e.key] ? toolSvg(e.tool, 30) : '?'}</button>`).join('')}</div></div>`).join('');
  for (const b of $('album-list').querySelectorAll('.slot')) b.addEventListener('click', () => {
    const e = ENDINGS.find((x) => x.key === b.dataset.key);
    $('album-joke').textContent = save.album[e.key] ? joke(e.h, e.tool, getLang()) : t('album.unknown');
    sfx.tap();
  });
}

// awards
const ACH = [];
const tiers = (kind, goals, coins) => goals.forEach((g, i) => ACH.push({ id: kind + g, kind, goal: g, coins: coins[i] }));
tiers('lv', [10, 25, 50, 100], [50, 100, 200, 400]);
tiers('stars', [30, 90, 240], [60, 150, 300]);
tiers('perfect', [10, 40], [80, 250]);
tiers('album', [10, 30, 50, ENDINGS.length], [50, 150, 300, 600]);
tiers('endless', [10, 25, 50], [50, 120, 250]);
tiers('daily', [3, 7, 30], [60, 150, 500]);
tiers('outfits', [3, 8], [80, 300]);
function achValue(a) {
  const st = Object.values(save.stars);
  switch (a.kind) {
    case 'lv': return save.level - 1;
    case 'stars': return st.reduce((x, y) => x + y, 0);
    case 'perfect': return st.filter((x) => x >= 3).length;
    case 'album': return albumCount();
    case 'endless': return save.endlessBest;
    case 'daily': return save.dailyCount;
    case 'outfits': return save.owned.length;
    default: return 0;
  }
}
function renderAch() {
  $('ach-coins').textContent = save.coins;
  const order = ACH.slice().sort((a, b) => (!!save.ach[a.id] - !!save.ach[b.id]) || (achValue(b) >= b.goal) - (achValue(a) >= a.goal));
  $('ach-list').innerHTML = order.map((a) => {
    const v = Math.min(a.goal, achValue(a));
    const done = save.ach[a.id];
    const ready = !done && v >= a.goal;
    return `<div class="ach ${done ? 'done' : ''}"><b>${t('ach.' + a.kind, { g: a.goal })}</b><small>${v}/${a.goal} · <span class="coin-icon" style="display:inline-block;width:12px;height:12px;vertical-align:-1px"></span> ${a.coins}</small><div class="progress"><i style="width:${(v / a.goal) * 100}%"></i></div>${ready ? `<button type="button" class="btn btn-gold" data-id="${a.id}">${t('ach.claim')}</button>` : done ? `<span style="grid-row:1/span 3;grid-column:2;font-weight:800">✓</span>` : ''}</div>`;
  }).join('');
  for (const b of $('ach-list').querySelectorAll('button[data-id]')) b.addEventListener('click', () => {
    const a = ACH.find((x) => x.id === b.dataset.id);
    save.ach[a.id] = 1;
    save.coins += a.coins;
    writeSave(); updateCoins(); sfx.buy();
    track('ach_claim', { id: a.id });
    renderAch();
  });
}

// level path on the home screen
function renderMap() {
  const cur = save.level;
  const start = Math.max(1, cur - 2);
  let html = '';
  for (let n = start; n < start + 5; n++) {
    const cls = n < cur ? 'done' : n === cur ? 'now' : 'lock';
    const st = save.stars[n] || 0;
    const multi = levelSpec(n).stages.length;
    const chest = n % 10 === 0 && !save.chests[n] ? '<span class="chest">🎁</span>' : '';
    html += `<div class="node ${cls}">${chest || (multi > 1 ? `<span class="boss">×${multi}</span>` : '')}<b>${n}</b><i>${n < cur ? '★'.repeat(st) + '☆'.repeat(3 - st) : ''}</i></div>`;
  }
  $('map').innerHTML = html;
}

// shop
function heroPreview(o, p) {
  const h = makeHero(o, p);
  setArms(h, 'down');
  return `<svg viewBox="-62 -200 124 210" aria-hidden="true">${h.outerHTML}</svg>`;
}
function renderShop() {
  $('shop-coins').textContent = save.coins;
  $('btn-buy-hints').textContent = t('shop.buyhints', { p: HINT_PACK });
  $('shop-grid').innerHTML = OUTFITS.map((o) => {
    const own = save.owned.includes(o.id);
    const on = save.outfit === o.id;
    const price = on ? t('shop.wearing') : own ? t('shop.owned') : `<span class="coin-icon"></span>${o.price}`;
    return `<button type="button" class="outfit ${on ? 'on' : ''} ${own ? '' : 'locked'}" data-id="${o.id}">${heroPreview(o)}<span class="name">${t('outfit.' + o.id)}</span><span class="price">${price}</span></button>`;
  }).join('');
  for (const b of $('shop-grid').children) b.addEventListener('click', () => buyOutfit(b.dataset.id, b));
  const cur = OUTFITS.find((o) => o.id === save.outfit) || OUTFITS[0];
  $('pet-grid').innerHTML = PETS.map((p) => {
    const own = save.pets.includes(p.id);
    const on = save.pet === p.id;
    const price = on ? t('shop.wearing') : own ? t('shop.owned') : `<span class="coin-icon"></span>${p.price}`;
    return `<button type="button" class="outfit ${on ? 'on' : ''} ${own ? '' : 'locked'}" data-id="${p.id}">${heroPreview(cur, p)}<span class="name">${t('pet.' + p.id)}</span><span class="price">${price}</span></button>`;
  }).join('');
  for (const b of $('pet-grid').children) b.addEventListener('click', () => buyPet(b.dataset.id, b));
}
function buyPet(id, btn) {
  const p = PETS.find((x) => x.id === id);
  if (!save.pets.includes(id)) {
    if (save.coins < p.price) { sfx.lose(); btn.querySelector('.price').textContent = t('shop.poor'); return; }
    save.coins -= p.price;
    save.pets.push(id);
    sfx.buy();
    track('pet_buy', { id });
  } else sfx.tap();
  save.pet = id;
  setPet(id);
  writeSave(); updateCoins(); renderShop();
}
function buyOutfit(id, btn) {
  const o = OUTFITS.find((x) => x.id === id);
  if (!save.owned.includes(id)) {
    if (save.coins < o.price) {
      sfx.lose();
      btn.querySelector('.price').textContent = t('shop.poor');
      return;
    }
    save.coins -= o.price;
    save.owned.push(id);
    sfx.buy();
    track('outfit_buy', { id });
  } else sfx.tap();
  save.outfit = id;
  setOutfit(id);
  writeSave();
  updateCoins();
  renderShop();
}
function buyHints(back) {
  if (save.coins < HINT_PACK) { sfx.lose(); return false; }
  save.coins -= HINT_PACK;
  save.hints += 3;
  sfx.buy();
  writeSave(); updateCoins(); updateHints();
  return true;
}
async function adHint() {
  const ok = await showRewarded('hint');
  if (!ok) return false;
  save.hints += 1;
  writeSave(); updateHints(); sfx.coin();
  return true;
}

// daily reward: a 7 day streak, the last day pays the most
const DAILY = [{ c: 20 }, { c: 30 }, { c: 40 }, { c: 60 }, { c: 80 }, { c: 100 }, { c: 150, h: 3 }];
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dailyReady = () => save.daily.last !== dayKey(new Date());
function dailyIndex() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return save.daily.last === dayKey(y) ? save.daily.streak % 7 : 0;
}
function openDaily() {
  const idx = dailyIndex();
  $('daily-row').innerHTML = DAILY.map((r, i) => `<div class="day ${i < idx ? 'got' : ''} ${i === idx ? 'today' : ''} ${i === 6 ? 'big' : ''}">${t('daily.day', { n: i + 1 })}<b><span class="coin-icon"></span>${r.c}${r.h ? ' +' + r.h + '💡' : ''}</b></div>`).join('');
  showScreen('screen-daily');
}
function claimDaily() {
  const idx = dailyIndex();
  const r = DAILY[idx];
  save.coins += r.c;
  save.hints += r.h || 0;
  save.daily = { last: dayKey(new Date()), streak: idx + 1 };
  writeSave();
  sfx.win();
  track('daily_claim', { day: idx + 1 });
  goHome();
}

// settings
function renderSettings() {
  $('tg-sound').setAttribute('aria-checked', String(!save.muted));
  $('tg-music').setAttribute('aria-checked', String(save.music));
  $('tg-vibe').setAttribute('aria-checked', String(save.vibe));
  $('btn-lang').textContent = getLang() === 'tr' ? 'Türkçe' : 'English';
}
const on = (id, fn) => $(id).addEventListener('click', (e) => { e.stopPropagation(); unlockAudio(); fn(); });
on('btn-play', () => { sfx.tap(); if (!save.seenIntro && save.level <= 1) startIntro(); else startLevel(save.level); });
on('btn-intro-go', () => { sfx.tap(); save.seenIntro = 1; writeSave(); startLevel(0); });
const afterWin = (home) => { if (home || level.mode === 'daily') goHome(); else startLevel(level.n === 0 ? 1 : level.n + 1); };
let chestThen = null;
function openChestScreen(then) {
  chestThen = then;
  $('chest-icon').classList.remove('open');
  $('chest-icon').textContent = '🎁';
  $('chest-reward').hidden = true;
  $('btn-chest').textContent = t('chest.open');
  $('chest-title').textContent = t('chest.title', { n: pendingChest });
  showScreen('screen-chest');
}
on('btn-chest', () => {
  if (pendingChest) {
    const n = pendingChest;
    const c = 100 + n * 3;
    save.coins += c; save.hints += 2; save.chests[n] = 1; pendingChest = 0;
    writeSave(); updateCoins(); updateHints();
    sfx.win(); buzz([30, 40, 30]); confetti(40);
    $('chest-icon').textContent = '💰';
    $('chest-icon').classList.add('open');
    $('chest-reward').textContent = t('chest.reward', { c, h: 2 });
    $('chest-reward').hidden = false;
    $('btn-chest').textContent = t('chest.go');
    track('chest_open', { level: n });
    return;
  }
  sfx.tap();
  const f = chestThen; chestThen = null;
  if (f) f();
});
on('btn-next', () => { sfx.tap(); if (pendingChest) openChestScreen(() => afterWin(false)); else afterWin(false); });
on('btn-won-home', () => { sfx.tap(); if (pendingChest) openChestScreen(() => afterWin(true)); else afterWin(true); });
on('btn-retry', () => { sfx.tap(); if (level.mode === 'endless') startLevel(-1, endlessSpec()); else if (level.mode === 'daily') startLevel(-2, dailySpec()); else startLevel(level.n); });
on('btn-endless', () => { sfx.tap(); startLevel(-1, endlessSpec()); });
on('btn-dailych', () => { sfx.tap(); startLevel(-2, dailySpec()); });
on('btn-album', () => { sfx.tap(); renderAlbum(); showScreen('screen-album'); });
on('btn-album-close', () => { sfx.tap(); goHome(); });
on('btn-ach', () => { sfx.tap(); renderAch(); showScreen('screen-ach'); });
on('btn-ach-close', () => { sfx.tap(); goHome(); });
on('promo-nfa', () => { track('promo_click', { game: 'notafakead' }); openLink(storeLink('notafakead')); });
on('promo-tower', () => { track('promo_click', { game: 'tower' }); openLink(storeLink('tower')); });
on('btn-lost-home', () => { sfx.tap(); goHome(); });
on('btn-home', () => { if (state === 'acting' || introAd || paused) return; sfx.tap(); goHome(); });
on('btn-hint', () => {
  if (state !== 'choose' || introAd) return;
  if (save.hints <= 0 && eventId !== 'freehint') {
    paused = true;
    $('btn-hb-buy').textContent = t('shop.buyhints', { p: HINT_PACK });
    showScreen('screen-hintbuy');
    return;
  }
  useHint();
});
function useHint() {
  if (state !== 'choose' || (save.hints <= 0 && eventId !== 'freehint')) return;
  const b = [...$('choices').children].find((x) => x.dataset.tool === HAZARDS[stage.hazard].correct);
  if (!b || b.classList.contains('hint')) return;
  if (eventId !== 'freehint') save.hints--;
  run.hint = true;
  writeSave();
  updateHints();
  b.classList.add('hint');
  sfx.tap();
}
on('btn-lang', () => { setLang(getLang() === 'tr' ? 'en' : 'tr'); sfx.tap(); renderSettings(); });
on('btn-settings', () => { sfx.tap(); renderSettings(); showScreen('screen-settings'); });
on('btn-settings-close', () => { sfx.tap(); goHome(); });
on('tg-sound', () => { save.muted = !save.muted; setMuted(save.muted); writeSave(); renderSettings(); sfx.tap(); });
on('tg-vibe', () => { save.vibe = !save.vibe; writeSave(); renderSettings(); buzz(30); sfx.tap(); });
on('tg-music', () => { save.music = !save.music; setMusicEnabled(save.music); if (save.music) startMusic(); writeSave(); renderSettings(); sfx.tap(); });
on('btn-shop', () => { sfx.tap(); renderShop(); showScreen('screen-shop'); });
on('btn-shop-close', () => { sfx.tap(); goHome(); });
on('btn-buy-hints', () => { if (buyHints()) renderShop(); });
on('btn-ad-hint', async () => { if (await adHint()) renderShop(); });
on('btn-daily', () => claimDaily());
const closeHintBuy = () => { showScreen(null); paused = false; };
on('btn-hb-close', () => { sfx.tap(); closeHintBuy(); });
on('btn-hb-buy', () => { if (buyHints()) { closeHintBuy(); useHint(); } });
on('btn-hb-ad', async () => { if (await adHint()) { closeHintBuy(); useHint(); } });
on('btn-revive', async () => {
  if (run.revived || state !== 'lost') return;
  const ok = await showRewarded('revive');
  if (!ok || state !== 'lost') return;
  run.revived = true;
  gen++;
  tweens.length = 0;
  showScreen(null);
  $('stamp').hidden = true;
  buildStage();
  track('revive', { level: level.n });
});
window.addEventListener('pointerdown', () => { unlockAudio(); if (save.music) startMusic(); }, { capture: true });
setMusicEnabled(save.music);

// ---------------------------------------------------------------- loop
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000) * speed;
  last = now;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t += dt;
    const k = Math.min(1, tw.t / tw.dur);
    tw.fn(k);
    if (k >= 1) { tweens.splice(i, 1); tw.done(); }
  }
  if (stage && !paused && (state === 'choose' || state === 'home')) {
    stageT += dt;
    const hz = HAZARDS[stage.hazard];
    if (hz.idle && ctx) hz.idle(ctx, state === 'home' ? Math.min(stageT, 3) : stageT);
    if (state === 'choose') {
      const left = Math.max(0, 1 - stageT / stage.time);
      $('timer').firstElementChild.style.transform = `scaleX(${left})`;
      $('timer').classList.toggle('low', left < 0.3);
      if (stage.twist && !twistDone && left < 0.55) runTwist();
      if (left <= 0) timeUp();
    }
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.age += dt;
    if (p.age < 0) { p.node.setAttribute('opacity', 0); continue; }
    p.vy += (p.grav || 0) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const k = p.age / p.life;
    const s = 1 + (p.grow ? k * p.grow : 0);
    p.node.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${((p.spin || 0) * p.age).toFixed(1)}) scale(${s.toFixed(2)})`);
    p.node.setAttribute('opacity', Math.max(0, 1 - k).toFixed(2));
    if (k >= 1) { p.node.remove(); parts.splice(i, 1); }
  }
  requestAnimationFrame(frame);
}

async function timeUp() {
  if (state !== 'choose') return;
  state = 'acting';
  const my = gen;
  for (const b of $('choices').children) { b.disabled = true; b.classList.add('dim'); }
  const hz = HAZARDS[stage.hazard];
  const firstWrong = Object.values(hz.wrong)[0];
  say(t('tooslow'));
  await hz.fails[firstWrong].call(hz, ctx);
  if (my !== gen) return;
  lost('time');
}

applyStatic();
goHome();
requestAnimationFrame(frame);
track('session_start');

// test hooks (headless bot)
window.__choices = {
  get state() { return state; },
  get level() { return level; },
  get stage() { return stage; },
  get save() { return save; },
  setEvent: (e) => { eventId = e; updateHints(); },
  goHome: () => goHome(),
  setSpeed: (s) => (speed = s),
  start: (n) => startLevel(n),
  endless: () => startLevel(-1, endlessSpec()),
  daily: () => startLevel(-2, dailySpec()),
  endings: ENDINGS,
  spec: (n) => levelSpec(n),
  pickCorrect: () => { const b = [...$('choices').children].find((x) => x.dataset.tool === HAZARDS[stage.hazard].correct); b && pick(b.dataset.tool, b); },
  hazardIds: HAZARD_IDS,
  optionsFor: (id) => [HAZARDS[id].correct, ...Object.keys(HAZARDS[id].wrong)],
  pickTool: (id) => { const b = [...$('choices').children].find((x) => x.dataset.tool === id); b && pick(id, b); },
  pickWrong: () => { const b = [...$('choices').children].find((x) => x.dataset.tool !== HAZARDS[stage.hazard].correct); b && pick(b.dataset.tool, b); },
  showHazard: (id) => { gen++; $('bottom').hidden = false; $('stamp').hidden = true; fxG.innerHTML = ''; level = { n: 1, stages: [{ hazard: id, options: [HAZARDS[id].correct, ...Object.keys(HAZARDS[id].wrong)], time: 99 }] }; stageIdx = 0; showScreen(null); $('hud').hidden = false; buildStage(); },
};
