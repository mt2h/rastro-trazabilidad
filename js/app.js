import { LOTS, SHARED } from './data.js';
import {
  formatCLP, formatDate, buildLotUrl, routeDistanceKm, stopStatus, lotFromHash,
  stopFractions, interpolateRoute, separatePins,
} from './lib.js';
import { GEAR, gearImage } from './gear.js';
import { PHOTO_CREDITS } from './credits.js';
import { initBrew } from './brew.js';
import { detectLevel } from './fx/level.js';
import { initPointer } from './fx/pointer.js';
import { initReveal, countTo } from './fx/reveal.js';
import { initHaze } from './fx/haze.js';
import { initInteract } from './fx/interact.js';
import { initProximity } from './fx/proximity.js';
import { initSmoothScroll, initNavSpy } from './fx/scroll.js';
import { createTrailLayer } from './fx/trailLayer.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const level = detectLevel();
const reduceMotion = level === 'off';
const hasMap = typeof window.L !== 'undefined';

document.documentElement.dataset.fx = level;
initPointer();

const state = {
  lot: lotFromHash(location.hash),
  current: -1, // the one lit stop, or -1
  t: 0, // fraction of the route that is drawn
  reached: 0, // stops already announced with a burst of beans
  token: 0, // bumped to cancel any running animation
  playing: false,
  inView: false,
};
const map = { inst: null, markers: [], dots: [], legs: [], glows: [], leaders: [], base: null, offsets: [], trail: null };

/** Build a DOM element; text goes in via textContent so nothing is parsed as HTML. */
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

const priceRange = (lot) => `${formatCLP(lot.salePrice)} – ${formatCLP(lot.priceMax)}`;
const stops = () => state.lot.stops;
const swap = (node) => { if (reduceMotion) return; node.classList.remove('swap'); void node.offsetWidth; node.classList.add('swap'); };

/* ---------- Hero tools ---------- */

function renderHeroGear() {
  $$('[data-gear]').forEach((node) => {
    const gear = GEAR.find((g) => g.id === node.dataset.gear);
    if (!gear) return;
    node.replaceChildren(gearImage(gear, { eager: true }));
    node.setAttribute('data-name', gear.name);
  });
}

function renderCredits() {
  $('#credits').replaceChildren(...PHOTO_CREDITS.map((c) => el('li', {}, [
    document.createTextNode(`${c.name}: `),
    el('a', { href: c.page, target: '_blank', rel: 'noopener', text: c.file }),
    document.createTextNode(` por ${c.author}, ${c.license}`),
  ])));
}

/* ---------- Lot selector, facts, buy rows ---------- */

function buildTabs() {
  const host = $('#lot-tabs');
  const ind = el('span', { class: 'seg__ind', 'aria-hidden': 'true' });
  host.replaceChildren(ind, ...LOTS.map((lot) => {
    const tab = el('button', { class: 'tab', role: 'tab', type: 'button', id: `tab-${lot.id}`, 'data-lot': lot.id, 'aria-selected': 'false', tabindex: '-1' }, [
      el('span', { class: 'tab__name', text: lot.lotLabel }),
      el('span', { class: 'tab__date', text: `Tueste ${formatDate(lot.roastDate)}` }),
      lot.badge ? el('span', { class: 'tab__badge', text: lot.badge }) : null,
    ]);
    tab.addEventListener('click', () => selectLot(lot.id));
    tab.addEventListener('keydown', (e) => {
      const i = LOTS.indexOf(state.lot);
      if (e.key === 'ArrowRight') { e.preventDefault(); selectLot(LOTS[(i + 1) % LOTS.length].id, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectLot(LOTS[(i + LOTS.length - 1) % LOTS.length].id, true); }
    });
    return tab;
  }));
}

function updateTabs() {
  $$('#lot-tabs .tab').forEach((tab) => {
    const on = tab.dataset.lot === state.lot.id;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    if (on) {
      const ind = $('#lot-tabs .seg__ind');
      ind.style.setProperty('--x', `${tab.offsetLeft}px`);
      ind.style.setProperty('--w', `${tab.offsetWidth}px`);
    }
  });
}

function renderFacts() {
  const lot = state.lot;
  const rows = [
    ['Tueste', formatDate(lot.roastDate)],
    ['Productor', SHARED.producer],
    ['Finca', SHARED.farm],
    ['Origen', SHARED.origin],
    ['Altitud', { count: 1600, tight: '+', suffix: 'msnm' }],
    ['Variedad', SHARED.variety],
    ['Proceso', SHARED.process],
    ['Malla', SHARED.screen],
    ['Cosecha', SHARED.harvest],
    ['Puntaje SCA', { count: SHARED.sca, suffix: '' }],
    ['Importador', SHARED.importer],
    ['Tostador', SHARED.roaster],
  ];
  $('#facts').replaceChildren(...rows.map(([k, v]) => {
    const dd = el('dd');
    const key = typeof v === 'object';
    if (key) {
      const num = el('span', { text: '0' });
      dd.append(num);
      if (v.tight) dd.append(document.createTextNode(v.tight));
      if (v.suffix) dd.append(document.createTextNode(` ${v.suffix}`));
      countTo(num, v.count, { level, duration: 1300 });
    } else {
      dd.textContent = v;
    }
    return el('div', { class: `fact${key ? ' fact--key' : ''}` }, [el('dt', { text: k }), dd]);
  }));
  swap($('#facts'));
}

function renderRows() {
  $('#rows').replaceChildren(...LOTS.map((lot) => {
    const buy = el('a', {
      class: 'btn btn--primary btn--sm', href: buildLotUrl(lot.slug), target: '_blank', rel: 'noopener',
      'aria-label': `Comprar ${lot.lotLabel} en rastrotienda.cl`,
    }, [document.createTextNode('Comprar'), icon('external')]);
    return el('li', { class: `row glass${lot.id === state.lot.id ? ' is-selected' : ''}`, 'data-dye': lot.id, 'data-spot': '' }, [
      el('span', { class: 'row__dot', 'aria-hidden': 'true' }),
      el('div', {}, [
        el('p', { class: 'row__name', text: `${lot.lotLabel}${lot.badge ? ` · ${lot.badge}` : ''}` }),
        el('p', { class: 'row__meta', text: `Tueste ${formatDate(lot.roastDate)} · disponibilidad en la tienda` }),
      ]),
      el('p', { class: 'row__price', text: priceRange(lot) }),
      buy,
    ]);
  }));
}

/* ---------- Map ---------- */

function knotIcon(i, off = { dx: 0, dy: 0 }) {
  const s = stops()[i];
  return window.L.divIcon({
    className: '',
    html: `<div class="knot map-knot" data-verified="${stopStatus(s) === 'confirmed'}">${i + 1}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17 - off.dx, 17 - off.dy],
  });
}

function popupFor(stop) {
  const photo = stop.image && !stop.image.logo
    ? el('img', { src: stop.image.src, width: String(stop.image.w), height: String(stop.image.h), alt: stop.image.alt, loading: 'lazy' })
    : null;
  return el('div', {}, [
    el('strong', { text: stop.label }),
    el('div', { text: stop.place }),
    el('div', { text: formatDate(stop.date) }),
    photo,
  ]);
}

function setupMap() {
  if (!hasMap) {
    $('#map').replaceChildren(el('p', { class: 'route__fallback', text: 'El mapa no pudo cargarse. Sigue el recorrido en la lista de etapas.' }));
    $('#play').disabled = true;
    return;
  }
  map.inst = window.L.map('map', { scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
  const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services';
  window.L.tileLayer(`${esri}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 13, attribution: 'Esri, USGS, NOAA' }).addTo(map.inst);
  window.L.tileLayer(`${esri}/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 13, opacity: 0.55, className: 'hill' }).addTo(map.inst);
  window.L.tileLayer(`${esri}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 13, opacity: 0.9 }).addTo(map.inst);
  map.trail = createTrailLayer(map.inst, { level, isPending: (s) => stopStatus(s) === 'pending' });
  map.inst.on('zoomend', layoutPins);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      map.inst.invalidateSize();
      if (!state.playing && state.current < 0) fitRoute();
      map.trail?.rebuild();
    }).observe($('#map'));
  }
}

function fitRoute() {
  if (!map.base) return;
  map.inst.fitBounds(map.base.getBounds(), { padding: [52, 52], animate: false });
}

/** Spread overlapping pins in pixel space so neighbouring stops stay readable. */
function layoutPins() {
  if (!map.inst || map.markers.length === 0) return;
  const pts = stops().map((s) => map.inst.latLngToContainerPoint([s.lat, s.lng]));
  map.offsets = separatePins(pts.map((p) => ({ x: p.x, y: p.y })), 40);
  map.markers.forEach((m, i) => m.setIcon(knotIcon(i, map.offsets[i])));
  map.leaders.forEach((leader, i) => {
    const off = map.offsets[i];
    if (Math.hypot(off.dx, off.dy) < 2) { leader.setLatLngs([]); return; }
    const moved = map.inst.containerPointToLatLng([pts[i].x + off.dx, pts[i].y + off.dy]);
    leader.setLatLngs([[stops()[i].lat, stops()[i].lng], moved]);
  });
  paintKnots();
  map.trail?.rebuild();
}

function buildRoute() {
  if (!hasMap) return;
  [...map.markers, ...map.dots, ...map.legs, ...map.glows, ...map.leaders, map.base].forEach((l) => l && l.remove());
  const latlngs = stops().map((s) => [s.lat, s.lng]);
  const style = (cls, weight, extra = {}) => ({ className: cls, weight, lineCap: 'round', lineJoin: 'round', interactive: false, ...extra });
  map.base = window.L.polyline(latlngs, style('route-base', 2, { opacity: 0.3, dashArray: '1 8' })).addTo(map.inst);
  map.glows = stops().slice(1).map(() => window.L.polyline([], style('route-glow', 16, { opacity: 0.2 })).addTo(map.inst));
  map.legs = stops().slice(1).map((s, k) => {
    const pending = stopStatus(stops()[k]) === 'pending' || stopStatus(s) === 'pending';
    return window.L.polyline([], style(`route-thread${pending ? ' is-pending' : ''}`, pending ? 6 : 5, { opacity: 1 })).addTo(map.inst);
  });
  map.leaders = stops().map(() => window.L.polyline([], { className: 'route-leader', weight: 1.5, opacity: 0.5, interactive: false }).addTo(map.inst));
  map.dots = stops().map((s) => window.L.circleMarker([s.lat, s.lng], { className: 'route-origin', radius: 3.5, weight: 1.5, color: '#2b1710', fillColor: '#2b1710', fillOpacity: 1, interactive: false }).addTo(map.inst));
  map.markers = stops().map((s, i) => {
    const marker = window.L.marker([s.lat, s.lng], { icon: knotIcon(i), title: s.label, keyboard: true }).addTo(map.inst);
    marker.bindPopup(popupFor(s));
    marker.on('click', () => { stopPlayback(); focusStop(i, false); });
    return marker;
  });
  fitRoute();
  map.trail?.setStops(stops());
  layoutPins();
}

/* ---------- Timeline ---------- */

/** Real photos and logos of the stop, from the RASTRO store. */
function stopMedia(stop) {
  if (!stop.image && !stop.badge) return null;
  const img = (spec, cls) => el('img', { class: cls, src: spec.src, width: String(spec.w), height: String(spec.h), alt: spec.alt, loading: 'lazy', decoding: 'async' });
  return el('span', { class: 'stop__media' }, [
    stop.image ? img(stop.image, `stop__photo${stop.image.logo ? ' stop__photo--logo' : ''}`) : null,
    stop.badge ? img(stop.badge, 'stop__badge') : null,
  ]);
}

function renderTimeline() {
  $('#timeline').replaceChildren(
    ...stops().map((s, i) => {
      const pending = stopStatus(s) === 'pending';
      const btn = el('button', { class: 'stop', type: 'button', 'data-index': String(i) }, [
        el('span', { class: 'knot', 'data-verified': String(!pending), text: String(i + 1) }),
        el('span', {}, [
          el('span', { class: 'stop__name', text: s.label }),
          el('span', { class: 'stop__place', text: s.place }),
          el('span', { class: 'stop__ticket' }, [
            el('span', { text: `${s.kind} · ${formatDate(s.date)}` }),
            pending ? el('span', { class: 'stop__tag', text: 'ubicación por confirmar' }) : null,
          ]),
          el('p', { class: 'stop__text', text: s.text }),
          stopMedia(s),
        ]),
      ]);
      btn.addEventListener('click', () => { stopPlayback(); focusStop(i, true); });
      return el('li', {}, [btn]);
    }),
  );
}

/* ---------- Painting the current progress ---------- */

function paintKnots() {
  const fr = stopFractions(stops());
  map.markers.forEach((m, i) => {
    const node = m.getElement()?.firstElementChild;
    if (!node) return;
    node.classList.toggle('is-reached', fr[i] <= state.t + 1e-9);
    node.classList.toggle('is-current', i === state.current);
  });
}

function paint() {
  const fr = stopFractions(stops());
  const n = stops().length;
  $$('#timeline li').forEach((li, i) => {
    const btn = li.firstElementChild;
    const knot = btn.firstElementChild;
    knot.classList.toggle('is-reached', fr[i] <= state.t + 1e-9);
    knot.classList.toggle('is-current', i === state.current);
    btn.classList.toggle('is-current', i === state.current);
    li.classList.toggle('seg-reached', i + 1 < n && fr[i + 1] <= state.t + 1e-9);
    if (i === state.current) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
  });
  const counter = $('#stage-counter');
  counter.hidden = state.current < 0;
  if (state.current >= 0) counter.textContent = `Etapa ${state.current + 1} de ${n}`;
  if (!hasMap) return;
  const route = interpolateRoute(stops(), state.t);
  const latlngs = route.points.map((p) => [p.lat, p.lng]);
  map.legs.forEach((leg, k) => {
    const seg = latlngs.length > k + 1 ? [latlngs[k], latlngs[k + 1]] : [];
    leg.setLatLngs(seg);
    map.glows[k].setLatLngs(seg);
  });
  // Announce each newly reached stop with a burst of beans.
  const reached = fr.filter((f) => f <= state.t + 1e-9).length;
  if (state.t > 0 && reached > state.reached) {
    for (let i = Math.max(1, state.reached); i < reached; i += 1) map.trail?.burst(i);
  }
  state.reached = reached;
  map.trail?.setProgress(state.t);
  paintKnots();
}

/* ---------- Animation ---------- */

const wait = (ms, token) => new Promise((resolve) => setTimeout(() => resolve(token === state.token), ms));

function animate(from, to, ms, token) {
  return new Promise((resolve) => {
    if (reduceMotion || ms <= 0) { state.t = to; paint(); resolve(token === state.token); return; }
    const start = performance.now();
    const frame = (now) => {
      if (token !== state.token) { resolve(false); return; }
      const x = Math.min(1, (now - start) / ms);
      const eased = x === 1 ? 1 : 1 - 2 ** (-10 * x); // exponential ease-out
      state.t = from + (to - from) * eased;
      paint();
      if (x < 1) requestAnimationFrame(frame); else resolve(true);
    };
    requestAnimationFrame(frame);
  });
}

function flyToStop(i) {
  if (!hasMap) return;
  const s = stops()[i];
  const target = [s.lat, s.lng];
  const zoom = Math.max(map.inst.getZoom(), 6);
  if (reduceMotion) map.inst.setView(target, zoom, { animate: false });
  else map.inst.flyTo(target, zoom, { duration: 1.1 });
}

function setPlayLabel(playing) {
  $('#play').replaceChildren(icon(playing ? 'pause' : 'play'), el('span', { text: playing ? 'Pausar' : 'Seguir el rastro' }));
}

function stopPlayback() {
  state.token += 1;
  state.playing = false;
  setPlayLabel(false);
}

/** The signature moment: the wake travels from the farm to the cup, leaving footprints and beans. */
async function weave() {
  const token = ++state.token;
  state.current = -1;
  state.t = 0;
  state.reached = 0;
  paint();
  await animate(0, 1, 3200, token);
  if (token === state.token) paint();
}

function focusStop(i, fly) {
  const fr = stopFractions(stops());
  state.current = i;
  state.t = fr[i];
  state.reached = i + 1;
  paint();
  if (fly) flyToStop(i);
}

async function play() {
  if (!hasMap) return;
  if (state.playing) { stopPlayback(); return; }
  const token = ++state.token;
  state.playing = true;
  setPlayLabel(true);
  const fr = stopFractions(stops());
  const n = stops().length;
  state.t = 0;
  state.reached = 0;
  state.current = 0;
  paint();
  flyToStop(0);
  if (!(await wait(reduceMotion ? 500 : 1700, token))) return;
  for (let i = 1; i < n; i += 1) {
    state.current = -1;
    if (!(await animate(fr[i - 1], fr[i], reduceMotion ? 0 : 1700, token))) return;
    state.current = i;
    paint();
    flyToStop(i);
    if (!(await wait(reduceMotion ? 500 : 1900, token))) return;
  }
  state.playing = false;
  state.current = -1;
  state.t = 1;
  paint();
  setPlayLabel(false);
  if (reduceMotion) fitRoute(); else map.inst.flyToBounds(map.base.getBounds(), { padding: [52, 52], duration: 1.2 });
}

/* ---------- Lot selection and boot ---------- */

function renderRoute() {
  stopPlayback();
  const n = stops().length;
  const km = Math.round(routeDistanceKm(stops()));
  $('#route-summary').textContent = `${state.lot.lotLabel} · ${n} etapas · cerca de ${km.toLocaleString('es-CL')} km en línea recta.`;
  state.current = -1;
  state.t = 0;
  state.reached = 0;
  renderTimeline();
  buildRoute();
  paint();
}

function selectLot(id, focusTab = false) {
  state.lot = LOTS.find((l) => l.id === id) || LOTS[0];
  document.body.dataset.lot = state.lot.id;
  history.replaceState(null, '', `#${state.lot.id}`);
  updateTabs();
  renderFacts();
  renderRows();
  renderRoute();
  swap($('#rows'));
  if (state.inView) weave(); else { state.t = 0; paint(); }
  if (focusTab) $(`#tab-${state.lot.id}`)?.focus();
}

function watchRoute() {
  const target = $('#map-wrap');
  if (!('IntersectionObserver' in window)) { state.inView = true; state.t = 1; paint(); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    state.inView = true;
    if (reduceMotion) { state.t = 1; paint(); } else weave();
  }, { threshold: 0.45 });
  io.observe(target);
}

document.body.dataset.lot = state.lot.id;
renderHeroGear();
buildTabs();
updateTabs();
renderFacts();
renderRows();
setupMap();
setPlayLabel(false);
renderRoute();
initReveal(level);
initHaze(level);
initInteract(level);
initProximity(level);
initSmoothScroll({ reduceMotion });
initNavSpy();
renderCredits();
initBrew({ level });
watchRoute();
$('#play').addEventListener('click', play);
window.addEventListener('resize', updateTabs);
if (document.fonts?.ready) document.fonts.ready.then(updateTabs);
window.addEventListener('hashchange', () => {
  // Section anchors (#ruta, #comprar) share the hash; only react to lot ids.
  const id = location.hash.replace(/^#/, '');
  if (LOTS.some((l) => l.id === id) && id !== state.lot.id) selectLot(id);
});
