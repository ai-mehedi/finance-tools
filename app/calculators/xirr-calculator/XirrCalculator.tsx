"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeXirr,
  formatUSD,
  formatCompact,
  formatPct,
  type XirrResult,
} from "@/lib/calculators/xirr";

type Row = { date: string; amount: string };

const DEFAULTS: Row[] = [
  { date: "2021-01-01", amount: "-10000" },
  { date: "2021-07-01", amount: "-5000" },
  { date: "2022-01-01", amount: "-5000" },
  { date: "2024-01-01", amount: "26000" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(rows: Row[]): XirrResult | null {
  return computeXirr({
    flows: rows.map((r) => ({ date: r.date, amount: num(r.amount) })),
  });
}

export default function XirrCalculator() {
  const [rows, setRows] = useState<Row[]>(DEFAULTS);
  const [result, setResult] = useState<XirrResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { date: "", amount: "" }]);
  }

  function removeRow(i: number) {
    setRows((rs) => (rs.length <= 2 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(rows);
    if (!r) {
      setError(
        "Enter at least two dated cash flows with valid dates, including at least one negative (invested) and one positive (received) amount."
      );
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  }

  function reset() {
    setRows(DEFAULTS);
    setResult(compute(DEFAULTS));
    setError(null);
  }

  const breakdown = result
    ? [
        { label: "Total invested", value: result.totalInvested, color: "bg-zinc-300" },
        { label: "Total received", value: result.totalReturned, color: "bg-orange-300" },
        { label: "Net gain", value: result.netGain, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your cash flows</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Use negative amounts for money you put in and positive amounts for money you take out.
          </p>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <Label className="mb-0">Date</Label>
              <Label className="mb-0">Amount</Label>
              <span className="w-9" />
            </div>

            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                <Input
                  type="date"
                  className="h-11"
                  value={r.date}
                  onChange={(e) => setRow(i, { date: e.target.value })}
                  aria-label={`Cash flow ${i + 1} date`}
                />
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="h-11 pl-7"
                    value={r.amount}
                    onChange={(e) => setRow(i, { amount: e.target.value })}
                    aria-label={`Cash flow ${i + 1} amount`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 2}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove cash flow ${i + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
            >
              <Plus className="size-4" /> Add cash flow
            </button>

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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Annualized XIRR</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatPct(result.ratePct) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs text-zinc-500">
              over {result.days} days ({(result.days / 365).toFixed(1)} years)
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid cash flows to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Cumulative chart */}
      {result && result.schedule.length > 1 && <FlowChart result={result} />}
    </div>
  );
}

function FlowChart({ result }: { result: XirrResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const n = data.length;
  const vals = data.map((p) => p.cumulative);
  const maxV = Math.max(0, ...vals);
  const minV = Math.min(0, ...vals);
  const span = maxV - minV || 1;

  const x = (i: number) => pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - ((v - minV) / span) * innerH;
  const zeroY = y(0);

  const linePts = data.map((p, i) => `${x(i).toFixed(1)},${y(p.cumulative).toFixed(1)}`);
  const areaPath = `M${x(0)},${zeroY.toFixed(1)} L${linePts.join(" L")} L${x(n - 1).toFixed(1)},${zeroY.toFixed(1)} Z`;
  const line = `M${linePts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minV + (span / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative cash position</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400/40" /> Running net</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cash flow chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="#d4d4d8" strokeWidth={1} strokeDasharray="3 3" />
        <defs>
          <linearGradient id="xirrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#xirrFill)" />
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.cumulative)} r={3} fill="#f97316" />
        ))}
        {data.map((p, i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={9}>{p.label}</text>
        ))}
      </svg>
    </div>
  );
}
