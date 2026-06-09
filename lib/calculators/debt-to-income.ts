// Pure logic for the Debt to Income (DTI) Ratio Calculator.
// DTI = total monthly debt payments / gross monthly income, shown as a percent.
// Lenders look at both the front-end ratio (housing only) and the back-end
// ratio (all debts). This tool reports the back-end ratio plus a housing split.

export interface DtiInput {
  grossMonthlyIncome: number;
  housingPayment: number; // rent or mortgage incl. tax/insurance
  carPayments: number;
  creditCardPayments: number; // minimum payments
  loanPayments: number; // student, personal, etc.
  otherDebt: number;
}

export type DtiRating = "Excellent" | "Good" | "Caution" | "High";

export interface DtiResult {
  totalDebt: number;
  dtiPct: number; // back-end ratio
  frontEndPct: number; // housing only
  rating: DtiRating;
  ratingNote: string;
  components: { label: string; value: number }[];
}

function rate(dti: number): { rating: DtiRating; note: string } {
  if (dti <= 28) return { rating: "Excellent", note: "Lenders see this as very healthy." };
  if (dti <= 36) return { rating: "Good", note: "Most lenders are comfortable here." };
  if (dti <= 43) return { rating: "Caution", note: "Near the common qualifying limit." };
  return { rating: "High", note: "Many lenders decline above this level." };
}

export function computeDti(input: DtiInput): DtiResult | null {
  const {
    grossMonthlyIncome,
    housingPayment,
    carPayments,
    creditCardPayments,
    loanPayments,
    otherDebt,
  } = input;

  if (!Number.isFinite(grossMonthlyIncome) || grossMonthlyIncome <= 0) return null;
  const parts = [housingPayment, carPayments, creditCardPayments, loanPayments, otherDebt];
  for (const p of parts) {
    if (!Number.isFinite(p) || p < 0) return null;
  }

  const totalDebt = parts.reduce((s, p) => s + p, 0);
  const dtiPct = (totalDebt / grossMonthlyIncome) * 100;
  const frontEndPct = (housingPayment / grossMonthlyIncome) * 100;
  const { rating, note } = rate(dtiPct);

  const components = [
    { label: "Housing", value: housingPayment },
    { label: "Car", value: carPayments },
    { label: "Credit cards", value: creditCardPayments },
    { label: "Loans", value: loanPayments },
    { label: "Other", value: otherDebt },
  ].filter((c) => c.value > 0);

  return { totalDebt, dtiPct, frontEndPct, rating, ratingNote: note, components };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export const formatPct = (n: number) => `${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;
