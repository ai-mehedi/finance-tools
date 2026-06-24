"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeBondPrice,
  formatUSD,
  formatUSD0,
  formatCompact,
  type Frequency,
  type BondPriceResult,
} from "@/lib/calculators/bond-price";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "annual", label: "Annual" },
  { value: "semiannual", label: "Semi-annual" },
  { value: "quarterly", label: "Quarterly" },
];

type FormState = {
  faceValue: string;
  couponRatePct: string;
  yieldPct: string;
  years: string;
  frequency: Frequency;
};

const DEFAULTS: FormState = {
  faceValue: "1000",
  couponRatePct: "5",
  yieldPct: "6",
  years: "10",
  frequency: "semiannual",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): BondPriceResult | null {
  return computeBondPrice({
    faceValue: num(f.faceValue),
    couponRatePct: num(f.couponRatePct) || 0,
    yieldPct: num(f.yieldPct) || 0,
    years: num(f.years),
    frequency: f.frequency,
  });
}

const STATUS_LABEL: Record<BondPriceResult["status"], string> = {
  premium: "Trades at a premium",
  discount: "Trades at a discount",
  par: "Trades at par",
};

export default function BondPriceCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a face value and years greater than 0, with non-negative coupon and yield." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Bond details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="face">Face value (par)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="face" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.faceValue} onChange={(e) => set("faceValue", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="coupon">Coupon rate (% / yr)</Label>
                <Input id="coupon" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.couponRatePct} onChange={(e) => set("couponRatePct", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="yield">Yield to maturity (%)</Label>
                <Input id="yield" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.yieldPct} onChange={(e) => set("yieldPct", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="years">Years to maturity</Label>
                <Input id="years" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.years} onChange={(e) => set("years", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="freq">Coupon frequency</Label>
                <Select id="freq" className="h-11" value={form.frequency} onChange={(e) => set("frequency", e.target.value as Frequency)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
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
            <Button type="button" variant="ghost" size="sm" onClick={copyLink} className="w-full">
              {copied ? <Check className="text-emerald-500" /> : <Link2 />}
              {copied ? "Link copied — share these numbers" : "Copy link to these numbers"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Bond price</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.price) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Status</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{STATUS_LABEL[result.status]}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    PV of coupons
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.pvCoupons)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                    PV of face value
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.pvFace)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Coupon per period</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatUSD(result.couponPayment)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
          {result && (
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {result.periods} payments totaling {formatUSD0(result.totalCoupons)} in coupons.
            </p>
          )}
        </div>
      </form>

      {result && result.curve.length > 1 && <PriceYieldChart result={result} entered={num(form.yieldPct) || 0} />}

      {/* What-if: how different yields to maturity change the bond price. */}
      {result && <YieldScenarios form={form} />}
    </div>
  );
}

/** Sweeps the yield to maturity so the user sees how the bond price and
 *  premium/discount move at a spread of yields plus their own value. */
function YieldScenarios({ form }: { form: FormState }) {
  const base = num(form.yieldPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const yields = Array.from(new Set([2, 4, 6, 8, 10, base]))
      .filter((y) => y >= 0)
      .sort((a, b) => a - b);

    const built = yields.map((y) => {
      const r = compute({ ...form, yieldPct: String(y) });
      return {
        yieldPct: y,
        price: r?.price ?? 0,
        premiumDiscount: r?.premiumDiscount ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.yieldPct === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "yieldPct", label: "Yield to maturity", format: (v) => `${Number(v).toFixed(1)}%` },
    { key: "price", label: "Bond price", align: "right", format: (v) => formatUSD(Number(v)) },
    {
      key: "premiumDiscount",
      label: "Premium / discount",
      align: "right",
      format: (v) => formatUSD(Number(v)),
    },
  ];

  return (
    <ScenarioGrid
      title="What if the yield to maturity changes?"
      caption="Same bond — only the required yield changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="bond-price-yield-scenarios"
    />
  );
}

function PriceYieldChart({ result, entered }: { result: BondPriceResult; entered: number }) {
  const W = 640;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = result.curve;
  const minY = data[0].yieldPct;
  const maxY = data[data.length - 1].yieldPct;
  const ySpan = maxY - minY || 1;
  const maxP = Math.max(...data.map((p) => p.price)) || 1;
  const minP = Math.min(...data.map((p) => p.price));
  const pSpan = maxP - minP || 1;

  const px = (yPct: number) => pad.l + ((yPct - minY) / ySpan) * innerW;
  const py = (price: number) => pad.t + innerH - ((price - minP) / pSpan) * innerH;

  const pts = data.map((p) => `${px(p.yieldPct).toFixed(1)},${py(p.price).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = minP + (pSpan / 4) * i;
    return { v, yy: py(v) };
  });
  const xTicks = [minY, minY + ySpan / 2, maxY];
  const markX = px(Math.min(maxY, Math.max(minY, entered)));
  const markY = py(result.price);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Price vs yield to maturity</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Bond price versus yield chart">
        {grid.map((g, i) => (
          <g key={i}>
            <line x1={pad.l} y1={g.yy} x2={W - pad.r} y2={g.yy} stroke="#f4f4f5" strokeWidth={1} />
            <text x={pad.l - 6} y={g.yy + 3} textAnchor="end" className="fill-zinc-400" fontSize={10}>{formatCompact(g.v)}</text>
          </g>
        ))}
        <path d={line} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={markX} y1={pad.t} x2={markX} y2={pad.t + innerH} stroke="#a1a1aa" strokeWidth={1} strokeDasharray="4 3" />
        <circle cx={markX} cy={markY} r={4} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
        {xTicks.map((t, i) => (
          <text key={i} x={px(t)} y={H - 8} textAnchor="middle" className="fill-zinc-400" fontSize={10}>{t.toFixed(1)}%</text>
        ))}
      </svg>
    </div>
  );
}
