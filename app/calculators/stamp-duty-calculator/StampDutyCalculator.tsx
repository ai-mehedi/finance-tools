"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useCalcState } from "../../components/calc/useCalcState";
import ScenarioGrid, { type GridColumn } from "../../components/calc/ScenarioGrid";
import {
  computeStampDuty,
  formatINR,
  formatCompact,
  type StampDutyResult,
} from "@/lib/calculators/stamp-duty";

// Indicative stamp-duty presets by state. Real rates change and depend on
// buyer gender and locality; users can override every field.
type Preset = { label: string; stamp: number; registration: number; regCap: number };

const PRESETS: Record<string, Preset> = {
  custom: { label: "Custom / other", stamp: 5, registration: 1, regCap: 0 },
  maharashtra: { label: "Maharashtra (city)", stamp: 6, registration: 1, regCap: 30000 },
  karnataka: { label: "Karnataka", stamp: 5, registration: 1, regCap: 0 },
  delhi_male: { label: "Delhi (male buyer)", stamp: 6, registration: 1, regCap: 0 },
  delhi_female: { label: "Delhi (female buyer)", stamp: 4, registration: 1, regCap: 0 },
  uttar_pradesh: { label: "Uttar Pradesh", stamp: 7, registration: 1, regCap: 0 },
  telangana: { label: "Telangana", stamp: 5, registration: 0.5, regCap: 0 },
};

type FormState = {
  preset: string;
  propertyValue: string;
  marketValue: string;
  stampDutyPct: string;
  registrationPct: string;
  registrationCap: string;
};

const DEFAULTS: FormState = {
  preset: "maharashtra",
  propertyValue: "8000000",
  marketValue: "",
  stampDutyPct: "6",
  registrationPct: "1",
  registrationCap: "30000",
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): StampDutyResult | null {
  return computeStampDuty({
    propertyValue: num(f.propertyValue),
    marketValue: num(f.marketValue) || 0,
    stampDutyPct: num(f.stampDutyPct) || 0,
    registrationPct: num(f.registrationPct) || 0,
    registrationCap: num(f.registrationCap) || 0,
  });
}

export default function StampDutyCalculator() {
  const { state: form, set, reset, shareUrl } = useCalcState<FormState>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compute(form), [form]);
  const error = result === null ? "Enter a property value greater than 0 and non-negative rates." : null;

  function onPreset(key: string) {
    set("preset", key);
    const p = PRESETS[key];
    if (p) {
      set("stampDutyPct", String(p.stamp));
      set("registrationPct", String(p.registration));
      set("registrationCap", p.regCap ? String(p.regCap) : "");
    }
  }

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
          <h2 className="text-base font-extrabold text-zinc-900">Your inputs</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Pick a state or set your own rates, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="preset">State / rate preset</Label>
              <Select id="preset" className="h-11" value={form.preset} onChange={(e) => onPreset(e.target.value)}>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>{p.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="value">Agreement value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="value" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.propertyValue} onChange={(e) => set("propertyValue", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="market">Circle rate value</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₹</span>
                  <Input id="market" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" placeholder="optional" value={form.marketValue} onChange={(e) => set("marketValue", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="stamp">Stamp duty (%)</Label>
                <Input id="stamp" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.stampDutyPct} onChange={(e) => { set("stampDutyPct", e.target.value); set("preset", "custom"); }} />
              </div>
              <div>
                <Label htmlFor="reg">Registration (%)</Label>
                <Input id="reg" type="number" min={0} step="any" inputMode="decimal" className="h-11" value={form.registrationPct} onChange={(e) => { set("registrationPct", e.target.value); set("preset", "custom"); }} />
              </div>
              <div>
                <Label htmlFor="cap">Reg. cap</Label>
                <Input id="cap" type="number" min={0} step="any" inputMode="decimal" className="h-11" placeholder="none" value={form.registrationCap} onChange={(e) => set("registrationCap", e.target.value)} />
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Total charges</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatINR(result.totalCharges) : "—"}
          </p>
          {result && (
            <p className="mt-0.5 text-sm font-semibold text-zinc-500 tabular-nums">{result.effectivePct.toFixed(2)}% of value</p>
          )}
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Stamp duty
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatINR(result.stampDuty)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-300" /> Registration
                  </span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatINR(result.registrationCharge)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
                  <span className="text-sm font-medium text-zinc-500">Chargeable value</span>
                  <span className="text-sm font-bold tabular-nums text-zinc-900">{formatINR(result.chargeableValue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-3 py-2.5">
                  <span className="text-sm font-bold text-orange-700">Total cost</span>
                  <span className="text-sm font-extrabold tabular-nums text-orange-700">{formatINR(result.totalCost)}</span>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Cost breakdown donut */}
      {result && <CostDonut result={result} />}

      {/* What-if: how total charges scale with the stamp duty rate. */}
      {result && <StampDutyRateScenarios form={form} />}
    </div>
  );
}

/** Sweeps the stamp duty rate so the user sees how total charges and the
 *  effective cost change across a range of state rates plus their own value. */
function StampDutyRateScenarios({ form }: { form: FormState }) {
  const base = num(form.stampDutyPct) || 0;

  const { rows, highlightIndex } = useMemo(() => {
    const rates = Array.from(new Set([2, 4, 5, 6, 7, base]))
      .filter((r) => r >= 0)
      .sort((a, b) => a - b);

    const built = rates.map((rate) => {
      const r = compute({ ...form, stampDutyPct: String(rate) });
      return {
        rate,
        charges: r?.totalCharges ?? 0,
        total: r?.totalCost ?? 0,
      };
    });

    return { rows: built, highlightIndex: built.findIndex((r) => r.rate === base) };
  }, [form, base]);

  const columns: GridColumn[] = [
    { key: "rate", label: "Stamp duty rate", format: (v) => `${Number(v)}%` },
    { key: "charges", label: "Total charges", align: "right", format: (v) => formatINR(Number(v)) },
    { key: "total", label: "All-in cost", align: "right", format: (v) => formatINR(Number(v)) },
  ];

  return (
    <ScenarioGrid
      title="What if the stamp duty rate were different?"
      caption="Same property — only the stamp duty rate changes."
      columns={columns}
      rows={rows}
      highlightIndex={highlightIndex}
      csvName="stamp-duty-rate-scenarios"
    />
  );
}

function CostDonut({ result }: { result: StampDutyResult }) {
  const segments = [
    { label: "Property value", value: result.chargeableValue, color: "#fed7aa" },
    { label: "Stamp duty", value: result.stampDuty, color: "#f97316" },
    { label: "Registration", value: result.registrationCharge, color: "#fb923c" },
  ];
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Acquisition cost breakdown</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label="Cost breakdown donut chart">
          <g transform="rotate(-90 90 90)">
            {segments.map((s) => {
              const frac = s.value / total;
              const dash = frac * C;
              const seg = (
                <circle
                  key={s.label}
                  cx={90}
                  cy={90}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={26}
                  strokeDasharray={`${dash.toFixed(2)} ${(C - dash).toFixed(2)}`}
                  strokeDashoffset={(-offset).toFixed(2)}
                />
              );
              offset += dash;
              return seg;
            })}
          </g>
          <text x={90} y={86} textAnchor="middle" className="fill-zinc-400" fontSize={10}>Total cost</text>
          <text x={90} y={102} textAnchor="middle" className="fill-zinc-900" fontSize={13} fontWeight={800}>{formatCompact(result.totalCost)}</text>
        </svg>
        <div className="w-full space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="text-sm font-bold tabular-nums text-zinc-900">{formatCompact(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
