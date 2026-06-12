import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CryptoAverageCalculator from "./CryptoAverageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/crypto-average-calculator";
const SELF_SLUG = "crypto-average-calculator";

const DESC =
  "Free crypto average buy calculator. Add every purchase to find your weighted average cost basis, total coins held and total invested, then compare against the current price to see your profit or loss.";

const baseMetadata: Metadata = {
  title: "Crypto Average Buy Calculator",
  description: DESC,
  keywords: [
    "crypto average calculator",
    "average buy price crypto",
    "cost basis calculator",
    "dollar cost averaging crypto",
    "crypto profit loss calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Crypto Average Buy Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Crypto Average Buy Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the average buy price calculated?",
    answer:
      "The tool uses a weighted average, not a simple average of the prices. It adds up the dollars spent on every buy, adds up the coins received, then divides total dollars by total coins. Larger buys therefore pull the average toward their price.",
  },
  {
    question: "Why is my average different from the midpoint of my prices?",
    answer:
      "A midpoint treats every buy as equal, but a weighted average weights each price by how many coins you bought at it. If you bought far more at a low price than at a high price, your true cost basis sits closer to that low price.",
  },
  {
    question: "What does break even mean here?",
    answer:
      "Break even is the price at which selling your whole position returns exactly what you paid, ignoring fees and taxes. It equals your average buy price, so any market price above it is an unrealized gain and any price below it is an unrealized loss.",
  },
  {
    question: "Does this account for trading fees and taxes?",
    answer:
      "No. The calculator works from the prices and quantities you enter, so it does not add exchange fees or estimate capital gains tax. To get a truer cost basis, include any fee in the price you paid for each buy.",
  },
];

export default async function CryptoAverageCalculatorPage() {
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
    "🪙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crypto Average Buy Calculator",
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
      title="Crypto Average Buy Calculator"
      intro="Find your true cost basis across every buy. Add each purchase price and quantity, optionally enter the current price, then press Calculate to see your weighted average and profit or loss."
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
            { name: "Crypto Average Buy Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Crypto Average Buy Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CryptoAverageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the crypto average calculator works</H2>
            <P>
              When you buy the same coin at several different prices, your real entry point is a
              blend of them all. This tool tracks every buy, multiplies each price by the quantity
              you bought, and divides the total spent by the total coins to give a weighted average
              cost basis, the single number that tells you where you actually stand.
            </P>
            <P>
              The line chart shows how that average shifts as you add buys. Buying at a lower price
              drags the line down, buying at a higher price pushes it up, and the size of the move
              depends on how much you bought relative to your existing stack.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you buy 0.1 BTC at $30,000, then 0.15 BTC at $25,000, then 0.05 BTC at $40,000. You
              spend $3,000 plus $3,750 plus $2,000, a total of $8,750 for 0.30 BTC. Dividing gives an
              average of about $29,167 per coin. At a current price of $45,000 your stack is worth
              $13,500, an unrealized gain of roughly $4,750.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Your average price is only a cost reference, not a prediction, and tax rules on
              disposals vary by country, so check the guidance from your tax authority such as the{" "}
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS digital assets page</a>{" "}
              before you sell. If you want to swap between coins or to a fiat amount first, try our{" "}
              <Link href="/calculators/crypto-converter" className="text-orange-600 underline">crypto converter</Link>.
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
