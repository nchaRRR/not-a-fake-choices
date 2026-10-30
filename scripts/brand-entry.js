// Builds the brand pictures in the page (used by scripts/brand.mjs).
import { makeHero, setFace, setArms, TOOLS, OUTFITS, PETS } from '../src/art.js';

const INK = '#2b2140';
const tool = (id, x, y, s, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s}) translate(-50 -50)">${TOOLS[id]}</g>`;
function hero(x, y, s, face = 'scared') {
  const h = makeHero(OUTFITS[0], PETS[0]);
  setArms(h, 'up');
  setFace(h, face);
  return `<g transform="translate(${x} ${y}) scale(${s})">${h.outerHTML}</g>`;
}
const BG = `<defs><radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#ffe066"/><stop offset="0.6" stop-color="#ffb23e"/><stop offset="1" stop-color="#ff7a2e"/></radialGradient></defs>`;
const rays = (cx, cy, n = 16, r = 1500) => `<g opacity="0.18">${Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, b = a + Math.PI / n; return `<path d="M${cx} ${cy} L${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r} Z" fill="#fff"/>`; }).join('')}</g>`;
const iconArt = () => `${hero(512, 1120, 5.4)}${tool('gasoline', 262, 360, 1.75, -16)}${tool('water', 762, 360, 1.75, 16)}`;

window.BRAND = {
  icon: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${BG}<rect width="1024" height="1024" fill="url(#bg)"/>${rays(512, 420)}${iconArt()}</svg>`,
  fg: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><g transform="translate(512 540) scale(0.8) translate(-512 -540)">${iconArt()}</g></svg>`,
  bg: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${BG}<rect width="1024" height="1024" fill="url(#bg)"/>${rays(512, 420)}</svg>`,
  feature: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">${BG.replace('cx="50%" cy="38%"', 'cx="72%" cy="40%"')}<rect width="1024" height="500" fill="url(#bg)"/>${rays(760, 220, 18, 1200)}
    ${hero(760, 470, 2.55)}${tool('gasoline', 600, 170, 1.0, -14)}${tool('water', 930, 160, 1.0, 14)}</svg>`,
  card: (id, glow) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${TOOLS[id]}</svg>`,
};
