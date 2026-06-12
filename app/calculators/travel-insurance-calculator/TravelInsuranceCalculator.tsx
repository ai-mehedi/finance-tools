"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  computeTravelInsurance,
  formatUSD,
  formatCompact,
  type Destination,
  type TravelInsuranceResult,
} from "@/lib/calculators/travel-insurance";

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: "domestic", label: "Domestic" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia / Pacific" },
  { value: "americas", label: "USA / Americas" },
  { value: "worldwide", label: "Worldwide" },
];

type FormState = {
  tripCost: string;
  tripDays: string;
  travelers: string;
  age: string;
  destination: Destination;
  coverCancellation: boolean;
  medicalUpgrade: boolean;
  adventureSports: boolean;
  rentalCar: boolean;
};

const DEFAULTS: FormState = {
  tripCost: "4000",
  tripDays: "10",
  travelers: "2",
  age: "42",
  destination: "europe",
  coverCancellation: true,
  medicalUpgrade: false,
  adventureSports: false,
  rentalCar: false,
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function compute(f: FormState): TravelInsuranceResult | null {
  return computeTravelInsurance({
    tripCost: num(f.tripCost) || 0,
    tripDays: num(f.tripDays),
    travelers: num(f.travelers),
    age: num(f.age),
    destination: f.destination,
    coverCancellation: f.coverCancellation,
    medicalUpgrade: f.medicalUpgrade,
    adventureSports: f.adventureSports,
    rentalCar: f.rentalCar,
  });
}

export default function TravelInsuranceCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<TravelInsuranceResult | null>(() => compute(DEFAULTS));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = compute(form);
    if (!r) {
      setError("Enter a positive trip length, at least one traveler and a valid age.");
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
          <h2 className="text-base font-extrabold text-zinc-900">Trip details</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Describe your trip, then press Calculate.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tripCost">Prepaid trip cost</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                  <Input id="tripCost" type="number" min={0} step="any" inputMode="decimal" className="h-11 pl-7" value={form.tripCost} onChange={(e) => set("tripCost", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="tripDays">Trip length (days)</Label>
                <Input id="tripDays" type="number" min={1} step="any" inputMode="decimal" className="h-11" value={form.tripDays} onChange={(e) => set("tripDays", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="travelers">Travelers</Label>
                <Input id="travelers" type="number" min={1} step="1" inputMode="numeric" className="h-11" value={form.travelers} onChange={(e) => set("travelers", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="age">Oldest age</Label>
                <Input id="age" type="number" min={0} step="1" inputMode="numeric" className="h-11" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dest">Destination</Label>
                <Select id="dest" className="h-11" value={form.destination} onChange={(e) => set("destination", e.target.value as Destination)}>
                  {DESTINATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Add-on coverage</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {([
                  ["coverCancellation", "Trip cancellation"],
                  ["medicalUpgrade", "Medical upgrade"],
                  ["adventureSports", "Adventure sports"],
                  ["rentalCar", "Rental-car damage"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 has-[:checked]:border-orange-300 has-[:checked]:bg-orange-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-orange-500"
                      checked={form[key]}
                      onChange={(e) => set(key, e.target.checked)}
                    />
                    {label}
                  </label>
                ))}
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
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Estimated premium</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {result ? formatUSD(result.premium) : "—"}
          </p>
          <div className="mt-5 space-y-2">
            {result ? (
              <>
                <Row label="Per traveler" value={formatUSD(result.perPerson)} />
                <Row label="Per day" value={formatUSD(result.perDay)} />
                <Row label="Share of trip cost" value={`${result.pctOfTripCost.toFixed(1)}%`} />
              </>
            ) : (
              <p className="rounded-lg bg-white/70 px-3 py-2.5 text-sm text-zinc-400">Enter valid values to see results.</p>
            )}
          </div>
        </div>
      </form>

      {/* Breakdown donut */}
      {result && result.components.length > 0 && <PremiumDonut result={result} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}

const SLICE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#a1a1aa"];

function PremiumDonut({ result }: { result: TravelInsuranceResult }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 86;
  const rInner = 54;
  const total = result.premium || 1;

  let start = -Math.PI / 2; // start at top
  const arcs = result.components.map((c, i) => {
    const frac = c.amount / total;
    const end = start + frac * Math.PI * 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);
    const xi2 = cx + rInner * Math.cos(end);
    const yi2 = cy + rInner * Math.sin(end);
    const xi1 = cx + rInner * Math.cos(start);
    const yi1 = cy + rInner * Math.sin(start);
    const d = `M${x1.toFixed(1)},${y1.toFixed(1)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${rInner},${rInner} 0 ${large} 0 ${xi1.toFixed(1)},${yi1.toFixed(1)} Z`;
    start = end;
    return { d, color: SLICE_COLORS[i % SLICE_COLORS.length], label: c.label, amount: c.amount };
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-zinc-900">Where the premium goes</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label="Premium breakdown by component">
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth={1.5} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900" fontSize={18} fontWeight={800}>
            {formatCompact(result.premium)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" fontSize={10}>total</text>
        </svg>
        <ul className="w-full space-y-1.5">
          {arcs.map((a, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                {a.label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">{formatUSD(a.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
