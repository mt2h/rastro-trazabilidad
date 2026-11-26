// A canvas over the map that draws the coffee footprints and the falling beans along the route.
// Footprints appear in order as the thread is woven; beans fall from the head and burst at each stop.
// Legs that touch an unconfirmed stop get fainter prints, so the map never claims more than we know.

import { onFrame } from './loop.js';
import {
  footprintsAlong, mapProgress, legAt, spawnBean, stepBeans, beanOpacity, printOpacity,
} from '../trail.js';
import { stopFractions } from '../lib.js';
import {
  drawBean, drawFootprint, fitCanvas, readWake, rgba,
} from './draw.js';

export function createTrailLayer(map, { level, isPending }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  map.getContainer().appendChild(canvas);

  const maxBeans = level === 'full' ? 140 : level === 'lite' ? 50 : 0;
  const s = {
    stops: [], fractions: [], legPending: [], px: [], cum: [], prints: [],
    t: 0, headPx: 0, beans: [], dirty: true, colors: readWake(), colorAge: 0, current: -1,
  };

  function rebuild() {
    if (!map._loaded) return; // the map has no view yet
    if (s.stops.length < 2) { s.px = []; s.prints = []; s.dirty = true; return; }
    s.px = s.stops.map((st) => {
      const p = map.latLngToContainerPoint([st.lat, st.lng]);
      return { x: p.x, y: p.y };
    });
    s.cum = [0];
    for (let i = 1; i < s.px.length; i += 1) s.cum.push(s.cum[i - 1] + Math.hypot(s.px[i].x - s.px[i - 1].x, s.px[i].y - s.px[i - 1].y));
    // Keep prints clear of the stop markers.
    s.prints = footprintsAlong(s.px, { spacing: 44, stride: 18 })
      .filter((p) => s.px.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 30));
    s.headPx = mapProgress(s.t, s.fractions, s.cum);
    s.dirty = true;
    if (level === 'off') draw();
  }

  function setStops(stops) {
    s.stops = stops;
    s.fractions = stopFractions(stops);
    s.legPending = stops.slice(1).map((st, k) => isPending(stops[k]) || isPending(st));
    s.t = 0;
    s.current = -1;
    s.beans = [];
    rebuild();
  }

  function head() {
    if (s.px.length < 2) return null;
    const d = s.headPx;
    for (let i = 1; i < s.px.length; i += 1) {
      if (d <= s.cum[i]) {
        const span = s.cum[i] - s.cum[i - 1];
        const k = span === 0 ? 1 : (d - s.cum[i - 1]) / span;
        return { x: s.px[i - 1].x + (s.px[i].x - s.px[i - 1].x) * k, y: s.px[i - 1].y + (s.px[i].y - s.px[i - 1].y) * k };
      }
    }
    return s.px[s.px.length - 1];
  }

  /** Move the head to progress `t`; beans fall from it as it travels. */
  function setProgress(t) {
    const before = s.headPx;
    s.t = t;
    s.headPx = mapProgress(t, s.fractions, s.cum);
    const moved = s.headPx - before;
    const h = head();
    if (maxBeans && h && moved > 0 && t < 1) {
      const n = Math.min(4, Math.ceil(moved / 7));
      for (let i = 0; i < n && s.beans.length < maxBeans; i += 1) {
        s.beans.push(spawnBean(h, Math.random, { spread: 46, size: [3.5, 6.5], life: [0.9, 1.7] }));
      }
    }
    s.dirty = true;
    if (level === 'off') draw();
  }

  /** A burst of beans where the thread arrives at stop `i`. */
  function burst(i) {
    const p = s.px[i];
    if (!p || !maxBeans) return;
    const n = Math.min(16, maxBeans - s.beans.length);
    for (let k = 0; k < n; k += 1) {
      const b = spawnBean(p, Math.random, { spread: 150, size: [3.5, 7], life: [0.9, 1.8] });
      b.vy = -60 - Math.random() * 90;
      s.beans.push(b);
    }
  }

  function draw() {
    const { ctx, w, h } = fitCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    if (s.px.length < 2) return;
    const total = s.cum[s.cum.length - 1];
    for (const p of s.prints) {
      if (p.distance > s.headPx) break;
      const pending = s.legPending[legAt(p.distance, s.cum)];
      const behind = s.headPx - p.distance;
      const stamp = s.t < 1 && behind < 34 ? 0.6 + 0.4 * (behind / 34) : 1;
      const base = printOpacity(p.distance, s.headPx, { fadeLength: total * 0.6, floor: 0.7 });
      drawFootprint(ctx, p, base * (pending ? 0.85 : 1), stamp * 2.1);
    }
    if (s.t > 0 && s.t < 1) {
      const hp = head();
      if (hp) {
        const g = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 22);
        g.addColorStop(0, rgba(s.colors.a, 0.9));
        g.addColorStop(1, rgba(s.colors.a, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Beans that have landed beside every third print, so they show even when nothing is falling.
    for (const p of s.prints) {
      if (p.distance > s.headPx) break;
      if (p.index % 3 !== 1) continue;
      const pending = s.legPending[legAt(p.distance, s.cum)];
      const k = Math.min(1, (s.headPx - p.distance) / 30);
      const off = 22 * (p.index % 2 === 0 ? 1 : -1);
      drawBean(ctx, {
        x: p.x - Math.sin(p.angle) * off, y: p.y + Math.cos(p.angle) * off,
        rot: p.index * 1.7, size: 6.5,
      }, k * (pending ? 0.7 : 0.95));
    }
    for (const b of s.beans) drawBean(ctx, { ...b, size: b.size * 1.35 }, beanOpacity(b));
    ctx.globalAlpha = 1;
  }

  const off = level === 'off' ? () => {} : onFrame((dt) => {
    s.colorAge += dt;
    if (s.colorAge > 0.4) { s.colors = readWake(); s.colorAge = 0; }
    if (s.beans.length) { s.beans = stepBeans(s.beans, dt, { gravity: 620, drag: 0.5 }); s.dirty = true; }
    if (!s.dirty) return;
    draw();
    s.dirty = s.beans.length > 0;
  });

  const onMove = () => rebuild();
  map.on('move zoom viewreset resize', onMove);
  map.on('moveend zoomend', () => { rebuild(); });

  return {
    setStops,
    setProgress,
    burst,
    rebuild,
    destroy() { off(); map.off('move zoom viewreset resize', onMove); canvas.remove(); },
  };
}
