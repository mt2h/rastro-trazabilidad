// Smooth page movement: links that point to a section glide there with an eased curve,
// and the menu marker follows the section being read. The user can interrupt a glide at any time.

/** Slow start, steady middle, soft landing. `t` goes from 0 to 1. */
export function easeInOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

/** Glide time grows with the distance, but stays between 0.7 s and 1.5 s. */
export function glideDuration(distance) {
  return Math.min(1500, Math.max(700, Math.abs(distance) * 0.45));
}

/** The section the reader is in: the last one whose top has passed `line` px from the viewport top. */
export function sectionAtLine(tops, line) {
  let current = -1;
  tops.forEach((top, i) => { if (top <= line) current = i; });
  return current;
}

export function initSmoothScroll({ reduceMotion = false } = {}) {
  let frame = 0;
  const offset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };

  const glideTo = (target) => {
    stop();
    const from = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const to = Math.min(max, Math.max(0, target));
    if (reduceMotion || Math.abs(to - from) < 2) { window.scrollTo(0, to); return; }
    const time = glideDuration(to - from);
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / time;
      window.scrollTo(0, from + (to - from) * easeInOutCubic(t));
      frame = t < 1 ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const el = id === 'top' ? document.documentElement : document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    glideTo(id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - offset());
    history.pushState(null, '', `#${id}`);
    if (id !== 'top') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  });

  // A wheel, a touch or a key press hands control back to the reader.
  ['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, stop, { passive: true }));
}

/** Moves the menu marker under the link of the section being read. */
export function initNavSpy() {
  const nav = document.querySelector('.nav');
  const strip = nav?.querySelector('nav');
  if (!nav || !strip) return;
  const links = [...strip.querySelectorAll('a')];
  const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  const buy = document.getElementById('comprar');
  let queued = false;
  let active = -2;

  const place = () => {
    const link = links[active];
    if (!link) return;
    strip.style.setProperty('--m-x', `${link.offsetLeft}px`);
    strip.style.setProperty('--m-w', `${link.offsetWidth}px`);
  };

  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.4;
    let index = sectionAtLine(sections.map((s) => (s ? s.getBoundingClientRect().top : Infinity)), line);
    // Once the buy section is reached, the CTA owns the highlight and the marker rests.
    if (buy && buy.getBoundingClientRect().top <= line) index = -1;
    if (index === active) return;
    active = index;
    links.forEach((a, i) => (i === index ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
    if (index >= 0) { place(); nav.setAttribute('data-spy', ''); } else nav.removeAttribute('data-spy');
  };

  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { place(); queue(); });
  if (document.fonts?.ready) document.fonts.ready.then(() => { place(); queue(); });
  update();
}
