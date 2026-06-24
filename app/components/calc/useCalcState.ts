"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { encodeParams, decodeParams } from "@/lib/calc-url";

/**
 * Calculator input state that stays in sync with the URL.
 *
 * - First paint uses `defaults` (matches the server-rendered HTML — no hydration
 *   mismatch). On mount we read the URL once, so a shared link like
 *   `?principal=50000&years=30` reproduces that exact scenario.
 * - Every change rewrites the URL with `history.replaceState` (no navigation, no
 *   history spam, no scroll jump), so the address bar always reflects the
 *   current numbers and "Copy link" just works.
 *
 * Generic over any flat string-map — every calculator keeps inputs as strings.
 */
export function useCalcState<T extends Record<string, string>>(defaults: T) {
  const [state, setState] = useState<T>(defaults);
  // Defaults are config, not reactive — freeze the first value so the effects
  // below don't need it in their dependency arrays.
  const defaultsRef = useRef(defaults);

  // Hydrate from the URL once, after mount.
  useEffect(() => {
    const fromUrl = decodeParams(window.location.search, defaultsRef.current) as T;
    setState(fromUrl);
  }, []);

  // Mirror state into the URL (debounced via the microtask-free replaceState).
  useEffect(() => {
    const qs = encodeParams(state, defaultsRef.current);
    const url = window.location.pathname + (qs ? `?${qs}` : "");
    window.history.replaceState(null, "", url);
  }, [state]);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const reset = useCallback(() => setState(defaultsRef.current), []);

  /** Absolute, shareable URL that reproduces the current inputs. */
  const shareUrl = useCallback(() => {
    const qs = encodeParams(state, defaultsRef.current);
    return window.location.origin + window.location.pathname + (qs ? `?${qs}` : "");
  }, [state]);

  return { state, set, reset, setState, shareUrl };
}
