import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ImpermanentLossCalculator from "./ImpermanentLossCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/impermanent-loss-calculator";
const SELF_SLUG = "impermanent-loss-calculator";

const DESC =
  "Free impermanent loss calculator for 50/50 liquidity pools. Compare the value of providing liquidity versus holding, see the loss in dollars and percent, and view the full IL curve.";

const baseMetadata: Metadata = {
  title: "Impermanent Loss Calculator",
  description: DESC,
  keywords: [
    "impermanent loss calculator",
    "liquidity pool loss",
    "Uniswap impermanent loss",
    "LP vs HODL",
    "DeFi yield farming loss",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Impermanent Loss Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Impermanent Loss Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is impermanent loss?",
    answer:
      "Impermanent loss is the difference between holding two tokens in a 50/50 liquidity pool and simply keeping them in your wallet. When the relative price of the tokens moves, the pool automatically rebalances and you end up with more of the token that fell and less of the one that rose, so the position is worth less than just holding. The loss is called impermanent because it shrinks if prices return to where they started.",
  },
  {
    question: "How is impermanent loss calculated?",
    answer:
      "For a constant-product pool, take the price ratio change as a factor k, which is the new relative price divided by the old relative price. Impermanent loss equals two times the square root of k, divided by one plus k, minus one. The result is always zero or negative, and it grows larger the further the price moves in either direction.",
  },
  {
    question: "Do trading fees offset impermanent loss?",
    answer:
      "They can. Liquidity providers earn a share of swap fees, and over time those fees may more than make up for impermanent loss in a busy pool. This calculator shows the loss before fees so you can judge how much fee income you would need to break even against holding the tokens instead.",
  },
  {
    question: "When is impermanent loss the smallest?",
    answer:
      "Impermanent loss is zero when the relative price of the two tokens is unchanged, and it stays small for stable pairs that barely move, such as two pegged stablecoins. It grows quickly for volatile pairs, so a token that doubles against its partner can lose several percent versus holding, even before counting fees.",
  },
];

export default async function ImpermanentLossCalculatorPage() {
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
    "🦄"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Impermanent Loss Calculator",
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
      title="Impermanent Loss Calculator"
      intro="See what providing liquidity really costs. Enter token prices at deposit and now to compare your LP position against simply holding, in both dollars and percent."
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
            { name: "Impermanent Loss Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Impermanent Loss Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImpermanentLossCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the impermanent loss calculator works</H2>
            <P>
              A 50/50 liquidity pool keeps the product of its two token balances constant, so when one
              token's price moves the pool quietly trades against you to stay balanced. This tool takes
              the price of each token at the moment you deposited and the price now, works out how far
              their relative value shifted, and applies the standard constant-product formula.
            </P>
            <P>
              The chart plots impermanent loss across a wide range of price moves so you can see the
              shape of the curve. The dashed line and dot mark where your own position sits, making it
              clear how a bigger move in either direction deepens the loss versus holding.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you deposit $10,000 split evenly between a token priced at $2,000 and a stablecoin at
              $1. The token then climbs to $3,000 while the stablecoin holds. That is a 50% relative
              move, which produces about 2% impermanent loss. Your position is worth roughly $200 less
              than if you had simply held the original tokens, before any swap fees are counted.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Impermanent loss is only realised when you withdraw, and it can reverse if prices return
              toward your entry point. The figure here excludes trading fees and rewards, which are the
              reason many providers stay in profitable pools despite the loss. For the original
              explanation of constant-product pools, see the{" "}
              <a href="https://docs.uniswap.org" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Uniswap docs</a>.
              To project the upside if your tokens simply grow over time, try our{" "}
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
