// Pure logic for the Closing Cost Calculator.
// Estimates the one-time costs a buyer pays at closing on a home purchase.
// Some costs are a percent of the loan or price, others are flat fees.
// We total them and expose the line items so the widget can chart a breakdown.

export interface ClosingCostInput {
  homePrice: number;
  downPayment: number; // dollar amount
  loanOriginationPct: number; // percent of loan amount
  appraisalFee: number;
  titleInsurancePct: number; // percent of home price
  recordingFees: number;
  prepaidEscrow: number; // taxes and insurance held at closing
  otherFees: number;
}

export interface ClosingCostLine {
  label: string;
  amount: number;
}

export interface ClosingCostResult {
  loanAmount: number;
  totalClosingCost: number;
  percentOfPrice: number; // closing cost as a percent of home price
  cashToClose: number; // down payment + closing costs
  lines: ClosingCostLine[];
}

export function computeClosingCost(input: ClosingCostInput): ClosingCostResult | null {
  const {
    homePrice,
    downPayment,
    loanOriginationPct,
    appraisalFee,
    titleInsurancePct,
    recordingFees,
    prepaidEscrow,
    otherFees,
  } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return null;
  if (!Number.isFinite(downPayment) || downPayment < 0) return null;
  if (downPayment > homePrice) return null;
  const pcts = [loanOriginationPct, titleInsurancePct];
  if (pcts.some((v) => !Number.isFinite(v) || v < 0)) return null;
  const flats = [appraisalFee, recordingFees, prepaidEscrow, otherFees];
  if (flats.some((v) => !Number.isFinite(v) || v < 0)) return null;

  const loanAmount = homePrice - downPayment;
  const origination = loanAmount * (loanOriginationPct / 100);
  const titleInsurance = homePrice * (titleInsurancePct / 100);

  const lines: ClosingCostLine[] = [
    { label: "Loan origination", amount: origination },
    { label: "Title insurance", amount: titleInsurance },
    { label: "Appraisal fee", amount: appraisalFee },
    { label: "Recording fees", amount: recordingFees },
    { label: "Prepaid escrow", amount: prepaidEscrow },
    { label: "Other fees", amount: otherFees },
  ];

  const totalClosingCost = lines.reduce((sum, l) => sum + l.amount, 0);
  const percentOfPrice = (totalClosingCost / homePrice) * 100;
  const cashToClose = downPayment + totalClosingCost;

  return {
    loanAmount,
    totalClosingCost,
    percentOfPrice,
    cashToClose,
    lines,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
export const formatUSD2 = (n: number) => usd2.format(Number.isFinite(n) ? n : 0);

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}
