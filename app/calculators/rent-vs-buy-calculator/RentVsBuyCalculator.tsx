"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeRentVsBuy,
  formatUSD,
  formatCompact,
  type RentVsBuyResult,
} from "@/lib/calculators/rent-vs-buy";

type FormState = {
  homePrice: string;
  downPaymentPct: string;
  mortgageRatePct: string;
  loanTermYears: string;
  monthlyRent: string;
  rentGrowthPct: string;
  homeAppreciationPct: string;
  propertyTaxPct: string;
  maintenancePct: string;
  insuranceMonthly: string;
  investmentReturnPct: string;
  sellingCostPct: string;
  stayYears: string;
};

const DEFAULTS: FormState = {
  homePrice: "400000",
  downPaymentPct: "20",
  mortgageRatePct: "6.5",
  loanTermYears: "30",
  monthlyRent: "2200",
  rentGrowthPct: "3",
  homeAppreciationPct: "3.5",
  propertyTaxPct: "1.1",
  maintenancePct: "1",
  insuranceMonthly: "120",
  investmentReturnPct: "6",
  sellingCostPct: "6",
  stayYears: "7",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): RentVsBuyResult | null {
  return computeRentVsBuy({
    homePrice: num(f.homePrice),
    downPaymentPct: num(f.downPaymentPct) || 0,
    mortgageRatePct: num(f.mortgageRatePct) || 0,
    loanTermYears: num(f.loanTermYears) || 30,
    monthlyRent: num(f.monthlyRent) || 0,
    rentGrowthPct: num(f.rentGrowthPct) || 0,
    homeAppreciationPct: num(f.homeAppreciationPct) || 0,
    propertyTaxPct: num(f.propertyTaxPct) || 0,
    maintenancePct: num(f.maintenancePct) || 0,
    insuranceMonthly: num(f.insuranceMonthly) || 0,
    investmentReturnPct: num(f.investmentReturnPct) || 0,
    sellingCostPct: num(f.sellingCostPct) || 0,
    stayYears: num(f.stayYears),
  });
}

export default function RentVsBuyCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<RentVsBuyResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a home price above 0, a stay of at least 1 year, and a down payment from 0 to 100 percent.");
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

  const verdict =
    result?.cheaper === "buy"
      ? "Buying looks cheaper"
      : result?.cheaper === "rent"
      ? "Renting looks cheaper"
      : "It is roughly a wash";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">If you buy</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Home price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="price" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.homePrice} onChange={(e) => set("homePrice", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="down">Down payment (%)</Label>
                <Input id="down" type="number" min={0} max={100} step="any" inputMode="decimal" className="h-11" value={form.downPaymentPct} onChange={(e) => set("downPaymentPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rate">Mortgage rate (%)</Label>
                <Input id="rate" type="number" step="any" inputMode="decimal" className="h-11" value={form.mortgageRatePct} onChange={(e) => set("mortgageRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="term">Loan term (yrs)</Label>
                <Input id="term" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.loanTermYears} onChange={(e) => set("loanTermYears", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tax">Property tax (%/yr)</Label>
                <Input id="tax" type="number" step="any" inputMode="decimal" className="h-11" value={form.propertyTaxPct} onChange={(e) => set("propertyTaxPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="maint">Maintenance (%/yr)</Label>
                <Input id="maint" type="number" step="any" inputMode="decimal" className="h-11" value={form.maintenancePct} onChange={(e) => set("maintenancePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ins">Insurance / mo</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="ins" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.insuranceMonthly} onChange={(e) => set("insuranceMonthly", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="appr">Appreciation (%/yr)</Label>
                <Input id="appr" type="number" step="any" inputMode="decimal" className="h-11" value={form.homeAppreciationPct} onChange={(e) => set("homeAppreciationPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sell">Selling cost (%)</Label>
                <Input id="sell" type="number" step="any" inputMode="decimal" className="h-11" value={form.sellingCostPct} onChange={(e) => set("sellingCostPct", e.target.value)} />
              </div>
            </div>

            <p className="pt-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400">If you rent</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rent">Monthly rent</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="rent" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.monthlyRent} onChange={(e) => set("monthlyRent", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rentg">Rent growth (%/yr)</Label>
                <Input id="rentg" type="number" step="any" inputMode="decimal" className="h-11" value={form.rentGrowthPct} onChange={(e) => set("rentGrowthPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="invest">Investment return (%/yr)</Label>
                <Input id="invest" type="number" step="any" inputMode="decimal" className="h-11" value={form.investmentReturnPct} onChange={(e) => set("investmentReturnPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="stay">Years you stay</Label>
                <Input id="stay" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.stayYears} onChange={(e) => set("stayYears", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Verdict</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
            {result ? verdict : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-medium text-zinc-500">
              by {formatUSD(Math.abs(result.difference))} over {form.stayYears} years
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Net cost of buying
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalBuyCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" /> Net cost of renting
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.totalRentCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" /> Monthly mortgage
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.monthlyMortgage)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {result && result.schedule.length > 1 && <CostChart result={result} />}
    </div>
  );
}

function CostChart({ result }: { result: RentVsBuyResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.schedule;
  const years = data[data.length - 1].year || 1;
  const vals = data.flatMap((p) => [p.buyCost, p.rentCost]);
  const maxVal = Math.max(...vals, 1);
  const minVal = Math.min(...vals, 0);
  const range = maxVal - minVal || 1;

  const x = (yr: number) => pad.l + (yr / years) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minVal) / range) * innerH;

  const buyPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.buyCost).toFixed(1)}`);
  const rentPts = data.map((p) => `${x(p.year).toFixed(1)},${y(p.rentCost).toFixed(1)}`);
  const buyLine = `M${buyPts.join(" L")}`;
  const rentLine = `M${rentPts.join(" L")}`;

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = minVal + (range / gridSteps) * i;
    return { v, yy: y(v) };
  });
  const xTicks = [0, Math.round(years / 2), years].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Cumulative net cost (lower is better)</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-orange-500" /> Buy</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-zinc-400" /> Rent</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Rent versus buy cost chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <path d={rentLine} fill="none" stroke="#a1a1aa" strokeWidth={2.5} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
        <path d={buyLine} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t} yr</text>
        ))}
      </svg>
    </div>
  );
}
