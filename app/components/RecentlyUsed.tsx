"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

type Item = { title: string; path: string };

/**
 * Shows the visitor's recently-used calculators from localStorage (populated by
 * CalcActions). Renders nothing on first visit, so it never shows an empty box.
 */
export default function RecentlyUsed() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      const list: Item[] = JSON.parse(localStorage.getItem("td:recent") || "[]");
      setItems(list.filter((x) => x && x.title && x.path).slice(0, 8));
    } catch {
      /* ignore */
    }
  }, []);

  if (!items.length) return null;

  return (
    <section className="border-t border-zinc-100 bg-white" data-embed-hide>
      <div className="mx-auto container px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-900">
          <Clock className="size-4 text-orange-500" /> Recently used
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <Link
              key={it.path}
              href={it.path}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
            >
              {it.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
