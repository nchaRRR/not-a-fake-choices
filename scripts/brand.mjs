// Renders the app icon (iOS + Android adaptive layers), splash screens and Play Store art.
// Usage: node scripts/brand.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const sharp = require('/opt/npm-tools/node_modules/sharp');
let esbuild;
try { esbuild = require('esbuild'); } catch { esbuild = require('/opt/npm-tools/node_modules/esbuild'); }

const brand = resolve(root, 'assets/brand');
const store = resolve(root, 'assets/store');
mkdirSync(brand, { recursive: true });
mkdirSync(store, { recursive: true });
const font = (f) => `data:font/ttf;base64,${readFileSync(resolve(root, 'assets/fonts', f)).toString('base64')}`;
const js = (await esbuild.build({ entryPoints: [resolve(root, 'scripts/brand-entry.js')], bundle: true, write: false, format: 'iife' })).outputFiles[0].text;

const CSS = `
@font-face { font-family: "Baloo 2"; src: url(${font('Baloo2.ttf')}); font-weight: 400 800; }
@font-face { font-family: Nunito; src: url(${font('Nunito.ttf')}); font-weight: 200 1000; }
:root { --ink: #2b2140; --red: #e8453c; --gold: #ffbe2e; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: transparent; overflow: hidden; }
.logo { font-family: "Baloo 2"; font-weight: 800; line-height: 0.86; text-align: center; color: #fff; -webkit-text-stroke: calc(var(--fs) * 0.055) var(--ink);
  paint-order: stroke fill; text-shadow: 0 calc(var(--fs) * 0.08) 0 var(--ink); transform: rotate(-3deg); font-size: var(--fs); }
.logo .strike { position: relative; display: inline-block; color: var(--red); }
.logo .strike::after { content: ""; position: absolute; left: -4%; right: -4%; top: 50%; height: calc(var(--fs) * 0.11); background: var(--ink); border-radius: 9px; transform: rotate(-8deg); }
.logo .sub { display: block; margin-top: calc(var(--fs) * 0.1); font-size: 0.56em; color: var(--gold); letter-spacing: 0.03em; }
.tag { display: inline-block; font-family: Nunito; font-weight: 900; letter-spacing: 0.1em; background: var(--gold); color: var(--ink); border: 0.12em solid var(--ink); border-radius: 0.3em; padding: 0.1em 0.5em; transform: rotate(-4deg); }
`;
const LOGO = '<h1 class="logo">Not a<br><span class="strike">Fake</span> Ad<span class="sub">CHOICES</span></h1>';

const browser = await chromium.launch();
async function shot(w, h, body, file, transparent = false) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS}</style><body>${body}<script>${js}</script></body>`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { for (const el of document.querySelectorAll('[data-brand]')) el.outerHTML = window.BRAND[el.dataset.brand](); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: file, omitBackground: transparent });
  await page.close();
}
const full = (k) => `<div data-brand="${k}"></div>`;

await shot(1024, 1024, full('icon'), resolve(brand, 'icon-1024.png'));
await shot(1024, 1024, full('fg'), resolve(brand, 'adaptive-foreground.png'), true);
await shot(1024, 1024, full('bg'), resolve(brand, 'adaptive-background.png'));
// Splash: logo on the game's paper colour, kept in the middle so any phone shape crops around it.
await shot(2732, 2732, `<div style="width:2732px;height:2732px;background:radial-gradient(circle at 50% 46%, #fff7ef 0, #ffe9d6 40%, #ffd9bd 100%);display:grid;place-items:center"><div style="--fs:230px">${LOGO}</div></div>`, resolve(brand, 'splash-2732.png'));
for (const lang of ['tr', 'en']) {
  await shot(1024, 500, `<div style="position:relative;width:1024px;height:500px">${full('feature')}<div style="position:absolute;left:40px;top:60px;width:470px;display:flex;flex-direction:column;align-items:center;gap:22px"><span class="tag" style="font-size:22px">${lang === 'tr' ? 'SPONSORLU?' : 'SPONSORED?'}</span><div style="--fs:92px">${LOGO}</div></div></div>`, resolve(store, `feature-graphic-${lang}.png`));
}
await browser.close();

// Derived sizes
const icon = resolve(brand, 'icon-1024.png');
await sharp(icon).resize(512).toFile(resolve(store, 'icon-512.png'));
await sharp(icon).resize(192).toFile(resolve(brand, 'icon-192.png'));
// monochrome layer: the foreground's shape in white (Android 13 themed icons)
const fg = sharp(resolve(brand, 'adaptive-foreground.png'));
const { data, info } = await fg.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
await sharp(data, { raw: info }).png().toFile(resolve(brand, 'adaptive-monochrome.png'));

// Into the native projects, at the sizes already there.
const res = resolve(root, 'android/app/src/main/res');
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const roundMask = (n) => Buffer.from(`<svg width="${n}" height="${n}"><circle cx="${n / 2}" cy="${n / 2}" r="${n / 2}"/></svg>`);
for (const [d, k] of Object.entries(dens)) {
  const L = Math.round(108 * k), I = Math.round(48 * k);
  const dir = resolve(res, `mipmap-${d}`);
  await sharp(resolve(brand, 'adaptive-background.png')).resize(L).toFile(resolve(dir, 'ic_launcher_background.png'));
  await sharp(resolve(brand, 'adaptive-foreground.png')).resize(L).toFile(resolve(dir, 'ic_launcher_foreground.png'));
  await sharp(resolve(brand, 'adaptive-monochrome.png')).resize(L).toFile(resolve(dir, 'ic_launcher_monochrome.png'));
  await sharp(icon).resize(I).toFile(resolve(dir, 'ic_launcher.png'));
  await sharp(icon).resize(I).composite([{ input: roundMask(I), blend: 'dest-in' }]).png().toFile(resolve(dir, 'ic_launcher_round.png'));
}
const splash = resolve(brand, 'splash-2732.png');
const sizes = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
for (const [d, [w, h]] of Object.entries(sizes)) {
  await sharp(splash).resize(w, h, { fit: 'cover' }).toFile(resolve(res, `drawable-port-${d}/splash.png`));
  await sharp(splash).resize(h, w, { fit: 'cover' }).toFile(resolve(res, `drawable-land-${d}/splash.png`));
}
await sharp(splash).resize(480, 320, { fit: 'cover' }).toFile(resolve(res, 'drawable/splash.png'));
const ios = resolve(root, 'ios/App/App/Assets.xcassets');
await sharp(icon).flatten({ background: '#ff9a3e' }).toFile(resolve(ios, 'AppIcon.appiconset/AppIcon-512@2x.png'));
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) await sharp(splash).toFile(resolve(ios, 'Splash.imageset', f));
writeFileSync(resolve(res, 'values/ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFB23E</color>\n</resources>');
console.log('brand art written');
