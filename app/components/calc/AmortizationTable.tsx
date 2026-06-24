"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "./exportCsv";

/**
 * Reusable amortization schedule for any loan-style calculator (mortgage, auto,
 * student, personal...). Takes the full month-by-month schedule and shows it
 * grouped by year — each year expands to its monthly rows — with a one-click
 * CSV export of every month.
 *
 * A real amortization table is one of the clearest "advanced vs two-field"
 * upgrades: it's the long-tail magnet ("mortgage amortization schedule with
 * extra payments") and the structured data search/AI engines extract.
 */
export type AmortRow = {
  month: number; // 1-based payment number
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AmortizationTable({
  rows,
  format = (n: number) => usd.format(Number.isFinite(n) ? n : 0),
  csvName = "amortization-schedule",
  defaultOpen = false,
}: {
  rows: AmortRow[];
  format?: (n: number) => string;
  csvName?: string;
  defaultOpen?: boolean;
}) {
  // Which year groups are expanded to show their monthly rows.
  const [open, setOpen] = useState<Set<number>>(new Set());

  if (rows.length === 0) return null;

  // Group the monthly rows into years (payments 1-12 = year 1, etc.).
  const years = new Map<number, AmortRow[]>();
  for (const row of rows) {
    const year = Math.ceil(row.month / 12);
    if (!years.has(year)) years.set(year, []);
    years.get(year)!.push(row);
  }

  const toggle = (year: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });

  const csvColumns = [
    { key: "month", label: "Payment #" },
    { key: "payment", label: "Payment" },
    { key: "principal", label: "Principal" },
    { key: "interest", label: "Interest" },
    { key: "balance", label: "Remaining balance" },
  ];

  return (
    <details
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      open={defaultOpen}
      data-embed-hide
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          Amortization schedule
          <ChevronDown className="size-4 text-zinc-400 transition-transform group-open:rotate-180" />
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            downloadCsv(csvName, csvColumns, rows as unknown as Record<string, string | number>[]);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              downloadCsv(csvName, csvColumns, rows as unknown as Record<string, string | number>[]);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          <Download className="size-3.5" /> CSV
        </span>
      </summary>

      <div className="mt-4 -mx-5 overflow-x-auto px-5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-bold uppercase tracking-wide text-zinc-500">
              <th className="py-2 pr-4 text-left">Year</th>
              <th className="py-2 pr-4 text-right">Principal</th>
              <th className="py-2 pr-4 text-right">Interest</th>
              <th className="py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {[...years.entries()].map(([year, months]) => {
              const principal = months.reduce((s, m) => s + m.principal, 0);
              const interest = months.reduce((s, m) => s + m.interest, 0);
              const endBalance = months[months.length - 1].balance;
              const isOpen = open.has(year);
              return (
                <FragmentRow
                  key={year}
                  year={year}
                  months={months}
                  principal={principal}
                  interest={interest}
                  endBalance={endBalance}
                  isOpen={isOpen}
                  onToggle={() => toggle(year)}
                  format={format}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function FragmentRow({
  year,
  months,
  principal,
  interest,
  endBalance,
  isOpen,
  onToggle,
  format,
}: {
  year: number;
  months: AmortRow[];
  principal: number;
  interest: number;
  endBalance: number;
  isOpen: boolean;
  onToggle: () => void;
  format: (n: number) => string;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-b border-zinc-100 font-semibold text-zinc-800 hover:bg-orange-50/50"
      >
        <td className="py-2 pr-4 text-left">
          <span className="inline-flex items-center gap-1.5">
            <ChevronDown className={`size-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            Year {year}
          </span>
        </td>
        <td className="py-2 pr-4 text-right tabular-nums">{format(principal)}</td>
        <td className="py-2 pr-4 text-right tabular-nums">{format(interest)}</td>
        <td className="py-2 text-right tabular-nums">{format(endBalance)}</td>
      </tr>
      {isOpen &&
        months.map((m) => (
          <tr key={m.month} className="border-b border-zinc-50 text-xs text-zinc-500">
            <td className="py-1.5 pr-4 pl-6 text-left">Month {m.month}</td>
            <td className="py-1.5 pr-4 text-right tabular-nums">{format(m.principal)}</td>
            <td className="py-1.5 pr-4 text-right tabular-nums">{format(m.interest)}</td>
            <td className="py-1.5 text-right tabular-nums">{format(m.balance)}</td>
          </tr>
        ))}
    </>
  );
}
