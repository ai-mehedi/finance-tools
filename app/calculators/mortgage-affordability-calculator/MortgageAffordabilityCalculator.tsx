"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeAffordability,
  formatUSD,
  formatCompact,
  type AffordabilityResult,
} from "@/lib/calculators/mortgage-affordability";

type FormState = {
  annualIncome: string;
  monthlyDebts: string;
  downPayment: string;
  annualRatePct: string;
  termYears: string;
  frontDtiPct: string;
  backDtiPct: string;
  annualTaxPct: string;
  annualInsurance: string;
  monthlyHoa: string;
};

const DEFAULTS: FormState = {
  annualIncome: "90000",
  monthlyDebts: "450",
  downPayment: "40000",
  annualRatePct: "6.5",
  termYears: "30",
  frontDtiPct: "28",
  backDtiPct: "36",
  annualTaxPct: "1.1",
  annualInsurance: "1500",
  monthlyHoa: "0",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): AffordabilityResult | null {
  return computeAffordability({
    annualIncome: num(f.annualIncome),
    monthlyDebts: num(f.monthlyDebts) || 0,
    downPayment: num(f.downPayment) || 0,
    annualRatePct: num(f.annualRatePct) || 0,
    termYears: num(f.termYears),
    frontDtiPct: num(f.frontDtiPct) || 0,
    backDtiPct: num(f.backDtiPct) || 0,
    annualTaxPct: num(f.annualTaxPct) || 0,
    annualInsurance: num(f.annualInsurance) || 0,
    monthlyHoa: num(f.monthlyHoa) || 0,
  });
}

export default function MortgageAffordabilityCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<AffordabilityResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a yearly income above 0, a loan term above 0 and DTI limits above 0.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Your finances</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your numbers, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Gross income (per yr)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="income" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="debts">Monthly debts</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="debts" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyDebts} onChange={(e) => set("monthlyDebts", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="down">Down payment</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="down" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.downPayment} onChange={(e) => set("downPayment", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Rate (% / yr)</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualRatePct} onChange={(e) => set("annualRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Term (yrs)</Label>
                <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="front">Front-end DTI (%)</Label>
                <Input id="front" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.frontDtiPct} onChange={(e) => set("frontDtiPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="back">Back-end DTI (%)</Label>
                <Input id="back" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.backDtiPct} onChange={(e) => set("backDtiPct", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="tax">Tax (% / yr)</Label>
                <Input id="tax" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.annualTaxPct} onChange={(e) => set("annualTaxPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ins">Insurance / yr</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="ins" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.annualInsurance} onChange={(e) => set("annualInsurance", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="hoa">HOA / mo</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="hoa" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyHoa} onChange={(e) => set("monthlyHoa", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Home you can afford</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.homePrice) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Capped by your {result.bindingLimit} DTI limit
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Loan amount" value={formatUSD(result.loanAmount)} />
                <Row label="Max housing payment" value={`${formatUSD(result.maxMonthlyHousing)}/mo`} />
                <Row label="At this price (PITI + HOA)" value={`${formatUSD(result.totalMonthly)}/mo`} strong />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Payment composition chart */}
      {result && result.totalMonthly > 0 && <PaymentChart result={result} />}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className={`text-sm tabular-nums text-zinc-900 ${strong ? "font-extrabold" : "font-bold"}`}>{value}</span>
    </div>
  );
}

function PaymentChart({ result }: { result: AffordabilityResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.bars;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const colors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: pad.t + innerH - (v / maxVal) * innerH };
  });

  const slot = innerW / data.length;
  const barW = Math.min(70, slot * 0.55);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Monthly payment breakdown</h3>
        <span className="text-xs text-zinc-500">at {formatCompact(result.homePrice)} home price</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly housing payment breakdown chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, idx) => {
          const h = (d.value / maxVal) * innerH;
          const cx = pad.l + slot * idx + slot / 2;
          const yTop = pad.t + innerH - h;
          return (
            <g key={d.label}>
              <rect x={cx - barW / 2} y={yTop} width={barW} height={Math.max(0, h)} rx={4} fill={colors[idx % colors.length]} />
              <text x={cx} y={yTop - 5} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{formatCompact(d.value)}</text>
              <text x={cx} y={H - 22} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{d.label.split(" ")[0]}</text>
              <text x={cx} y={H - 10} textAnchor="middle" className="fill-zinc-400" fontSize={9}>{d.label.split(" ").slice(1).join(" ")}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
