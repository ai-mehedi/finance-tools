import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BrokerageCalculator from "./BrokerageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/brokerage-calculator";
const SELF_SLUG = "brokerage-calculator";

const DESC =
  "Free brokerage calculator. Estimate the brokerage and statutory charges on a stock trade, your net profit after costs, and the break-even sell price.";

export const metadata: Metadata = {
  title: "Brokerage Calculator",
  description: DESC,
  keywords: [
    "brokerage calculator",
    "trading cost calculator",
    "stock brokerage fees",
    "net profit calculator",
    "break-even price calculator",
    "share trading charges",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Brokerage Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Brokerage Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is brokerage and how is it charged?",
    answer:
      "Brokerage is the fee your broker charges to execute a trade. It is usually a small percentage of the trade value, often with a flat cap per order. Most brokers charge it on both the buy and the sell side, so a round trip incurs the fee twice.",
  },
  {
    question: "What other charges apply besides brokerage?",
    answer:
      "On top of brokerage you typically pay exchange, clearing and regulatory fees that scale with turnover. This calculator bundles those into a single statutory charge estimate so you can see your total cost rather than just the headline brokerage.",
  },
  {
    question: "What is the break-even sell price?",
    answer:
      "It is the price at which your sale just covers your purchase cost plus all charges, leaving zero profit. Selling above it produces a gain and selling below it produces a loss. It is a quick way to know the minimum price you need.",
  },
  {
    question: "Does a lower brokerage rate always mean more profit?",
    answer:
      "Lower brokerage helps, but the flat cap, statutory charges and your trade size all matter. For large orders a percentage fee can dominate, while for small orders a flat minimum can be the bigger cost. Compare total charges, not just the rate.",
  },
];

export default async function BrokerageCalculatorPage() {
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
    name: "Brokerage Calculator",
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
      title="Brokerage Calculator"
      intro="Estimate the brokerage and statutory charges on a trade, see your net profit after all costs, and find the break-even sell price. Enter your numbers and press Calculate."
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
            { name: "Brokerage Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Brokerage Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BrokerageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the brokerage calculator works</H2>
            <P>
              Every trade has two sides: a buy and a sell. The calculator multiplies your price by
              quantity to get the turnover on each side, applies your brokerage rate, and respects
              any flat cap per order. It then adds an estimate of exchange and regulatory charges
              that scale with total turnover.
            </P>
            <P>
              Your net profit is the difference between sell and buy turnover minus all of those
              charges. The break-even chart and figure show how much of your gross gain is consumed
              by costs, which is easy to overlook on small or frequent trades.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy 100 shares at $100 and sell at $110. The gross gain is $1,000. With brokerage at
              0.05% per side capped at $20 and a small statutory charge, total costs are only a few
              dollars, so your net profit stays close to $1,000. On a thin spread, those same costs
              can erase the entire gain.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Rates, caps and statutory charges vary by broker and market, so treat this as an
              estimate and confirm exact fees with your broker. For investor basics, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Securities and Exchange Commission</a>{" "}
              is a reliable source. You can also compare scenarios with our{" "}
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
