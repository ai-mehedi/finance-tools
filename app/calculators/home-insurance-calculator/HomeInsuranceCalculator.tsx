"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeHomeInsurance,
  formatUSD,
  formatCompact,
  type RiskLevel,
  type HomeInsuranceResult,
} from "@/lib/calculators/home-insurance";

const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: "low", label: "Low risk area" },
  { value: "average", label: "Average risk" },
  { value: "high", label: "High risk area" },
];

type FormState = {
  dwellingCost: string;
  personalPropertyPct: string;
  liabilityCoverage: string;
  ratePerThousand: string;
  riskLevel: RiskLevel;
  deductible: string;
};

const DEFAULTS: FormState = {
  dwellingCost: "350000",
  personalPropertyPct: "50",
  liabilityCoverage: "300000",
  ratePerThousand: "3.5",
  riskLevel: "average",
  deductible: "1000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): HomeInsuranceResult | null {
  return computeHomeInsurance({
    dwellingCost: num(f.dwellingCost),
    personalPropertyPct: num(f.personalPropertyPct) || 0,
    liabilityCoverage: num(f.liabilityCoverage) || 0,
    ratePerThousand: num(f.ratePerThousand),
    riskLevel: f.riskLevel,
    deductible: num(f.deductible) || 0,
  });
}

const SLICE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#d4d4d8"];

export default function HomeInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<HomeInsuranceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a dwelling rebuild cost and a base rate per $1,000 both greater than 0.");
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
        { label: "Annual premium", value: result.annualPremium, color: "bg-orange-500" },
        { label: "Personal property limit", value: result.personalPropertyLimit, color: "bg-orange-300" },
        { label: "Other structures limit", value: result.otherStructuresLimit, color: "bg-orange-200" },
        { label: "Loss of use limit", value: result.lossOfUseLimit, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Coverage details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Enter your home and coverage, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dwellingCost">Rebuild cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="dwellingCost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.dwellingCost} onChange={(e) => set("dwellingCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="liability">Liability coverage</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="liability" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.liabilityCoverage} onChange={(e) => set("liabilityCoverage", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="propertyPct">Personal property (% of home)</Label>
                <Input id="propertyPct" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.personalPropertyPct} onChange={(e) => set("personalPropertyPct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="deductible">Deductible</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="deductible" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.deductible} onChange={(e) => set("deductible", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rate">Rate per $1,000</Label>
                <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.ratePerThousand} onChange={(e) => set("ratePerThousand", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="risk">Risk level</Label>
                <Select id="risk" className="h-11" value={form.riskLevel} onChange={(e) => set("riskLevel", e.target.value as RiskLevel)}>
                  {RISK_LEVELS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated annual premium</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.annualPremium) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-xs font-medium text-zinc-500">
              About {formatUSD(result.monthlyPremium)} per month
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

      {/* Premium breakdown donut */}
      {result && <PremiumDonut result={result} />}
    </div>
  );
}

function PremiumDonut({ result }: { result: HomeInsuranceResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const stroke = 30;
  const circ = 2 * Math.PI * r;

  const total = result.slices.reduce((s, sl) => s + sl.premium, 0) || 1;

  let offset = 0;
  const arcs = result.slices.map((sl, i) => {
    const frac = sl.premium / total;
    const dash = frac * circ;
    const arc = {
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dasharray: `${dash} ${circ - dash}`,
      dashoffset: -offset,
      label: sl.label,
      premium: sl.premium,
      pct: frac * 100,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where your premium goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label="Premium breakdown by coverage">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={18} fontWeight={800}>
            {formatCompact(total)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>
            per year
          </text>
        </svg>
        <ul className="w-full space-y-2">
          {arcs.map((a, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                {a.label}
              </span>
              <span className="tabular-nums text-zinc-500">
                {formatUSD(a.premium)} <span className="text-zinc-400">({a.pct.toFixed(0)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
