import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RiskRewardCalculator from "./RiskRewardCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/risk-reward-calculator";
const SELF_SLUG = "risk-reward-calculator";

const DESC =
  "Free risk reward ratio calculator for traders. Enter your entry, stop loss and target to get the risk reward ratio, break-even win rate and position size, with a chart of expected profit per trade across win rates.";

const baseMetadata: Metadata = {
  title: "Risk Reward Ratio Calculator",
  description: DESC,
  keywords: [
    "risk reward calculator",
    "risk reward ratio",
    "position size calculator",
    "trade expectancy",
    "stop loss calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Risk Reward Ratio Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Risk Reward Ratio Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a good risk reward ratio?",
    answer:
      "Many traders look for at least 1 to 2, meaning the potential reward is twice the amount risked. A higher ratio lets you be profitable even when you lose more trades than you win, but it usually means a more distant target that is hit less often. The right ratio depends on how reliable your setup is.",
  },
  {
    question: "How is the risk reward ratio calculated?",
    answer:
      "Risk per share is the distance from your entry to your stop loss. Reward per share is the distance from your entry to your target. The ratio is the reward divided by the risk. For example, risking 5 dollars to make 15 dollars is a ratio of 1 to 3.",
  },
  {
    question: "What win rate do I need to break even?",
    answer:
      "The break-even win rate is 1 divided by the quantity 1 plus the reward to risk ratio. At a 1 to 2 ratio you need to win about 33 percent of trades just to break even, before costs. The calculator shows this figure so you can judge whether your strategy clears the bar.",
  },
  {
    question: "How does this size my position?",
    answer:
      "Enter your account balance and the percentage you are willing to risk per trade. The tool turns that into a dollar risk amount, then divides it by the risk per share to find how many shares to buy so a stop-out costs no more than your chosen risk.",
  },
];

export default async function RiskRewardCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Risk Reward Ratio Calculator",
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
      title="Risk Reward Ratio Calculator"
      intro="Size up a trade before you take it. Enter your entry, stop and target to see the risk reward ratio, the win rate you need to break even and how many shares to buy, then press Calculate."
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
            { name: "Risk Reward Ratio Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Risk Reward Ratio Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskRewardCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the risk reward calculator works</H2>
            <P>
              Every trade has two distances that matter: how far the price can move against you before
              your stop loss closes the position, and how far it can move in your favor before it
              reaches your target. The first is your risk per share, the second is your reward per
              share, and the risk reward ratio simply divides one by the other. The tool detects
              whether the setup is long or short from where the stop sits relative to the entry.
            </P>
            <P>
              Because no edge wins every time, the ratio is only half the story. The chart plots the
              expected profit per trade across a range of win rates, so you can see the point where a
              strategy flips from losing to winning over many repetitions. The break-even win rate is
              where that line crosses zero.
            </P>

            <H2>A worked example</H2>
            <P>
              Buy at 100 dollars with a stop at 95 and a target at 115. Risk per share is 5 dollars,
              reward per share is 15 dollars, so the ratio is 1 to 3. The break-even win rate is just
              25 percent. Risking 1 percent of a 25,000 dollar account means a 250 dollar risk, which
              divided by the 5 dollar risk per share allows 50 shares, putting roughly 5,000 dollars to
              work for a 750 dollar potential gain.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The ratio ignores commissions, slippage and the chance the price gaps past your stop, all
              of which erode real results. A favorable ratio is no guarantee the target gets hit. For a
              primer on managing trading risk, see{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To project the growth of profits you keep, pair this with our{" "}
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
