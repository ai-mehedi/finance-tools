import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import InventoryTurnoverCalculator from "./InventoryTurnoverCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/inventory-turnover-calculator";
const SELF_SLUG = "inventory-turnover-calculator";

const DESC =
  "Free inventory turnover calculator. Measure how many times you sell and replace stock from cost of goods sold and average inventory, with days on hand and a monthly cycle chart.";

const baseMetadata: Metadata = {
  title: "Inventory Turnover Calculator",
  description: DESC,
  keywords: [
    "inventory turnover calculator",
    "inventory turnover ratio",
    "days inventory on hand",
    "stock turnover",
    "COGS to average inventory",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Inventory Turnover Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Inventory Turnover Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a good inventory turnover ratio?",
    answer:
      "It depends heavily on the industry. Grocery and fast fashion can turn stock dozens of times a year, while heavy machinery or jewellery may turn only a few. As a rough guide, a ratio between four and six suits many general retailers, but always compare against peers in your own sector.",
  },
  {
    question: "How do I find my average inventory?",
    answer:
      "Add the inventory value at the start of the period to the value at the end, then divide by two. Using an average smooths out seasonal spikes so a single busy month does not distort the ratio. For more precision you can average several monthly snapshots instead.",
  },
  {
    question: "Why use cost of goods sold instead of sales revenue?",
    answer:
      "Inventory on your balance sheet is recorded at cost, not at the price you sell it for. Dividing sales revenue by inventory mixes retail prices with cost figures and inflates the ratio. Cost of goods sold keeps both the top and bottom of the formula on the same cost basis.",
  },
  {
    question: "What does days inventory on hand tell me?",
    answer:
      "It converts the turnover ratio into the average number of days a unit sits in your warehouse before it sells. Take the days in the period and divide by the turnover ratio. Fewer days usually means leaner working capital, while a rising number can signal slow movers or overstocking.",
  },
];

export default async function InventoryTurnoverCalculatorPage() {
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
    "📦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Inventory Turnover Calculator",
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
      title="Inventory Turnover Calculator"
      intro="See how efficiently your stock moves. Enter your cost of goods sold and average inventory, then press Calculate to get the turnover ratio and the days each unit sits on the shelf."
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
            { name: "Inventory Turnover Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Inventory Turnover Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InventoryTurnoverCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the inventory turnover calculator works</H2>
            <P>
              The ratio comes from one simple division: cost of goods sold for the period divided by
              your average inventory at cost. The answer tells you how many complete times you sold
              through and refilled your shelves. A higher number means stock is moving briskly and
              less cash is tied up sitting in storage.
            </P>
            <P>
              The chart spreads that result evenly across twelve months so you can picture the pace
              of cycling. Each bar is the running total of turns by that month, climbing steadily to
              your full annual ratio by December.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose your cost of goods sold last year was 500,000 dollars and your average
              inventory was 80,000 dollars. Dividing gives a turnover of 6.25 times. Spread over 365
              days that works out to roughly 58 days inventory on hand, meaning a typical item sells
              about two months after it lands in your warehouse.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A very high ratio is not automatically better. Pushed too far it can mean you are
              constantly running out of stock and losing sales, so balance turnover against service
              levels. For the accounting definitions behind the figures, see the{" "}
              <a href="https://www.sec.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC</a>{" "}
              filings of public retailers. To see how slow stock ties up cash, pair this with our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>.
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
