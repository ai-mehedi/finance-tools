import Link from "next/link";
import {
  Banknote,
  Home,
  TrendingUp,
  Landmark,
  PiggyBank,
  Receipt,
  PieChart,
  Wallet,
  CreditCard,
  ShieldCheck,
  Briefcase,
  Bitcoin,
  ArrowLeftRight,
  GraduationCap,
  TrendingDown,
  Car,
  Calculator,
  ChevronDown,
  ArrowRight,
  FileText,
  Check,
  type LucideIcon,
} from "lucide-react";
import JsonLd from "./JsonLd";
import { faqSchema } from "@/lib/seo";

type Cat = { _id: string; name: string; slug: string; count?: number; thumbnail?: string };

// Each category gets a crisp lucide icon + an editorial one-liner. The homepage
// was almost entirely interactive components with little indexable text.
const META: Record<string, { icon: LucideIcon; blurb: string }> = {
  "loans-debt": { icon: Banknote, blurb: "EMI, payoff and payment plans for personal, home and auto loans." },
  "mortgage-home": { icon: Home, blurb: "Affordability, refinance, overpayment and amortization for home buyers." },
  investing: { icon: TrendingUp, blurb: "Compound growth, SIP, dividends and portfolio return calculators." },
  retirement: { icon: Landmark, blurb: "401(k), Roth IRA, pension, FIRE and retirement-corpus planning." },
  "savings-deposits": { icon: PiggyBank, blurb: "Savings goals, CDs, fixed and recurring deposits, and interest growth." },
  taxes: { icon: Receipt, blurb: "Income tax, capital gains, paycheck and sales-tax estimators." },
  budgeting: { icon: PieChart, blurb: "Monthly budgets, 50/30/20, cash flow, net worth and expenses." },
  "salary-income": { icon: Wallet, blurb: "Take-home pay, hourly-to-salary, overtime and raise calculators." },
  "credit-cards": { icon: CreditCard, blurb: "Payoff plans, interest, minimum payments and credit utilisation." },
  insurance: { icon: ShieldCheck, blurb: "Life, health, disability and coverage-needs calculators." },
  "business-freelance": { icon: Briefcase, blurb: "Margins, break-even, freelance rates and business finance." },
  crypto: { icon: Bitcoin, blurb: "Profit, DCA, staking, gas fees and portfolio calculators." },
  "currency-forex": { icon: ArrowLeftRight, blurb: "Currency conversion, forex profit, pip and margin tools." },
  "education-student": { icon: GraduationCap, blurb: "Student loans, college costs and education-savings planning." },
  "inflation-economy": { icon: TrendingDown, blurb: "Inflation, purchasing power and time-value-of-money tools." },
  "auto-vehicle": { icon: Car, blurb: "Car loans, leasing, fuel cost and total ownership cost." },
  "everyday-finance": { icon: Calculator, blurb: "Tips, discounts, percentages and quick everyday money maths." },
};

const CHECKS = [
  "Transparent formula and assumptions on every page",
  "Content reviewed and stamped with a last-updated date",
  "Figures checked against official US and UK sources",
  "100% free, with no sign-up and no data collected",
];

const FAQ = [
  {
    question: "Are all the calculators free to use?",
    answer:
      "Yes. Every calculator and guide on TopicDrill is completely free, with no sign-up, account or payment required. You can use any tool as many times as you like.",
  },
  {
    question: "Do I have to share any personal or financial data?",
    answer:
      "No. The calculators run in your browser and we do not ask you to register or hand over personal details to get a result. You stay in control of your numbers.",
  },
  {
    question: "How accurate are the results?",
    answer:
      "Each tool uses the standard financial formula for its topic, and we show the method and assumptions on the page. Results are reliable estimates for planning, but they are not a quote or an offer from any lender or provider.",
  },
  {
    question: "Which countries do the calculators support?",
    answer:
      "Most tools work for any currency and are tuned for United States and United Kingdom rules where tax or contribution limits apply. Each page states the market and figures it uses so you know what applies to you.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Our calculators and guides are for general information and education only. For decisions that affect your money, speak to a qualified professional who can consider your full situation.",
  },
];

export default function HomeContent({ categories }: { categories: Cat[] }) {
  return (
    <section className="border-t border-zinc-100 bg-white">
      <JsonLd data={faqSchema(FAQ)} />
      <div className="mx-auto container px-6 py-16">
        {/* Intro / value proposition */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Why TopicDrill</span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Free financial calculators for every money decision
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600">
            TopicDrill brings more than 200 free financial calculators together in one place, so you
            can run the numbers on a loan, a mortgage, a paycheck, an investment or a retirement plan
            without juggling spreadsheets or signing up for anything. Pick a tool, enter your figures,
            and get a clear answer in seconds, along with a short explanation of how the result is
            worked out.
          </p>
          <p className="mt-3 text-[15px] leading-7 text-zinc-600">
            Whether you are paying down debt faster, working out how much house you can afford,
            comparing two loan offers, or planning decades ahead for retirement, there is a focused
            calculator for the job. Every tool shows its formula and assumptions, so you can trust the
            output and understand what is driving it.
          </p>
        </div>

        {/* Category hub with icons + counts + descriptions */}
        <div className="mt-14 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Browse calculators by category
          </h2>
          <Link
            href="/categories"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 sm:inline-flex"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const m = META[c.slug];
            const Icon = m?.icon ?? Calculator;
            return (
              <Link
                key={c._id}
                href={`/categories/${c.slug}`}
                className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <Icon className="size-5" strokeWidth={2} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-[15px] font-bold text-zinc-900 group-hover:text-orange-600">{c.name}</h3>
                    {typeof c.count === "number" && c.count > 0 && (
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 group-hover:bg-orange-100 group-hover:text-orange-600">
                        {c.count}
                      </span>
                    )}
                  </div>
                  {m?.blurb && <p className="mt-1 text-[13px] leading-6 text-zinc-500">{m.blurb}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* About / trust — two columns: branded visual + content with checklist */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          {/* Left: branded visual panel (no external asset needed) */}
          <div className="relative order-last overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 p-8 sm:p-10 lg:order-first">
            <div className="mx-auto flex max-w-sm flex-col gap-4">
              <div className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                    <ShieldCheck className="size-5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Trusted method</p>
                    <p className="text-xs text-zinc-500">Standard, transparent formulas</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                  <Calculator className="size-5 text-orange-600" strokeWidth={2} />
                  <p className="mt-2 text-sm font-bold text-zinc-900">Formula shown</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <Check className="size-3.5" strokeWidth={3} /> Verified
                  </p>
                </div>
                <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                  <FileText className="size-5 text-orange-600" strokeWidth={2} />
                  <p className="mt-2 text-sm font-bold text-zinc-900">Reviewed</p>
                  <p className="mt-0.5 text-xs text-zinc-500">June 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-zinc-900 p-5 text-center text-white">
                <div>
                  <p className="text-lg font-extrabold">200+</p>
                  <p className="text-[11px] text-zinc-400">Calculators</p>
                </div>
                <div className="border-x border-zinc-700">
                  <p className="text-lg font-extrabold">17</p>
                  <p className="text-[11px] text-zinc-400">Categories</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold">Free</p>
                  <p className="text-[11px] text-zinc-400">No sign-up</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: about + checklist */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-orange-500">About TopicDrill</span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Numbers you can act on, from a site that shows its working
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-zinc-600">
              Money decisions are serious, so we treat them that way. Every calculator runs on the
              standard, transparent formula for its topic, and each page documents the method, the
              assumptions, and the date it was last reviewed. Where a number depends on tax bands or
              contribution limits, we check it against the official source and link to it.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-6 text-zinc-700">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/editorial-policy"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
              >
                How we review content <ArrowRight className="size-4" />
              </Link>
              <Link href="/about" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                About us
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.question} className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-colors open:border-orange-200 open:bg-orange-50/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-open:bg-orange-500 group-open:text-white">
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-7 text-zinc-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
