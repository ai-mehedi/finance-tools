import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StockReturnCalculator from "./StockReturnCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/stock-return-calculator";
const SELF_SLUG = "stock-return-calculator";

const DESC =
  "Free stock return calculator. Measure total return from price gains plus dividends on a holding, then convert it to an annualized CAGR over your holding period, with a growth chart.";

const baseMetadata: Metadata = {
  title: "Stock Return Calculator",
  description: DESC,
  keywords: [
    "stock return calculator",
    "total return calculator",
    "annualized return CAGR",
    "dividend return calculator",
    "investment return calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Stock Return Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Stock Return Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is total return on a stock?",
    answer:
      "Total return is everything you earned from holding the stock, not just the price move. It adds the price appreciation, which is the rise in share price times the shares you hold, to the dividends you collected over the period. Both pieces together divided by what you paid give your total return percent.",
  },
  {
    question: "What is an annualized return or CAGR?",
    answer:
      "CAGR stands for compound annual growth rate. It is the single yearly rate that would have grown your starting amount into the ending value over the same number of years. It is found by taking the ending value divided by the starting value, raised to the power of one divided by the years, then subtracting one.",
  },
  {
    question: "Why is annualized return lower than total return?",
    answer:
      "Total return is the whole gain across the entire period, while annualized return spreads that gain evenly across each year and accounts for compounding. A 90 percent total return over five years is impressive, but as a yearly rate it works out to roughly 14 percent a year.",
  },
  {
    question: "Does this calculator assume dividends are reinvested?",
    answer:
      "It folds the dividend cash you received into the ending value before computing the annualized rate, which is close to treating them as reinvested at the position's own growth rate. If you actually spent the dividends, your realized price-only CAGR would be a little lower than the figure shown.",
  },
];

export default async function StockReturnCalculatorPage() {
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
    name: "Stock Return Calculator",
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
      title="Stock Return Calculator"
      intro="See the full picture of a holding's performance. Combine price appreciation and dividends into a total return, then convert it to an annualized rate so you can compare it across time and against other investments."
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
            { name: "Stock Return Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Stock Return Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockReturnCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the stock return calculator works</H2>
            <P>
              The tool splits your gain into two sources. Price appreciation is the change in share
              price times the number of shares, and dividend income is the total dividend per share
              times your shares. Added together and divided by your original cost, they give your
              total return. The tool then annualizes that figure into a compound annual growth rate.
            </P>
            <P>
              The chart grows your starting cost at that annual rate across the holding period, so
              the curve shows how the position compounded year by year to reach its ending value
              rather than jumping straight from buy to sell.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy 100 shares at $40, a $4,000 cost, and sell five years later at $75 while collecting
              $4 per share in dividends along the way. Price appreciation is $3,500 and dividends add
              $400, for a total return of $3,900, or about 97.5 percent. As an annualized rate that
              is roughly 14.6 percent a year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Annualized return smooths over a bumpy ride, so two stocks with the same CAGR can feel
              very different to hold. For background on how total return is measured and why it beats
              looking at price alone, see{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/total-return" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov on total return</a>.
              To project where a steady annual return could take a balance, try our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
