// Shareable calculator state <-> URL query string.
//
// Calculators keep their inputs as a flat map of strings (e.g. { principal: "10000" }).
// These helpers turn that map into a clean, stable query string and back, so a
// user can copy a link that reproduces their exact scenario. That makes every
// result a linkable, indexable, backlink-able asset — the single biggest
// "advanced mode" win for SEO. Pure functions, no React, so they're testable
// and reusable by every calculator.

export type CalcParams = Record<string, string>;

/**
 * Serialize calculator inputs into a query string. Keys are sorted (stable URLs
 * across renders), empty values are dropped, and any value equal to its default
 * is omitted so a freshly-loaded calculator has a clean `?`-free URL.
 */
export function encodeParams(state: CalcParams, defaults?: CalcParams): string {
  const sp = new URLSearchParams();
  for (const key of Object.keys(state).sort()) {
    const v = state[key];
    if (v == null || v === "") continue;
    if (defaults && defaults[key] === v) continue;
    sp.set(key, v);
  }
  return sp.toString();
}

/**
 * Read calculator inputs back out of a query string. Only keys present in
 * `defaults` are accepted (whitelist) so arbitrary query params can't inject
 * state; anything missing falls back to its default.
 */
export function decodeParams(search: string, defaults: CalcParams): CalcParams {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: CalcParams = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const v = sp.get(key);
    if (v != null) out[key] = v;
  }
  return out;
}
