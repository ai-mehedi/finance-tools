"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeLeaseVsBuy,
  formatUSD,
  formatUSD2,
  type LeaseVsBuyResult,
} from "@/lib/calculators/lease-vs-buy";

type FormState = {
  termYears: string;
  leaseDownPayment: string;
  leaseMonthlyPayment: string;
  vehiclePrice: string;
  buyDownPayment: string;
  loanRatePct: string;
  loanTermYears: string;
  resaleValue: string;
};

const DEFAULTS: FormState = {
  termYears: "3",
  leaseDownPayment: "2000",
  leaseMonthlyPayment: "399",
  vehiclePrice: "35000",
  buyDownPayment: "5000",
  loanRatePct: "6.5",
  loanTermYears: "5",
  resaleValue: "20000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): LeaseVsBuyResult | null {
  return computeLeaseVsBuy({
    termYears: num(f.termYears),
    leaseDownPayment: num(f.leaseDownPayment) || 0,
    leaseMonthlyPayment: num(f.leaseMonthlyPayment) || 0,
    vehiclePrice: num(f.vehiclePrice) || 0,
    buyDownPayment: num(f.buyDownPayment) || 0,
    loanRatePct: num(f.loanRatePct) || 0,
    loanTermYears: num(f.loanTermYears),
    resaleValue: num(f.resaleValue) || 0,
  });
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
        <Input id={id} type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function LeaseVsBuyCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<LeaseVsBuyResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a comparison term and loan term greater than 0.");
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
    result === null
      ? ""
      : result.cheaper === "equal"
        ? "Lease and buy cost about the same"
        : result.cheaper === "buy"
          ? "Buying is cheaper"
          : "Leasing is cheaper";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Compare the options</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="term">Comparison term (years)</Label>
              <Input id="term" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.termYears} onChange={(e) => set("termYears", e.target.value)} />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <p className="text-sm font-semibold text-zinc-600">Lease</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Money id="leaseDown" label="Lease down payment" value={form.leaseDownPayment} onChange={(v) => set("leaseDownPayment", v)} />
                <Money id="leaseMonthly" label="Lease payment / mo" value={form.leaseMonthlyPayment} onChange={(v) => set("leaseMonthlyPayment", v)} />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
              <p className="text-sm font-semibold text-zinc-600">Buy with a loan</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Money id="price" label="Vehicle price" value={form.vehiclePrice} onChange={(v) => set("vehiclePrice", v)} />
                <Money id="buyDown" label="Buy down payment" value={form.buyDownPayment} onChange={(v) => set("buyDownPayment", v)} />
                <div>
                  <Label htmlFor="rate">Loan rate (% / yr)</Label>
                  <Input id="rate" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.loanRatePct} onChange={(e) => set("loanRatePct", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Loan term (years)</Label>
                  <Input id="loanTerm" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.loanTermYears} onChange={(e) => set("loanTermYears", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Money id="resale" label="Resale value at end of term" value={form.resaleValue} onChange={(v) => set("resaleValue", v)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Verdict</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
            {result ? verdict : "—"}
          </p>
          {result && result.cheaper !== "equal" && (
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              You save about {formatUSD(result.difference)} over the term.
            </p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                    Lease total cost
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.leaseTotalCost)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Buy net cost
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.buyNetCost)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Buy net cost is the {formatUSD(result.buyTotalPaid)} you pay in,{" "}
              minus the resale value you still own. Loan payment is about{" "}
              <span className="font-semibold text-zinc-600">{formatUSD2(result.loanMonthlyPayment)}</span> a month.
            </p>
          )}
        </div>
      </form>

      {result && <CompareChart result={result} />}
    </div>
  );
}

function CompareChart({ result }: { result: LeaseVsBuyResult }) {
  const rows = [
    { label: "Lease", value: result.leaseTotalCost, color: "#fdba74" },
    { label: "Buy (net)", value: result.buyNetCost, color: "#f97316" },
  ];
  const maxVal = Math.max(...rows.map((r) => Math.abs(r.value)), 1);

  const W = 640;
  const rowH = 56;
  const H = rows.length * rowH + 16;
  const labelW = 110;
  const barMax = W - labelW - 130;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Total cost over the term</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Lease versus buy cost comparison chart">
        {rows.map((r, i) => {
          const yTop = i * rowH + 12;
          const w = (Math.abs(r.value) / maxVal) * barMax;
          return (
            <g key={r.label}>
              <text x={0} y={yTop + 22} className="fill-zinc-600" fontSize={13} fontWeight={600}>{r.label}</text>
              <rect x={labelW} y={yTop} width={Math.max(2, w)} height={28} rx={6} fill={r.color} />
              <text x={labelW + Math.max(2, w) + 8} y={yTop + 20} className="fill-zinc-900" fontSize={12} fontWeight={700}>
                {formatUSD(r.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
