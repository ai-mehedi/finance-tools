"use client";

import { useCallback, useEffect, useState } from "react";

export type ListResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

/**
 * Fetch a paginated list from an admin API endpoint with search + filters.
 * `params` are extra query params (status, type, etc).
 */
export function useList<T>(endpoint: string, params: Record<string, string> = {}) {
  const [result, setResult] = useState<ListResult<T>>({ data: [], total: 0, page: 1, limit: 10, pages: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "10" });
      if (q) qs.set("q", q);
      const extra: Record<string, string> = JSON.parse(key);
      for (const [k, v] of Object.entries(extra)) if (v) qs.set(k, v);

      const res = await fetch(`${endpoint}?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, q, key]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0); // debounce search
    return () => clearTimeout(t);
  }, [load, q]);

  // Reset to page 1 when search / filters change.
  useEffect(() => {
    setPage(1);
  }, [q, key]);

  return { ...result, page, setPage, q, setQ, loading, error, reload: load };
}
