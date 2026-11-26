// Builds the brand art: logo mark, favicon, disc of beans, bag image and social preview.
//   node design-src/build.mjs
// Needs Playwright and sharp. Each is looked up in PLAYWRIGHT_MODULES / SHARP_MODULES
// (a node_modules folder), and falls back to this project's own node_modules.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logoMark, discBeans, bagSvg } from './art.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const own = resolve(root, 'node_modules');
const { chromium } = createRequire(`${process.env.PLAYWRIGHT_MODULES ?? own}/x.js`)('playwright');
const sharp = createRequire(`${process.env.SHARP_MODULES ?? own}/x.js`)('sharp');
const font = (name) => `data:font/woff2;base64,${readFileSync(`${root}/assets/fonts/${name}`).toString('base64')}`;

const fonts = `
  @font-face { font-family: Sora; font-weight: 100 800; src: url(${font('sora-latin.woff2')}) format('woff2'); }
  @font-face { font-family: 'Hanken Grotesk'; font-weight: 100 900; src: url(${font('hanken-grotesk-latin.woff2')}) format('woff2'); }`;

writeFileSync(`${root}/assets/brand/logo-mark.svg`, logoMark());
writeFileSync(`${root}/assets/brand/disc-beans.svg`, discBeans());

const browser = await chromium.launch();

async function shot(html, { width, height, scale = 2, transparent = true }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.setContent(`<style>${fonts} html,body{margin:0;background:${transparent ? 'transparent' : '#fff'}}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const png = await page.screenshot({ omitBackground: transparent, type: 'png' });
  await page.close();
  return png;
}

// Favicon, 192 px.
const fav = await shot(logoMark({ id: 'f' }).replace('width="256" height="256"', 'width="96" height="96"'), { width: 96, height: 96 });
await sharp(fav).resize(192, 192).png().toFile(`${root}/assets/brand/favicon.png`);

// Bag, 900 x 1120.
const bagPng = await shot(bagSvg(), { width: 450, height: 560 });
await sharp(bagPng).webp({ quality: 92, alphaQuality: 100 }).toFile(`${root}/assets/rastro_bag_hd.webp`);

// Social preview, 1200 x 630.
const og = await shot(`
  <div style="position:relative;width:1200px;height:630px;overflow:hidden;font-family:'Hanken Grotesk';
    background: radial-gradient(circle at 12% 0%, #ffe680, transparent 38%), radial-gradient(circle at 100% 90%, #d9c2ff, transparent 45%), linear-gradient(135deg,#fff3fa,#ffd0ea);">
    <div style="position:absolute;right:70px;top:35px;width:560px;height:560px;border-radius:50%;overflow:hidden;
      background: radial-gradient(circle at 28% 22%, rgba(255,214,10,.65), transparent 32%), radial-gradient(circle at 34% 28%, #ff5cb8, #e7037f 36%, #b0066a 66%, #6d28d9 100%);
      box-shadow: 0 40px 90px -30px rgba(231,3,127,.8);">
      <img src="data:image/svg+xml;base64,${Buffer.from(discBeans()).toString('base64')}" style="position:absolute;inset:0;width:100%;height:100%">
    </div>
    <img src="data:image/png;base64,${bagPng.toString('base64')}" style="position:absolute;right:195px;top:105px;width:330px;filter:drop-shadow(0 26px 22px rgba(43,23,16,.4))">
    <div style="position:absolute;left:80px;top:150px;width:520px;color:#2b1710">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:34px">
        <img src="data:image/svg+xml;base64,${Buffer.from(logoMark({ id: 'o' })).toString('base64')}" style="width:64px;height:64px">
        <span style="font:700 26px Sora;letter-spacing:.2em">RASTRO</span>
      </div>
      <div style="font:300 64px/1.05 Sora">Cada café</div>
      <div style="font:800 64px/1.05 Sora">deja un rastro.</div>
      <div style="font:500 26px/1.4 'Hanken Grotesk';margin-top:26px;color:#5e4a3f">De la finca en Caranavi, Bolivia, hasta tu taza.</div>
    </div>
  </div>`, { width: 1200, height: 630, scale: 1, transparent: false });
await sharp(og).jpeg({ quality: 88, mozjpeg: true }).toFile(`${root}/assets/og.jpg`);

await browser.close();
console.log('brand art built');
