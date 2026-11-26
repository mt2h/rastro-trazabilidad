// Base brewing recipes. These are standard starting points (common ratios and times),
// not claims about a specific coffee; the roaster can replace them with his own.
//
// `pour` is the cumulative share of the total water poured by the time of the step.

export const RECIPES = [
  {
    id: 'v60',
    name: 'V60',
    gearId: 'v60',
    filtered: true,
    ratio: 16,
    tempC: 94,
    totalSec: 180,
    grind: 'Media-fina',
    storeGrind: 'Media (V60)',
    dose: { min: 10, max: 30, default: 15 },
    summary: 'Limpia y aromática. La favorita para destacar notas florales.',
    steps: [
      { at: 0, pour: 0, label: 'Prepara', detail: 'Enjuaga el filtro con agua caliente, descártala y agrega el café molido.' },
      { at: 5, pour: 0.125, label: 'Floración', detail: 'Vierte el doble del café en peso y deja reposar para que libere gas.' },
      { at: 40, pour: 0.6, label: 'Primer vertido', detail: 'Vierte en espiral lenta hasta el 60 % del agua.' },
      { at: 80, pour: 1, label: 'Segundo vertido', detail: 'Completa el agua total sin tocar las paredes del filtro.' },
      { at: 120, pour: 1, label: 'Drenado', detail: 'Deja que el agua termine de bajar.' },
      { at: 180, pour: 1, label: 'Listo', detail: 'Remueve suavemente y sirve.' },
    ],
  },
  {
    id: 'chemex',
    name: 'Chemex',
    gearId: 'chemex',
    filtered: true,
    ratio: 16,
    tempC: 94,
    totalSec: 270,
    grind: 'Media-gruesa',
    storeGrind: 'Media (V60)',
    dose: { min: 20, max: 50, default: 30 },
    summary: 'Taza muy limpia y brillante, gracias a su filtro grueso.',
    steps: [
      { at: 0, pour: 0, label: 'Prepara', detail: 'Moja el filtro, descarta el agua y agrega el café. Si puedes, muele un poco más grueso que para V60.' },
      { at: 5, pour: 0.1, label: 'Floración', detail: 'Vierte agua para humedecer todo el café y espera.' },
      { at: 45, pour: 0.55, label: 'Primer vertido', detail: 'Vierte en círculos hasta poco más de la mitad.' },
      { at: 105, pour: 1, label: 'Segundo vertido', detail: 'Completa el agua total.' },
      { at: 180, pour: 1, label: 'Drenado', detail: 'Espera a que el lecho baje.' },
      { at: 270, pour: 1, label: 'Listo', detail: 'Retira el filtro y sirve.' },
    ],
  },
  {
    id: 'aeropress',
    name: 'Aeropress',
    gearId: 'aeropress',
    filtered: true,
    ratio: 15,
    tempC: 88,
    totalSec: 120,
    grind: 'Media-fina',
    storeGrind: 'Media (V60)',
    dose: { min: 12, max: 24, default: 16 },
    summary: 'Rápida, tolerante y fácil de llevar a cualquier lugar.',
    steps: [
      { at: 0, pour: 0, label: 'Prepara', detail: 'Moja el filtro, coloca el café y arma la Aeropress.' },
      { at: 3, pour: 1, label: 'Vierte', detail: 'Agrega toda el agua y remueve unos segundos.' },
      { at: 60, pour: 1, label: 'Reposa', detail: 'Deja infusionar.' },
      { at: 90, pour: 1, label: 'Presiona', detail: 'Presiona despacio, unos 30 segundos.' },
      { at: 120, pour: 1, label: 'Listo', detail: 'Diluye con agua si quieres una taza más suave.' },
    ],
  },
  {
    id: 'frenchpress',
    name: 'Prensa francesa',
    gearId: 'frenchpress',
    filtered: false,
    ratio: 15,
    tempC: 94,
    totalSec: 270,
    grind: 'Gruesa',
    storeGrind: 'Gruesa (Francesa)',
    dose: { min: 15, max: 60, default: 30 },
    summary: 'Taza de cuerpo pleno y textura densa.',
    steps: [
      { at: 0, pour: 1, label: 'Vierte', detail: 'Agrega el café y vierte toda el agua de una vez.' },
      { at: 240, pour: 1, label: 'Rompe la costra', detail: 'Remueve la superficie y retira la espuma.' },
      { at: 255, pour: 1, label: 'Presiona', detail: 'Baja el émbolo lentamente.' },
      { at: 270, pour: 1, label: 'Listo', detail: 'Sirve de inmediato para que no se sobreextraiga.' },
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso doméstico',
    gearId: 'grinder',
    filtered: false,
    ratio: 2,
    tempC: 93,
    totalSec: 30,
    grind: 'Fina',
    storeGrind: 'Fina (Espresso doméstica)',
    dose: { min: 14, max: 22, default: 18 },
    summary: 'Intensa y concentrada. Pide una molienda precisa.',
    steps: [
      { at: 0, pour: 0, label: 'Prepara', detail: 'Distribuye y compacta el café de forma pareja.' },
      { at: 2, pour: 0.5, label: 'Extrae', detail: 'Inicia la extracción. El café debería caer en hilo continuo.' },
      { at: 25, pour: 1, label: 'Detén', detail: 'Corta cuando alcances el peso en taza indicado.' },
      { at: 30, pour: 1, label: 'Listo', detail: 'Prueba y ajusta la molienda en la próxima taza.' },
    ],
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || RECIPES[0];
}

/** Clamp a dose into the recipe's range; fall back to its default for non-numbers. */
export function clampDose(recipe, grams) {
  const g = Number(grams);
  if (!Number.isFinite(g)) return recipe.dose.default;
  return Math.min(recipe.dose.max, Math.max(recipe.dose.min, Math.round(g)));
}

/** Scale a recipe to a coffee dose in grams: total water and the water to reach at each step. */
export function scaleRecipe(recipe, grams) {
  const coffee = clampDose(recipe, grams);
  const water = Math.round(coffee * recipe.ratio);
  return {
    coffee,
    water,
    tempC: recipe.tempC,
    steps: recipe.steps.map((s) => ({ ...s, waterTo: Math.round(water * s.pour) })),
  };
}

/** Index of the step in progress after `elapsedSec` seconds (-1 before the first). */
export function activeStep(steps, elapsedSec) {
  let idx = -1;
  for (let i = 0; i < steps.length; i += 1) if (elapsedSec >= steps[i].at) idx = i;
  return idx;
}

/** 83 -> "1:23". Negative and invalid inputs read "0:00". */
export function formatClock(seconds) {
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Water poured (ml) after `t` seconds, interpolating linearly between steps. `scaled` comes from scaleRecipe. */
export function waterAtTime(scaled, t) {
  const pts = [{ at: 0, ml: 0 }, ...scaled.steps.map((s) => ({ at: s.at, ml: s.waterTo }))];
  const x = Number.isFinite(t) ? Math.max(0, t) : 0;
  for (let i = 1; i < pts.length; i += 1) {
    if (x <= pts[i].at) {
      const span = pts[i].at - pts[i - 1].at;
      const k = span === 0 ? 1 : (x - pts[i - 1].at) / span;
      return Math.round(pts[i - 1].ml + (pts[i].ml - pts[i - 1].ml) * k);
    }
  }
  return pts[pts.length - 1].ml;
}
