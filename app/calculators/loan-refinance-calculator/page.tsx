import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanRefinanceCalculator from "./LoanRefinanceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-refinance-calculator";
const SELF_SLUG = "loan-refinance-calculator";

const DESC =
  "Free loan refinance calculator. Compare your current loan with a new rate and term, factor in closing costs, and find your monthly savings, break-even point and lifetime cost difference.";

export const metadata: Metadata = {
  title: "Loan Refinance Calculator",
  description: DESC,
  keywords: [
    "loan refinance calculator",
    "refinance break-even calculator",
    "mortgage refinance savings",
    "should I refinance",
    "refinance closing costs",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Loan Refinance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Loan Refinance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the break-even point on a refinance?",
    answer:
      "It is the moment when the money you save from the lower payment finally catches up with the closing costs you paid up front. Before that point you are still in the hole; after it every month is a net gain. If you expect to keep the loan past the break-even point, refinancing tends to pay off.",
  },
  {
    question: "Why does the calculator add closing costs to the refinance path?",
    answer:
      "Refinancing is not free. Application fees, appraisal, title and lender charges are real money spent on day one. The tool starts the refinance cost curve at the closing-cost figure so the comparison is honest, then shows how long the lower payments take to win that money back.",
  },
  {
    question: "Can a lower rate still cost me more overall?",
    answer:
      "Yes, if you stretch the term. Dropping the rate but resetting a loan with a few years left back to a fresh long term can lower the monthly payment while raising total interest, because you pay for many more years. The lifetime savings figure flags this by comparing total cost, not just the monthly amount.",
  },
  {
    question: "Does this work for mortgages, auto loans and personal loans?",
    answer:
      "Yes. The math is the same amortization for any fixed-rate installment loan. Enter the remaining balance, your current rate and years left, then the new rate, term and closing costs. Just make sure the closing-cost figure reflects the fees for that specific loan type.",
  },
];

export default async function LoanRefinanceCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getTools({ type: "calculator", limit: 7 }),
    getArticles({ limit: 4 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "🔁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Refinance Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Loan Refinance Calculator"
      intro="Decide whether refinancing is worth it. Enter your current loan, the new rate and term, and the closing costs, then press Calculate to see your monthly savings, break-even point and lifetime difference."
      active="Calculators"
      icon={icon}
      wide
    >
      <JsonLd
        data={[
          webApp,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/calculators" },
            { name: "Loan Refinance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Refinance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanRefinanceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan refinance calculator works</H2>
            <P>
              The tool builds two amortization schedules from the same outstanding balance. The first
              keeps your current rate and the years you have left. The second uses the new rate and new
              term you are considering. It works out the monthly payment for each, then adds up every
              payment over the life of both loans so you can compare not just the monthly figure but the
              full cost.
            </P>
            <P>
              The chart plots cumulative spending. The refinance line starts above zero because you have
              already paid closing costs, while the current-loan line starts at zero. Where the orange
              refinance line dips below the grey current line is your break-even point, marked with a
              vertical guide.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you owe 220,000 dollars at 7.2 percent with 25 years remaining, and a lender offers
              5.8 percent over a fresh 25 years with 4,500 dollars in closing costs. The lower rate trims
              the monthly payment by a few hundred dollars, you recover the closing costs within a couple
              of years, and you save a large sum in interest over the life of the loan, provided you keep
              the loan well past break-even.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Match the terms when you can so a lower rate is not hidden by a longer payoff, and weigh how
              long you plan to keep the loan against the break-even point. For a checklist of refinance
              questions to ask a lender, see{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB</a>.
              To then model paying the new loan off faster, head to our{" "}
              <Link href="/calculators/loan-payoff-calculator" className="text-orange-600 underline">loan payoff calculator</Link>.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
                  </Link>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
