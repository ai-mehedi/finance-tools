// Pure logic for the Budget Calculator.
// Applies the popular 50/30/20 rule to monthly after-tax income:
// 50% to needs, 30% to wants, 20% to savings and debt repayment.

export interface BudgetInput {
  monthlyIncome: number;
}

export interface BudgetResult {
  needs: number; // 50%
  wants: number; // 30%
  savings: number; // 20%
}

export function computeBudget(input: BudgetInput): BudgetResult | null {
  const { monthlyIncome } = input;
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) return null;

  return {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
  };
}

// Fixed en-US locale so server and client render identical strings (no hydration mismatch).
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(n: number): string {
  return usd.format(Number.isFinite(n) ? n : 0);
}
