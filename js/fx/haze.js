// The haze drifts slowly with the scroll, and the nav thread fills as you read.
// Nothing here follows the pointer.

import { onFrame } from './loop.js';

export function initHaze(level) {
  const root = document.documentElement;
  const nav = document.querySelector('.nav');
  let hy = 0;
  let progress = -1;

  const readProgress = () => {
    const max = root.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  const apply = (p) => { if (nav && Math.abs(p - progress) > 0.002) { progress = p; nav.style.setProperty('--progress', p.toFixed(4)); } };

  apply(readProgress());
  if (level === 'off') return;

  onFrame((dt) => {
    apply(readProgress());
    const k = 1 - Math.exp(-3 * dt);
    const ty = -window.scrollY * 0.05;
    if (Math.abs(ty - hy) < 0.05) return;
    hy += (ty - hy) * k;
    root.style.setProperty('--hy', `${hy.toFixed(1)}px`);
  });
}
