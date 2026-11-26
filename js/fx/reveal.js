// Scroll reveals, word-by-word headlines and number counters.

/** Wrap each word of an element in a span with its index, keeping nested tags such as <strong>. */
export function splitWords(root) {
  let index = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part === '') return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
          const span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--i', String(index));
          span.textContent = part;
          index += 1;
          frag.append(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    }
  };
  walk(root);
}

export function initReveal(level) {
  const words = [...document.querySelectorAll('[data-words]')];
  if (level === 'off' || !('IntersectionObserver' in window)) return;
  words.forEach(splitWords);
  document.documentElement.classList.add('fx-ready');

  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    visible.forEach((entry, i) => {
      entry.target.style.setProperty('--d', `${i * 90}ms`);
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('[data-reveal], [data-words]').forEach((el) => io.observe(el));
  return io;
}

/** Make anything added later with data-reveal visible and animated. */
export function observeNew(io, root) {
  if (!io) return;
  root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
}

const nf = new Intl.NumberFormat('es-CL');

/** Count a number up inside `el`. Falls back to the final value when motion is off. */
export function countTo(el, to, { duration = 1200, level = 'full', suffix = '' } = {}) {
  const final = `${nf.format(to)}${suffix}`;
  if (level === 'off' || !Number.isFinite(to)) { el.textContent = final; return; }
  const start = performance.now();
  const frame = (now) => {
    const x = Math.min(1, (now - start) / duration);
    const eased = x === 1 ? 1 : 1 - 2 ** (-10 * x);
    el.textContent = `${nf.format(Math.round(to * eased))}${suffix}`;
    if (x < 1) requestAnimationFrame(frame); else el.textContent = final;
  };
  requestAnimationFrame(frame);
}
