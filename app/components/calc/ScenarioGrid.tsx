"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, type CsvRow } from "./exportCsv";

/**
 * A reusable "what-if" table for any calculator. The calculator computes one
 * row per scenario (e.g. each monthly contribution, each interest rate, each
 * extra payment) and hands them here; this renders a clean comparison grid and
 * a one-click CSV export.
 *
 * Why it matters: a scenario grid generated from your OWN calculation logic is
 * unique, citable data that single-purpose competitors don't have — exactly the
 * kind of structured answer AI Overviews and search snippets pull from.
 *
 * Raw values live in `rows`; pass an optional `format` per column for display
 * (e.g. currency). The CSV always exports the raw values, not the formatted
 * strings, so the download opens cleanly in a spreadsheet.
 */
export type GridColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: (value: string | number) => string;
};

export default function ScenarioGrid({
  title,
  caption,
  columns,
  rows,
  highlightIndex,
  csvName = "scenarios",
}: {
  title: string;
  caption?: string;
  columns: GridColumn[];
  rows: CsvRow[];
  /** Index of the row matching the user's current inputs (gets emphasized). */
  highlightIndex?: number;
  csvName?: string;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" data-embed-hide>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
          {caption && <p className="mt-0.5 text-xs text-zinc-500">{caption}</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadCsv(csvName, columns, rows)}
        >
          <Download /> CSV
        </Button>
      </div>

      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`py-2 pr-4 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-zinc-100 last:border-0 ${
                  i === highlightIndex ? "bg-orange-50/70 font-semibold text-zinc-900" : "text-zinc-700"
                }`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-2 pr-4 tabular-nums ${c.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {c.format ? c.format(row[c.key]) : String(row[c.key])}
                    {i === highlightIndex && c === columns[0] && (
                      <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                        you
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
