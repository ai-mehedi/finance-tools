// Pure logic for the PPF (Public Provident Fund) Calculator.
// PPF interest is calculated on the minimum balance between the 5th and the last
// day of each month, but credited (compounded) once a year at year end. The most
// common modelling assumption — used here — is an annual deposit at the start of
// each financial year, which earns a full year of interest. Interest is then
// added to the balance at year end and itself earns interest in following years.
// Exposes a per-year schedule for charting.

export interface PpfInput {
  yearlyDeposit: number;
  annualRatePct: number;
  years: number; // tenure, PPF minimum is 15
}

export interface PpfYearPoint {
  year: number;
  deposited: number; // cumulative deposits so far
  balance: number; // closing balance after interest credit
  interest: number; // cumulative interest earned so far
}

export interface PpfResult {
  maturityValue: number;
  totalDeposited: number;
  totalInterest: number;
  schedule: PpfYearPoint[];
}

export function computePpf(input: PpfInput): PpfResult | null {
  const { yearlyDeposit, annualRatePct, years } = input;

  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(yearlyDeposit) || yearlyDeposit < 0) return null;
  if (!Number.isFinite(annualRatePct)) return null;

  const r = annualRatePct / 100;
  const n = Math.round(years);

  let balance = 0;
  let deposited = 0;
  const schedule: PpfYearPoint[] = [
    { year: 0, deposited: 0, balance: 0, interest: 0 },
  ];

  for (let y = 1; y <= n; y++) {
    // Deposit at the start of the year, then a full year of interest on the
    // running balance (which now includes this year's deposit).
    deposited += yearlyDeposit;
    balance = (balance + yearlyDeposit) * (1 + r);
    schedule.push({
      year: y,
      deposited,
      balance,
      interest: balance - deposited,
    });
  }

  return {
    maturityValue: balance,
    totalDeposited: deposited,
    totalInterest: balance - deposited,
    schedule,
  };
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
