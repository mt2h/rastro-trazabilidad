// One shared animation loop. Every effect subscribes here, so there is a single
// requestAnimationFrame, and it pauses when the tab is hidden.

const subs = new Set();
let raf = 0;
let last = 0;

function tick(now) {
  raf = 0;
  if (document.hidden || subs.size === 0) return;
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  for (const fn of [...subs]) fn(dt, now);
  raf = requestAnimationFrame(tick);
}

function start() {
  if (raf || document.hidden || subs.size === 0) return;
  last = performance.now();
  raf = requestAnimationFrame(tick);
}

/** Subscribe `fn(dt, now)` to the loop. Returns an unsubscribe function. */
export function onFrame(fn) {
  subs.add(fn);
  start();
  return () => subs.delete(fn);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  } else {
    start();
  }
});
