import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOTS } from '../js/data.js';
import {
  formatCLP, formatDate, buildLotUrl, haversineKm, routeDistanceKm, stopStatus, lotFromHash,
  stopFractions, interpolateRoute, separatePins,
} from '../js/lib.js';

test('data: three lots with unique ids and slugs', () => {
  assert.equal(LOTS.length, 3);
  assert.equal(new Set(LOTS.map((l) => l.id)).size, 3);
  assert.equal(new Set(LOTS.map((l) => l.slug)).size, 3);
});

test('data: roast dates match the store', () => {
  const byId = Object.fromEntries(LOTS.map((l) => [l.id, l.roastDate]));
  assert.deepEqual(byId, {
    'lote-3': '2026-02-04',
    'lote-3-1': '2026-03-19',
    'lote-3-5': '2026-09-26',
  });
});

test('data: coordinates are valid and the roast stop carries the roast date', () => {
  for (const lot of LOTS) {
    assert.ok(lot.stops.length >= 2);
    for (const s of lot.stops) {
      assert.ok(s.lat >= -90 && s.lat <= 90, `${s.id} lat`);
      assert.ok(s.lng >= -180 && s.lng <= 180, `${s.id} lng`);
    }
    assert.equal(lot.stops[0].id, 'farm');
    assert.equal(lot.stops.find((s) => s.id === 'roaster').date, lot.roastDate);
  }
});

test('formatCLP', () => {
  assert.equal(formatCLP(8000), '$8.000');
  assert.equal(formatCLP(0), '$0');
  assert.equal(formatCLP(1234567), '$1.234.567');
  assert.equal(formatCLP(NaN), '');
});

test('formatDate', () => {
  assert.equal(formatDate('2026-02-04'), '4 feb 2026');
  assert.equal(formatDate(null), 'Sin dato');
  assert.equal(formatDate('2026-13-01'), 'Sin dato');
  assert.equal(formatDate('nope'), 'Sin dato');
});

test('buildLotUrl matches real permalinks', () => {
  assert.equal(
    buildLotUrl('bolivia-lavado-java-lote-3-1'),
    'https://rastrotienda.cl/producto/bolivia-lavado-java-lote-3-1/',
  );
  assert.equal(
    buildLotUrl(LOTS[2].slug),
    'https://rastrotienda.cl/producto/bolivia-lavado-java-lote-3-5-dia-del-cafe/',
  );
});

test('distance', () => {
  const p = { lat: -33.4489, lng: -70.6693 };
  assert.equal(haversineKm(p, p), 0);
  assert.equal(routeDistanceKm([]), 0);
  assert.equal(routeDistanceKm([p]), 0);
  const km = routeDistanceKm(LOTS[0].stops);
  assert.ok(km > 2000 && km < 4000, `unexpected ${km}`);
});

test('stopStatus', () => {
  assert.equal(stopStatus({ verified: true }), 'confirmed');
  assert.equal(stopStatus({ verified: false }), 'pending');
  assert.equal(stopStatus(undefined), 'pending');
});

test('lotFromHash falls back to first lot', () => {
  assert.equal(lotFromHash('#lote-3-1').id, 'lote-3-1');
  assert.equal(lotFromHash('#nada').id, 'lote-3');
  assert.equal(lotFromHash(undefined).id, 'lote-3');
});

test('stopFractions runs from 0 to 1 and increases', () => {
  const f = stopFractions(LOTS[0].stops);
  assert.equal(f.length, LOTS[0].stops.length);
  assert.equal(f[0], 0);
  assert.ok(Math.abs(f[f.length - 1] - 1) < 1e-9);
  for (let i = 1; i < f.length; i += 1) assert.ok(f[i] >= f[i - 1]);
});

test('stopFractions edge cases', () => {
  assert.deepEqual(stopFractions([]), []);
  assert.deepEqual(stopFractions([{ lat: 0, lng: 0 }]), [0]);
  const same = [{ lat: 1, lng: 1 }, { lat: 1, lng: 1 }, { lat: 1, lng: 1 }];
  assert.deepEqual(stopFractions(same), [0, 0.5, 1]);
});

test('interpolateRoute draws part of the route', () => {
  const stops = LOTS[0].stops;
  const none = interpolateRoute(stops, 0);
  assert.equal(none.points.length, 1);
  assert.equal(none.head.lat, stops[0].lat);
  const all = interpolateRoute(stops, 1);
  assert.equal(all.points.length, stops.length);
  assert.equal(all.head.lat, stops[stops.length - 1].lat);
  const f = stopFractions(stops);
  const half = interpolateRoute(stops, (f[1] + f[2]) / 2);
  assert.equal(half.points.length, 3);
  const mid = half.head;
  assert.ok(mid.lat < stops[1].lat && mid.lat > stops[2].lat, 'head lies between stop 2 and 3');
});

test('interpolateRoute clamps and handles tiny routes', () => {
  const stops = LOTS[0].stops;
  assert.equal(interpolateRoute(stops, -3).points.length, 1);
  assert.equal(interpolateRoute(stops, 7).points.length, stops.length);
  assert.equal(interpolateRoute(stops, NaN).points.length, 1);
  assert.deepEqual(interpolateRoute([], 0.5), { points: [], head: null });
  assert.equal(interpolateRoute([stops[0]], 0.5).points.length, 1);
});

test('separatePins spreads overlapping pins', () => {
  const pts = [{ x: 100, y: 100 }, { x: 108, y: 104 }, { x: 400, y: 400 }];
  const offs = separatePins(pts, 36);
  const moved = pts.map((p, i) => ({ x: p.x + offs[i].dx, y: p.y + offs[i].dy }));
  assert.ok(Math.hypot(moved[0].x - moved[1].x, moved[0].y - moved[1].y) >= 35.9);
  assert.deepEqual(offs[2], { dx: 0, dy: 0 });
});

test('separatePins handles identical, single and empty inputs', () => {
  const same = [{ x: 50, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }];
  const offs = separatePins(same, 30);
  const moved = same.map((p, i) => ({ x: p.x + offs[i].dx, y: p.y + offs[i].dy }));
  for (let i = 0; i < 3; i += 1) {
    for (let j = i + 1; j < 3; j += 1) {
      assert.ok(Math.hypot(moved[i].x - moved[j].x, moved[i].y - moved[j].y) >= 29, `pair ${i}-${j}`);
    }
  }
  assert.deepEqual(separatePins([{ x: 1, y: 1 }]), [{ dx: 0, dy: 0 }]);
  assert.deepEqual(separatePins([]), []);
});
