// 2D cartoon art for Not a Fake Ad: Choices, drawn as SVG so it stays crisp on every phone.
// The hero, his moods and the tool icons the player picks from.
export const NS = 'http://www.w3.org/2000/svg';
const INK = '#2b2140';

// Builds an SVG element. attrs: plain object; kids: element or markup string.
export function el(tag, attrs = {}, kids = []) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  for (const k of [].concat(kids)) {
    if (typeof k === 'string') e.insertAdjacentHTML('beforeend', k);
    else if (k) e.appendChild(k);
  }
  return e;
}
export function g(attrs = {}, markup = '') {
  const e = el('g', attrs);
  if (markup) e.innerHTML = markup;
  return e;
}

// Position / rotation / scale of a group, all in one transform.
export function place(node, x, y, rot = 0, sx = 1, sy = sx) {
  node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
}

// ------------------------------------------------------------------ the hero
// Origin at his feet. About 140 units tall. Colours come from CSS variables so moods can
// repaint him (burnt, frozen) without rebuilding.
const HERO = `
  <g class="h-legs">
    <rect x="-17" y="-44" width="13" height="44" rx="6" fill="var(--pants)" stroke="${INK}" stroke-width="4"/>
    <rect x="4" y="-44" width="13" height="44" rx="6" fill="var(--pants)" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="-11" cy="-2" rx="11" ry="6" fill="${INK}"/>
    <ellipse cx="11" cy="-2" rx="11" ry="6" fill="${INK}"/>
  </g>
  <g class="h-arm-l"><rect x="-8" y="-4" width="14" height="40" rx="7" fill="var(--shirt)" stroke="${INK}" stroke-width="4"/><circle cx="-1" cy="38" r="8" fill="var(--skin)" stroke="${INK}" stroke-width="4"/></g>
  <g class="h-arm-r"><rect x="-6" y="-4" width="14" height="40" rx="7" fill="var(--shirt)" stroke="${INK}" stroke-width="4"/><circle cx="1" cy="38" r="8" fill="var(--skin)" stroke="${INK}" stroke-width="4"/></g>
  <rect x="-26" y="-92" width="52" height="54" rx="18" fill="var(--shirt)" stroke="${INK}" stroke-width="4"/>
  <path d="M-10 -92 L0 -80 L10 -92" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <g class="h-head">
    <circle cx="0" cy="-118" r="28" fill="var(--skin)" stroke="${INK}" stroke-width="4"/>
    <path class="h-hair" d="M-27 -122 C-30 -150 -4 -156 4 -148 C10 -158 34 -150 28 -124 C20 -136 4 -138 -6 -132 C-14 -138 -22 -134 -27 -122 Z" fill="var(--hair)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <g class="h-face"></g>
    <g class="h-hat"></g>
  </g>
  <g class="h-fx"></g>
`;

const FACES = {
  idle: `<circle cx="-10" cy="-116" r="4" fill="${INK}"/><circle cx="10" cy="-116" r="4" fill="${INK}"/>
         <path d="M-9 -103 Q0 -96 9 -103" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  scared: `<ellipse cx="-10" cy="-117" rx="6" ry="7" fill="#fff" stroke="${INK}" stroke-width="3"/><ellipse cx="10" cy="-117" rx="6" ry="7" fill="#fff" stroke="${INK}" stroke-width="3"/>
           <circle cx="-10" cy="-116" r="2.5" fill="${INK}"/><circle cx="10" cy="-116" r="2.5" fill="${INK}"/>
           <path d="M-17 -129 L-5 -126 M17 -129 L5 -126" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
           <ellipse cx="0" cy="-100" rx="6" ry="8" fill="${INK}"/>
           <path d="M26 -128 q5 8 0 12 q-5 -4 0 -12 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="2"/>`,
  happy: `<path d="M-15 -116 q5 -7 10 0 M5 -116 q5 -7 10 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
          <path d="M-13 -106 Q0 -88 13 -106 Z" fill="#e8453c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  hurt: `<path d="M-15 -121 l9 9 m0 -9 l-9 9 M6 -121 l9 9 m0 -9 l-9 9" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
         <path d="M-10 -100 q5 -5 10 0 q5 5 10 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
};

// Outfits from the shop: colours plus an optional hat drawn on the head (head centre 0,-118, radius 28).
const H = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
export const OUTFITS = [
  { id: 'classic', price: 0, shirt: '#2f7cf6', pants: '#23366b', hair: '#6b3f22', hat: '' },
  { id: 'sporty', price: 150, shirt: '#e8453c', pants: '#2b2b38', hair: '#2b1a10', hat: `<path d="M-28 -132 C-28 -160 28 -160 28 -132 Z" fill="#e8453c" ${H}/><path d="M18 -134 h30 q4 6 -4 8 h-26 Z" fill="#e8453c" ${H}/>` },
  { id: 'farmer', price: 300, shirt: '#2eb872', pants: '#3a6bd0', hair: '#c9893b', hat: `<ellipse cx="0" cy="-138" rx="46" ry="9" fill="#ffd34d" ${H}/><path d="M-22 -138 C-22 -166 22 -166 22 -138 Z" fill="#ffd34d" ${H}/><path d="M-22 -146 h44" stroke="#e8453c" stroke-width="6"/>` },
  { id: 'chef', price: 500, shirt: '#f6f6f6', pants: '#2b2b38', hair: '#2b1a10', hat: `<rect x="-20" y="-160" width="40" height="22" fill="#fff" ${H}/><circle cx="-14" cy="-166" r="13" fill="#fff" ${H}/><circle cx="14" cy="-166" r="13" fill="#fff" ${H}/><circle cx="0" cy="-174" r="14" fill="#fff" ${H}/><rect x="-18" y="-158" width="36" height="12" fill="#fff"/>` },
  { id: 'cowboy', price: 800, shirt: '#c9893b', pants: '#3a5a8a', hair: '#6b3f22', hat: `<path d="M-50 -140 q50 16 100 0 q-6 10 -20 12 h-60 q-14 -2 -20 -12 Z" fill="#8a5a32" ${H}/><path d="M-24 -136 C-28 -170 -8 -166 0 -158 C8 -166 28 -170 24 -136 Z" fill="#8a5a32" ${H}/><path d="M-24 -142 h48" stroke="${INK}" stroke-width="5"/>` },
  { id: 'pirate', price: 1200, shirt: '#f6f6f6', pants: '#2b2b38', hair: '#2b1a10', hat: `<path d="M-30 -130 C-28 -156 28 -156 30 -130 Z" fill="#e8453c" ${H}/><circle cx="-6" cy="-142" r="4" fill="#fff"/><circle cx="8" cy="-144" r="4" fill="#fff"/><path d="M28 -132 l14 4 l-10 10 Z" fill="#e8453c" ${H}/><path d="M-22 -126 L22 -110" stroke="${INK}" stroke-width="3"/><ellipse cx="10" cy="-116" rx="8" ry="7" fill="${INK}"/>` },
  { id: 'astro', price: 2000, shirt: '#e6ecf4', pants: '#c8d2e0', hair: '#6b3f22', hat: `<circle cx="0" cy="-118" r="38" fill="#bfeaff" opacity="0.35" ${H}/><path d="M-20 -146 q10 -6 20 -4" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="-6" y="-166" width="12" height="12" rx="3" fill="#e8453c" ${H}/>` },
  { id: 'king', price: 3500, shirt: '#8a78f0', pants: '#4b3a8a', hair: '#ffd34d', hat: `<path d="M-24 -138 L-26 -168 L-12 -152 L0 -172 L12 -152 L26 -168 L24 -138 Z" fill="#ffbe2e" ${H}/><circle cx="0" cy="-150" r="4" fill="#e8453c"/>` },
];
// Pets stand beside the hero (or sit on his shoulder) and go wherever he goes.
export const PETS = [
  { id: 'none', price: 0, art: '' },
  { id: 'chick', price: 250, art: `<g transform="translate(46 0)"><path d="M-6 0 v-6 M6 0 v-6" stroke="${INK}" stroke-width="3"/><circle cy="-18" r="14" fill="#ffd34d" ${H}/><circle cx="-5" cy="-21" r="2.5" fill="${INK}"/><path d="M-13 -17 l-7 3 l7 2 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="2"/><path d="M4 -32 q2 -8 8 -6" fill="none" stroke="${INK}" stroke-width="3"/></g>` },
  { id: 'dog', price: 400, art: '<g transform="translate(26 -44) scale(0.46)" class="pet-tool" data-tool="dog"></g>' },
  { id: 'cat', price: 400, art: '<g transform="translate(26 -44) scale(0.46)" class="pet-tool" data-tool="cat"></g>' },
  { id: 'parrot', price: 700, art: `<g transform="translate(30 -96)"><path d="M6 6 q10 18 4 30" fill="none" stroke="#2f7cf6" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="11" ry="14" fill="#e8453c" ${H}/><circle cx="2" cy="-14" r="9" fill="#e8453c" ${H}/><path d="M-6 -14 q-8 2 -4 8 l4 -3 Z" fill="#ffd34d" stroke="${INK}" stroke-width="2"/><circle cx="1" cy="-16" r="2" fill="${INK}"/><path d="M4 -2 q8 4 6 12" fill="none" stroke="#2eb872" stroke-width="5" stroke-linecap="round"/></g>` },
];
let pet = PETS[0];
export function setPet(id) { pet = PETS.find((p) => p.id === id) || PETS[0]; }

let outfit = OUTFITS[0];
export function setOutfit(id) { outfit = OUTFITS.find((o) => o.id === id) || OUTFITS[0]; }

export function makeHero(o = outfit, p = pet) {
  const h = g({ class: 'hero', style: `--skin:#ffd2b0;--shirt:${o.shirt};--pants:${o.pants};--hair:${o.hair}` }, HERO);
  if (p && p.art) {
    const pg = g({ class: 'h-pet' }, p.art);
    for (const t of pg.querySelectorAll('.pet-tool')) t.innerHTML = TOOLS[t.dataset.tool];
    if (p.id === 'parrot') h.appendChild(pg); else h.insertBefore(pg, h.firstChild);
  }
  h.outfit = o;
  h.querySelector('.h-hat').innerHTML = o.hat;
  h.arms = [h.querySelector('.h-arm-l'), h.querySelector('.h-arm-r')];
  h.face = h.querySelector('.h-face');
  h.fx = h.querySelector('.h-fx');
  h.head = h.querySelector('.h-head');
  setArms(h, 'down');
  setFace(h, 'idle');
  return h;
}

export function setFace(h, mood) {
  h.face.innerHTML = FACES[mood] || FACES.idle;
  h.mood = mood;
}

// down | up (panic / cheer) | hold (holding something in front)
export function setArms(h, pose, wave = 0) {
  const [l, r] = h.arms;
  if (pose === 'up') {
    place(l, -26, -86, 150 + wave, 1);
    place(r, 26, -86, -150 - wave, 1);
  } else if (pose === 'hold') {
    place(l, -26, -86, 70, 1);
    place(r, 26, -86, -70, 1);
  } else {
    place(l, -26, -86, 12 + wave, 1);
    place(r, 26, -86, -12 - wave, 1);
  }
}

// Repaints for burnt / frozen / stung looks.
export function paintHero(h, look) {
  const s = h.style;
  if (look === 'burnt') { s.setProperty('--skin', '#4a3a3a'); s.setProperty('--shirt', '#2a2a30'); s.setProperty('--pants', '#1a1a20'); s.setProperty('--hair', '#111'); }
  else if (look === 'frozen') { s.setProperty('--skin', '#bfe6ff'); s.setProperty('--shirt', '#8fc4f0'); s.setProperty('--pants', '#6a9cc8'); s.setProperty('--hair', '#e6f6ff'); }
  else if (look === 'wet') { s.setProperty('--hair', '#3a2412'); s.setProperty('--shirt', '#1d5bc4'); }
  else { const o = h.outfit || OUTFITS[0]; s.setProperty('--skin', '#ffd2b0'); s.setProperty('--shirt', o.shirt); s.setProperty('--pants', o.pants); s.setProperty('--hair', o.hair); }
}

// ------------------------------------------------------------------ tool icons (100 x 100)
const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
export const TOOLS = {
  water: `<path d="M22 34 h56 l-8 54 h-40 Z" fill="#9aa6b8" ${S}/><path d="M28 34 q22 -26 44 0" fill="none" ${S}/><path d="M26 44 h48" stroke="#5aaef0" stroke-width="10"/><path d="M50 8 q10 14 0 20 q-10 -6 0 -20 Z" fill="#5aaef0" ${S}/>`,
  extinguisher: `<rect x="34" y="28" width="32" height="62" rx="12" fill="#e8453c" ${S}/><rect x="40" y="16" width="20" height="14" rx="4" fill="#2b2140"/><path d="M58 20 h22 l6 10" fill="none" ${S}/><rect x="38" y="50" width="24" height="16" rx="3" fill="#fff" stroke="${INK}" stroke-width="3"/>`,
  gasoline: `<path d="M24 30 h46 l10 10 v48 h-56 Z" fill="#e8453c" ${S}/><path d="M66 30 l10 -16 h10" fill="none" ${S}/><path d="M36 50 l24 24 m0 -24 l-24 24" stroke="#ffbe2e" stroke-width="7"/>`,
  sword: `<path d="M50 8 l9 12 v48 h-18 v-48 Z" fill="#dfe6ef" ${S}/><rect x="30" y="66" width="40" height="9" rx="4" fill="#ffbe2e" ${S}/><rect x="45" y="75" width="10" height="17" rx="3" fill="#6b3f22" ${S}/>`,
  steak: `<path d="M18 52 C18 26 60 18 78 34 C92 46 84 74 62 80 C40 86 18 76 18 52 Z" fill="#c9443a" ${S}/><path d="M34 46 q14 -10 30 0 M32 60 q16 -8 34 2" fill="none" stroke="#f6c8b0" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="44" r="7" fill="#f6efe0" ${S}/>`,
  banana: `<path d="M20 30 C24 72 62 86 84 66 C70 70 44 64 34 26 Z" fill="#ffd34d" ${S}/><path d="M18 30 l6 -8" ${S}/>`,
  rod: `<path d="M16 88 L80 14" ${S}/><path d="M80 14 q8 30 -4 46" fill="none" stroke="${INK}" stroke-width="3"/><path d="M76 60 q-6 8 2 10" fill="none" ${S}/><circle cx="28" cy="74" r="8" fill="#9aa6b8" ${S}/>`,
  torch: `<path d="M44 46 h12 l-2 46 h-8 Z" fill="#8a5a32" ${S}/><path d="M50 10 C34 26 36 46 50 48 C64 46 66 26 50 10 Z" fill="#ff8a2e" ${S}/><path d="M50 26 C44 34 44 42 50 44 C56 42 56 34 50 26 Z" fill="#ffd34d"/><circle cx="70" cy="18" r="7" fill="#c8c8d0"/><circle cx="80" cy="10" r="5" fill="#c8c8d0"/>`,
  honey: `<path d="M26 40 h48 v40 q0 10 -10 10 h-28 q-10 0 -10 -10 Z" fill="#ffbe2e" ${S}/><rect x="28" y="26" width="44" height="14" rx="4" fill="#c9893b" ${S}/><rect x="36" y="54" width="28" height="18" rx="4" fill="#fff6d0" stroke="${INK}" stroke-width="3"/><path d="M60 26 q4 -12 14 -8" fill="none" stroke="#c9893b" stroke-width="5"/>`,
  stick: `<path d="M18 86 L82 16" stroke="#8a5a32" stroke-width="12" stroke-linecap="round"/><path d="M18 86 L82 16" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="0"/><path d="M56 44 l14 4" ${S}/>`,
  fan: `<circle cx="50" cy="42" r="30" fill="#fff" ${S}/><path d="M50 42 C40 22 56 16 58 30 Z M50 42 C70 44 70 60 56 56 Z M50 42 C36 54 26 44 36 36 Z" fill="#7fd3ff" stroke="${INK}" stroke-width="3"/><path d="M50 72 v14 M34 90 h32" ${S}/>`,
  drum: `<ellipse cx="50" cy="40" rx="32" ry="12" fill="#fff" ${S}/><path d="M18 40 v34 q32 18 64 0 v-34" fill="#e8453c" ${S}/><path d="M24 12 l18 22 M76 12 l-18 22" ${S}/>`,
  broccoli: `<path d="M44 60 h12 l4 30 h-20 Z" fill="#9adf6a" ${S}/><circle cx="36" cy="44" r="16" fill="#2eb872" ${S}/><circle cx="64" cy="44" r="16" fill="#2eb872" ${S}/><circle cx="50" cy="28" r="18" fill="#2eb872" ${S}/>`,
  vacuum: `<rect x="20" y="52" width="40" height="30" rx="12" fill="#8a5cf0" ${S}/><circle cx="30" cy="84" r="6" fill="${INK}"/><circle cx="52" cy="84" r="6" fill="${INK}"/><path d="M56 56 q20 -10 18 -40 l12 -4" fill="none" ${S}/>`,
  candle: `<rect x="38" y="40" width="24" height="48" rx="4" fill="#fff6d0" ${S}/><path d="M50 14 C42 24 44 34 50 36 C56 34 58 24 50 14 Z" fill="#ffbe2e" ${S}/>`,
  teddy: `<circle cx="32" cy="24" r="10" fill="#b5835a" ${S}/><circle cx="68" cy="24" r="10" fill="#b5835a" ${S}/><circle cx="50" cy="38" r="22" fill="#b5835a" ${S}/><ellipse cx="50" cy="74" rx="26" ry="20" fill="#b5835a" ${S}/><circle cx="43" cy="36" r="3" fill="${INK}"/><circle cx="57" cy="36" r="3" fill="${INK}"/><ellipse cx="50" cy="45" rx="7" ry="5" fill="#e8c9a6" stroke="${INK}" stroke-width="3"/>`,
  campfire: `<path d="M20 84 l60 -14 M20 70 l60 14" stroke="#8a5a32" stroke-width="10" stroke-linecap="round"/><path d="M50 16 C30 36 32 66 50 70 C68 66 70 36 50 16 Z" fill="#ff8a2e" ${S}/><path d="M50 40 C42 50 42 62 50 64 C58 62 58 50 50 40 Z" fill="#ffd34d"/>`,
  icecream: `<path d="M34 50 l16 42 l16 -42 Z" fill="#e0a868" ${S}/><circle cx="40" cy="40" r="14" fill="#ff9ac8" ${S}/><circle cx="60" cy="40" r="14" fill="#9adff0" ${S}/><circle cx="50" cy="24" r="14" fill="#fff6d0" ${S}/>`,
  ring: `<circle cx="50" cy="50" r="34" fill="#ff6f5e" ${S}/><circle cx="50" cy="50" r="15" fill="#bfe0ff" ${S}/><path d="M50 16 v10 M50 74 v10 M16 50 h10 M74 50 h10" stroke="#fff" stroke-width="9"/>`,
  anchor: `<circle cx="50" cy="18" r="9" fill="none" ${S}/><path d="M50 27 v58 M34 40 h32 M20 62 q4 26 30 24 q26 2 30 -24" fill="none" ${S}/><path d="M14 66 l6 -8 l8 6 M86 66 l-6 -8 l-8 6" fill="none" ${S}/>`,
  sponge: `<rect x="18" y="30" width="64" height="44" rx="8" fill="#ffd34d" ${S}/><circle cx="36" cy="46" r="5" fill="#e0a83a"/><circle cx="60" cy="56" r="6" fill="#e0a83a"/><circle cx="48" cy="62" r="3" fill="#e0a83a"/><path d="M18 30 h64 v10 h-64 Z" fill="#2eb872" ${S}/>`,
  scissors: `<circle cx="30" cy="72" r="12" fill="none" ${S}/><circle cx="70" cy="72" r="12" fill="none" ${S}/><path d="M38 62 L66 14 M62 62 L34 14" ${S}/>`,
  hammer: `<rect x="22" y="14" width="56" height="22" rx="5" fill="#9aa6b8" ${S}/><rect x="44" y="36" width="12" height="54" rx="4" fill="#8a5a32" ${S}/>`,
  match: `<path d="M30 84 L70 30" stroke="#e8c9a6" stroke-width="10" stroke-linecap="round"/><circle cx="72" cy="26" r="9" fill="#e8453c" ${S}/><path d="M74 6 C66 14 68 20 74 22 C80 20 82 14 74 6 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="3"/>`,
  dog: `<ellipse cx="50" cy="66" rx="28" ry="18" fill="#c9893b" ${S}/><circle cx="68" cy="40" r="16" fill="#c9893b" ${S}/><path d="M60 26 l-6 -14 l12 8 Z" fill="#8a5a32" ${S}/><circle cx="72" cy="38" r="3" fill="${INK}"/><circle cx="83" cy="44" r="4" fill="${INK}"/><path d="M28 82 v10 M70 82 v10 M22 60 l-10 -8" ${S}/>`,
  cat: `<ellipse cx="46" cy="68" rx="24" ry="18" fill="#9aa6b8" ${S}/><circle cx="64" cy="42" r="15" fill="#9aa6b8" ${S}/><path d="M54 32 l2 -14 l8 10 M70 30 l6 -12 l2 14" fill="#9aa6b8" ${S}/><circle cx="60" cy="42" r="2.5" fill="${INK}"/><circle cx="70" cy="42" r="2.5" fill="${INK}"/><path d="M22 66 q-14 -10 -6 -28" fill="none" ${S}/>`,
  shield: `<path d="M50 10 L84 22 V48 C84 70 68 84 50 92 C32 84 16 70 16 48 V22 Z" fill="#6a7f9e" ${S}/><path d="M50 22 L72 30 V48 C72 62 62 72 50 78 C38 72 28 62 28 48 V30 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="3"/>`,
  paper: `<path d="M26 12 h36 l14 14 v62 h-50 Z" fill="#fff" ${S}/><path d="M62 12 v14 h14" fill="none" ${S}/><path d="M34 44 h32 M34 56 h32 M34 68 h22" stroke="#9aa6b8" stroke-width="4"/>`,
  garlic: `<path d="M50 14 C40 30 22 40 24 62 C26 84 74 84 76 62 C78 40 60 30 50 14 Z" fill="#fff6e8" ${S}/><path d="M50 22 C46 40 44 60 48 82 M50 22 C56 40 58 60 54 82" fill="none" stroke="#d9c8a8" stroke-width="4"/>`,
  ketchup: `<path d="M34 34 h32 l4 54 h-40 Z" fill="#e8453c" ${S}/><path d="M42 34 v-12 h16 v12" fill="#fff" ${S}/><path d="M46 22 l4 -12 l4 12" fill="#fff" ${S}/><circle cx="50" cy="60" r="10" fill="#fff6d0" stroke="${INK}" stroke-width="3"/>`,
  bottle: `<path d="M38 30 h24 v8 q10 6 10 18 v32 h-44 v-32 q0 -12 10 -18 Z" fill="#7fd3ff" ${S}/><rect x="40" y="14" width="20" height="14" rx="3" fill="#2f7cf6" ${S}/><path d="M30 60 h40" stroke="#fff" stroke-width="6" opacity="0.7"/>`,
  salt: `<path d="M32 34 h36 l-4 56 h-28 Z" fill="#fff" ${S}/><path d="M32 34 q18 -26 36 0 Z" fill="#9aa6b8" ${S}/><circle cx="44" cy="24" r="2" fill="${INK}"/><circle cx="56" cy="24" r="2" fill="${INK}"/><text x="50" y="72" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="${INK}">S</text>`,
  rocket: `<path d="M50 8 C68 24 68 54 62 70 H38 C32 54 32 24 50 8 Z" fill="#fff" ${S}/><circle cx="50" cy="38" r="8" fill="#7fd3ff" ${S}/><path d="M38 56 l-14 18 h14 M62 56 l14 18 h-14" fill="#e8453c" ${S}/><path d="M42 72 l8 18 l8 -18 Z" fill="#ff8a2e" ${S}/>`,
  umbrella: `<path d="M12 50 Q50 0 88 50 Q78 42 69 50 Q59 42 50 50 Q41 42 31 50 Q22 42 12 50 Z" fill="#e8453c" ${S}/><path d="M50 50 v32 q0 8 -9 8 q-7 0 -7 -8" fill="none" ${S}/>`,
  parachute: `<path d="M10 44 Q50 -6 90 44 Z" fill="#ffbe2e" ${S}/><path d="M30 44 Q50 10 70 44" fill="none" stroke="#e8453c" stroke-width="6"/><path d="M10 44 L44 80 M90 44 L56 80 M50 44 V80" stroke="${INK}" stroke-width="3"/><rect x="40" y="78" width="20" height="14" rx="4" fill="#8a5a32" ${S}/>`,
  skateboard: `<rect x="12" y="50" width="76" height="12" rx="6" fill="#ff6f5e" ${S}/><circle cx="28" cy="72" r="8" fill="#fff" ${S}/><circle cx="72" cy="72" r="8" fill="#fff" ${S}/>`,
  drumstick: `<path d="M30 30 C46 10 80 22 74 46 C70 62 54 66 44 58 Z" fill="#c9893b" ${S}/><path d="M44 58 L26 78" stroke="#f6efe0" stroke-width="9" stroke-linecap="round"/><circle cx="22" cy="82" r="6" fill="#f6efe0" ${S}/>`,
  ice: `<path d="M24 40 L50 24 L76 40 V70 L50 86 L24 70 Z" fill="#bfeaff" ${S}/><path d="M24 40 L50 56 L76 40 M50 56 V86" fill="none" stroke="#fff" stroke-width="4"/>`,
  magnet: `<path d="M20 20 h20 v34 a10 10 0 0 0 20 0 v-34 h20 v34 a30 30 0 0 1 -60 0 Z" fill="#e8453c" ${S}/><rect x="20" y="20" width="20" height="14" fill="#dfe6ef" stroke="${INK}" stroke-width="4"/><rect x="60" y="20" width="20" height="14" fill="#dfe6ef" stroke="${INK}" stroke-width="4"/>`,
  balloon: `<ellipse cx="50" cy="38" rx="26" ry="30" fill="#ff6f5e" ${S}/><path d="M50 68 l-5 8 h10 Z" fill="#ff6f5e" ${S}/><path d="M50 76 q-10 10 0 18" fill="none" stroke="${INK}" stroke-width="3"/><ellipse cx="40" cy="28" rx="6" ry="9" fill="#fff" opacity="0.6"/>`,
  mirror: `<ellipse cx="50" cy="40" rx="26" ry="30" fill="#bfeaff" ${S}/><path d="M38 28 l20 -8 M36 42 l26 -10" stroke="#fff" stroke-width="5"/><rect x="45" y="70" width="10" height="22" rx="3" fill="#8a5a32" ${S}/>`,
  flute: `<path d="M14 80 L80 18" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M14 80 L80 18" stroke="#c9893b" stroke-width="13" stroke-linecap="round"/><circle cx="36" cy="60" r="3.5" fill="${INK}"/><circle cx="48" cy="49" r="3.5" fill="${INK}"/><circle cx="60" cy="38" r="3.5" fill="${INK}"/><path d="M80 10 q8 -4 10 4 M86 26 q8 0 6 8" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  kite: `<path d="M50 8 L80 40 L50 72 L20 40 Z" fill="#8a78f0" ${S}/><path d="M50 8 V72 M20 40 H80" stroke="${INK}" stroke-width="3"/><path d="M50 72 q-10 8 0 14 q10 6 -2 12" fill="none" stroke="${INK}" stroke-width="3"/><path d="M44 82 l-6 -2 l2 6 Z M52 92 l6 -2 l-2 6 Z" fill="#ffbe2e" stroke="${INK}" stroke-width="2"/>`,
  broom: `<path d="M72 10 L46 58" stroke="#c9893b" stroke-width="9" stroke-linecap="round"/><path d="M34 52 L58 66 L44 92 Q28 92 16 80 Z" fill="#ffd34d" ${S}/><path d="M38 56 l-12 26 M46 61 l-10 28 M53 64 l-6 26" stroke="#c98a00" stroke-width="3"/>`,
  cheese: `<path d="M14 70 L80 32 L86 66 L14 78 Z" fill="#ffd34d" ${S}/><path d="M14 70 L80 32 L58 26 Z" fill="#ffe680" ${S}/><circle cx="44" cy="64" r="5" fill="#e0b030"/><circle cx="66" cy="58" r="4" fill="#e0b030"/><circle cx="74" cy="44" r="3" fill="#e0b030"/>`,
  brain: `<path d="M22 56 C12 40 24 22 40 26 C46 14 66 16 70 28 C86 28 92 48 80 58 C84 72 66 82 56 74 C48 84 28 80 30 68 C20 68 16 60 22 56 Z" fill="#ff9ac8" ${S}/><path d="M50 26 v48 M34 42 q8 4 4 12 M64 40 q-8 6 -2 14 M38 64 q6 -4 12 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  yarn: `<circle cx="48" cy="50" r="30" fill="#ff6f5e" ${S}/><path d="M24 36 q24 10 48 -6 M20 52 q28 12 56 -8 M26 68 q22 8 44 -6 M40 22 q-10 30 4 58" fill="none" stroke="#c9443a" stroke-width="3"/><path d="M76 62 q14 10 4 26" fill="none" ${S}/>`,
  flower: `<path d="M50 52 V92" stroke="#2eb872" stroke-width="6"/><path d="M50 74 q14 -12 22 -4 q-10 10 -22 4 Z" fill="#2eb872" ${S}/><g fill="#ff9ac8" stroke="${INK}" stroke-width="4"><circle cx="50" cy="22" r="11"/><circle cx="68" cy="36" r="11"/><circle cx="60" cy="56" r="11"/><circle cx="40" cy="56" r="11"/><circle cx="32" cy="36" r="11"/></g><circle cx="50" cy="40" r="10" fill="#ffd34d" ${S}/>`,
  cape: `<path d="M18 18 H82" stroke="#8a5a32" stroke-width="8" stroke-linecap="round"/><path d="M24 20 H76 L84 88 Q50 76 16 88 Z" fill="#e8453c" ${S}/><path d="M36 24 L32 80 M64 24 L68 80" stroke="#b02a22" stroke-width="4"/>`,
  skis: `<path d="M14 84 L74 14 q8 -8 12 0" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M14 84 L74 14 q8 -8 12 0" fill="none" stroke="#2f7cf6" stroke-width="6" stroke-linecap="round"/><path d="M32 90 L90 30 q6 -8 10 0" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M32 90 L90 30 q6 -8 10 0" fill="none" stroke="#e8453c" stroke-width="6" stroke-linecap="round"/>`,
  rope: `<ellipse cx="46" cy="56" rx="30" ry="24" fill="none" stroke="${INK}" stroke-width="13"/><ellipse cx="46" cy="56" rx="30" ry="24" fill="none" stroke="#c9a06b" stroke-width="7"/><ellipse cx="46" cy="56" rx="17" ry="12" fill="none" stroke="${INK}" stroke-width="11"/><ellipse cx="46" cy="56" rx="17" ry="12" fill="none" stroke="#c9a06b" stroke-width="5"/><path d="M74 62 q16 10 10 28" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M74 62 q16 10 10 28" fill="none" stroke="#c9a06b" stroke-width="4" stroke-linecap="round"/>`,
  surfboard: `<path d="M22 86 C10 60 50 12 80 10 C92 30 56 82 22 86 Z" fill="#7fd3ff" ${S}/><path d="M28 78 C40 56 60 30 76 18" fill="none" stroke="#ffbe2e" stroke-width="7"/>`,
  clothespin: `<path d="M38 10 L46 90 h10 L50 10 Z" fill="#e0b080" ${S}/><path d="M62 10 L54 90 h-10 L52 10 Z" fill="#d09860" ${S}/><rect x="38" y="44" width="24" height="12" rx="3" fill="#9aa6b8" ${S}/>`,
  boots: `<path d="M16 20 h22 v46 h14 q6 0 6 10 v12 h-42 Z" fill="#ffd34d" ${S}/><path d="M52 14 h22 v46 h14 q6 0 6 10 v12 h-42 Z" fill="#ffbe2e" ${S}/><path d="M16 34 h22 M52 28 h22" stroke="${INK}" stroke-width="3"/>`,
  plank: `<rect x="8" y="38" width="84" height="24" rx="4" fill="#c9893b" ${S}/><path d="M16 46 q20 -4 40 2 t30 0 M18 56 q24 4 50 -2" fill="none" stroke="#8a5a32" stroke-width="3"/><circle cx="16" cy="50" r="3" fill="${INK}"/><circle cx="84" cy="50" r="3" fill="${INK}"/>`,
};

export function toolSvg(id, size = 100) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${TOOLS[id] || ''}</svg>`;
}
export function toolNode(id) {
  return g({}, TOOLS[id] || '');
}
