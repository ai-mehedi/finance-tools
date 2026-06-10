import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanComparisonCalculator from "./LoanComparisonCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-comparison-calculator";
const SELF_SLUG = "loan-comparison-calculator";

const DESC =
  "Free loan comparison calculator. Put two loan offers side by side to compare monthly payments, total interest and true cost including upfront fees, with a balance payoff chart.";

export const metadata: Metadata = {
  title: "Loan Comparison Calculator",
  description: DESC,
  keywords: [
    "loan comparison calculator",
    "compare loans",
    "loan offer comparison",
    "best loan rate",
    "total loan cost calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Loan Comparison Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Loan Comparison Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "Why is the cheaper monthly payment not always the better loan?",
    answer:
      "A lower monthly payment often comes from a longer term, which spreads the same debt over more months. You pay less each month but make more payments, so total interest can be far higher. This tool compares true lifetime cost, not just the monthly figure, so a smaller payment does not fool you.",
  },
  {
    question: "How do upfront fees change the comparison?",
    answer:
      "Origination fees, points and processing charges are real money you pay to get the loan. The calculator adds them to the total of your payments to give a total cost figure. A loan with a slightly higher rate but no fees can sometimes win once fees are included.",
  },
  {
    question: "What is the formula behind each payment?",
    answer:
      "Each loan uses the standard amortizing payment formula. The monthly payment equals the principal times the monthly rate times one plus the monthly rate raised to the number of months, divided by one plus the monthly rate raised to the number of months minus one. When the rate is zero the payment is simply the principal divided by the number of months.",
  },
  {
    question: "Does this account for the time value of money?",
    answer:
      "The comparison sums the actual dollars paid over each loan, which is the most direct measure of cost. It does not discount future payments back to today. If you want to weigh paying more now against paying more later, treat the total cost as a starting point and consider what else you could do with the money.",
  },
];

export default async function LoanComparisonCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Comparison Calculator",
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
      title="Loan Comparison Calculator"
      intro="Have two loan offers and not sure which is better? Enter the amount, rate, term and fees for each, then press Compare to see monthly payments, total interest and the true lifetime cost side by side."
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
            { name: "Loan Comparison Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Comparison Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanComparisonCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan comparison calculator works</H2>
            <P>
              The tool amortizes each loan separately. It turns the annual rate into a monthly rate,
              works out the fixed payment that clears the balance over the chosen term, and tallies
              every dollar of interest along the way. It then adds any upfront fees so the final
              number reflects what each offer truly costs you from start to finish.
            </P>
            <P>
              The chart traces how each balance falls month by month. A loan with a higher rate or a
              longer term pays down more slowly, and you can see the gap between the two payoff lines
              widen or close depending on which offer is stronger.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you borrow $25,000. Offer A charges 6.5% over 5 years with $300 in fees, while
              Offer B charges 5.9% over 6 years with $900 in fees. Offer B has the lower payment and
              lower rate, but the extra year of interest plus the larger fee can push its total cost
              above Offer A. The verdict box tells you which one actually wins once everything is
              counted.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Always compare loans on the same amount so the payments are apples to apples, and watch
              for prepayment penalties that are not captured by rate alone. The annual percentage
              rate is a useful single number that bundles many fees together; the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loans-interest-rate-and-its-apr-en-733/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB explains rate versus APR</a>.
              Once you have picked a loan, see the full breakdown with our{" "}
              <Link href="/calculators/loan-interest-calculator" className="text-orange-600 underline">loan interest calculator</Link>.
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
