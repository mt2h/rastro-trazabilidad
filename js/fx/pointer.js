// Shared pointer state for the effects: position, normalized position and speed.

export const pointer = { x: 0, y: 0, nx: 0, ny: 0, speed: 0, seen: false, fine: false };

export function initPointer() {
  pointer.fine = window.matchMedia('(pointer: fine)').matches;
  if (!pointer.fine) return;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pointer.speed = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y);
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.seen = true;
  }, { passive: true });
}
