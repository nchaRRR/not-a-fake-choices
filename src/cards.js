// Card collection: 24 cards in 4 sets of 6 (3 common, 2 rare, 1 epic each). A won level can drop a
// card (boss levels and the first daily win always do); doubles turn into coins; a full set pays
// a big reward once. Cards are drawn with CSS around the danger's emoji, no image files.
export const SETS = [
  { id: 'monsters', bg: ['#8a78f0', '#4b3a8a'], cards: [['dragon', 'epic', '🐉'], ['vampire', 'rare', '🧛'], ['witch', 'rare', '🧙'], ['zombie', 'common', '🧟'], ['ghost', 'common', '👻'], ['alien', 'common', '👽']] },
  { id: 'wild', bg: ['#7cc35a', '#2e7d4a'], cards: [['lion', 'epic', '🦁'], ['shark', 'rare', '🦈'], ['gorilla', 'rare', '🦍'], ['bees', 'common', '🐝'], ['bear', 'common', '🐻'], ['snake', 'common', '🐍']] },
  { id: 'disasters', bg: ['#ff8a2e', '#b02a22'], cards: [['meteor', 'epic', '☄️'], ['tornado', 'rare', '🌪️'], ['tsunami', 'rare', '🌊'], ['lava', 'common', '🌋'], ['avalanche', 'common', '🏔️'], ['lightning', 'common', '⚡']] },
  { id: 'beyond', bg: ['#2f7cf6', '#1a2348'], cards: [['blackhole', 'epic', '🕳️'], ['whale', 'rare', '🐋'], ['octopus', 'rare', '🐙'], ['moon', 'common', '🌙'], ['traffic', 'common', '🚗'], ['pigeons', 'common', '🐦']] },
];
export const CARDS = SETS.flatMap((s) => s.cards.map(([id, rarity, icon]) => ({ id, rarity, icon, set: s.id })));
const DUPE = { common: 20, rare: 40, epic: 100 };
const SET_COINS = 400;
const SET_HINTS = 3;

const CSS = `
.cd-wrap { position: fixed; inset: 0; z-index: 105; background: rgba(43,33,64,0.55); display: flex; justify-content: center; overflow-y: auto;
  padding: calc(env(safe-area-inset-top, 0px) + 14px) 12px calc(env(safe-area-inset-bottom, 0px) + 14px); }
.cd-card { width: min(100%, 440px); margin: auto 0; background: var(--paper, #fff7ef); border: 3px solid var(--ink, #2b2140); border-radius: 24px; box-shadow: 0 6px 0 var(--ink, #2b2140);
  padding: 16px 14px 14px; display: flex; flex-direction: column; gap: 10px; color: var(--ink, #2b2140); font-family: var(--font-body, system-ui, sans-serif); }
.cd-card h2 { margin: 0; font: 800 26px/1.1 var(--font-display, sans-serif); display: flex; justify-content: space-between; align-items: center; }
.cd-card h2 b { font-size: 20px; }
.cd-set { border: 3px solid var(--ink, #2b2140); border-radius: 16px; background: #fff; padding: 8px; }
.cd-set-head { display: flex; justify-content: space-between; align-items: center; font: 800 17px/1.1 var(--font-display, sans-serif); margin-bottom: 6px; gap: 8px; }
.cd-set-head small { font: 700 12px var(--font-body, sans-serif); color: var(--ink-soft, #5d5172); text-align: right; }
.cd-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px; }
.pc { position: relative; aspect-ratio: 3 / 4; border-radius: 9px; border: 2.5px solid var(--ink, #2b2140); background: linear-gradient(160deg, var(--c1), var(--c2));
  display: grid; place-items: center; overflow: hidden; box-shadow: 0 2px 0 var(--ink, #2b2140); padding: 0; cursor: pointer; font: inherit; color: inherit; }
.pc .ic { font-size: clamp(18px, 6vw, 28px); line-height: 1; filter: drop-shadow(0 2px 0 rgba(43,33,64,0.5)); }
.pc.rare { border-color: #2f7cf6; box-shadow: 0 0 0 2px #2b2140, 0 2px 0 3px #2b2140; }
.pc.epic { border-color: #ffbe2e; box-shadow: 0 0 0 2px #2b2140, 0 2px 0 3px #2b2140; }
.pc.epic::after, .pc.rare::after { content: ''; position: absolute; inset: -40%; background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%); animation: pcshine 2.6s ease-in-out infinite; }
.pc.rare::after { animation-duration: 3.6s; }
@keyframes pcshine { 0% { transform: translateX(-60%); } 60%, 100% { transform: translateX(60%); } }
.pc.miss { background: #e9e0d6; }
.pc.miss .ic { filter: grayscale(1) brightness(0) opacity(0.22); }
.pc .nw { position: absolute; top: 2px; right: 2px; background: #e8453c; color: #fff; font: 800 9px/1 var(--font-display, sans-serif); border-radius: 6px; padding: 2px 3px; border: 1.5px solid #2b2140; z-index: 1; }
.cd-info { min-height: 2.6em; text-align: center; font-weight: 800; margin: 0; }
.cd-done { color: var(--green-deep, #1f8a54); }
.cd-btn { font: 800 17px/1 var(--font-display, sans-serif); border: 3px solid var(--ink, #2b2140); border-radius: 14px; padding: 11px 12px 9px; cursor: pointer; color: #fff;
  background: var(--green, #2eb872); box-shadow: 0 4px 0 var(--ink, #2b2140); }
.cd-btn.plain { color: var(--ink, #2b2140); background: var(--paper, #fff7ef); }
.cd-btn.gold { color: var(--ink, #2b2140); background: var(--gold, #ffbe2e); }
.cd-reveal { position: fixed; inset: 0; z-index: 120; background: rgba(43,33,64,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px;
  color: #fff; font-family: var(--font-display, sans-serif); text-align: center; }
.cd-reveal .tag { font: 800 26px/1.1 var(--font-display, sans-serif); -webkit-text-stroke: 5px #2b2140; paint-order: stroke fill; }
.cd-reveal .pc { width: min(52vw, 210px); border-width: 5px; border-radius: 22px; cursor: default; animation: pcflip 0.7s cubic-bezier(.2,1.4,.4,1) both; }
.cd-reveal .pc .ic { font-size: min(24vw, 96px); }
.cd-reveal .pc .nm { position: absolute; left: 6px; right: 6px; bottom: 8px; background: #fff7ef; color: #2b2140; border: 3px solid #2b2140; border-radius: 10px; font: 800 17px/1.1 var(--font-display, sans-serif); padding: 5px 4px 3px; }
.cd-reveal .pc .rr { position: absolute; top: 8px; left: 8px; font: 800 12px/1 var(--font-display, sans-serif); background: #2b2140; color: #fff; border-radius: 8px; padding: 4px 6px 3px; text-transform: uppercase; }
.cd-reveal .sub { font: 800 18px/1.2 var(--font-display, sans-serif); max-width: 22ch; }
@keyframes pcflip { from { transform: rotateY(90deg) scale(0.6); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .pc::after, .cd-reveal .pc { animation: none !important; } }
`;

export function createCards({ save, writeSave, t, sfx = {}, track = () => {}, onCoins = () => {}, onHints = () => {} }) {
  const own = () => (save.cards = save.cards || {});
  const seen = () => (save.cardsSeen = save.cardsSeen || {});
  const sets = () => (save.cardSets = save.cardSets || {});
  const css = () => {
    if (document.getElementById('cd-style')) return;
    const s = document.createElement('style'); s.id = 'cd-style'; s.textContent = CSS; document.head.appendChild(s);
  };
  const setOf = (id) => SETS.find((s) => s.id === id);
  const cardFace = (c, cls = '') => {
    const s = setOf(c.set);
    return `<span class="pc ${c.rarity} ${cls}" style="--c1:${s.bg[0]};--c2:${s.bg[1]}"><span class="ic">${c.icon}</span></span>`;
  };

  // Which card drops: rarity first, then a card of that rarity, leaning to the dangers just played.
  function pick(r, hint = []) {
    const roll = r();
    const rarity = roll < 0.08 ? 'epic' : roll < 0.35 ? 'rare' : 'common';
    const pool = CARDS.filter((c) => c.rarity === rarity);
    const near = pool.filter((c) => hint.includes(c.id));
    const from = near.length && r() < 0.5 ? near : pool;
    return from[Math.floor(r() * from.length)];
  }

  // Grants a card; returns { card, dupe, coins, setDone } for the reveal.
  function grant(card) {
    const had = own()[card.id] || 0;
    own()[card.id] = had + 1;
    let coins = 0;
    if (had) { coins = DUPE[card.rarity]; save.coins += coins; } else seen()[card.id] = 0;
    const s = setOf(card.set);
    const setDone = !had && !sets()[s.id] && s.cards.every(([id]) => own()[id]);
    if (setDone) { sets()[s.id] = Date.now(); save.coins += SET_COINS; save.hints = (save.hints || 0) + SET_HINTS; onHints(); }
    writeSave();
    onCoins();
    track('card', { id: card.id, rarity: card.rarity, dupe: !!had });
    if (setDone) track('card_set', { set: s.id });
    return { card, dupe: !!had, coins, setDone, set: s };
  }

  // After a win. chance 0..1; returns a promise that resolves when the reveal is closed.
  function maybeDrop(chance, hint = []) {
    if (Math.random() >= chance) return Promise.resolve(null);
    return reveal(grant(pick(Math.random, hint)));
  }

  function reveal(res) {
    css();
    const { card, dupe, coins, setDone, set } = res;
    const root = document.createElement('div');
    root.className = 'cd-reveal';
    root.innerHTML = `<div class="tag">${dupe ? t('card.dupe') : t('card.new')}</div>
      <span class="pc ${card.rarity}" style="--c1:${set.bg[0]};--c2:${set.bg[1]}"><span class="rr">${t('card.r.' + card.rarity)}</span><span class="ic">${card.icon}</span><span class="nm">${t('card.' + card.id)}</span></span>
      <div class="sub">${dupe ? t('card.coins', { n: coins }) : setDone ? t('card.setdone', { set: t('cset.' + set.id), n: SET_COINS, h: SET_HINTS }) : t('card.inset', { set: t('cset.' + set.id) })}</div>
      <button type="button" class="cd-btn gold">${t('card.ok')}</button>`;
    document.body.appendChild(root);
    if (sfx.win && (setDone || card.rarity === 'epic')) sfx.win(); else if (sfx.coin) sfx.coin();
    return new Promise((done) => {
      root.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); if (sfx.tap) sfx.tap(); root.remove(); done(res); });
    });
  }

  function open() {
    css();
    const root = document.createElement('div');
    root.className = 'cd-wrap';
    document.body.appendChild(root);
    const total = CARDS.length;
    const paint = (info = t('card.help')) => {
      const got = CARDS.filter((c) => own()[c.id]).length;
      root.innerHTML = `<div class="cd-card"><h2>🃏 ${t('card.title')} <b>${got}/${total}</b></h2>
        ${SETS.map((s) => {
          const n = s.cards.filter(([id]) => own()[id]).length;
          return `<div class="cd-set"><div class="cd-set-head"><span>${t('cset.' + s.id)} · ${n}/6</span><small class="${sets()[s.id] ? 'cd-done' : ''}">${sets()[s.id] ? '✓ ' + t('card.claimed') : t('card.reward', { n: SET_COINS, h: SET_HINTS })}</small></div>
            <div class="cd-grid">${s.cards.map(([id]) => {
              const c = CARDS.find((x) => x.id === id);
              const has = own()[id];
              return `<button type="button" class="pc ${c.rarity} ${has ? '' : 'miss'}" data-id="${id}" style="--c1:${s.bg[0]};--c2:${s.bg[1]}"><span class="ic">${c.icon}</span>${has && seen()[id] === 0 ? '<span class="nw">NEW</span>' : ''}</button>`;
            }).join('')}</div></div>`;
        }).join('')}
        <p class="cd-info">${info}</p>
        <button type="button" class="cd-btn plain" data-a="close">${t('close')}</button></div>`;
    };
    paint();
    // looking at the album clears the NEW marks (after this paint)
    for (const id of Object.keys(seen())) seen()[id] = 1;
    writeSave();
    track('cards_open', {});
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) { if (e.target === root) root.remove(); return; }
      if (b.dataset.a === 'close') { if (sfx.tap) sfx.tap(); root.remove(); return; }
      const c = CARDS.find((x) => x.id === b.dataset.id);
      if (!c) return;
      if (sfx.tap) sfx.tap();
      const n = own()[c.id] || 0;
      paint(n ? `${c.icon} ${t('card.' + c.id)} · ${t('card.r.' + c.rarity)}${n > 1 ? ' · ×' + n : ''}` : `${t('card.r.' + c.rarity)} · ${t('card.missing')}`);
    });
  }

  return {
    open, maybeDrop, reveal, grant,
    newCount: () => Object.values(seen()).filter((v) => v === 0).length,
    count: () => CARDS.filter((c) => own()[c.id]).length,
    face: cardFace,
  };
}
