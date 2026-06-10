// Pure logic for the Present Value Calculator.
// Discounts a future amount back to today, and optionally a stream of equal
// future payments (an annuity), to find what they are worth now. Simulates
// period by period so the discounting stays consistent across compounding
// choices, and exposes a per-period schedule showing how each future dollar is
// worth less the further out it sits.

export type Frequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";

export const FREQ_PER_YEAR: Record<Frequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export interface PresentValueInput {
  futureValue: number; // a single lump sum due in the future
  payment: number; // equal payment received each period (ordinary annuity)
  annualRatePct: number; // discount rate
  years: number;
  frequency: Frequency; // compounding / discounting frequency
}

export interface PresentValuePoint {
  period: number; // period index (in units of the chosen frequency)
  year: number;
  discountFactor: number; // 1 / (1 + i)^period
  pvOfPayment: number; // present value of the payment due at this period
  cumulativePV: number; // running present value of payments up to here
}

export interface PresentValueResult {
  presentValue: number; // total PV of lump sum plus annuity
  pvLumpSum: number;
  pvAnnuity: number;
  totalFutureCash: number; // undiscounted sum of all future cash
  schedule: PresentValuePoint[];
}

export function computePresentValue(input: PresentValueInput): PresentValueResult | null {
  const { futureValue, payment, annualRatePct, years, frequency } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(futureValue) || !Number.isFinite(payment)) return null;

  const n = FREQ_PER_YEAR[frequency];
  const i = annualRatePct / 100 / n; // periodic discount rate
  const periods = Math.round(years * n);
  if (periods <= 0) return null;

  // PV of a single future lump sum: FV / (1 + i)^N
  const pvLumpSum = futureValue / Math.pow(1 + i, periods);

  // PV of an ordinary annuity, period by period (keeps it exact for i = 0).
  let pvAnnuity = 0;
  let cumulativePV = 0;
  const schedule: PresentValuePoint[] = [];

  // To keep the chart readable, sample at most ~120 points.
  const step = Math.max(1, Math.ceil(periods / 120));

  for (let p = 1; p <= periods; p++) {
    const discountFactor = 1 / Math.pow(1 + i, p);
    const pvOfPayment = payment * discountFactor;
    pvAnnuity += pvOfPayment;
    cumulativePV += pvOfPayment;

    if (p % step === 0 || p === periods) {
      schedule.push({
        period: p,
        year: p / n,
        discountFactor,
        pvOfPayment,
        cumulativePV,
      });
    }
  }

  const presentValue = pvLumpSum + pvAnnuity;
  const totalFutureCash = futureValue + payment * periods;

  return { presentValue, pvLumpSum, pvAnnuity, totalFutureCash, schedule };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
