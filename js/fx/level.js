// Decides how much motion the page runs. Pure, so it can be tested.

/**
 * "off": no animation (reduced motion requested).
 * "lite": the essential effects only (data saver or a modest device).
 * "full": everything.
 */
export function fxLevel({ reduceMotion = false, saveData = false, cores = 8, memory = 8 } = {}) {
  if (reduceMotion) return 'off';
  if (saveData) return 'lite';
  if (Number.isFinite(cores) && cores <= 4) return 'lite';
  if (Number.isFinite(memory) && memory <= 4) return 'lite';
  return 'full';
}

export function detectLevel(win = window) {
  const nav = win.navigator || {};
  const conn = nav.connection || {};
  return fxLevel({
    reduceMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: Boolean(conn.saveData),
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
  });
}
