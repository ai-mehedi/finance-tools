// Pure logic for the Home Equity Line of Credit (HELOC) Calculator.
// First it works out how much equity you can borrow against, using the lender's
// maximum combined loan-to-value (CLTV). Then it amortizes a draw over a HELOC's
// two phases: an interest-only draw period followed by a fully amortizing
// repayment period. A per-year schedule is returned for charting.

export interface HelocInput {
  homeValue: number;
  mortgageBalance: number;
  maxCltvPct: number; // lender's combined loan-to-value cap, e.g. 85
  drawAmount: number; // amount actually borrowed from the line
  annualRatePct: number;
  drawYears: number; // interest-only draw period
  repayYears: number; // amortizing repayment period
}

export interface HelocYearPoint {
  year: number;
  balance: number;
  phase: "draw" | "repay";
}

export interface HelocResult {
  availableCredit: number; // max line size before subtracting any draw
  cltvAfterDraw: number; // resulting combined LTV once the draw is taken, in %
  drawMonthlyPayment: number; // interest-only payment during the draw period
  repayMonthlyPayment: number; // amortizing payment during repayment
  totalInterest: number;
  totalPaid: number;
  schedule: HelocYearPoint[];
}

export function computeHeloc(input: HelocInput): HelocResult | null {
  const {
    homeValue,
    mortgageBalance,
    maxCltvPct,
    drawAmount,
    annualRatePct,
    drawYears,
    repayYears,
  } = input;

  if (!Number.isFinite(homeValue) || homeValue <= 0) return null;
  if (mortgageBalance < 0 || drawAmount < 0) return null;
  if (!Number.isFinite(maxCltvPct) || maxCltvPct <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(drawYears) || drawYears < 0) return null;
  if (!Number.isFinite(repayYears) || repayYears <= 0) return null;

  const maxCombined = homeValue * (maxCltvPct / 100);
  const availableCredit = Math.max(0, maxCombined - mortgageBalance);

  const cltvAfterDraw = ((mortgageBalance + drawAmount) / homeValue) * 100;

  const monthlyRate = annualRatePct / 100 / 12;
  const drawMonths = Math.round(drawYears * 12);
  const repayMonths = Math.round(repayYears * 12);

  // Interest-only payment during the draw period: balance stays flat.
  const drawMonthlyPayment = drawAmount * monthlyRate;

  // Fully amortizing payment over the repayment period.
  const repayMonthlyPayment =
    monthlyRate === 0
      ? drawAmount / repayMonths
      : (drawAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -repayMonths));

  let balance = drawAmount;
  let totalPaid = 0;
  const schedule: HelocYearPoint[] = [{ year: 0, balance, phase: drawMonths > 0 ? "draw" : "repay" }];

  // Draw period: interest only, principal unchanged.
  for (let m = 1; m <= drawMonths; m++) {
    totalPaid += drawMonthlyPayment;
    if (m % 12 === 0) schedule.push({ year: m / 12, balance, phase: "draw" });
  }

  // Repayment period: amortize down to zero.
  for (let m = 1; m <= repayMonths; m++) {
    const interest = balance * monthlyRate;
    const principal = repayMonthlyPayment - interest;
    balance = Math.max(0, balance - principal);
    totalPaid += repayMonthlyPayment;
    if (m % 12 === 0) {
      schedule.push({ year: drawYears + m / 12, balance, phase: "repay" });
    }
  }

  const totalInterest = totalPaid - drawAmount;

  return {
    availableCredit,
    cltvAfterDraw,
    drawMonthlyPayment,
    repayMonthlyPayment,
    totalInterest,
    totalPaid,
    schedule,
  };
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
