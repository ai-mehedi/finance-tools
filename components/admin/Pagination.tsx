"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pages,
  total,
  limit,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-sm text-zinc-500">
      <span>
        Showing <span className="font-medium text-zinc-700">{from}</span>–
        <span className="font-medium text-zinc-700">{to}</span> of{" "}
        <span className="font-medium text-zinc-700">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft /> Prev
        </Button>
        <span className="px-2 text-zinc-600">
          Page {page} / {pages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
