import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StockProfitCalculator from "./StockProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/stock-profit-calculator";
const SELF_SLUG = "stock-profit-calculator";

const DESC =
  "Free stock profit calculator. Work out the net profit or loss on a share trade after buy and sell commissions, your return on cost, and the break-even price you need to sell at.";

const baseMetadata: Metadata = {
  title: "Stock Profit Calculator",
  description: DESC,
  keywords: [
    "stock profit calculator",
    "share profit calculator",
    "trade profit and loss",
    "break-even stock price",
    "stock gain calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Stock Profit Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Stock Profit Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do I calculate profit on a stock?",
    answer:
      "Take the price you sold each share for minus the price you bought it for, multiply by the number of shares, then subtract any buy and sell commissions. The result is your net profit. As a formula it is sell price minus buy price, times shares, minus total fees.",
  },
  {
    question: "What is the break-even price?",
    answer:
      "The break-even price is the sell price per share at which your net profit is exactly zero. It is your total cost including the buy commission, plus the sell commission you will pay, divided by the number of shares. Sell above it and you make money, sell below it and you take a loss.",
  },
  {
    question: "Does this include taxes on my gain?",
    answer:
      "No. This calculator shows your pre-tax trading profit after commissions only. Capital gains tax depends on how long you held the shares and your income, so your take-home amount will usually be lower. Treat the net profit here as the figure before any tax is applied.",
  },
  {
    question: "What does return on cost mean here?",
    answer:
      "Return on cost is your net profit divided by the total amount you put in, expressed as a percent. It tells you how hard your money worked on this trade regardless of the share count, which makes it easy to compare one position against another.",
  },
];

export default async function StockProfitCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stock Profit Calculator",
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
      title="Stock Profit Calculator"
      intro="Enter what you paid, what you sold for, and your commissions to see the net profit or loss on a trade, your return on cost, and the break-even price you needed to clear."
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
            { name: "Stock Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Stock Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the stock profit calculator works</H2>
            <P>
              The tool builds your trade from both sides. On the buy side it adds the shares times
              the purchase price to your buy commission to get the total cost. On the sell side it
              takes the shares times the sale price and subtracts the sell commission to get your
              net proceeds. The difference between proceeds and cost is your net profit or loss.
            </P>
            <P>
              The chart puts cost and proceeds side by side so the gap between the two bars is your
              profit at a glance. When proceeds fall short of cost, that gap is the loss you took
              once fees are counted.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy 100 shares at $45 with a $5 commission, so your cost is $4,505. Sell them at $62
              with another $5 commission, leaving proceeds of $6,195. Your net profit is $1,690,
              which is a return of about 37.5% on the $4,505 you put at risk.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The break-even figure is the number to watch on thin trades: small price moves can be
              wiped out entirely by commissions. For a primer on how brokerage costs eat into
              returns, see{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              If you bought in several lots, find your blended cost first with our{" "}
              <Link href="/calculators/stock-average-calculator" className="text-orange-600 underline">stock average calculator</Link>.
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
