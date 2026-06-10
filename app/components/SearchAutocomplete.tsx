"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Tool = { _id: string; title: string; slug: string; url?: string };

/**
 * Instant calculator search with a live autocomplete dropdown (debounced, hits
 * the public /api/tools endpoint). Submitting goes to the full results page.
 */
export default function SearchAutocomplete({ placeholder = "Search any calculator or tool..." }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tools?type=calculator&status=active&q=${encodeURIComponent(q.trim())}&limit=8`,
          { signal: ctrl.signal }
        );
        const json = await res.json();
        setResults(Array.isArray(json?.data) ? json.data : []);
        setOpen(true);
        setActive(-1);
      } catch {
        /* aborted or network error */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(t: Tool) {
    router.push(t.url || `/tools/${t.slug}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(results[active]);
    if (q.trim()) router.push(`/tools?q=${encodeURIComponent(q.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative max-w-xl">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm focus-within:border-orange-400"
      >
        <div className="flex flex-1 items-center gap-2 pl-3">
          <Search className="size-[18px] shrink-0 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => results.length && setOpen(true)}
            type="search"
            aria-label="Search calculators"
            placeholder={placeholder}
            className="w-full bg-transparent py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
          />
        </div>
        <button type="submit" className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
          Search
        </button>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          {results.map((t, i) => (
            <button
              key={t._id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(t)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm ${i === active ? "bg-orange-50 text-orange-700" : "text-zinc-700 hover:bg-zinc-50"}`}
            >
              <Search className="size-3.5 shrink-0 text-zinc-300" />
              <span className="truncate">{t.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
