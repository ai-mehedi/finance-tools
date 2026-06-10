import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BridgeLoanCalculator from "./BridgeLoanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/bridge-loan-calculator";
const SELF_SLUG = "bridge-loan-calculator";

const DESC =
  "Free bridge loan calculator. Estimate the monthly interest, total interest, fees and payoff on a short-term interest-only bridge loan between two property deals.";

export const metadata: Metadata = {
  title: "Bridge Loan Calculator",
  description: DESC,
  keywords: [
    "bridge loan calculator",
    "bridging loan calculator",
    "bridge financing calculator",
    "short term loan calculator",
    "interest only bridge loan",
    "bridge loan interest",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Bridge Loan Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Bridge Loan Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a bridge loan?",
    answer:
      "A bridge loan is short-term financing that covers the gap between two transactions, most often buying a new home before selling your current one. It is usually interest-only and is repaid in full once the longer-term financing or sale closes.",
  },
  {
    question: "How is bridge loan interest calculated?",
    answer:
      "Most bridge loans are interest-only, so the monthly payment is the loan amount times the monthly interest rate, with no principal paid down. The full principal is repaid as a lump sum at the end of the term, which is why monthly payments stay flat.",
  },
  {
    question: "Why are bridge loans more expensive?",
    answer:
      "Because they are short-term and higher risk for the lender, bridge loans carry higher interest rates than standard mortgages and often add an origination fee. The total cost is small in dollars only because the term is brief, so paying it off quickly matters.",
  },
  {
    question: "What happens at the end of the term?",
    answer:
      "You repay the entire principal in one payment, usually from the sale of your old property or by refinancing into a permanent loan. If neither happens in time, you may need an extension, which can add cost, so plan the exit before you borrow.",
  },
];

export default async function BridgeLoanCalculatorPage() {
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
    "🌉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bridge Loan Calculator",
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
      title="Bridge Loan Calculator"
      intro="Estimate the monthly interest, total interest, fees and final payoff on a short-term bridge loan. Enter the amount, rate and term, then press Calculate."
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
            { name: "Bridge Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Bridge Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BridgeLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the bridge loan calculator works</H2>
            <P>
              A bridge loan is designed to be short and simple. Because it is usually interest-only,
              your monthly payment is just the loan balance multiplied by the monthly rate, and the
              full principal comes due at the end of the term. This calculator adds any origination
              fee so you can see the real cost of bridging the gap.
            </P>
            <P>
              The key figures are the monthly interest you carry while the loan is open, the total
              interest over the term and the lump sum payoff. Together they tell you how much the
              convenience of bridging actually costs.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $250,000 at 9.5% for 12 months with a 2% fee. The monthly interest is about
              $1,979, total interest over the year is roughly $23,750, and the fee adds $5,000. The
              cost to borrow is near $28,750, with the $250,000 principal due at the end.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Bridge loans assume your old property sells or your permanent financing closes on time.
              Have a clear exit plan, and budget for an extension just in case. For guidance on home
              financing, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. Compare options with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
