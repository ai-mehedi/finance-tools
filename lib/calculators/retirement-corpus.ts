// Pure logic for the Retirement Corpus Calculator.
// Works out how large a retirement corpus you need so that an inflation-adjusted
// annual expense can be drawn for the whole of retirement while the remaining
// corpus keeps earning a post-retirement return. Uses the present value of a
// growing annuity, then exposes a draw-down schedule for charting.

export interface RetirementCorpusInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenseToday: number; // current monthly spend, today's money
  inflationPct: number; // % per year
  preRetReturnPct: number; // return while still working
  postRetReturnPct: number; // return during retirement
}

export interface CorpusYearPoint {
  age: number;
  balance: number; // remaining corpus at start of that retirement year
  withdrawal: number; // amount drawn that year
}

export interface RetirementCorpusResult {
  corpusRequired: number; // lump sum needed at retirement
  firstYearExpense: number; // annual expense in the first retirement year
  annualExpenseToday: number;
  yearsInRetirement: number;
  yearsToRetire: number;
  schedule: CorpusYearPoint[];
}

export function computeRetirementCorpus(
  input: RetirementCorpusInput
): RetirementCorpusResult | null {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenseToday,
    inflationPct,
    preRetReturnPct,
    postRetReturnPct,
  } = input;

  if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge) || !Number.isFinite(lifeExpectancy)) return null;
  if (retirementAge <= currentAge) return null;
  if (lifeExpectancy <= retirementAge) return null;
  if (monthlyExpenseToday < 0) return null;
  if (!Number.isFinite(inflationPct) || !Number.isFinite(postRetReturnPct) || !Number.isFinite(preRetReturnPct)) return null;

  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  const annualExpenseToday = monthlyExpenseToday * 12;
  const i = inflationPct / 100;
  const g = postRetReturnPct / 100;

  // Annual expense at the start of retirement (inflated from today to retirement).
  const firstYearExpense = annualExpenseToday * Math.pow(1 + i, yearsToRetire);

  // Present value at retirement of a growing annuity: payments grow with inflation,
  // discounted at the post-retirement return. Withdrawals at the start of each year.
  let corpusRequired = 0;
  if (Math.abs(g - i) < 1e-9) {
    // Real return is ~zero: each discounted payment equals the first-year amount.
    corpusRequired = firstYearExpense * yearsInRetirement;
  } else {
    const ratio = (1 + i) / (1 + g);
    corpusRequired = firstYearExpense * ((1 - Math.pow(ratio, yearsInRetirement)) / (g - i));
  }

  // Build a draw-down schedule to confirm the corpus lasts and to chart it.
  const schedule: CorpusYearPoint[] = [];
  let balance = corpusRequired;
  for (let k = 0; k < yearsInRetirement; k++) {
    const withdrawal = firstYearExpense * Math.pow(1 + i, k);
    schedule.push({ age: retirementAge + k, balance, withdrawal });
    balance = (balance - withdrawal) * (1 + g);
    if (balance < 0) balance = 0;
  }
  schedule.push({ age: lifeExpectancy, balance: Math.max(balance, 0), withdrawal: 0 });

  return {
    corpusRequired,
    firstYearExpense,
    annualExpenseToday,
    yearsInRetirement,
    yearsToRetire,
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
