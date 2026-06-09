"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Cat = { _id: string; name: string };

export function CategoryPicker({
  type,
  value,
  onChange,
}: {
  type: "tool" | "blog";
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetch(`/api/categories?type=${type}&limit=100`)
      .then((r) => r.json())
      .then((d) => setCats(d.data ?? []))
      .catch(() => setCats([]));
  }, [type]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  }

  return (
    <div>
      <Label>Categories</Label>
      {cats.length === 0 ? (
        <p className="text-xs text-zinc-400">No {type} categories yet — create some first.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              type="button"
              key={c._id}
              onClick={() => toggle(c._id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                value.includes(c._id)
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
