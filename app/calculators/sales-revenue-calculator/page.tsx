import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalesRevenueCalculator from "./SalesRevenueCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/sales-revenue-calculator";
const SELF_SLUG = "sales-revenue-calculator";

const DESC =
  "Free sales revenue calculator. Work out gross revenue, discounts, returns, net revenue, cost of goods and gross profit from units sold and price per unit, with a chart of revenue versus volume.";

const baseMetadata: Metadata = {
  title: "Sales Revenue Calculator",
  description: DESC,
  keywords: [
    "sales revenue calculator",
    "net revenue calculator",
    "gross profit calculator",
    "revenue and margin calculator",
    "units sold revenue",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Sales Revenue Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Sales Revenue Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the difference between gross and net revenue?",
    answer:
      "Gross revenue is units sold times price per unit, before any deductions. Net revenue is what remains after you subtract discounts given to customers and the value of goods that were returned or refunded. Net revenue is the more honest top line because it reflects money you actually keep.",
  },
  {
    question: "How is gross profit calculated here?",
    answer:
      "Gross profit is net revenue minus the cost of the goods you actually sold. The calculator multiplies your per unit cost only by the units that were kept, not the ones returned, then subtracts that total cost from net revenue. Dividing gross profit by net revenue gives the gross margin percentage.",
  },
  {
    question: "Why do returns reduce both revenue and cost?",
    answer:
      "A returned unit means you give back the sale and usually do not incur the full cost of a kept sale, so the model removes returned units from both the revenue and the cost of goods. This keeps the margin realistic rather than punishing you twice for the same returned item.",
  },
  {
    question: "Does this figure include operating expenses or tax?",
    answer:
      "No. This is a gross profit view that stops at the cost of goods sold. It does not subtract marketing, salaries, rent, shipping or income tax. To reach operating or net profit you would deduct those expenses separately from the gross profit shown here.",
  },
];

export default async function SalesRevenueCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sales Revenue Calculator",
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
      title="Sales Revenue Calculator"
      intro="See what your sales really bring in. Enter units sold, price, unit cost and your discount and returns rates, then press Calculate to reveal net revenue and gross profit."
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
            { name: "Sales Revenue Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Sales Revenue Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesRevenueCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the sales revenue calculator works</H2>
            <P>
              The tool starts with gross revenue, which is simply units sold multiplied by your price
              per unit. It then peels away the two things that erode a top line: the average discount
              you grant customers and the share of sales that come back as returns. What is left is
              net revenue, the cash you can actually count on.
            </P>
            <P>
              To turn revenue into profit, it multiplies your per unit cost by the units you kept and
              subtracts that from net revenue. The chart plots both net revenue and gross profit
              across a range of volumes, so you can see how scaling units changes the gap between the
              two lines.
            </P>

            <H2>A quick example</H2>
            <P>
              Sell 1,200 units at 49 dollars each and gross revenue is 58,800 dollars. Apply a 10
              percent average discount and a 4 percent returns rate and net revenue lands near 50,800
              dollars. With a unit cost of 18 dollars, the cost of the kept units is about 20,700
              dollars, leaving roughly 30,100 dollars of gross profit, a margin near 59 percent.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Discount and returns rates are averages, so they smooth over promotions and seasonal
              swings; revisit them as your real data lands. For a primer on reading an income
              statement, the{" "}
              <a href="https://www.sec.gov/about/reports-publications/investor-publications/beginners-guide-financial-statements" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC beginners guide to financial statements</a>{" "}
              is a clear, neutral source. To price a single product before modelling volume, try our{" "}
              <Link href="/calculators/profit-margin-calculator" className="text-orange-600 underline">profit margin calculator</Link>.
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
export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
