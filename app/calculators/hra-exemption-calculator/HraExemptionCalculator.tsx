"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeHraExemption,
  formatUSD,
  formatCompact,
  type HraResult,
} from "@/lib/calculators/hra-exemption";

type FormState = {
  basicSalary: string;
  hraReceived: string;
  rentPaid: string;
  city: "metro" | "nonmetro";
};

const DEFAULTS: FormState = {
  basicSalary: "600000",
  hraReceived: "240000",
  rentPaid: "300000",
  city: "metro",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HraResult | null {
  return computeHraExemption({
    basicSalary: num(f.basicSalary),
    hraReceived: num(f.hraReceived) || 0,
    rentPaid: num(f.rentPaid) || 0,
    isMetro: f.city === "metro",
  });
}

export default function HraExemptionCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HraResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a basic salary above 0 and non-negative HRA and rent amounts.");
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
        { label: "HRA received", value: result.hraReceived, color: "bg-zinc-300" },
        { label: "Exempt HRA", value: result.exemptHra, color: "bg-orange-500" },
        { label: "Taxable HRA", value: result.taxableHra, color: "bg-orange-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter annual figures, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="basic">Basic salary + DA / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="basic" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.basicSalary} onChange={(e) => set("basicSalary", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="hra">HRA received / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="hra" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.hraReceived} onChange={(e) => set("hraReceived", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rent">Rent paid / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="rent" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.rentPaid} onChange={(e) => set("rentPaid", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="city">City type</Label>
                <Select id="city" className="h-11" value={form.city} onChange={(e) => set("city", e.target.value as FormState["city"])}>
                  <option value="metro">Metro (50%)</option>
                  <option value="nonmetro">Non-metro (40%)</option>
                </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Exempt HRA</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.exemptHra) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {formatUSD(result.taxableHra)} of HRA stays taxable
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
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && <RuleChart result={result} />}
    </div>
  );
}

function RuleChart({ result }: { result: HraResult }) {
  const W = 640;
  const H = 280;
  const pad = { l: 52, r: 16, t: 16, b: 56 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.rules;
  const maxVal = Math.max(...data.map((d) => d.value)) || 1;
  const minVal = Math.min(...data.map((d) => d.value));

  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.5, 110);
  const y = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: y(v) };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">The three exemption limits</h3>
        <span className="text-xs text-zinc-500">Exemption is the smallest bar</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="HRA exemption rule comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(d.value);
          const h = pad.t + innerH - top;
          const isMin = d.value === minVal;
          return (
            <g key={d.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(h, 0)} rx={5} fill={isMin ? "#f97316" : d.color} opacity={isMin ? 1 : 0.85} />
              {isMin && (
                <text x={cx} y={top - 18} textAnchor="middle" className="fill-orange-600" fontSize={10} fontWeight={800}>exempt</text>
              )}
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-zinc-500" fontSize={10} fontWeight={700}>{formatCompact(d.value)}</text>
              <text x={cx} y={H - 28} textAnchor="middle" className="fill-zinc-500" fontSize={11}>
                {d.label.split(" ").slice(0, 2).join(" ")}
              </text>
              <text x={cx} y={H - 14} textAnchor="middle" className="fill-zinc-400" fontSize={11}>
                {d.label.split(" ").slice(2).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
