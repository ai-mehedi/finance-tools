// Pure logic for the APR (Annual Percentage Rate) Calculator.
// APR reflects the true yearly cost of a loan once upfront fees are folded in.
// We solve for the periodic rate that makes the present value of the monthly
// payments equal the amount actually received (loan amount minus fees), then
// express it as a nominal annual rate.

export interface AprInput {
  loanAmount: number;
  annualRatePct: number; // stated nominal interest rate
  termYears: number;
  fees: number; // upfront fees and finance charges
}

export interface AprResult {
  monthlyPayment: number;
  netAdvance: number; // money received after fees
  aprPct: number; // effective annual percentage rate
  totalPaid: number; // sum of all monthly payments
  totalCost: number; // interest plus fees
}

// Standard amortizing payment for principal P, monthly rate r, n payments.
function payment(P: number, r: number, n: number): number {
  if (P <= 0 || n <= 0) return 0;
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Present value of n payments of pmt discounted at monthly rate r.
function presentValue(pmt: number, r: number, n: number): number {
  if (n <= 0) return 0;
  if (r === 0) return pmt * n;
  return (pmt * (1 - Math.pow(1 + r, -n))) / r;
}

export function computeApr(input: AprInput): AprResult | null {
  const { loanAmount, annualRatePct, termYears, fees } = input;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(termYears) || termYears <= 0) return null;
  if (annualRatePct < 0 || fees < 0) return null;

  const n = Math.round(termYears * 12);
  const nominalMonthly = annualRatePct / 100 / 12;

  // Payment is based on the stated rate and full loan amount.
  const monthlyPayment = payment(loanAmount, nominalMonthly, n);

  // The borrower actually receives loanAmount minus fees, so the APR is the
  // rate that equates that net advance to the stream of payments.
  const netAdvance = Math.max(0, loanAmount - fees);

  // Bisection on the monthly rate that makes PV(payments) == netAdvance.
  let lo = 0;
  let hi = 1; // 100% monthly is far beyond any realistic APR
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pv = presentValue(monthlyPayment, mid, n);
    if (pv > netAdvance) {
      lo = mid; // need a higher rate to lower the present value
    } else {
      hi = mid;
    }
  }
  const aprMonthly = (lo + hi) / 2;
  const aprPct = aprMonthly * 12 * 100;

  const totalPaid = monthlyPayment * n;
  const totalCost = totalPaid - netAdvance;

  return { monthlyPayment, netAdvance, aprPct, totalPaid, totalCost };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;
