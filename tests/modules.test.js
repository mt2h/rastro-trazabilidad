import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  polylineLength, pointAtDistance, footprintsAlong, printOpacity, spawnBean, stepBeans, beanOpacity,
} from '../js/trail.js';
import {
  RECIPES, recipeById, clampDose, scaleRecipe, activeStep, formatClock,
} from '../js/recipes.js';
import { GEAR, gearById } from '../js/gear.js';
import { fxLevel } from '../js/fx/level.js';
import { easeInOutCubic, glideDuration, sectionAtLine } from '../js/fx/scroll.js';

const line = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];

test('polylineLength and pointAtDistance', () => {
  assert.equal(polylineLength(line), 200);
  assert.equal(polylineLength([]), 0);
  assert.equal(polylineLength([{ x: 1, y: 1 }]), 0);
  assert.deepEqual(pointAtDistance(line, 50), { x: 50, y: 0, angle: 0 });
  const down = pointAtDistance(line, 150);
  assert.equal(down.x, 100);
  assert.equal(down.y, 50);
  assert.ok(Math.abs(down.angle - Math.PI / 2) < 1e-9);
  const past = pointAtDistance(line, 999);
  assert.deepEqual({ x: past.x, y: past.y }, { x: 100, y: 100 });
  assert.equal(pointAtDistance([], 5), null);
});

test('footprintsAlong alternates sides, stays ordered and covers the line', () => {
  const prints = footprintsAlong(line, { spacing: 20, stride: 8 });
  assert.equal(prints.length, 10);
  prints.forEach((p, i) => {
    assert.equal(p.index, i);
    assert.equal(p.side, i % 2 === 0 ? -1 : 1);
    if (i > 0) assert.ok(p.distance > prints[i - 1].distance);
  });
  // On the first leg (heading +x) the left and right prints sit 8 px apart across the line.
  assert.ok(Math.abs(prints[0].y - -prints[1].y) < 1e-9);
  assert.ok(Math.abs(Math.abs(prints[0].y) - 4) < 1e-9);
});

test('footprintsAlong handles degenerate input', () => {
  assert.deepEqual(footprintsAlong([]), []);
  assert.deepEqual(footprintsAlong([{ x: 1, y: 1 }]), []);
  assert.deepEqual(footprintsAlong([{ x: 5, y: 5 }, { x: 5, y: 5 }]), []);
  assert.deepEqual(footprintsAlong(line, { spacing: 0 }), []);
});

test('printOpacity hides unreached prints and fades old ones to the floor', () => {
  assert.equal(printOpacity(120, 100), 0);
  assert.equal(printOpacity(100, 100), 1);
  assert.equal(printOpacity(0, 10000, { floor: 0.4 }), 0.4);
  const mid = printOpacity(100, 230, { fadeLength: 260, floor: 0.4 });
  assert.ok(mid > 0.4 && mid < 1);
});

test('beans fall, age out and fade', () => {
  let seed = 0.3;
  const rng = () => { seed = (seed * 9301 + 49297) % 233280 / 233280; return seed; };
  const bean = spawnBean({ x: 50, y: 50 }, rng);
  assert.ok(bean.life > 0 && bean.size > 0);
  const later = stepBeans([bean], 0.2)[0];
  assert.ok(later.vy > bean.vy, 'gravity increases vy');
  assert.ok(later.age > bean.age);
  assert.deepEqual(stepBeans([bean], 0), [bean]);
  assert.deepEqual(stepBeans([bean], bean.life + 1), []);
  assert.equal(beanOpacity({ age: 0, life: 1 }), 0);
  assert.equal(beanOpacity({ age: 0.1, life: 1 }), 1);
  assert.ok(beanOpacity({ age: 0.99, life: 1 }) < 0.05);
});

test('recipes: every recipe is well formed', () => {
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  for (const r of RECIPES) {
    assert.ok(r.ratio > 0 && r.tempC > 0 && r.totalSec > 0, r.id);
    assert.ok(r.dose.min < r.dose.default && r.dose.default < r.dose.max, r.id);
    assert.ok(gearById(r.gearId).id === r.gearId, `${r.id} points to a real gear item`);
    let lastAt = -1;
    let lastPour = 0;
    for (const s of r.steps) {
      assert.ok(s.at >= lastAt, `${r.id} steps are in time order`);
      assert.ok(s.pour >= lastPour && s.pour <= 1, `${r.id} pours never go back`);
      lastAt = s.at;
      lastPour = s.pour;
    }
    assert.equal(r.steps[r.steps.length - 1].at, r.totalSec, `${r.id} ends at totalSec`);
    assert.equal(r.steps[r.steps.length - 1].pour, 1, `${r.id} reaches all the water`);
  }
});

test('scaleRecipe scales water and per-step amounts', () => {
  const v60 = recipeById('v60');
  const s = scaleRecipe(v60, 20);
  assert.equal(s.coffee, 20);
  assert.equal(s.water, 320);
  assert.equal(s.steps[s.steps.length - 1].waterTo, 320);
  assert.equal(s.steps[1].waterTo, 40, 'bloom is twice the coffee');
  assert.equal(scaleRecipe(recipeById('espresso'), 18).water, 36);
});

test('clampDose handles out-of-range and invalid input', () => {
  const v60 = recipeById('v60');
  assert.equal(clampDose(v60, 5), v60.dose.min);
  assert.equal(clampDose(v60, 500), v60.dose.max);
  assert.equal(clampDose(v60, 'abc'), v60.dose.default);
  assert.equal(clampDose(v60, undefined), v60.dose.default);
  assert.equal(clampDose(v60, 14.6), 15);
  assert.equal(recipeById('nope').id, RECIPES[0].id);
});

test('activeStep and formatClock', () => {
  const steps = recipeById('v60').steps;
  assert.equal(activeStep(steps, -1), -1);
  assert.equal(activeStep(steps, 0), 0);
  assert.equal(activeStep(steps, 41), 2);
  assert.equal(activeStep(steps, 9999), steps.length - 1);
  assert.equal(formatClock(83), '1:23');
  assert.equal(formatClock(0), '0:00');
  assert.equal(formatClock(-5), '0:00');
  assert.equal(formatClock(NaN), '0:00');
});

test('gear: unique ids, names, notes and real image files', async () => {
  const { existsSync, statSync } = await import('node:fs');
  assert.ok(GEAR.length >= 6);
  assert.equal(new Set(GEAR.map((g) => g.id)).size, GEAR.length);
  for (const g of GEAR) {
    assert.ok(g.name && g.note, g.id);
    const file = new URL(`../${g.img}`, import.meta.url);
    assert.ok(existsSync(file), `${g.img} exists`);
    assert.ok(statSync(file).size > 5000, `${g.img} is a real image`);
    assert.ok(g.w > 100 && g.h > 100, `${g.id} declares its size`);
  }
  assert.equal(gearById('nope').id, GEAR[0].id);
});

test('fxLevel', () => {
  assert.equal(fxLevel({}), 'full');
  assert.equal(fxLevel({ reduceMotion: true }), 'off');
  assert.equal(fxLevel({ saveData: true }), 'lite');
  assert.equal(fxLevel({ cores: 2 }), 'lite');
  assert.equal(fxLevel({ memory: 2 }), 'lite');
  assert.equal(fxLevel({ reduceMotion: true, saveData: true }), 'off');
});

import { mapProgress, legAt } from '../js/trail.js';
import { waterAtTime } from '../js/recipes.js';

test('mapProgress converts geographic progress to pixel distance', () => {
  const fr = [0, 0.25, 1];
  const px = [0, 100, 300];
  assert.equal(mapProgress(0, fr, px), 0);
  assert.equal(mapProgress(0.125, fr, px), 50);
  assert.equal(mapProgress(0.25, fr, px), 100);
  assert.equal(mapProgress(0.625, fr, px), 200);
  assert.equal(mapProgress(1, fr, px), 300);
  assert.equal(mapProgress(5, fr, px), 300);
  assert.equal(mapProgress(-1, fr, px), 0);
  assert.equal(mapProgress(NaN, fr, px), 0);
  assert.equal(mapProgress(0.5, [], []), 0);
  assert.equal(mapProgress(0.5, [0], [0]), 0);
  assert.equal(mapProgress(0.5, [0, 0, 1], [0, 0, 10]), 5, 'zero-length first leg does not divide by zero');
});

test('legAt finds the leg that holds a distance', () => {
  const px = [0, 100, 300];
  assert.equal(legAt(0, px), 0);
  assert.equal(legAt(100, px), 0);
  assert.equal(legAt(101, px), 1);
  assert.equal(legAt(999, px), 1);
});

test('waterAtTime ramps water up to the total', () => {
  const s = scaleRecipe(recipeById('v60'), 20);
  assert.equal(waterAtTime(s, 0), 0);
  assert.equal(waterAtTime(s, s.steps[s.steps.length - 1].at), s.water);
  assert.equal(waterAtTime(s, 99999), s.water);
  const mid = waterAtTime(s, 60);
  assert.ok(mid > 0 && mid < s.water);
  let last = 0;
  for (let t = 0; t <= 200; t += 5) {
    const w = waterAtTime(s, t);
    assert.ok(w >= last, 'never decreases');
    last = w;
  }
  assert.equal(waterAtTime(s, -4), 0);
  assert.equal(waterAtTime(s, NaN), 0);
});

test('the scroll glide eases in and out and stays inside 0..1', () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.ok(easeInOutCubic(0.1) < 0.1 && easeInOutCubic(0.9) > 0.9);
  assert.equal(easeInOutCubic(-3), 0);
  assert.equal(easeInOutCubic(7), 1);
});

test('the glide lasts between 0.7 s and 1.5 s', () => {
  assert.equal(glideDuration(50), 700);
  assert.equal(glideDuration(-2000), 900);
  assert.equal(glideDuration(99999), 1500);
});

test('the reader section is the last one past the reading line', () => {
  assert.equal(sectionAtLine([900, 1800, 2700], 360), -1);
  assert.equal(sectionAtLine([300, 1800, 2700], 360), 0);
  assert.equal(sectionAtLine([-1200, 200, 2700], 360), 1);
});
