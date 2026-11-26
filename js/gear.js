// Brewing tools: real photographs, cut out from their backgrounds (see credits.js).
// `w` and `h` are the pixel size of each file, so the browser can reserve space before they load.

export const GEAR = [
  { id: 'v60', name: 'Hario V60', note: 'Cono de cerámica con estrías en espiral.', img: 'assets/gear/v60.webp', w: 720, h: 568 },
  { id: 'chemex', name: 'Chemex', note: 'Reloj de arena de vidrio con collar de madera.', img: 'assets/gear/chemex.webp', w: 409, h: 720 },
  { id: 'aeropress', name: 'Aeropress', note: 'Cámara transparente con émbolo.', img: 'assets/gear/aeropress.webp', w: 238, h: 720 },
  { id: 'frenchpress', name: 'Prensa francesa', note: 'Jarra de vidrio con marco metálico y émbolo.', img: 'assets/gear/frenchpress.webp', w: 453, h: 720 },
  { id: 'kettle', name: 'Hervidor de cuello de cisne', note: 'Vertido preciso y lento.', img: 'assets/gear/kettle.webp', w: 720, h: 424 },
  { id: 'grinder', name: 'Molino manual', note: 'Molienda pareja, grano a grano.', img: 'assets/gear/grinder.webp', w: 637, h: 720 },
];

export function gearById(id) {
  return GEAR.find((g) => g.id === id) || GEAR[0];
}

/** An <img> element for a tool. Hero images load eagerly; the rest wait until needed. */
export function gearImage(gear, { eager = false, className = '' } = {}) {
  const img = document.createElement('img');
  img.src = gear.img;
  img.width = gear.w;
  img.height = gear.h;
  img.alt = `${gear.name}. ${gear.note}`;
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  if (className) img.className = className;
  return img;
}
