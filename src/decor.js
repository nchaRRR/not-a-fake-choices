// Life in the background of every danger: drifting clouds and birds by day, twinkling stars and
// fireflies at night, embers near fire, dust in rooms, leaves in the jungle, grass along the ground,
// a soft light over the scene and a shadow under the hero. Built per stage, updated every frame.
const NS = 'http://www.w3.org/2000/svg';
const INK = '#2b2140';

const MOOD = {
  lava: 'cave embers', shark: 'day clouds birds', bees: 'day clouds birds grass leaves', fire: 'day clouds grass embers',
  bear: 'day clouds birds grass', ghost: 'night room dust', cold: 'snowday', flood: 'room dust', bomb: 'day clouds',
  thief: 'night stars fireflies grass', dragon: 'dusk clouds embers', vampire: 'night stars mist', desert: 'hot dust',
  meteor: 'night stars', dino: 'day clouds birds grass', snake: 'day leaves grass', alien: 'night stars fireflies',
  tornado: 'storm', carsink: 'water bubbles', airballoon: 'day clouds birds', boulder: 'hot dust clouds', spider: 'room dust',
  mice: 'room dust', zombie: 'night mist grass', lion: 'hot grass dust', gorilla: 'day leaves grass', witch: 'night stars mist',
  robot: 'room dust', bull: 'day clouds dust', avalanche: 'snowday', quicksand: 'hot dust', tsunami: 'day clouds birds',
  skunk: 'day leaves grass', lightning: 'storm', piranha: 'day clouds leaves', grease: 'room embers dust', electric: 'room dust',
  sleepbear: 'cave fireflies dust', vampsun: 'room dust', thiefbone: 'night stars fireflies grass', ghostbaby: 'night room dust',
  oxygen: 'night stars shoot', blackhole: 'night stars shoot', moon: 'night stars', octopus: 'day clouds birds', jellyfish: 'water bubbles',
  whale: 'day clouds birds', traffic: 'day clouds birds', pigeons: 'day clouds', subway: 'room dust',
};

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
const rand = (a, b) => a + Math.random() * (b - a);

export function createDecor(layer, hazardId, hero) {
  const mood = new Set((MOOD[hazardId] || 'day').split(' '));
  const back = el('g', { class: 'decor-back' });
  const front = el('g', { class: 'decor-front', 'pointer-events': 'none' });
  // behind the scene's objects, just above its sky / wall
  const sky = layer.querySelector('rect');
  if (sky && sky.parentNode === layer) sky.after(back); else layer.prepend(back);
  const items = [];

  if (mood.has('stars')) {
    for (let i = 0; i < 22; i++) {
      const s = el('circle', { cx: rand(5, 395), cy: rand(8, 230), r: rand(0.8, 2.2), fill: '#fff' }, back);
      items.push({ kind: 'twinkle', node: s, ph: rand(0, 6), sp: rand(1.5, 4) });
    }
    items.push({ kind: 'shoot', node: el('path', { d: 'M0 0 l-46 14', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 }, back), t: rand(2, 6) });
  }
  if (mood.has('clouds')) {
    for (let i = 0; i < 3; i++) {
      const g = el('g', { opacity: 0.9 }, back);
      g.innerHTML = `<g fill="#fff" stroke="${INK}" stroke-width="3" stroke-opacity="0.25"><ellipse cx="0" cy="0" rx="34" ry="14"/><ellipse cx="-18" cy="-8" rx="18" ry="12"/><ellipse cx="14" cy="-10" rx="20" ry="14"/></g>`;
      items.push({ kind: 'cloud', node: g, x: rand(-40, 420), y: rand(26, 120), s: rand(0.7, 1.3), v: rand(4, 10) });
    }
  }
  if (mood.has('birds')) {
    for (let i = 0; i < 2; i++) {
      const b = el('path', { d: 'M-8 0 q4 -6 8 0 q4 -6 8 0', fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, back);
      items.push({ kind: 'bird', node: b, x: rand(-200, 0), y: rand(50, 150), v: rand(28, 44), ph: rand(0, 6) });
    }
  }
  if (mood.has('mist')) {
    for (let i = 0; i < 3; i++) {
      const m = el('ellipse', { rx: rand(90, 140), ry: rand(14, 22), fill: '#d8d0f0', opacity: 0.18 }, back);
      items.push({ kind: 'mist', node: m, x: rand(0, 400), y: rand(395, 440), v: rand(5, 12) * (i % 2 ? -1 : 1) });
    }
  }
  if (mood.has('grass')) {
    const xs = [18, 62, 96, 288, 326, 372];
    for (const x of xs) {
      const g = el('g', {}, layer);
      const col = mood.has('hot') ? '#c9a03a' : mood.has('night') ? '#3e6a4a' : '#4fa04a';
      g.innerHTML = `<path d="M-8 0 q2 -14 4 -18 q1 10 2 18 q2 -16 6 -22 q0 14 -1 22 q3 -10 6 -14 q-1 8 -3 14 Z" fill="${col}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
      items.push({ kind: 'grass', node: g, x, y: 432, ph: rand(0, 6) });
    }
  }
  // the hero's shadow, under his feet when he is on the ground
  const shadow = el('ellipse', { rx: 30, ry: 7, fill: INK, opacity: 0 });
  if (hero && hero.parentNode === layer) layer.insertBefore(shadow, hero);
  else layer.appendChild(shadow);

  // floating particles in front of the scene
  const parts = [];
  const spawn = (kind) => {
    let node;
    if (kind === 'ember') node = el('circle', { r: rand(1.8, 3.6), fill: Math.random() < 0.5 ? '#ffbe2e' : '#ff8a2e' }, front);
    else if (kind === 'dust') node = el('circle', { r: rand(1, 2.2), fill: '#fff6d0', opacity: 0.5 }, front);
    else if (kind === 'firefly') node = el('circle', { r: 2.6, fill: '#f6ff7a' }, front);
    else if (kind === 'leaf') { node = el('path', { d: 'M0 -6 q6 4 0 12 q-6 -8 0 -12 Z', fill: '#5aa84a', stroke: INK, 'stroke-width': 1.5 }, front); }
    else if (kind === 'bubble') node = el('circle', { r: rand(2, 5), fill: 'none', stroke: '#e6f6ff', 'stroke-width': 1.5 }, front);
    else if (kind === 'flake') node = el('circle', { r: rand(1.5, 3), fill: '#fff' }, front);
    const p = { kind, node, x: rand(0, 400), y: rand(0, 520), vx: 0, vy: 0, ph: rand(0, 6), life: 0 };
    if (kind === 'ember') { p.y = rand(380, 540); p.vy = -rand(25, 55); }
    if (kind === 'dust') { p.vx = rand(-6, 6); p.vy = rand(-4, 4); }
    if (kind === 'leaf') { p.y = rand(-40, 300); p.vx = rand(14, 26); p.vy = rand(22, 36); }
    if (kind === 'bubble') { p.y = rand(300, 540); p.vy = -rand(20, 40); }
    if (kind === 'flake') { p.y = rand(-20, 500); p.vy = rand(18, 36); p.vx = rand(-8, 8); }
    if (kind === 'firefly') { p.y = rand(300, 430); }
    parts.push(p);
  };
  const n = (k) => mood.has(k);
  for (let i = 0; i < (n('embers') ? 12 : 0); i++) spawn('ember');
  for (let i = 0; i < (n('dust') ? 14 : 0); i++) spawn('dust');
  for (let i = 0; i < (n('fireflies') ? 7 : 0); i++) spawn('firefly');
  for (let i = 0; i < (n('leaves') ? 5 : 0); i++) spawn('leaf');
  for (let i = 0; i < (n('bubbles') ? 10 : 0); i++) spawn('bubble');
  for (let i = 0; i < (n('snowday') ? 16 : 0); i++) spawn('flake');

  // light over everything: warm sun by day, cool edges at night, flashes in a storm
  const lightId = `lt${Math.floor(Math.random() * 1e6)}`;
  const light = el('g', { 'pointer-events': 'none' });
  const night = n('night') || n('cave');
  light.innerHTML = night
    ? `<defs><radialGradient id="${lightId}" cx="50%" cy="45%" r="75%"><stop offset="0.5" stop-color="#0a0820" stop-opacity="0"/><stop offset="1" stop-color="#0a0820" stop-opacity="0.45"/></radialGradient></defs><rect width="400" height="520" fill="url(#${lightId})"/>`
    : n('storm')
      ? `<rect class="storm" width="400" height="520" fill="#fff" opacity="0"/>`
      : `<defs><radialGradient id="${lightId}" cx="78%" cy="4%" r="80%"><stop offset="0" stop-color="#fffbe0" stop-opacity="${n('hot') ? 0.4 : 0.28}"/><stop offset="0.6" stop-color="#fffbe0" stop-opacity="0"/></radialGradient></defs><rect width="400" height="520" fill="url(#${lightId})"/>`;
  layer.appendChild(front);
  layer.appendChild(light);
  const stormRect = light.querySelector('.storm');
  let stormT = rand(2, 5);

  function heroFeet() {
    const m = (hero.getAttribute('transform') || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  }

  return {
    update(dt, t) {
      for (const it of items) {
        if (it.kind === 'twinkle') it.node.setAttribute('opacity', (0.45 + Math.sin(t * it.sp + it.ph) * 0.4).toFixed(2));
        else if (it.kind === 'shoot') {
          it.t -= dt;
          if (it.t < 0) { it.t = rand(4, 9); it.x = rand(150, 420); it.y = rand(20, 110); it.a = 1; }
          if (it.a > 0) { it.a -= dt * 1.4; it.x -= dt * 260; it.y += dt * 80; it.node.setAttribute('transform', `translate(${it.x.toFixed(1)} ${it.y.toFixed(1)})`); it.node.setAttribute('opacity', Math.max(0, it.a).toFixed(2)); }
        } else if (it.kind === 'cloud') {
          it.x += it.v * dt; if (it.x > 460) it.x = -60;
          it.node.setAttribute('transform', `translate(${it.x.toFixed(1)} ${it.y}) scale(${it.s})`);
        } else if (it.kind === 'bird') {
          it.x += it.v * dt; if (it.x > 460) { it.x = rand(-300, -60); it.y = rand(50, 150); }
          it.node.setAttribute('transform', `translate(${it.x.toFixed(1)} ${(it.y + Math.sin(t * 2 + it.ph) * 4).toFixed(1)}) scale(1 ${(0.6 + Math.abs(Math.sin(t * 9 + it.ph)) * 0.6).toFixed(2)})`);
        } else if (it.kind === 'mist') {
          it.x += it.v * dt; if (it.x > 520) it.x = -120; if (it.x < -120) it.x = 520;
          it.node.setAttribute('cx', it.x.toFixed(1)); it.node.setAttribute('cy', it.y);
        } else if (it.kind === 'grass') it.node.setAttribute('transform', `translate(${it.x} ${it.y}) rotate(${(Math.sin(t * 1.8 + it.ph) * 4).toFixed(1)})`);
      }
      for (const p of parts) {
        p.life += dt;
        if (p.kind === 'ember') { p.y += p.vy * dt; p.x += Math.sin(t * 3 + p.ph) * 12 * dt; if (p.y < 120) { p.y = rand(440, 540); p.x = rand(0, 400); } p.node.setAttribute('opacity', Math.max(0, Math.min(1, (p.y - 120) / 200)).toFixed(2)); }
        else if (p.kind === 'dust') { p.x += (p.vx + Math.sin(t * 0.7 + p.ph) * 4) * dt; p.y += (p.vy + Math.cos(t * 0.5 + p.ph) * 3) * dt; if (p.x < -5) p.x = 405; if (p.x > 405) p.x = -5; if (p.y < -5) p.y = 525; if (p.y > 525) p.y = -5; }
        else if (p.kind === 'firefly') { p.x += Math.sin(t * 0.9 + p.ph) * 16 * dt; p.y += Math.cos(t * 1.3 + p.ph) * 12 * dt; p.node.setAttribute('opacity', (0.35 + Math.abs(Math.sin(t * 2 + p.ph)) * 0.65).toFixed(2)); }
        else if (p.kind === 'leaf') { p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > 460 || p.x > 430) { p.x = rand(-60, 300); p.y = rand(-40, -10); } }
        else if (p.kind === 'bubble') { p.y += p.vy * dt; p.x += Math.sin(t * 2 + p.ph) * 10 * dt; if (p.y < 160) { p.y = rand(480, 540); p.x = rand(0, 400); } }
        else if (p.kind === 'flake') { p.y += p.vy * dt; p.x += (p.vx + Math.sin(t + p.ph) * 6) * dt; if (p.y > 520) { p.y = -10; p.x = rand(0, 400); } }
        const rot = p.kind === 'leaf' ? ` rotate(${((t * 90 + p.ph * 60) % 360).toFixed(0)})` : '';
        p.node.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})${rot}`);
      }
      if (stormRect) {
        stormT -= dt;
        if (stormT < 0) { stormT = rand(3, 7); stormRect.dataset.f = '1'; }
        const f = Number(stormRect.dataset.f || 0);
        if (f > 0) { const nf = Math.max(0, f - dt * 3); stormRect.dataset.f = nf; stormRect.setAttribute('opacity', (nf > 0.5 ? 0.35 : nf * 0.5).toFixed(2)); }
      }
      // shadow
      const feet = hero && hero.style.display !== 'none' ? heroFeet() : null;
      if (feet && feet[1] > 380 && feet[1] < 470) {
        shadow.setAttribute('cx', feet[0].toFixed(1));
        shadow.setAttribute('cy', (feet[1] + 1).toFixed(1));
        shadow.setAttribute('opacity', '0.18');
      } else shadow.setAttribute('opacity', '0');
    },
  };
}
