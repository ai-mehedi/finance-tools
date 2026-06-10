import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgageAmortizationCalculator from "./MortgageAmortizationCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-amortization-calculator";
const SELF_SLUG = "mortgage-amortization-calculator";

const DESC =
  "Free mortgage amortization calculator. See your monthly payment, total interest and a year-by-year schedule of how principal and interest split, plus the savings from extra payments.";

export const metadata: Metadata = {
  title: "Mortgage Amortization Calculator",
  description: DESC,
  keywords: [
    "mortgage amortization calculator",
    "amortization schedule",
    "loan amortization",
    "mortgage payment breakdown",
    "extra payment calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mortgage Amortization Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mortgage Amortization Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is mortgage amortization?",
    answer:
      "Amortization is the process of paying off a loan with a level payment that stays the same each month. Early on most of that payment is interest because the balance is large, and over time more of it goes to principal. By the final payment the loan reaches zero.",
  },
  {
    question: "Why is so much of my early payment interest?",
    answer:
      "Interest is charged on the balance still owed, and the balance is highest at the start. With a 300,000 dollar loan at 6.5 percent, the first payment is roughly 1,625 dollars of interest and only a few hundred dollars of principal. As the balance shrinks the interest portion falls and the principal portion rises.",
  },
  {
    question: "How do extra payments change the schedule?",
    answer:
      "Any amount paid above the scheduled payment goes straight to principal, which lowers the balance faster and cuts the interest charged in every month that follows. Even a modest extra each month can shorten the loan by years and save a large amount of interest, which this tool shows when you enter an extra figure.",
  },
  {
    question: "Does this include taxes, insurance or PMI?",
    answer:
      "No. This calculator focuses on principal and interest only, so the schedule and totals reflect the loan itself. Property tax, homeowners insurance and mortgage insurance are real monthly costs but they do not amortize the loan, so they are handled separately in our affordability tool.",
  },
];

export default async function MortgageAmortizationCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Amortization Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    author: personSchema(EDITORIAL.author),
    ...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Mortgage Amortization Calculator"
      intro="Break down a fixed-rate mortgage payment by payment. Enter your loan, rate and term, add any extra principal, then press Calculate to see your payment, total interest and how the balance falls each year."
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
            { name: "Mortgage Amortization Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Amortization Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgageAmortizationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How amortization works</H2>
            <P>
              A fixed-rate mortgage uses a level payment, the same dollar amount every month, that is
              sized so the loan reaches exactly zero at the end of the term. Each payment first covers
              the interest due on the current balance, and whatever is left chips away at the principal.
            </P>
            <P>
              Because the balance starts high, early payments are mostly interest and barely dent what
              you owe. As the principal falls the interest charge falls with it, so the principal share
              of each payment grows steadily until the loan is gone. The chart traces that crossover.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a 300,000 dollar loan at 6.5 percent over 30 years. The monthly payment is about
              1,896 dollars and you pay roughly 382,000 dollars of interest across the full term. Add
              just 200 dollars of extra principal a month and the loan clears about five years early
              while cutting tens of thousands from that interest bill.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The schedule assumes a fixed rate and on-time payments, so an adjustable rate or a missed
              month would shift the numbers. For the official explainer on loan terms, see the{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/loan-options/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB loan options guide</a>.
              To check whether a price fits your budget first, try our{" "}
              <Link href="/calculators/mortgage-affordability-calculator" className="text-orange-600 underline">mortgage affordability calculator</Link>.
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
