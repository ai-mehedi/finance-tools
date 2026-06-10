import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CalcTrust from "../../components/CalcTrust";
import LoanPayoffCalculator from "./LoanPayoffCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-payoff-calculator";
const SELF_SLUG = "loan-payoff-calculator";
// Bump this when you materially update the page (content, formula, rates).
const UPDATED = "June 2026";

const DESC =
  "Free loan payoff calculator. See how fast you can clear a loan, how much interest you will pay, and how much an extra monthly payment shaves off your debt-free date.";

export const metadata: Metadata = {
  title: "Loan Payoff Calculator",
  description: DESC,
  keywords: [
    "loan payoff calculator",
    "debt payoff calculator",
    "extra payment calculator",
    "loan interest savings",
    "early loan payoff",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Loan Payoff Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Loan Payoff Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does paying extra each month speed up a loan payoff?",
    answer:
      "Every dollar above the scheduled payment goes straight to the principal instead of interest. A smaller principal means less interest accrues the next month, so the balance falls faster and faster. The effect compounds, which is why even a modest extra payment can cut years off the term.",
  },
  {
    question: "Why does the calculator need my monthly payment instead of the loan term?",
    answer:
      "This tool starts from where you are today, which is a balance and a payment you are already making. From those two numbers plus the rate it works out how many months remain, so you do not need to remember the original term or how long you have been paying.",
  },
  {
    question: "What happens if my payment is too small?",
    answer:
      "If the monthly payment is smaller than the interest that builds up each month, the balance grows instead of shrinking and the loan is never repaid. When that happens the calculator returns an error and asks you to raise the payment above the monthly interest charge.",
  },
  {
    question: "Is interest saved the same as money in my pocket?",
    answer:
      "It is money you no longer hand to the lender, so yes, it is a real saving. Just remember the extra payments are cash you commit now. If that money could earn more elsewhere or you carry higher-rate debt, weigh those options before locking it into this loan.",
  },
];

export default async function LoanPayoffCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getRelatedTools(SELF_SLUG, 7),
    getArticles({ limit: 3 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "🏁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Payoff Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    dateModified: "2026-06-01",
    author: personSchema(EDITORIAL.author),
    ...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Loan Payoff Calculator"
      intro="Find out when you will be debt-free. Enter your balance, rate and monthly payment, add any extra you can put toward it, then press Calculate to see your payoff date and interest saved."
      active="Calculators"
      icon={icon}
      updated={UPDATED}
      wide
    >
      <JsonLd
        data={[
          webApp,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/calculators" },
            { name: "Loan Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Payoff Calculator" />
      </div>

      <CalcTrust
        methodology={
          <>
            <p>
              We run a standard amortization: each month interest is charged on the remaining
              balance at your rate divided by 12, your payment is subtracted, and the smaller
              balance carries to the next month. We run it twice, once with your scheduled payment
              and once with the scheduled payment plus any extra, then compare the two payoff dates
              and total interest. A 100-year cap guards against payments too small to ever clear the
              loan.
            </p>
            <p>
              Assumptions: a fixed interest rate, payments applied entirely to this loan, and no
              fees or prepayment penalties. Figures are estimates for planning, not a loan offer.
              Method based on standard amortization as described by the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB</a>.
            </p>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanPayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan payoff calculator works</H2>
            <P>
              The tool walks your loan forward one month at a time. Each month it charges interest on
              the current balance, subtracts your payment, and rolls the smaller balance into the next
              month. It runs the same process twice, once with your minimum payment and once with the
              minimum plus any extra you add, so you can see both timelines side by side.
            </P>
            <P>
              The chart plots both balances. The solid orange line is your accelerated payoff and the
              dashed grey line is the minimum-only path. The gap between where the two lines hit zero
              is the time you save, and the shrinking area beneath the orange line is the interest you
              never have to pay.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you owe 25,000 dollars at 6.5 percent and pay 450 dollars a month. On the minimum
              alone the loan takes about six and a half years. Add 150 dollars a month and you clear it
              in roughly four and a half years while saving well over 1,500 dollars in interest. The
              extra is the same 150 dollars each month, but the earlier it lands the more principal it
              attacks.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Confirm your lender applies extra amounts to principal and does not just advance your due
              date, and check there is no prepayment penalty. For a plain-language overview of how loan
              interest is charged, see{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB</a>.
              If you want to model a single lump-sum prepayment instead of a steady extra amount, try our{" "}
              <Link href="/calculators/loan-prepayment-calculator" className="text-orange-600 underline">loan prepayment calculator</Link>.
            </P>

            <H2>Frequently asked questions</H2>
            <div className="mt-4 space-y-3">
              {FAQ.map((f) => (
                <details key={f.question} className="group rounded-xl border border-zinc-200 bg-white p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-[15px] leading-7 text-zinc-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {articles.length > 0 && (
            <div className="mt-12">
              <div className="mb-5 flex items-center justify-between">
                <H2>Related guides</H2>
                <Link href="/blog" className="shrink-0 text-sm font-semibold text-orange-600 hover:text-orange-700">View all →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <BlogCard key={a._id} article={a} size="sm" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        <aside className="space-y-6">
          {relatedTools.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-extrabold text-zinc-900">Related calculators</h2>
              <ul className="mt-3 space-y-1">
                {relatedTools.map((t) => (
                  <li key={t._id}>
                    <Link href={t.url || `/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-base">
                        {t.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-0.5" />
                        ) : ("🧮")}
                      </span>
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-orange-600">{t.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/calculators" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100">
                View all calculators
              </Link>
            </div>
          )}

          <AdSlot slot="8843302220" minHeight={600} className="lg:sticky lg:top-20" />

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
            <h2 className="text-lg font-extrabold leading-snug text-zinc-900">Explore more tools</h2>
            <p className="mt-2 text-sm text-zinc-600">200+ free calculators in one place.</p>
            <Link href="/tools" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600">Browse tools</Link>
          </div>
        </aside>
      </div>
    </StaticPage>
  );
}
