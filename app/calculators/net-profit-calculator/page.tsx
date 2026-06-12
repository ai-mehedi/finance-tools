import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import NetProfitCalculator from "./NetProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/net-profit-calculator";
const SELF_SLUG = "net-profit-calculator";

const DESC =
  "Free net profit calculator. Work down the income statement from revenue through cost of goods, operating expenses, interest and tax to find net profit, gross, operating and net margins, with a waterfall chart.";

const baseMetadata: Metadata = {
  title: "Net Profit Calculator",
  description: DESC,
  keywords: [
    "net profit calculator",
    "net income calculator",
    "profit margin calculator",
    "income statement calculator",
    "bottom line calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Net Profit Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Net Profit Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is net profit?",
    answer:
      "Net profit is the bottom line of the income statement, the money left after every cost has been paid. It takes revenue and subtracts cost of goods sold, operating expenses, interest and tax, so it shows what the business truly keeps from a period of trading.",
  },
  {
    question: "How is net profit different from gross profit?",
    answer:
      "Gross profit is revenue minus only the direct cost of making the goods or services. Net profit goes much further by also removing operating overheads, interest on debt and taxes, so it is always lower than gross profit and reflects the full cost of running the business.",
  },
  {
    question: "What is a good net profit margin?",
    answer:
      "It varies widely by industry. Grocery and retail often run on low single-digit margins, while software and consultancy can exceed twenty percent. The most useful comparison is against your own past results and direct competitors rather than a universal benchmark.",
  },
  {
    question: "How is tax applied in this calculator?",
    answer:
      "Tax is charged only on a positive pre-tax profit, found after subtracting interest from operating profit. If the business makes a loss before tax, the calculator applies no tax, so the net figure stays equal to the pre-tax loss for that period.",
  },
];

export default async function NetProfitCalculatorPage() {
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
    name: "Net Profit Calculator",
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
      title="Net Profit Calculator"
      intro="Find your true bottom line. Enter revenue and each layer of cost, then press Calculate to see net profit alongside your gross, operating and net margins."
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
            { name: "Net Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Net Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the net profit calculator works</H2>
            <P>
              The calculator follows the same path an income statement does. It starts with revenue,
              removes the cost of goods sold to reach gross profit, takes out operating expenses to reach
              operating profit, subtracts interest to reach pre-tax profit, and finally applies tax to
              land on net profit. Each step also shows what share of revenue survives.
            </P>
            <P>
              The waterfall chart makes the erosion visible. The tallest bar is revenue and each
              following bar is shorter as another layer of cost is removed, so you can see exactly where
              the money goes and which costs squeeze your margin the most.
            </P>

            <H2>A quick example</H2>
            <P>
              Take 500,000 dollars of revenue, 200,000 in cost of goods, 150,000 in operating expenses
              and 20,000 of interest. That leaves 130,000 of pre-tax profit; a 21 percent tax of about
              27,300 brings net profit to roughly 102,700 dollars, a net margin near 21 percent of
              revenue. Trimming operating expenses flows straight through to that bottom line.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Net profit is an accounting figure and can differ from the cash in your bank because of
              timing, depreciation and credit terms. For how the income statement fits together, see{" "}
              <a href="https://www.investopedia.com/terms/i/incomestatement.asp" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investopedia on income statements</a>.
              To judge a one-off project on cash terms instead, try our{" "}
              <Link href="/calculators/npv-calculator" className="text-orange-600 underline">NPV calculator</Link>.
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
