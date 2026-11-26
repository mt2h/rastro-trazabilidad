// Shared shapes for the brand art. A coffee bean is drawn upright, centered on 0,0, about 100 wide and 130 tall.
// The crease is an S curve: it doubles as the "rastro" line in the logo.

export const BEAN_BODY = 'M0 -64 C 34 -64 52 -30 52 2 C 52 40 30 66 0 66 C -30 66 -52 40 -52 2 C -52 -30 -34 -64 0 -64 Z';
export const BEAN_CREASE = 'M-2 -52 C 22 -30 -22 -10 2 12 S 6 44 0 58';

/** Deterministic random numbers, so the art builds the same way every time. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One bean as SVG, placed with a translate, a rotation and a scale. */
export function bean({ x, y, rot, s, body, crease, creaseW = 7, shine = 0 }) {
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})">
    <path d="${BEAN_BODY}" fill="${body}"/>
    <path d="${BEAN_CREASE}" fill="none" stroke="${crease}" stroke-width="${creaseW}" stroke-linecap="round"/>
    ${shine ? `<ellipse cx="-22" cy="-28" rx="13" ry="24" transform="rotate(18 -22 -28)" fill="#fff" opacity="${shine}"/>` : ''}
  </g>`;
}
