// Pure logic for the PMI (Private Mortgage Insurance) Calculator.
// PMI is typically required when a conventional mortgage starts with less than
// 20 percent down. It is charged as an annual rate on the loan balance and can
// usually be cancelled once the loan-to-value ratio reaches 80 percent.
// We amortize the loan month by month to find when PMI drops off and how much
// it costs in total, and expose a per-year schedule for charting.

export interface PmiInput {
  homePrice: number;
  downPayment: number; // dollars paid up front
  annualRatePct: number; // mortgage interest rate
  termYears: number;
  pmiRatePct: number; // annual PMI rate as a percent of the loan balance
}

export interface PmiYearPoint {
  year: number;
  balance: number; // remaining loan balance at year end
  ltv: number; // loan-to-value percent at year end
  pmiPaidToDate: number; // cumulative PMI paid through this year
  pmiActive: boolean; // whether PMI was still charged during this year
}

export interface PmiResult {
  loanAmount: number;
  downPaymentPct: number;
  monthlyPmiInitial: number; // first-month PMI charge
  monthlyPrincipalInterest: number; // fixed P&I payment
  totalPmiCost: number; // total PMI paid until it drops off
  monthsWithPmi: number; // how many months PMI is charged
  cancelMonth: number | null; // month PMI reaches the 80% LTV cutoff (null if never within term)
  requiresPmi: boolean;
  schedule: PmiYearPoint[];
}

export function computePmi(input: PmiInput): PmiResult | null {
  const { homePrice, downPayment, annualRatePct, termYears, pmiRatePct } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (!Number.isFinite(downPayment) || downPayment < 0) return null;
  if (downPayment >= homePrice) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (!Number.isFinite(pmiRatePct) || pmiRatePct < 0) return null;

  const loanAmount = homePrice - downPayment;
  const downPaymentPct = (downPayment / homePrice) * 100;
  const requiresPmi = downPaymentPct < 20 && pmiRatePct > 0;

  // Fixed monthly principal-and-interest payment.
  const i = annualRatePct / 100 / 12;
  const months = Math.round(termYears * 12);
  const monthlyPrincipalInterest =
    i === 0
      ? loanAmount / months
      : (loanAmount * i) / (1 - Math.pow(1 + i, -months));

  // PMI is charged while the balance is above 80 percent of the home price.
  const pmiCutoffBalance = homePrice * 0.8;
  const monthlyPmiRate = pmiRatePct / 100 / 12;
  const monthlyPmiInitial = requiresPmi ? loanAmount * monthlyPmiRate : 0;

  let balance = loanAmount;
  let totalPmiCost = 0;
  let monthsWithPmi = 0;
  let cancelMonth: number | null = null;

  const schedule: PmiYearPoint[] = [
    {
      year: 0,
      balance: loanAmount,
      ltv: (loanAmount / homePrice) * 100,
      pmiPaidToDate: 0,
      pmiActive: requiresPmi,
    },
  ];

  for (let m = 1; m <= months; m++) {
    const pmiActiveThisMonth = requiresPmi && balance > pmiCutoffBalance;
    if (pmiActiveThisMonth) {
      totalPmiCost += balance * monthlyPmiRate;
      monthsWithPmi += 1;
    } else if (requiresPmi && cancelMonth === null) {
      cancelMonth = m; // first month PMI is no longer charged
    }

    const interest = balance * i;
    const principal = monthlyPrincipalInterest - interest;
    balance = Math.max(0, balance - principal);

    if (m % 12 === 0 || m === months) {
      schedule.push({
        year: m / 12,
        balance,
        ltv: (balance / homePrice) * 100,
        pmiPaidToDate: totalPmiCost,
        pmiActive: requiresPmi && balance > pmiCutoffBalance,
      });
    }
  }

  return {
    loanAmount,
    downPaymentPct,
    monthlyPmiInitial,
    monthlyPrincipalInterest,
    totalPmiCost,
    monthsWithPmi,
    cancelMonth,
    requiresPmi,
    schedule,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}
