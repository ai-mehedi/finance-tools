// Pure logic for the Recurring Deposit (RD) Calculator.
// Models an Indian-style recurring deposit where a fixed amount is paid every
// month and interest is compounded quarterly, the standard bank convention.
// Each monthly instalment earns interest for the months remaining until
// maturity. Returns INR figures and a per-year schedule for charting.

export interface RdInput {
  monthlyDeposit: number;
  annualRatePct: number;
  years: number;
}

export interface RdYearPoint {
  year: number;
  balance: number; // value of the RD at the end of this year
  deposited: number; // total instalments paid in so far
  interest: number; // balance minus deposited
}

export interface RdResult {
  maturityValue: number;
  totalDeposited: number;
  totalInterest: number;
  months: number;
  schedule: RdYearPoint[];
}

// Quarterly compounding means the effective monthly growth factor is
// (1 + r/4)^(1/3), applied once per month between compounding dates.
export function computeRd(input: RdInput): RdResult | null {
  const { monthlyDeposit, annualRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (monthlyDeposit <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;

  const months = Math.round(years * 12);
  const quarterlyRate = annualRatePct / 100 / 4;
  const monthlyFactor = Math.pow(1 + quarterlyRate, 1 / 3);

  let balance = 0;
  const schedule: RdYearPoint[] = [{ year: 0, balance: 0, deposited: 0, interest: 0 }];

  for (let m = 1; m <= months; m++) {
    // Deposit is made at the start of the month, then grows for the month.
    balance = (balance + monthlyDeposit) * monthlyFactor;
    if (m % 12 === 0) {
      const deposited = monthlyDeposit * m;
      schedule.push({
        year: m / 12,
        balance,
        deposited,
        interest: balance - deposited,
      });
    }
  }

  const totalDeposited = monthlyDeposit * months;
  const maturityValue = balance;
  const totalInterest = maturityValue - totalDeposited;

  return { maturityValue, totalDeposited, totalInterest, months, schedule };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}
