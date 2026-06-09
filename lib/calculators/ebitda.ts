// Pure logic for the EBITDA Calculator.
// EBITDA = Earnings Before Interest, Taxes, Depreciation and Amortization.
// It can be built up from net income (the add-back method) or down from
// revenue (operating method). Here we use the add-back method, which is the
// most common: EBITDA = Net income + Interest + Taxes + Depreciation + Amortization.

export interface EbitdaInput {
  netIncome: number;
  interest: number;
  taxes: number;
  depreciation: number;
  amortization: number;
  revenue?: number; // optional, used only for the EBITDA margin
}

export interface EbitdaResult {
  ebitda: number;
  addBacks: number; // interest + taxes + depreciation + amortization
  margin: number | null; // EBITDA / revenue, percent, null when no revenue
}

export function computeEbitda(input: EbitdaInput): EbitdaResult | null {
  const { netIncome, interest, taxes, depreciation, amortization, revenue = 0 } = input;

  if (
    !Number.isFinite(netIncome) ||
    !Number.isFinite(interest) ||
    !Number.isFinite(taxes) ||
    !Number.isFinite(depreciation) ||
    !Number.isFinite(amortization)
  ) {
    return null;
  }
  if (interest < 0 || taxes < 0 || depreciation < 0 || amortization < 0) return null;

  const addBacks = interest + taxes + depreciation + amortization;
  const ebitda = netIncome + addBacks;
  const margin = revenue > 0 ? (ebitda / revenue) * 100 : null;

  return { ebitda, addBacks, margin };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
