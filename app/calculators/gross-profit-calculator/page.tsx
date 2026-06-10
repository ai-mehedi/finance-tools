import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GrossProfitCalculator from "./GrossProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/gross-profit-calculator";
const SELF_SLUG = "gross-profit-calculator";

const DESC =
  "Free gross profit calculator. Enter revenue and cost of goods sold to find gross profit, gross margin and markup, with optional per-unit figures and a clear revenue versus cost chart.";

export const metadata: Metadata = {
  title: "Gross Profit Calculator",
  description: DESC,
  keywords: [
    "gross profit calculator",
    "gross margin calculator",
    "cost of goods sold",
    "markup calculator",
    "revenue minus cogs",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Gross Profit Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Gross Profit Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is gross profit?",
    answer:
      "Gross profit is the money left from sales after subtracting the direct cost of producing or buying what you sold. It is revenue minus cost of goods sold, and it shows how much each sale contributes before overhead, marketing, taxes and other operating expenses are paid.",
  },
  {
    question: "How do I calculate gross margin from gross profit?",
    answer:
      "Divide gross profit by revenue and multiply by 100. If a business earns 42,000 dollars of gross profit on 120,000 dollars of revenue, the gross margin is 42,000 divided by 120,000 times 100, which is 35 percent.",
  },
  {
    question: "What is the difference between margin and markup?",
    answer:
      "Margin measures profit as a share of the selling price, while markup measures the same profit as a share of the cost. A product that costs 78 dollars and sells for 120 dollars has a 35 percent margin but a roughly 54 percent markup, so the two numbers are never the same.",
  },
  {
    question: "Does gross profit include operating expenses?",
    answer:
      "No. Gross profit only subtracts the direct cost of goods sold, such as materials, freight and direct labor. Rent, salaries, advertising and interest come out later to reach operating profit and then net profit, so gross profit is always the larger figure.",
  },
];

export default async function GrossProfitCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gross Profit Calculator",
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
      title="Gross Profit Calculator"
      intro="See how much your sales earn before overhead. Enter revenue and cost of goods sold, add units if you like, then press Calculate to get gross profit, margin and markup."
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
            { name: "Gross Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Gross Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GrossProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the gross profit calculator works</H2>
            <P>
              The tool starts with your total revenue and subtracts the cost of goods sold, the direct
              cost of making or buying the products you sold. What remains is gross profit, the cash
              that is available to cover everything else the business spends money on.
            </P>
            <P>
              From those two numbers it also derives two ratios that matter when you compare products
              or periods. Gross margin expresses profit as a percentage of revenue, and markup
              expresses the same profit as a percentage of cost. Add a units figure and you also get
              the price, cost and profit baked into a single sale.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a shop sells 4,000 items for 120,000 dollars and the goods cost 78,000 dollars to
              produce. Gross profit is 42,000 dollars, the gross margin is 35 percent, and the markup on
              cost is about 54 percent. On a per-unit basis each item sells for 30 dollars, costs 19.50
              dollars and leaves 10.50 dollars of gross profit.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Gross profit ignores fixed costs such as rent, salaries and advertising, so a healthy
              gross margin does not guarantee the business is profitable overall. For how the term fits
              into a full income statement, see this overview from{" "}
              <a href="https://www.investopedia.com/terms/g/grossprofit.asp" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investopedia</a>.
              To carry the figure all the way down to take-home profit, try our{" "}
              <Link href="/calculators/net-profit-margin-calculator" className="text-orange-600 underline">net profit margin calculator</Link>.
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
