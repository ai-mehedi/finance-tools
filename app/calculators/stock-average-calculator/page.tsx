import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StockAverageCalculator from "./StockAverageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/stock-average-calculator";
const SELF_SLUG = "stock-average-calculator";

const DESC =
  "Free stock average calculator. Combine several buy lots into one weighted-average cost per share, see your total shares and total invested, and chart how each purchase moves your cost basis.";

const baseMetadata: Metadata = {
  title: "Stock Average Calculator",
  description: DESC,
  keywords: [
    "stock average calculator",
    "average cost per share",
    "averaging down calculator",
    "share cost basis calculator",
    "weighted average price",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Stock Average Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Stock Average Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the average stock price calculated?",
    answer:
      "It is a weighted average, not a simple average of the prices. Add up the money spent on every lot, which is shares times price for each buy, then divide that total cost by the total number of shares. Lots with more shares pull the average toward their price.",
  },
  {
    question: "What does averaging down mean?",
    answer:
      "Averaging down is buying more of a stock after the price has fallen so your blended cost per share drops. It lowers the price the stock needs to reach for you to break even, but it also puts more money into a position that has been losing value, so it raises your risk if the decline continues.",
  },
  {
    question: "Should I include trading fees in my average cost?",
    answer:
      "If you want your true break-even price, yes. This tool averages the share prices you enter, so to fold in commissions you can spread each fee across the shares in that lot and add it to the price before entering it. With most brokers now charging zero commission on stocks, the difference is often negligible.",
  },
  {
    question: "Does the average change when I sell some shares?",
    answer:
      "Under the average-cost method your per-share cost basis stays the same when you sell part of a position. Selling reduces the number of shares you hold but does not change what each remaining share originally cost you on average. Some tax methods such as specific-lot identification work differently.",
  },
];

export default async function StockAverageCalculatorPage() {
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
    name: "Stock Average Calculator",
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
      title="Stock Average Calculator"
      intro="Bought the same stock at several prices? Enter each lot and this tool blends them into a single weighted-average cost per share, with a chart of how your cost basis shifts after every purchase."
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
            { name: "Stock Average Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Stock Average Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockAverageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the stock average calculator works</H2>
            <P>
              The tool tracks two running totals as it reads your lots: the number of shares you own
              and the total dollars you have spent. Your average cost per share is simply the total
              dollars divided by the total shares, so a large lot bought cheaply moves the blended
              price far more than a small lot bought expensively.
            </P>
            <P>
              The bar chart shows the running average after each purchase. Watching that line drift
              down as you add cheaper lots is exactly what averaging down looks like, while adding
              lots above your current cost pushes it back up.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you buy 100 shares at $50, then 150 at $40, then 200 at $30. You have spent
              $5,000 plus $6,000 plus $6,000, which is $17,000 for 450 shares. Dividing gives an
              average cost of about $37.78 per share, well below your first purchase price even
              though you never sold a thing.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A lower average cost feels good, but it does not change the quality of the company you
              own. Decide whether you would buy the stock fresh at today's price before adding to a
              losing position. For the official view on cost basis and how it affects taxes, see the{" "}
              <a href="https://www.irs.gov/taxtopics/tc409" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS guide to capital gains and losses</a>.
              Once you know your average, estimate your gain with our{" "}
              <Link href="/calculators/stock-profit-calculator" className="text-orange-600 underline">stock profit calculator</Link>.
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
