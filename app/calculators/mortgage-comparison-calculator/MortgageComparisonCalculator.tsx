"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  computeComparison,
  formatUSD,
  formatCompact,
  type ComparisonResult,
} from "@/lib/calculators/mortgage-comparison";

type OfferForm = {
  rate: string;
  term: string;
  points: string;
  fees: string;
};

type FormState = {
  loanAmount: string;
  a: OfferForm;
  b: OfferForm;
};

const DEFAULTS: FormState = {
  loanAmount: "300000",
  a: { rate: "6.5", term: "30", points: "0", fees: "3000" },
  b: { rate: "6", term: "30", points: "1", fees: "3000" },
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function offer(o: OfferForm) {
  return {
    annualRatePct: num(o.rate) || 0,
    termYears: num(o.term),
    pointsPct: num(o.points) || 0,
    feesFlat: num(o.fees) || 0,
  };
}

function compute(f: FormState): ComparisonResult | null {
  return computeComparison({
    loanAmount: num(f.loanAmount),
    a: offer(f.a),
    b: offer(f.b),
  });
}

function months(m: number): string {
  const y = Math.floor(m / 12);
  const r = m % 12;
  if (m === 0) return "right away";
  if (y === 0) return `${r} mo`;
  if (r === 0) return `${y} yr`;
  return `${y} yr ${r} mo`;
}

export default function MortgageComparisonCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<ComparisonResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function setLoan(v: string) {
    setForm((f) => ({ ...f, loanAmount: v }));
  }
  function setOffer(which: "a" | "b", k: keyof OfferForm, v: string) {
    setForm((f) => ({ ...f, [which]: { ...f[which], [k]: v } }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a loan amount and terms greater than 0, with non-negative rates and fees.");
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

  const winner = result?.cheaperByTotalCost;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-zinc-900">Loan amount</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Both offers are compared on the same principal.</p>
          <div className="mt-4 max-w-xs">
            <Label htmlFor="loan">Amount borrowed</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input id="loan" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.loanAmount} onChange={(e) => setLoan(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <OfferCard title="Offer A" accent="orange" o={form.a} onChange={(k, v) => setOffer("a", k, v)} />
          <OfferCard title="Offer B" accent="zinc" o={form.b} onChange={(k, v) => setOffer("b", k, v)} />
        </div>

        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" className="flex-1 sm:flex-none sm:px-10">
            <Calculator /> Compare
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={reset}>
            <RotateCcw /> Reset
          </Button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Lower total cost</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
            {winner === "tie" ? "It's a tie" : `Offer ${winner} wins`}
          </p>
          {winner !== "tie" && (
            <p className="mt-1 text-sm font-medium text-zinc-600">
              Saves {formatUSD(result.totalCostGap)} in total interest plus upfront cost over the term.
            </p>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <OfferSummary label="Offer A" o={result.a} highlight={winner === "A"} />
            <OfferSummary label="Offer B" o={result.b} highlight={winner === "B"} />
          </div>

          {result.cheaperMonthly !== "tie" && result.breakEvenMonth !== null && (
            <div className="mt-4 rounded-lg bg-white/70 px-4 py-3 text-sm text-zinc-700">
              Offer {result.cheaperMonthly} has the lower monthly payment
              {result.breakEvenMonth === 0
                ? " and costs no more upfront, so it leads from day one."
                : `, recovering its extra upfront cost in about ${months(result.breakEvenMonth)}.`}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {result && <CompareChart result={result} />}
    </div>
  );
}

function OfferCard({
  title,
  accent,
  o,
  onChange,
}: {
  title: string;
  accent: "orange" | "zinc";
  o: OfferForm;
  onChange: (k: keyof OfferForm, v: string) => void;
}) {
  const dot = accent === "orange" ? "bg-orange-500" : "bg-zinc-400";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-extrabold text-zinc-900">
        <span className={`h-3 w-3 rounded-full ${dot}`} /> {title}
      </h3>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Rate (% / yr)</Label>
            <Input type="number" min={0} step="any" inputMode="decimal" className="h-11" value={o.rate} onChange={(e) => onChange("rate", e.target.value)} />
          </div>
          <div>
            <Label>Term (years)</Label>
            <Input type="number" min={0} step="any" inputMode="decimal" className="h-11" value={o.term} onChange={(e) => onChange("term", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Points (%)</Label>
            <Input type="number" min={0} step="any" inputMode="decimal" className="h-11" value={o.points} onChange={(e) => onChange("points", e.target.value)} />
          </div>
          <div>
            <Label>Other fees</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <Input type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={o.fees} onChange={(e) => onChange("fees", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferSummary({
  label,
  o,
  highlight,
}: {
  label: string;
  o: ComparisonResult["a"];
  highlight: boolean;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? "border-orange-300 bg-white" : "border-zinc-200 bg-white/70"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-900">{label}</span>
        {highlight && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600">Lower cost</span>}
      </div>
      <dl className="mt-2 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-zinc-500">Monthly</dt><dd className="font-bold tabular-nums text-zinc-900">{formatUSD(o.monthlyPayment)}</dd></div>
        <div className="flex justify-between"><dt className="text-zinc-500">Total interest</dt><dd className="font-bold tabular-nums text-zinc-900">{formatUSD(o.totalInterest)}</dd></div>
        <div className="flex justify-between"><dt className="text-zinc-500">Upfront cost</dt><dd className="font-bold tabular-nums text-zinc-900">{formatUSD(o.upfrontCost)}</dd></div>
        <div className="flex justify-between border-t border-zinc-100 pt-1.5"><dt className="font-semibold text-zinc-600">Total cost</dt><dd className="font-extrabold tabular-nums text-zinc-900">{formatUSD(o.totalCost)}</dd></div>
      </dl>
    </div>
  );
}

function CompareChart({ result }: { result: ComparisonResult }) {
  const W = 640;
  const H = 260;
  const pad = { l: 52, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.bars;
  const maxVal = Math.max(...data.map((d) => d.interest + d.upfront), 1);

  const gridSteps = 4;
  const grid = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = (maxVal / gridSteps) * i;
    return { v, yy: pad.t + innerH - (v / maxVal) * innerH };
  });

  const slot = innerW / data.length;
  const barW = Math.min(110, slot * 0.5);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">Total cost comparison</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-400" /> Interest</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-orange-200" /> Upfront</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mortgage total cost comparison chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        {data.map((d, idx) => {
          const cx = pad.l + slot * idx + slot / 2;
          const total = d.interest + d.upfront;
          const hInterest = (d.interest / maxVal) * innerH;
          const hUpfront = (d.upfront / maxVal) * innerH;
          const yInterestTop = pad.t + innerH - hInterest;
          const yUpfrontTop = yInterestTop - hUpfront;
          return (
            <g key={d.label}>
              <rect x={cx - barW / 2} y={yInterestTop} width={barW} height={Math.max(0, hInterest)} rx={3} fill="#fb923c" />
              <rect x={cx - barW / 2} y={yUpfrontTop} width={barW} height={Math.max(0, hUpfront)} rx={3} fill="#fed7aa" />
              <text x={cx} y={yUpfrontTop - 5} textAnchor="middle" className="fill-zinc-600" fontSize={10} fontWeight={600}>{formatCompact(total)}</text>
              <text x={cx} y={H - 8} textAnchor="middle" className="fill-zinc-500" fontSize={10}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
