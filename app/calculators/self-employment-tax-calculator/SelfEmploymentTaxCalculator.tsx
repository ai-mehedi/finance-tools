"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeSelfEmploymentTax,
  formatUSD,
  type FilingStatus,
  type SelfEmploymentTaxResult,
} from "@/lib/calculators/self-employment-tax";

const FILING_STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "marriedSeparate", label: "Married filing separately" },
  { value: "headOfHousehold", label: "Head of household" },
];

type FormState = {
  netProfit: string;
  w2SocialSecurityWages: string;
  filingStatus: FilingStatus;
};

const DEFAULTS: FormState = {
  netProfit: "80000",
  w2SocialSecurityWages: "0",
  filingStatus: "single",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): SelfEmploymentTaxResult | null {
  return computeSelfEmploymentTax({
    netProfit: num(f.netProfit),
    w2SocialSecurityWages: num(f.w2SocialSecurityWages) || 0,
    filingStatus: f.filingStatus,
  });
}

export default function SelfEmploymentTaxCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a net profit of 0 or more and non-negative W-2 wages." : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const breakdown = result
    ? [
        { label: "Social Security (12.4%)", value: result.socialSecurityTax, color: "bg-orange-500" },
        { label: "Medicare (2.9%)", value: result.medicareTax, color: "bg-orange-300" },
        { label: "Additional Medicare (0.9%)", value: result.additionalMedicareTax, color: "bg-zinc-300" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Fill in the details, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="netProfit">Net self-employment profit (Schedule C)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="netProfit" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.netProfit} onChange={(e) => set("netProfit", e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="w2">W-2 Social Security wages (already taxed)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                <Input id="w2" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.w2SocialSecurityWages} onChange={(e) => set("w2SocialSecurityWages", e.target.value)} />
              </div>
              <p className="mt-1 text-xs text-zinc-400">Wages from a regular job reduce the Social Security portion you owe.</p>
            </div>

            <div>
              <Label htmlFor="filing">Filing status</Label>
              <Select id="filing" className="h-11" value={form.filingStatus} onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}>
                {FILING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Self-employment tax</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.totalSeTax) : "—"}
          </p>
          {result && (
            <p className="mt-1 text-sm font-semibold text-orange-600">
              {result.effectiveRatePct.toFixed(1)}% of net profit
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
          {result && (
            <p className="mt-3 text-xs text-zinc-500">
              Deductible half of SE tax: <span className="font-semibold text-zinc-700">{formatUSD(result.deductibleHalf)}</span>
            </p>
          )}
        </div>
      </form>

      {/* Donut chart */}
      {result && result.totalSeTax > 0 && <TaxDonut result={result} />}

      {/* What-if: how SE tax changes across different net profit levels. */}
      {result && <NetProfitScenarios form={form} />}
    </div>
  );
}

/** Sweeps net profit so the user sees how the SE tax and effective rate shift
 *  across a range of incomes, with their own value highlighted. */
function NetProfitScenarios({ form }: { form: FormState }) {
  const base = num(form.netProfit);

  const { rows, highlightIndex } = useMemo(() => {
    const profits = Array.from(
      new Set([30000, 60000, 100000, 150000, 200000, base])
    )
      .filter((p) => Number.isFinite(p) && p >= 0)
      .sort((a, b) => a - b);

    const built = profits.map((profit) => {
      const r = compute({ ...form, netProfit: String(profit) });
      return {
        profit,
        tax: r?.totalSeTax ?? 0,
        rate: r ? `${r.effectiveRatePct.toFixed(1)}%` : "—",
        deductible: r?.deductibleHalf ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.profit === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "profit", label: "Net profit", format: (v) => formatUSD(Number(v)) },
    { key: "tax", label: "SE tax", align: "right", format: (v) => formatUSD(Number(v)) },
    { key: "rate", label: "Effective rate", align: "right" },
    { key: "deductible", label: "Deductible half", align: "right", format: (v) => formatUSD(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="How does SE tax change with income?"
      caption="Same filing status & W-2 wages — only net self-employment profit changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="self-employment-tax-scenarios"
    />
  );
}

function TaxDonut({ result }: { result: SelfEmploymentTaxResult }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const stroke = 34;
  const circ = 2 * Math.PI * radius;

  const segments = [
    { label: "Social Security", value: result.socialSecurityTax, color: "#f97316" },
    { label: "Medicare", value: result.medicareTax, color: "#fb923c" },
    { label: "Additional Medicare", value: result.additionalMedicareTax, color: "#d4d4d8" },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((s) => {
    const frac = s.value / total;
    const dash = frac * circ;
    const arc = {
      color: s.color,
      dashArray: `${dash} ${circ - dash}`,
      dashOffset: -offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the tax goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Self-employment tax breakdown donut chart">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dashArray}
              strokeDashoffset={a.dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={20} fontWeight={800}>
            {formatUSD(result.totalSeTax)}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-zinc-400" fontSize={11}>
            total SE tax
          </text>
        </svg>
        <ul className="space-y-2 text-sm">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
              <span className="font-medium text-zinc-600">{s.label}</span>
              <span className="ml-auto font-bold tabular-nums text-zinc-900">{formatUSD(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
