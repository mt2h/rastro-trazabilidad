import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Reads the color tokens from the stylesheet and checks WCAG AA contrast for the
// text/background pairs the page actually uses.

const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

const tokens = {};
for (const m of css.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)) tokens[m[1]] = m[2].trim();

function resolve(name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`token cycle at ${name}`);
  seen.add(name);
  const raw = tokens[name];
  assert.ok(raw, `missing token --${name}`);
  const ref = /^var\(--([a-z0-9-]+)\)$/.exec(raw);
  if (ref) return resolve(ref[1], seen);
  assert.match(raw, /^#[0-9a-f]{6}$/i, `--${name} is not a hex color`);
  return raw;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `top` laid over `bottom` at opacity `alpha`, as a hex color. */
function over(top, bottom, alpha) {
  const ch = (hex, i) => parseInt(hex.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round(ch(top, i) * alpha + ch(bottom, i) * (1 - alpha)));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const LOTS = ['lote-3', 'lote-3-1', 'lote-3-5'];

const PAIRS = [
  ['ink', 'pearl', 4.5],
  ['ink-soft', 'pearl', 4.5],
  ['ink', 'pearl-deep', 4.5],
  ['ink-soft', 'pearl-deep', 4.5],
  ['ink', 'white', 4.5],
  ['ink-soft', 'white', 4.5],
  ['accent-text', 'pearl', 4.5],
  ['accent-text', 'white', 4.5],
  ['white', 'ink', 4.5],
];

for (const [fg, bg, min] of PAIRS) {
  test(`contrast ${fg} on ${bg} >= ${min}`, () => {
    const ratio = contrast(resolve(fg), resolve(bg));
    assert.ok(ratio >= min, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
  });
}

for (const id of LOTS) {
  for (const token of [`wake-a-${id}`, `wake-b-${id}`, `fill-a-${id}`, `fill-b-${id}`, `wake-ink-${id}`]) {
    test(`token ${token} exists`, () => { resolve(token); });
  }
  test(`wake-ink of ${id} reads on pearl and on glass`, () => {
    assert.ok(contrast(resolve(`wake-ink-${id}`), resolve('pearl')) >= 4.5, 'on pearl');
    assert.ok(contrast(resolve(`wake-ink-${id}`), resolve('white')) >= 4.5, 'on white');
  });
  for (const fill of ['a', 'b']) {
    test(`white text on fill-${fill} of ${id} >= 4.5`, () => {
      const ratio = contrast(resolve('white'), resolve(`fill-${fill}-${id}`));
      assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1`);
    });
  }
}

// Body text sits directly on the haze. Check the strongest spot of each of the three fields.
test('text stays readable on the strongest haze', () => {
  for (const n of ['1', '2', '3']) {
    const alpha = parseFloat(tokens[`haze-${n}-a`]);
    assert.ok(alpha > 0 && alpha < 1, `--haze-${n}-a is an opacity`);
    const bg = over(resolve(`haze-${n}`), resolve('pearl'), alpha);
    for (const fg of ['ink', 'ink-soft']) {
      const ratio = contrast(resolve(fg), bg);
      assert.ok(ratio >= 4.5, `${fg} on haze ${n} (${bg}) is ${ratio.toFixed(2)}:1`);
    }
  }
});
