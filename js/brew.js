// The brew section: pick a method, scale the dose, and follow the step timer.

import {
  RECIPES, recipeById, clampDose, scaleRecipe, activeStep, formatClock, waterAtTime,
} from './recipes.js';
import { gearById, gearImage } from './gear.js';
import { onFrame } from './fx/loop.js';

const $ = (sel) => document.querySelector(sel);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

export function initBrew({ level, onFinish = () => {} }) {
  const state = { id: RECIPES[0].id, dose: RECIPES[0].dose.default, running: false, elapsed: 0, startedAt: 0, base: 0, lastStep: -2 };
  let off = null;

  const recipe = () => recipeById(state.id);
  const scaled = () => scaleRecipe(recipe(), state.dose);

  function renderTabs() {
    const tabs = $('#brew-tabs');
    tabs.replaceChildren(...RECIPES.map((r) => {
      const gear = gearById(r.gearId);
      const thumb = gearImage(gear);
      thumb.alt = '';
      const btn = el('button', { class: 'method', role: 'tab', type: 'button', 'aria-selected': String(r.id === state.id), tabindex: r.id === state.id ? '0' : '-1', id: `method-${r.id}` }, [
        thumb,
        el('span', {}, [el('b', { text: r.name }), el('small', { text: r.filtered ? 'Filtrado · recomendado' : r.grind })]),
      ]);
      btn.addEventListener('click', () => select(r.id));
      btn.addEventListener('keydown', (e) => {
        const i = RECIPES.findIndex((x) => x.id === state.id);
        const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(RECIPES[(i + dir + RECIPES.length) % RECIPES.length].id, true);
      });
      return btn;
    }));
  }

  function renderPanel() {
    const r = recipe();
    const sc = scaled();
    $('#brew-gear').replaceChildren(gearImage(gearById(r.gearId), { eager: true }));
    $('#brew-name').textContent = r.name;
    $('#brew-summary').textContent = r.summary;
    $('#brew-fit').textContent = r.filtered
      ? 'Según la ficha del lote, es ideal para métodos filtrados como este.'
      : 'La ficha del lote lo recomienda para métodos filtrados; este es una alternativa.';
    $('#brew-facts').replaceChildren(...[
      ['Proporción', `1:${r.ratio}`],
      ['Temperatura', `${r.tempC} °C`],
      ['Molienda', r.grind],
      ['Tiempo', formatClock(r.totalSec)],
    ].map(([k, v]) => el('div', {}, [el('dt', { text: k }), el('dd', { text: v })])));

    const dose = $('#dose');
    dose.min = String(r.dose.min);
    dose.max = String(r.dose.max);
    dose.value = String(sc.coffee);
    state.dose = sc.coffee;
    renderDose();

    let lastMl = 0;
    $('#brew-steps').replaceChildren(...sc.steps.map((s, i) => {
      const pours = s.waterTo > lastMl;
      lastMl = s.waterTo;
      return el('li', { class: 'step', 'data-i': String(i) }, [
        el('time', { text: formatClock(s.at) }),
        el('div', {}, [
          el('b', { text: s.label }),
          el('span', { text: s.detail }),
          pours ? el('em', { text: `Llega a ${s.waterTo} ml` }) : null,
        ]),
      ]);
    }));

    const grind = $('#brew-grind');
    grind.replaceChildren(
      document.createTextNode('Al pedir tu café elige la molienda '),
      el('b', { text: r.storeGrind }),
      document.createTextNode(' en '),
      el('a', { href: '#comprar', text: 'la tienda' }),
      document.createTextNode('.'),
    );
    updateTimer(true);
  }

  function renderDose() {
    const r = recipe();
    const dose = $('#dose');
    const pct = ((state.dose - r.dose.min) / (r.dose.max - r.dose.min)) * 100;
    dose.style.setProperty('--pct', `${pct.toFixed(1)}%`);
    $('#dose-out').textContent = `${state.dose} g`;
  }

  function updateTimer(force = false) {
    const r = recipe();
    const sc = scaled();
    const t = Math.min(state.elapsed, r.totalSec);
    const p = (t / r.totalSec) * 100;
    $('#timer-ring').style.setProperty('--p', p.toFixed(1));
    $('#timer-clock').textContent = formatClock(t);
    const ml = waterAtTime(sc, t);
    const water = $('#brew-water');
    water.replaceChildren(el('b', { text: `${ml} ml` }), document.createTextNode(` de ${sc.water} ml · café ${sc.coffee} g`));
    $('#gauge-fill').style.setProperty('--fill', `${(ml / sc.water) * 100}%`);
    $('#gauge-fill').parentElement.style.setProperty('--fill', `${(ml / sc.water) * 100}%`);
    const idx = state.elapsed > 0 || state.running ? activeStep(sc.steps, t) : -1;
    if (force || idx !== state.lastStep) {
      state.lastStep = idx;
      document.querySelectorAll('#brew-steps .step').forEach((node, i) => {
        node.classList.toggle('is-active', i === idx);
        node.classList.toggle('is-done', i < idx);
      });
    }
  }

  function setButton(running) {
    const btn = $('#timer-toggle');
    const finished = state.elapsed >= recipe().totalSec;
    btn.replaceChildren(icon(running ? 'pause' : 'play'), el('span', { text: running ? 'Pausar' : finished ? 'Repetir' : state.elapsed > 0 ? 'Continuar' : 'Iniciar' }));
  }

  function stop() {
    state.running = false;
    if (off) { off(); off = null; }
    setButton(false);
  }

  function toggle() {
    if (state.running) { state.base = state.elapsed; stop(); return; }
    if (state.elapsed >= recipe().totalSec) { state.elapsed = 0; state.base = 0; }
    state.running = true;
    state.startedAt = performance.now();
    setButton(true);
    off = onFrame((_, now) => {
      state.elapsed = state.base + (now - state.startedAt) / 1000;
      if (state.elapsed >= recipe().totalSec) {
        state.elapsed = recipe().totalSec;
        stop();
        updateTimer();
        onFinish(recipe());
        return;
      }
      updateTimer();
    });
  }

  function reset() {
    stop();
    state.elapsed = 0;
    state.base = 0;
    state.lastStep = -2;
    setButton(false);
    updateTimer(true);
  }

  function select(id, focus = false) {
    stop();
    state.id = id;
    state.dose = recipeById(id).dose.default;
    state.elapsed = 0;
    state.base = 0;
    state.lastStep = -2;
    renderTabs();
    renderPanel();
    setButton(false);
    $('#brew-gear').classList.remove('swap');
    void $('#brew-gear').offsetWidth;
    if (level !== 'off') $('#brew-gear').classList.add('swap');
    if (focus) $(`#method-${id}`)?.focus();
  }

  $('#dose').addEventListener('input', (e) => {
    state.dose = clampDose(recipe(), e.target.value);
    renderDose();
    renderPanel();
  });
  $('#timer-toggle').addEventListener('click', toggle);
  $('#timer-reset').addEventListener('click', reset);

  renderTabs();
  renderPanel();
  setButton(false);
}
