"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computePortfolioReturn,
  formatUSD,
  formatPct,
  formatCompact,
  type PortfolioReturnResult,
} from "@/lib/calculators/portfolio-return";

type HoldingRow = { name: string; amount: string; returnPct: string };

type FormState = {
  rows: HoldingRow[];
  years: string;
};

const DEFAULTS: FormState = {
  rows: [
    { name: "US stocks", amount: "6000", returnPct: "18" },
    { name: "Bonds", amount: "3000", returnPct: "4" },
    { name: "Cash", amount: "1000", returnPct: "1.5" },
  ],
  years: "1",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): PortfolioReturnResult | null {
  return computePortfolioReturn({
    holdings: f.rows.map((r, i) => ({
      name: r.name.trim() || `Holding ${i + 1}`,
      amount: num(r.amount) || 0,
      returnPct: num(r.returnPct) || 0,
    })),
    years: num(f.years),
  });
}

const PALETTE = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#a1a1aa", "#d4d4d8"];

export default function PortfolioReturnCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PortfolioReturnResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setYears(v: string) {
    setForm((f) => ({ ...f, years: v }));
  }

  function setRow(idx: number, key: keyof HoldingRow, v: string) {
    setForm((f) => ({
      ...f,
      rows: f.rows.map((r, i) => (i === idx ? { ...r, [key]: v } : r)),
    }));
  }

  function addRow() {
    setForm((f) => ({ ...f, rows: [...f.rows, { name: "", amount: "", returnPct: "" }] }));
  }

  function removeRow(idx: number) {
    setForm((f) => ({
      ...f,
      rows: f.rows.length > 1 ? f.rows.filter((_, i) => i !== idx) : f.rows,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Add at least one holding with a positive amount and a holding period above 0.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setForm(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your holdings</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter each position and its return, then press Calculate.</p>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <span>Holding</span>
              <span className="w-24 text-right">Amount</span>
              <span className="w-20 text-right">Return %</span>
              <span className="w-7" />
            </div>
            {form.rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                <Input
                  aria-label={`Holding ${i + 1} name`}
                  type="text"
                  className="h-10"
                  placeholder={`Holding ${i + 1}`}
                  value={r.name}
                  onChange={(e) => setRow(i, "name", e.target.value)}
                />
                <div className="relative w-24">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input aria-label={`Holding ${i + 1} amount`} type="number" min={0} step="any" inputMode="decimal" className="h-10 pl-6" value={r.amount} onChange={(e) => setRow(i, "amount", e.target.value)} />
                </div>
                <div className="relative w-20">
                  <Input aria-label={`Holding ${i + 1} return percent`} type="number" step="any" inputMode="decimal" className="h-10 pr-5" value={r.returnPct} onChange={(e) => setRow(i, "returnPct", e.target.value)} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label={`Remove holding ${i + 1}`}
                  className="flex h-10 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-orange-300 px-3 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
            >
              <Plus className="size-4" /> Add holding
            </button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <Label htmlFor="years">Holding period (years)</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => setYears(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" size="lg" className="flex-1">
                <Calculator /> Calculate
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={reset}>
                <RotateCcw /> Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total return</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.totalReturnPct) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm text-zinc-500">{formatPct(result.annualizedReturnPct)} per year annualized</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Total invested</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalInvested)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Ending value</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.endingValue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Total gain
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalGain)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 0 && <AllocationChart result={result} />}

      {/* What-if: how the holding period changes the annualized return. */}
      {result && <HoldingPeriodScenarios form={form} />}
    </div>
  );
}

/** Sweeps the holding period so the user sees how the same total return
 *  annualizes over 1 / 2 / 3 / 5 / 10 years plus their own value. The total
 *  return and ending value are fixed by the holdings; only the CAGR changes. */
function HoldingPeriodScenarios({ form }: { form: FormState }) {
  const base = num(form.years);

  const { rows, highlightIndex } = useMemo(() => {
    const candidates = [1, 2, 3, 5, 10, base];
    const periods = Array.from(new Set(candidates))
      .filter((y) => Number.isFinite(y) && y > 0)
      .sort((a, b) => a - b);

    const built = periods.map((years) => {
      const r = compute({ ...form, years: String(years) });
      return {
        years,
        annualized: r?.annualizedReturnPct ?? 0,
        ending: r?.endingValue ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.years === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "years", label: "Holding period", format: (v) => `${Number(v)} yr` },
    { key: "annualized", label: "Annualized return", align: "right", format: (v) => formatPct(Number(v)) },
    { key: "ending", label: "Ending value", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if you held it longer?"
      caption="Same holdings and total return — only the holding period changes the annualized rate."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="portfolio-return-holding-period-scenarios"
    />
  );
}

function AllocationChart({ result }: { result: PortfolioReturnResult }) {
  const data = result.schedule;
  const total = result.totalInvested || 1;

  // Donut geometry.
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 88;
  const rInner = 54;

  let acc = 0;
  const segments = data.map((p, i) => {
    const frac = p.amount / total;
    const start = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const end = acc * 2 * Math.PI - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);
    const xi2 = cx + rInner * Math.cos(end);
    const yi2 = cy + rInner * Math.sin(end);
    const xi1 = cx + rInner * Math.cos(start);
    const yi1 = cy + rInner * Math.sin(start);
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${rInner},${rInner} 0 ${large} 0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`;
    return { d, color: PALETTE[i % PALETTE.length], point: p };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Allocation and return contribution</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label="Portfolio allocation donut chart">
          {segments.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth={1.5} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={15} fontWeight={800}>
            {formatPct(result.totalReturnPct)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            total return
          </text>
        </svg>

        <div className="w-full flex-1 space-y-1.5">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm odd:bg-zinc-50">
              <span className="flex min-w-0 items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="truncate font-medium">{s.point.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 tabular-nums">
                <span className="text-zinc-400">{formatCompact(s.point.amount)}</span>
                <span className="font-bold text-zinc-900">{formatPct(s.point.contributionPct)}</span>
              </span>
            </div>
          ))}
          <p className="px-2 pt-1 text-xs text-zinc-400">
            Right column is each holding&apos;s contribution to the total return, in percentage points.
          </p>
        </div>
      </div>
    </div>
  );
}
