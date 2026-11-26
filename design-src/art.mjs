// SVG sources of the brand art: logo mark, disc of beans, and the bag.
import { BEAN_BODY, BEAN_CREASE, bean, rng } from './shapes.mjs';

const defsLogo = `
  <linearGradient id="lg-bg" x1="0.1" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="#ff4db3"/><stop offset="0.5" stop-color="#e7037f"/><stop offset="1" stop-color="#6d28d9"/>
  </linearGradient>
  <linearGradient id="lg-bean" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#ffe3f3"/><stop offset="1" stop-color="#ff9fd3"/>
  </linearGradient>
  <radialGradient id="lg-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffd60a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd60a" stop-opacity="0"/>
  </radialGradient>`;

/** The logo mark: a bean on a fuchsia disc, with the trail it leaves ending in a yellow stop. */
export function logoMark({ id = '' } = {}) {
  const dots = [[142, 166], [156, 182], [172, 194], [190, 200], [207, 198]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${4.2 + i * 0.6}" fill="#ffd60a"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>${defsLogo.replaceAll('lg-', `lg${id}-`)}</defs>
  <circle cx="128" cy="128" r="128" fill="url(#lg${id}-bg)"/>
  <circle cx="128" cy="128" r="126" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
  <g transform="translate(108 106) rotate(-32) scale(1.02)">
    <path d="${BEAN_BODY}" fill="url(#lg${id}-bean)"/>
    <path d="${BEAN_CREASE}" fill="none" stroke="#b0066a" stroke-width="8" stroke-linecap="round"/>
  </g>
  ${dots}
  <circle cx="214" cy="193" r="22" fill="url(#lg${id}-glow)"/>
  <circle cx="214" cy="193" r="9" fill="#ffd60a"/>
</svg>`;
}

/** The disc behind the bag: tone-on-tone beans scattered over the fuchsia, a few in yellow. */
export function discBeans() {
  const r = rng(91);
  const placed = [];
  const out = [];
  let guard = 0;
  while (placed.length < 46 && guard++ < 4000) {
    const s = 0.55 + r() * 0.85;
    const x = 40 + r() * 720;
    const y = 40 + r() * 720;
    const rad = 62 * s;
    if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.rad + rad + 10)) continue;
    placed.push({ x, y, rad });
    const rot = r() * 360;
    const tone = r();
    const gold = tone > 0.9;
    out.push(bean({
      x, y, rot, s,
      body: gold ? 'rgba(255,214,10,0.55)' : `rgba(255,255,255,${(0.1 + r() * 0.2).toFixed(2)})`,
      crease: gold ? 'rgba(176,6,106,0.55)' : 'rgba(120,0,70,0.32)',
      creaseW: 6,
      shine: gold ? 0.35 : 0.18,
    }));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${out.join('')}</svg>`;
}

/** The bag, front view: matte plum pouch, crimped seal, zipper, the mark, the wordmark and a bean trail. */
export function bagSvg() {
  const body = 'M44 14 L406 14 Q414 14 415 24 L428 508 Q429 530 408 534 Q225 550 42 534 Q21 530 22 508 L35 24 Q36 14 44 14 Z';
  const trail = [[88, 408], [112, 392], [138, 384], [164, 386], [190, 394], [216, 400], [244, 398], [270, 388], [292, 372], [310, 352]];
  const dots = trail.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${2.4 + i * 0.28}" fill="#ffd60a" opacity="${(0.45 + i * 0.06).toFixed(2)}"/>`).join('');
  const beans = [
    bean({ x: 120, y: 420, rot: 28, s: 0.34, body: 'url(#bg-pink)', crease: '#5b0a46', creaseW: 8, shine: 0.3 }),
    bean({ x: 205, y: 424, rot: -40, s: 0.3, body: 'url(#bg-pink)', crease: '#5b0a46', creaseW: 8, shine: 0.3 }),
    bean({ x: 290, y: 410, rot: 52, s: 0.36, body: 'url(#bg-pink)', crease: '#5b0a46', creaseW: 8, shine: 0.3 }),
    bean({ x: 342, y: 330, rot: -18, s: 0.42, body: 'url(#bg-gold)', crease: '#8a4b00', creaseW: 8, shine: 0.45 }),
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 560" width="450" height="560">
  <defs>
    <linearGradient id="bg-body" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#4a1766"/><stop offset="0.55" stop-color="#2a0f3d"/><stop offset="1" stop-color="#170820"/>
    </linearGradient>
    <linearGradient id="bg-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.38"/><stop offset="0.035" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="0.09" stop-color="#fff" stop-opacity="0"/><stop offset="0.9" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.965" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="bg-gloss" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.12" stop-color="#fff" stop-opacity="0"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="0.42" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bg-base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="bg-seal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="bg-pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6cc3"/><stop offset="1" stop-color="#e7037f"/></linearGradient>
    <linearGradient id="bg-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#ffb800"/></linearGradient>
    <linearGradient id="bg-word" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffd1ec"/></linearGradient>
    <radialGradient id="bg-halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffd60a" stop-opacity="0.85"/><stop offset="1" stop-color="#ffd60a" stop-opacity="0"/></radialGradient>
    <radialGradient id="bg-glowpink" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e7037f" stop-opacity="0.55"/><stop offset="1" stop-color="#e7037f" stop-opacity="0"/></radialGradient>
    <clipPath id="bg-clip"><path d="${body}"/></clipPath>
    <pattern id="bg-crimp" width="6" height="3" patternUnits="userSpaceOnUse"><rect width="6" height="1.2" fill="#fff" opacity="0.2"/></pattern>
  </defs>

  <path d="${body}" fill="url(#bg-body)"/>
  <g clip-path="url(#bg-clip)">
    <!-- soft fuchsia light from the lower graphic -->
    <ellipse cx="225" cy="440" rx="230" ry="150" fill="url(#bg-glowpink)"/>
    <!-- crimped seal and zipper -->
    <rect x="0" y="0" width="450" height="62" fill="url(#bg-seal)"/>
    <rect x="0" y="14" width="450" height="40" fill="url(#bg-crimp)"/>
    <rect x="0" y="61" width="450" height="1.6" fill="#fff" opacity="0.25"/>
    <rect x="0" y="82" width="450" height="9" fill="#000" opacity="0.18"/>
    <rect x="0" y="82" width="450" height="1.2" fill="#fff" opacity="0.22"/>
    <path d="M30 74 l9 4 -9 4z M420 74 l-9 4 9 4z" fill="#000" opacity="0.4"/>

    <!-- mark and wordmark -->
    <circle cx="225" cy="150" r="62" fill="url(#bg-glowpink)"/>
    ${logoMark({ id: 'b' }).replace(/<svg [^>]*>/, '<svg x="189" y="114" width="72" height="72" viewBox="0 0 256 256">')}
    <text x="225" y="258" text-anchor="middle" font-family="Sora" font-weight="800" font-size="78" letter-spacing="2" fill="url(#bg-word)">RASTRO</text>
    <text x="225" y="288" text-anchor="middle" font-family="Hanken Grotesk" font-weight="600" font-size="12.5" letter-spacing="4.6" fill="#ffd60a">CAFÉ DE ESPECIALIDAD</text>

    <!-- the trail -->
    <g transform="translate(0 40)">
    ${dots}
    ${beans}
    <circle cx="326" cy="338" r="34" fill="url(#bg-halo)"/>
    </g>

    <rect x="123" y="500" width="204" height="28" rx="14" fill="none" stroke="#fff" stroke-opacity="0.5"/>
    <text x="225" y="519" text-anchor="middle" font-family="Hanken Grotesk" font-weight="700" font-size="11.5" letter-spacing="2.4" fill="#fff">CARANAVI · BOLIVIA</text>

    <!-- light and form -->
    <rect width="450" height="560" fill="url(#bg-side)"/>
    <rect width="450" height="560" fill="url(#bg-gloss)"/>
    <rect width="450" height="560" fill="url(#bg-base)"/>
  </g>
  <path d="${body}" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1.4"/>
</svg>`;
}
