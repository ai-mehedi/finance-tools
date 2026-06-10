"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLatePayment,
  formatUSD,
  type LatePaymentResult,
} from "@/lib/calculators/loan-late-payment";

type FormState = {
  installmentAmount: string;
  flatLateFee: string;
  lateFeePct: string;
  annualRatePct: string;
  daysLate: string;
};

const DEFAULTS: FormState = {
  installmentAmount: "450",
  flatLateFee: "25",
  lateFeePct: "5",
  annualRatePct: "18",
  daysLate: "15",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LatePaymentResult | null {
  return computeLatePayment({
    installmentAmount: num(f.installmentAmount),
    flatLateFee: num(f.flatLateFee) || 0,
    lateFeePct: num(f.lateFeePct) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    daysLate: num(f.daysLate) || 0,
  });
}

export default function LoanLatePaymentCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LatePaymentResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter an installment greater than 0 and non-negative fees, rate and days.");
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
        { label: "Flat late fee", value: result.flatFee, color: "#f97316" },
        { label: "Percentage fee", value: result.percentFee, color: "#fb923c" },
        { label: "Penalty interest", value: result.penaltyInterest, color: "#fdba74" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your overdue payment</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="installment">Installment amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="installment" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.installmentAmount} onChange={(e) => set("installmentAmount", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="flat">Flat late fee</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="flat" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.flatLateFee} onChange={(e) => set("flatLateFee", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="pct">Late fee (% of payment)</Label>
                <Input id="pct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.lateFeePct} onChange={(e) => set("lateFeePct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Penalty rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="days">Days late</Label>
                <Input id="days" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.daysLate} onChange={(e) => set("daysLate", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total now due</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalDue) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm text-zinc-600">
              Late penalty <span className="font-bold text-zinc-900">{formatUSD(result.totalLateCost)}</span> on top
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              breakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
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

      {result && result.totalLateCost > 0 && <PenaltyDonut result={result} breakdown={breakdown} />}
    </div>
  );
}

function PenaltyDonut({
  result,
  breakdown,
}: {
  result: LatePaymentResult;
  breakdown: { label: string; value: number; color: string }[];
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const stroke = 26;
  const circ = 2 * Math.PI * radius;
  const total = result.totalLateCost || 1;

  let offset = 0;
  const segments = breakdown
    .filter((b) => b.value > 0)
    .map((b) => {
      const frac = b.value / total;
      const seg = { ...b, dash: frac * circ, offset };
      offset += frac * circ;
      return seg;
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">What makes up the late penalty</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44" role="img" aria-label="Late penalty breakdown donut chart">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash.toFixed(2)} ${(circ - s.dash).toFixed(2)}`}
              strokeDashoffset={(-s.offset).toFixed(2)}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={20} fontWeight={800}>
            {formatUSD(result.totalLateCost)}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>
            penalty
          </text>
        </svg>
        <ul className="space-y-2">
          {breakdown.map((b) => (
            <li key={b.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-zinc-500">{b.label}</span>
              <span className="ml-1 font-bold tabular-nums text-zinc-900">{formatUSD(b.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
