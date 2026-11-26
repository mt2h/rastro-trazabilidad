// Pure helpers, free of DOM access so they can be tested with node:test.

import { LOTS, STORE_BASE } from './data.js';

/** Format an integer amount as Chilean pesos, e.g. 8000 -> "$8.000". */
export function formatCLP(amount) {
  if (!Number.isFinite(amount)) return '';
  const digits = String(Math.round(Math.abs(amount)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}$${grouped}`;
}

const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** Format an ISO date (YYYY-MM-DD) as "4 feb 2026". Null/invalid -> "Sin dato". */
export function formatDate(iso) {
  if (typeof iso !== 'string') return 'Sin dato';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return 'Sin dato';
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return 'Sin dato';
  return `${day} ${MONTHS[month - 1]} ${m[1]}`;
}

/** Link to the real product page on the store. */
export function buildLotUrl(slug) {
  return `${STORE_BASE}${slug}/`;
}

/** Great-circle distance between two points, in km (haversine). */
export function haversineKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Total length of a route through the stops, in km (0 for fewer than 2). */
export function routeDistanceKm(stops) {
  let total = 0;
  for (let i = 1; i < stops.length; i += 1) total += haversineKm(stops[i - 1], stops[i]);
  return total;
}

/**
 * Fraction of the total route length at which each stop sits, from 0 to 1.
 * When every stop shares one coordinate the length is 0, so stops are spread evenly instead.
 */
export function stopFractions(stops) {
  const n = stops.length;
  if (n === 0) return [];
  if (n === 1) return [0];
  const cumulative = [0];
  for (let i = 1; i < n; i += 1) cumulative.push(cumulative[i - 1] + haversineKm(stops[i - 1], stops[i]));
  const total = cumulative[n - 1];
  if (total === 0) return stops.map((_, i) => i / (n - 1));
  return cumulative.map((d) => d / total);
}

/**
 * The part of the route drawn at fraction `t` (0 to 1) of its length.
 * Returns the polyline points up to the head and the head position.
 */
export function interpolateRoute(stops, t) {
  if (stops.length === 0) return { points: [], head: null };
  if (stops.length === 1) return { points: [{ lat: stops[0].lat, lng: stops[0].lng }], head: { lat: stops[0].lat, lng: stops[0].lng } };
  const clamped = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  const fractions = stopFractions(stops);
  const points = [{ lat: stops[0].lat, lng: stops[0].lng }];
  for (let i = 1; i < stops.length; i += 1) {
    const from = stops[i - 1];
    const to = stops[i];
    if (clamped >= fractions[i]) {
      points.push({ lat: to.lat, lng: to.lng });
      continue;
    }
    const span = fractions[i] - fractions[i - 1];
    const local = span === 0 ? 0 : (clamped - fractions[i - 1]) / span;
    if (local <= 0) break; // the head sits exactly on the previous stop
    points.push({ lat: from.lat + (to.lat - from.lat) * local, lng: from.lng + (to.lng - from.lng) * local });
    break;
  }
  return { points, head: points[points.length - 1] };
}

/**
 * Push overlapping pins apart. `points` are pixel positions ({x, y}); returns one
 * {dx, dy} offset per point so that no two pins end up closer than `minDist` pixels.
 */
export function separatePins(points, minDist = 36, iterations = 16) {
  const pos = points.map((p) => ({ x: p.x, y: p.y }));
  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < pos.length; i += 1) {
      for (let j = i + 1; j < pos.length; j += 1) {
        let dx = pos[j].x - pos[i].x;
        let dy = pos[j].y - pos[i].y;
        let dist = Math.hypot(dx, dy);
        if (dist >= minDist) continue;
        if (dist === 0) {
          // Identical positions: pick a deterministic direction (golden angle) per pair.
          const angle = (i + j + 1) * 2.399963;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }
        const push = (minDist - Math.hypot(pos[j].x - pos[i].x, pos[j].y - pos[i].y)) / 2 + 0.01;
        const ux = dx / dist;
        const uy = dy / dist;
        pos[i].x -= ux * push;
        pos[i].y -= uy * push;
        pos[j].x += ux * push;
        pos[j].y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return pos.map((p, i) => ({ dx: p.x - points[i].x, dy: p.y - points[i].y }));
}

/** "confirmed" for verified stops, "pending" otherwise. */
export function stopStatus(stop) {
  return stop && stop.verified === true ? 'confirmed' : 'pending';
}

/** Resolve a location hash ("#lote-3-1") to a lot; unknown hashes fall back to the first lot. */
export function lotFromHash(hash) {
  const id = typeof hash === 'string' ? hash.replace(/^#/, '') : '';
  return LOTS.find((l) => l.id === id) || LOTS[0];
}
