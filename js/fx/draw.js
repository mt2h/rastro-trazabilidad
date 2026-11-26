// Canvas drawing helpers shared by the hero, the map layer and the pointer wake.

const COFFEE = '#6b4226';

/** A coffee bean: an ellipse with a curved center crease. */
export function drawBean(ctx, bean, alpha = 1) {
  if (alpha <= 0) return;
  const s = bean.size;
  ctx.save();
  ctx.translate(bean.x, bean.y);
  ctx.rotate(bean.rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COFFEE;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 236, 210, 0.7)';
  ctx.lineWidth = Math.max(1, s * 0.16);
  ctx.beginPath();
  ctx.moveTo(-s * 0.78, 0);
  ctx.quadraticCurveTo(0, -s * 0.34, s * 0.78, 0);
  ctx.stroke();
  ctx.restore();
}

/** A shoe print pointing along `angle`. `side` is -1 for the left foot and 1 for the right. */
export function drawFootprint(ctx, print, alpha = 1, scale = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(print.x, print.y);
  ctx.rotate(print.angle);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  const sole = () => { ctx.beginPath(); ctx.ellipse(2.8, 0, 5.2, 3.1, 0, 0, Math.PI * 2); };
  const heel = () => { ctx.beginPath(); ctx.ellipse(-4.6, 0, 2.7, 2.3, 0, 0, Math.PI * 2); };
  // A light rim keeps the print readable over any map color.
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  sole(); ctx.stroke();
  heel(); ctx.stroke();
  ctx.fillStyle = COFFEE;
  sole(); ctx.fill();
  heel(); ctx.fill();
  ctx.fillStyle = 'rgba(255, 236, 210, 0.4)';
  ctx.beginPath();
  ctx.ellipse(3.6, print.side * -0.5, 2.4, 1.1, 0, 0, Math.PI * 2); // soft highlight
  ctx.fill();
  ctx.restore();
}

/** "rgb(…)" or "rgba(…)" to [r, g, b]. Anything else falls back to violet. */
export function parseRgb(css, fallback = [122, 77, 255]) {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(css || '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : fallback;
}

export const rgba = ([r, g, b], a) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

/** The two wake colors of the current lot, read from the page. */
export function readWake() {
  const cs = getComputedStyle(document.body);
  return {
    a: parseRgb(cs.getPropertyValue('--wake-a')),
    b: parseRgb(cs.getPropertyValue('--wake-b'), [47, 91, 255]),
  };
}

/** A soft round glow drawn once to an offscreen canvas. */
export function glowSprite(rgb, size = 64) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, rgba(rgb, 0.95));
  grad.addColorStop(0.35, rgba(rgb, 0.35));
  grad.addColorStop(1, rgba(rgb, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** Size a canvas to its CSS box at device resolution (capped at 2x) and return the 2D context. */
export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
