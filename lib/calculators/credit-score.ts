// Pure logic for the Credit Score Simulator.
// Estimates a FICO-style score (300 to 850) from the five weighted factors FICO
// publishes: payment history (35%), amounts owed / utilization (30%), length of
// history (15%), credit mix (10%) and new credit (10%). This is an educational
// estimate, not your real score.

export interface CreditScoreInput {
  onTimePaymentPct: number; // share of payments made on time, 0 to 100
  utilizationPct: number; // credit utilization, 0 to 100+
  avgAccountAgeYears: number; // average age of accounts in years
  accountTypes: number; // number of distinct credit types (cards, loans, etc.)
  hardInquiries: number; // hard inquiries in the last 12 months
}

export interface ScoreFactor {
  label: string;
  weightPct: number; // contribution weight
  scorePct: number; // 0 to 100, how well this factor scores
  points: number; // contribution to the final score, in points
}

export interface CreditScoreResult {
  score: number; // 300 to 850
  band: string; // Poor / Fair / Good / Very Good / Exceptional
  factors: ScoreFactor[];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function paymentSubscore(onTimePct: number): number {
  // On-time history dominates. Below 95% on-time falls off quickly.
  const p = clamp(onTimePct, 0, 100);
  if (p >= 100) return 100;
  return clamp(100 - (100 - p) * 6, 0, 100);
}

function utilizationSubscore(utilPct: number): number {
  const u = clamp(utilPct, 0, 200);
  if (u <= 10) return 100;
  if (u <= 30) return 100 - (u - 10) * 1.25; // 100 down to 75
  if (u <= 50) return 75 - (u - 30) * 1.5; // 75 down to 45
  if (u <= 100) return clamp(45 - (u - 50) * 0.9, 0, 45);
  return 0;
}

function ageSubscore(years: number): number {
  // Around 7+ years of average age is excellent.
  return clamp((clamp(years, 0, 12) / 7) * 100, 0, 100);
}

function mixSubscore(types: number): number {
  // Three or more distinct credit types is ideal.
  return clamp((clamp(types, 0, 5) / 3) * 100, 0, 100);
}

function inquirySubscore(inquiries: number): number {
  // Each hard inquiry in the last year costs roughly a sixth of this factor.
  return clamp(100 - clamp(inquiries, 0, 10) * 16, 0, 100);
}

function bandFor(score: number): string {
  if (score >= 800) return "Exceptional";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

export function computeCreditScore(input: CreditScoreInput): CreditScoreResult | null {
  const { onTimePaymentPct, utilizationPct, avgAccountAgeYears, accountTypes, hardInquiries } = input;

  if (
    !Number.isFinite(onTimePaymentPct) ||
    !Number.isFinite(utilizationPct) ||
    !Number.isFinite(avgAccountAgeYears) ||
    !Number.isFinite(accountTypes) ||
    !Number.isFinite(hardInquiries)
  ) {
    return null;
  }
  if (onTimePaymentPct < 0 || utilizationPct < 0 || avgAccountAgeYears < 0 || accountTypes < 0 || hardInquiries < 0) {
    return null;
  }

  const defs: { label: string; weightPct: number; scorePct: number }[] = [
    { label: "Payment history", weightPct: 35, scorePct: paymentSubscore(onTimePaymentPct) },
    { label: "Credit utilization", weightPct: 30, scorePct: utilizationSubscore(utilizationPct) },
    { label: "Length of history", weightPct: 15, scorePct: ageSubscore(avgAccountAgeYears) },
    { label: "Credit mix", weightPct: 10, scorePct: mixSubscore(accountTypes) },
    { label: "New credit", weightPct: 10, scorePct: inquirySubscore(hardInquiries) },
  ];

  // Weighted fraction of the 300 to 850 range (550 points wide).
  const range = 850 - 300;
  const weightedPct = defs.reduce((acc, d) => acc + (d.weightPct / 100) * (d.scorePct / 100), 0);
  const score = Math.round(300 + weightedPct * range);

  const factors: ScoreFactor[] = defs.map((d) => ({
    label: d.label,
    weightPct: d.weightPct,
    scorePct: d.scorePct,
    points: Math.round((d.weightPct / 100) * (d.scorePct / 100) * range),
  }));

  return { score: clamp(score, 300, 850), band: bandFor(score), factors };
}
