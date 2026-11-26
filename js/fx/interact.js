// Pointer interactions on hover: the bag tilts and catches a holographic sheen, and glass
// panels get a light under the pointer. Nothing follows the pointer around the page.

import { pointer } from './pointer.js';

const MAX_TILT = 9;

export function initInteract(level) {
  if (level === 'off' || !pointer.fine) return;

  let tiltEl = null;
  let spotEl = null;

  const reset = (el, vars) => vars.forEach((v) => el.style.removeProperty(v));

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const t = e.target.closest?.('[data-tilt]') || null;
    const s = e.target.closest?.('[data-spot]') || null;

    if (tiltEl && tiltEl !== t) reset(tiltEl, ['--rx', '--ry', '--mx', '--my', '--sheen']);
    if (spotEl && spotEl !== s) reset(spotEl, ['--mx', '--my']);
    tiltEl = t; spotEl = s;

    if (t) {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      t.style.setProperty('--rx', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      t.style.setProperty('--ry', `${(-(y - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      t.style.setProperty('--sheen', '1');
    }
    if (s) {
      const r = s.getBoundingClientRect();
      s.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
      s.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
    }
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    if (tiltEl) reset(tiltEl, ['--rx', '--ry', '--mx', '--my', '--sheen']);
    if (spotEl) reset(spotEl, ['--mx', '--my']);
    tiltEl = spotEl = null;
  });

}
