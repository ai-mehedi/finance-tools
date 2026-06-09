// Pure logic for the 50/30/20 Budget Calculator.
// The 50/30/20 rule splits after-tax income into 50% needs, 30% wants and
// 20% savings or debt payoff. This computes the monthly target for each bucket.

export interface Budget503020Input {
  monthlyIncome: number; // take-home (after-tax) income
}

export interface Budget503020Result {
  needs: number; // 50%
  wants: number; // 30%
  savings: number; // 20%
}

export function computeBudget503020(input: Budget503020Input): Budget503020Result | null {
  const { monthlyIncome } = input;
  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) return null;

  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
  };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number) => usd.format(Number.isFinite(n) ? n : 0);
