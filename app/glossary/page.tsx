import StaticPage from "../components/StaticPage";

export const metadata = {
  title: "Financial Glossary",
  alternates: { canonical: "/glossary" },
  description: "Common money and finance terms explained in plain English, without the jargon.",
};

const TERMS: [string, string][] = [
  ["Amortization", "Paying off a loan in equal installments, where early payments cover mostly interest and later ones mostly principal."],
  ["APR", "The yearly cost of a loan including interest and most fees, shown as a percentage so you can compare offers fairly."],
  ["Asset", "Anything you own that has value, such as cash, a home, a car or investments."],
  ["CAGR", "The smoothed yearly growth rate of an investment over several years, as if it grew at a steady pace."],
  ["Compound Interest", "Interest that earns interest. You earn returns on your original money and on the returns it has already made."],
  ["Credit Score", "A number lenders use to judge how likely you are to repay. Higher scores usually mean better rates."],
  ["Credit Utilization", "How much of your available credit you are using. Keeping it low generally helps your score."],
  ["Diversification", "Spreading money across different investments so one bad result does not sink your whole portfolio."],
  ["Down Payment", "The cash you pay upfront when buying something on finance, like a home or car. The rest is borrowed."],
  ["EMI", "Equated Monthly Installment. The fixed amount you repay on a loan each month."],
  ["Emergency Fund", "Money set aside for surprises like a job loss or repair, usually three to six months of expenses."],
  ["Inflation", "The gradual rise in prices over time, which slowly reduces what your money can buy."],
  ["Liability", "Money you owe, such as a loan, credit card balance or mortgage."],
  ["Liquidity", "How quickly you can turn something into cash without losing much value."],
  ["Net Worth", "What you own minus what you owe. A simple snapshot of your financial health."],
  ["Principal", "The original amount you borrow or invest, before any interest is added."],
  ["ROI", "Return on Investment. The profit or loss from an investment compared with what you put in."],
  ["SIP", "Systematic Investment Plan. Investing a fixed amount on a regular schedule instead of all at once."],
  ["Term", "The length of a loan or investment, for example a 30 year mortgage or a 5 year deposit."],
  ["Yield", "The income an investment pays out each year, shown as a percentage of its value."],
];

export default function GlossaryPage() {
  return (
    <StaticPage
      title="Financial Glossary"
      wide
      intro="The money terms you will meet across our calculators and guides, explained without the jargon."
    >
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TERMS.map(([term, def]) => (
          <div key={term} className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm">
            <dt className="text-base font-bold text-zinc-900">
              {term}
              <span className="ml-2 inline-block h-1 w-6 rounded-full bg-orange-400 align-middle" />
            </dt>
            <dd className="mt-2 text-sm leading-6 text-zinc-600">{def}</dd>
          </div>
        ))}
      </dl>
    </StaticPage>
  );
}
