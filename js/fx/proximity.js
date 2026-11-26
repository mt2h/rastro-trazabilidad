// Proximity glow: buttons, tabs, menu links and headline letters light up as the pointer
// gets close. Each element receives --near, from 0 (far) to 1 (touching), and the CSS does the rest.

import { pointer } from './pointer.js';
import { onFrame } from './loop.js';

const TARGETS = '.btn, .tab, .method, .nav nav a, .nav__cta, .brand span, [data-glow-text], .hero h1 .word';

/** 0 when `distance` is `radius` or more, 1 at distance 0, easing in between. */
export function nearness(distance, radius) {
  if (!(radius > 0) || !Number.isFinite(distance)) return 0;
  const k = Math.min(1, Math.max(0, 1 - distance / radius));
  return k * k * (3 - 2 * k); // smoothstep
}

/** Distance from a point to a rectangle (0 when inside). */
export function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

export function initProximity(level) {
  if (level === 'off' || !pointer.fine) return;
  const state = new WeakMap();
  let lastX = -1;
  let lastY = -1;
  let scrollY = -1;

  onFrame(() => {
    if (!pointer.seen) return;
    // Only work when the pointer or the page moved.
    if (pointer.x === lastX && pointer.y === lastY && window.scrollY === scrollY) return;
    lastX = pointer.x;
    lastY = pointer.y;
    scrollY = window.scrollY;
    for (const el of document.querySelectorAll(TARGETS)) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
      const isText = el.matches('[data-glow-text], .word, .brand span');
      const radius = isText ? 170 : 150;
      const value = nearness(distanceToRect(pointer.x, pointer.y, rect), radius);
      const rounded = Math.round(value * 50) / 50;
      if (state.get(el) === rounded) continue;
      state.set(el, rounded);
      el.style.setProperty('--near', String(rounded));
    }
  });
}
