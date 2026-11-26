// Pure geometry and physics for the trail: footprints along a route and falling coffee beans.
// Everything works in screen pixels so it can be tested without a DOM or a map.

/** Total length of a polyline of {x, y} points. */
export function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

/** Position and heading (radians) at `distance` pixels along the polyline. */
export function pointAtDistance(points, distance) {
  if (points.length === 0) return null;
  if (points.length === 1) return { x: points[0].x, y: points[0].y, angle: 0 };
  let remaining = Math.max(0, distance);
  let lastAngle = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    lastAngle = Math.atan2(dy, dx);
    if (remaining <= len) {
      const k = remaining / len;
      return { x: points[i - 1].x + dx * k, y: points[i - 1].y + dy * k, angle: lastAngle };
    }
    remaining -= len;
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y, angle: lastAngle };
}

/**
 * Footprints along a polyline. One print every `spacing` pixels, alternating left and
 * right of the line by `stride / 2`. Each print carries its distance from the start so the
 * caller can reveal them in order and fade the older ones.
 */
export function footprintsAlong(points, { spacing = 28, stride = 9 } = {}) {
  if (points.length < 2 || !(spacing > 0)) return [];
  const total = polylineLength(points);
  if (total === 0) return [];
  const prints = [];
  let index = 0;
  for (let d = spacing / 2; d <= total; d += spacing) {
    const p = pointAtDistance(points, d);
    const side = index % 2 === 0 ? -1 : 1;
    const nx = -Math.sin(p.angle);
    const ny = Math.cos(p.angle);
    prints.push({
      x: p.x + nx * side * (stride / 2),
      y: p.y + ny * side * (stride / 2),
      angle: p.angle,
      side,
      distance: d,
      index,
    });
    index += 1;
  }
  return prints;
}

/** Opacity of a print given how far behind the head it is: recent prints are strong, old ones settle at `floor`. */
export function printOpacity(printDistance, headDistance, { fadeLength = 260, floor = 0.45 } = {}) {
  if (printDistance > headDistance) return 0;
  const behind = headDistance - printDistance;
  const k = Math.min(1, behind / fadeLength);
  return 1 - k * (1 - floor);
}

/** A new bean at `origin`. `rng` returns numbers in [0, 1), so tests can be deterministic. */
export function spawnBean(origin, rng = Math.random, { spread = 40, size = [4, 7], life = [1.1, 2] } = {}) {
  const between = ([a, b]) => a + (b - a) * rng();
  return {
    x: origin.x + (rng() - 0.5) * 8,
    y: origin.y + (rng() - 0.5) * 8,
    vx: (rng() - 0.5) * spread,
    vy: -10 - rng() * 30,
    rot: rng() * Math.PI * 2,
    vr: (rng() - 0.5) * 8,
    age: 0,
    life: between(life),
    size: between(size),
  };
}

/** Advance every bean by `dt` seconds under gravity. Beans past their life are dropped. */
export function stepBeans(beans, dt, { gravity = 520, drag = 0.6 } = {}) {
  if (!(dt > 0)) return beans.slice();
  const next = [];
  for (const b of beans) {
    const age = b.age + dt;
    if (age >= b.life) continue;
    const damp = Math.max(0, 1 - drag * dt);
    const vx = b.vx * damp;
    const vy = b.vy * damp + gravity * dt;
    next.push({ ...b, age, vx, vy, x: b.x + vx * dt, y: b.y + vy * dt, rot: b.rot + b.vr * dt });
  }
  return next;
}

/** 0 to 1 opacity of a bean over its life: quick fade-in, long fade-out. */
export function beanOpacity(bean) {
  const k = bean.age / bean.life;
  if (k < 0.1) return k / 0.1;
  return Math.max(0, 1 - (k - 0.1) / 0.9);
}

/**
 * Convert route progress `t` (0 to 1 of the geographic length) into a distance along the
 * pixel polyline, given each stop's geographic fraction and its pixel distance from the start.
 * Both arrays have one entry per stop and start at 0.
 */
export function mapProgress(t, fractions, cumulativePx) {
  const n = Math.min(fractions.length, cumulativePx.length);
  if (n === 0) return 0;
  if (n === 1) return 0;
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  for (let i = 1; i < n; i += 1) {
    if (x <= fractions[i]) {
      const span = fractions[i] - fractions[i - 1];
      const k = span === 0 ? 1 : (x - fractions[i - 1]) / span;
      return cumulativePx[i - 1] + (cumulativePx[i] - cumulativePx[i - 1]) * k;
    }
  }
  return cumulativePx[n - 1];
}

/** Index of the leg (0-based) that contains `distance`, given cumulative stop distances. */
export function legAt(distance, cumulativePx) {
  for (let i = 1; i < cumulativePx.length; i += 1) if (distance <= cumulativePx[i]) return i - 1;
  return Math.max(0, cumulativePx.length - 2);
}
