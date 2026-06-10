"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeMileage,
  STANDARD_RATES,
  formatUSD,
  formatUSD2,
  formatCompact,
  type MileagePurpose,
  type MileageResult,
} from "@/lib/calculators/mileage-reimbursement";

const PURPOSES: { value: MileagePurpose; label: string }[] = [
  { value: "business", label: "Business (67¢)" },
  { value: "medical", label: "Medical / moving (21¢)" },
  { value: "charity", label: "Charity (14¢)" },
  { value: "custom", label: "Custom rate" },
];

type FormState = {
  purpose: MileagePurpose;
  miles: string;
  ratePerMileCents: string;
  trips: string;
  parkingTolls: string;
};

const DEFAULTS: FormState = {
  purpose: "business",
  miles: "120",
  ratePerMileCents: String(STANDARD_RATES.business),
  trips: "1",
  parkingTolls: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): MileageResult | null {
  return computeMileage({
    miles: num(f.miles) || 0,
    ratePerMileCents: num(f.ratePerMileCents) || 0,
    trips: num(f.trips),
    parkingTolls: num(f.parkingTolls) || 0,
  });
}

export default function MileageReimbursementCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<MileageResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPurpose(p: MileagePurpose) {
    setForm((f) => ({
      ...f,
      purpose: p,
      ratePerMileCents:
        p === "custom" ? f.ratePerMileCents : String(STANDARD_RATES[p]),
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter miles of 0 or more, at least one trip, and a non-negative rate.");
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

  const breakdown = result
    ? [
        { label: "Mileage amount", value: result.mileageAmount, color: "bg-orange-500" },
        { label: "Parking & tolls", value: result.extras, color: "bg-orange-300" },
        { label: "Total miles driven", value: result.totalMiles, color: "bg-zinc-300", isMiles: true },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Trip details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your driving, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Select id="purpose" className="h-11" value={form.purpose} onChange={(e) => onPurpose(e.target.value as MileagePurpose)}>
                {PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="miles">Miles per trip</Label>
                <Input id="miles" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.miles} onChange={(e) => set("miles", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="trips">Number of trips</Label>
                <Input id="trips" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.trips} onChange={(e) => set("trips", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Rate (¢ / mile)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.ratePerMileCents} onChange={(e) => { set("ratePerMileCents", e.target.value); set("purpose", "custom"); }} />
              </div>
              <div>
                <Label htmlFor="parking">Parking & tolls / trip</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="parking" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.parkingTolls} onChange={(e) => set("parkingTolls", e.target.value)} />
                </div>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Reimbursement owed</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD2(result.total) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Effective {formatUSD2(result.effectiveRate)} per mile
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
                  <span className="text-sm font-bold tabular-nums text-zinc-900">
                    {b.isMiles ? `${b.value.toLocaleString("en-US")} mi` : formatUSD2(b.value)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Breakdown chart */}
      {result && result.total > 0 && <BreakdownChart result={result} />}
    </div>
  );
}

function BreakdownChart({ result }: { result: MileageResult }) {
  const W = 640;
  const H = 240;
  const pad = { l: 110, r: 24, t: 16, b: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.breakdown;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const band = innerH / data.length;
  const barH = Math.min(34, band * 0.6);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    const xx = pad.l + (v / maxVal) * innerW;
    return { v, xx };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Where the money comes from</h3>
        <span className="text-xs text-zinc-500">{result.totalMiles.toLocaleString("en-US")} miles total</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mileage reimbursement breakdown chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={g.xx} y1={pad.t} x2={g.xx} y2={H - pad.b} stroke="#f4f4f5" strokeWidth={1} />
            <text x={g.xx} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const yy = pad.t + band * i + (band - barH) / 2;
          const w = (d.value / maxVal) * innerW;
          const isTotal = d.label === "Total";
          return (
            <g key={d.label}>
              <text x={pad.l - 10} y={yy + barH / 2 + 3} textAnchor="end" className="fill-zinc-600" fontSize={11} fontWeight={600}>{d.label}</text>
              <rect x={pad.l} y={yy} width={Math.max(w, 1)} height={barH} rx={5} fill={isTotal ? "#f97316" : "#fb923c"} opacity={isTotal ? 1 : 0.7} />
              <text x={pad.l + Math.max(w, 1) + 6} y={yy + barH / 2 + 3} className="fill-zinc-500" fontSize={10}>{formatUSD(d.value)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
