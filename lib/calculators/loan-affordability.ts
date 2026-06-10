// Pure logic for the Loan Affordability Calculator.
// Works backwards from your budget: given gross monthly income, existing monthly
// debt payments, the share of income a lender lets go to debt (the DTI ceiling),
// plus the loan's rate and term, it solves for the largest payment you can take
// on and the loan principal that payment supports. Also returns a schedule of how
// the affordable loan amount changes as the interest rate moves, for charting.

export interface LoanAffordabilityInput {
  monthlyIncome: number; // gross monthly income
  monthlyDebts: number; // existing recurring debt payments (cards, car, etc.)
  dtiPct: number; // maximum total debt-to-income ratio a lender allows
  annualRatePct: number; // interest rate on the new loan
  termYears: number; // length of the new loan
}

export interface RateAffordPoint {
  ratePct: number;
  loanAmount: number;
}

export interface LoanAffordabilityResult {
  maxTotalDebtPayment: number; // income times DTI ceiling
  affordablePayment: number; // what's left for the new loan after existing debts
  loanAmount: number; // principal that payment supports
  totalOfPayments: number; // affordable payment times number of months
  totalInterest: number;
  schedule: RateAffordPoint[]; // affordable loan amount across a band of rates
}

// Present value of an ordinary annuity: how much principal a level payment buys.
function principalFromPayment(payment: number, monthlyRate: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return payment * months;
  return (payment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

export function computeLoanAffordability(
  input: LoanAffordabilityInput
): LoanAffordabilityResult | null {
  const { monthlyIncome, monthlyDebts, dtiPct, annualRatePct, termYears } = input;

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;
  if (!Number.isFinite(monthlyDebts) || monthlyDebts < 0) return null;
  if (!Number.isFinite(dtiPct) || dtiPct <= 0 || dtiPct > 100) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;

  const months = Math.round(termYears * 12);
  const monthlyRate = annualRatePct / 100 / 12;

  const maxTotalDebtPayment = monthlyIncome * (dtiPct / 100);
  const affordablePayment = Math.max(0, maxTotalDebtPayment - monthlyDebts);

  const loanAmount = principalFromPayment(affordablePayment, monthlyRate, months);
  const totalOfPayments = affordablePayment * months;
  const totalInterest = Math.max(0, totalOfPayments - loanAmount);

  // Show how the affordable loan amount shifts as the rate changes around the
  // chosen rate, holding the affordable payment fixed.
  const base = annualRatePct;
  const lo = Math.max(0, base - 4);
  const hi = base + 4;
  const steps = 9;
  const schedule: RateAffordPoint[] = [];
  for (let i = 0; i < steps; i++) {
    const ratePct = lo + ((hi - lo) / (steps - 1)) * i;
    const mr = ratePct / 100 / 12;
    schedule.push({
      ratePct,
      loanAmount: principalFromPayment(affordablePayment, mr, months),
    });
  }

  return {
    maxTotalDebtPayment,
    affordablePayment,
    loanAmount,
    totalOfPayments,
    totalInterest,
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
