import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CryptoProfitCalculator from "./CryptoProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/crypto-profit-calculator";
const SELF_SLUG = "crypto-profit-calculator";

const DESC =
  "Free crypto profit calculator. Enter your investment, buy price, sell price and exchange fees to see net profit or loss, return percentage, coins bought and the break-even price after fees.";

export const metadata: Metadata = {
  title: "Crypto Profit Calculator",
  description: DESC,
  keywords: [
    "crypto profit calculator",
    "bitcoin profit calculator",
    "crypto gain loss calculator",
    "crypto roi calculator",
    "crypto break even price",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Crypto Profit Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Crypto Profit Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is crypto profit calculated?",
    answer:
      "First the buy fee is taken out of your investment, and the rest buys coins at the buy price. At sale those coins are valued at the sell price to give gross proceeds, the sell fee is subtracted to give net proceeds, and your profit is net proceeds minus the original amount you put in.",
  },
  {
    question: "Why do fees matter so much?",
    answer:
      "Exchanges charge a fee on both the buy and the sell, so you pay twice on every round trip. Even a small percentage eats into thin margins, which is why this calculator applies fees on each side and reports the total so you see the real take-home figure.",
  },
  {
    question: "What is the break-even price?",
    answer:
      "It is the sell price at which your net proceeds, after the sell fee, exactly equal what you invested, leaving zero profit. Selling above it puts you in the green and selling below it locks in a loss. It already accounts for the coins you actually received after the buy fee.",
  },
  {
    question: "Does this account for taxes?",
    answer:
      "No. The result is your pre-tax trading profit. Depending on where you live and how long you held the coins, a realized gain may be subject to capital gains tax, so the amount you keep can be lower. Check your local rules or a tax professional before relying on the figure.",
  },
];

export default async function CryptoProfitCalculatorPage() {
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
    "💹"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crypto Profit Calculator",
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
      title="Crypto Profit Calculator"
      intro="Work out exactly what a trade made or lost. Enter your investment, buy and sell prices and exchange fees, then press Calculate to see net profit, return and your break-even price."
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
            { name: "Crypto Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Crypto Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CryptoProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the crypto profit calculator works</H2>
            <P>
              The calculator follows your money through a full round trip. Your investment first loses
              the buy fee, and the remainder buys coins at the buy price. When you sell, those coins are
              valued at the sell price for gross proceeds, the sell fee comes off, and what is left is
              your net proceeds. Subtract the original investment and you have the profit or loss, shown
              alongside the return percentage.
            </P>
            <P>
              The bar chart lines up four amounts side by side: what you invested, the gross proceeds
              before the sell fee, the net proceeds after it, and the profit on top. Seeing them
              together makes the bite of fees and the size of the gain easy to compare at a glance.
            </P>

            <H2>A quick example</H2>
            <P>
              Invest 1,000 dollars in a coin at 25,000 dollars with a 0.1 percent buy fee, then sell at
              40,000 dollars with a 0.1 percent sell fee. After the buy fee you hold about 0.04 of a
              coin, the sale brings in roughly 1,598 dollars net, and your profit is close to 598
              dollars, a return near 60 percent before tax. The break-even price sits just above your
              25,000 dollar entry to cover both fees.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The figure is pre-tax and assumes you actually sell at the price you enter, which is never
              guaranteed in a volatile market with slippage and spreads. Use your exchange's real fee
              tier, and remember that a realized gain can be taxable. For the rules on reporting digital
              asset gains, see{" "}
              <a href="https://www.irs.gov/filing/digital-assets" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the IRS digital assets page</a>.
              To model regular buying instead of a one-off trade, try our{" "}
              <Link href="/calculators/crypto-dca-calculator" className="text-orange-600 underline">crypto DCA calculator</Link>.
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
