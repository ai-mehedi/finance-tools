import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MiningCalculator from "./MiningCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mining-calculator";
const SELF_SLUG = "mining-calculator";

const DESC =
  "Free crypto mining profitability calculator. Estimate daily, monthly and yearly mining revenue, electricity cost and net profit from your hash rate, power draw, coin price and network difficulty, plus a hardware payback chart.";

export const metadata: Metadata = {
  title: "Mining Profitability Calculator",
  description: DESC,
  keywords: [
    "mining calculator",
    "crypto mining profitability",
    "hash rate profit calculator",
    "bitcoin mining calculator",
    "mining break-even calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mining Profitability Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mining Profitability Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is mining profit estimated?",
    answer:
      "Your share of the network is your hash rate divided by the total network hash rate. Multiply that share by the number of blocks mined per day and the block reward to get your expected coins, convert to dollars at the coin price, then subtract electricity cost and the pool fee to reach net profit.",
  },
  {
    question: "Why does network hash rate matter so much?",
    answer:
      "Block rewards are split across everyone mining, so your slice shrinks as the network grows. If total network hash rate doubles while yours stays the same, your daily coins roughly halve even though nothing about your rig changed.",
  },
  {
    question: "How is the electricity cost worked out?",
    answer:
      "The rig power draw in watts is turned into kilowatt-hours per day by multiplying by 24 and dividing by 1000, then multiplied by your price per kilowatt-hour. A 3250 watt rig at ten cents per kilowatt-hour costs about 7.80 dollars a day to run.",
  },
  {
    question: "What does the payback figure mean?",
    answer:
      "Payback is how long the rig must run at the current net daily profit to earn back its upfront cost. If daily profit is negative the hardware never pays for itself, which the tool flags rather than showing a misleading number.",
  },
];

export default async function MiningCalculatorPage() {
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
    "⛏️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mining Profitability Calculator",
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
      title="Mining Profitability Calculator"
      intro="Find out whether mining pays at your numbers. Enter your hash rate, power draw, electricity price and the coin's reward economics, then press Calculate for daily, monthly and yearly profit plus a payback timeline."
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
            { name: "Mining Profitability Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mining Profitability Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiningCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mining profitability calculator works</H2>
            <P>
              Mining rewards are a lottery weighted by hash power. The calculator finds the slice of
              the network you control, scales it by how many blocks are mined each day and the reward
              per block, and applies your pool fee to land on the coins you can expect to keep. It then
              prices those coins, subtracts the electricity your rig burns, and reports profit per day,
              month and year.
            </P>
            <P>
              The chart tracks your cumulative position over two years, starting below zero by the cost
              of the rig and climbing as daily profit accrues. The point where the line crosses zero is
              your break-even, the moment the hardware has paid for itself.
            </P>

            <H2>A quick example</H2>
            <P>
              A 100 TH/s rig drawing 3250 watts on a 600 PH/s network, with a 3.125 coin block reward,
              ten minute blocks, a coin price of 65,000 dollars and a one percent pool fee, earns a tiny
              fraction of a coin each day. After roughly 7.80 dollars of daily power cost, the net result
              is a modest daily profit that compounds into the monthly figure shown, with payback on a
              3,000 dollar rig measured in months rather than years.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Coin price and network difficulty move constantly, so a result that looks profitable today
              can flip negative after the next difficulty adjustment. Track live network conditions on a
              chain explorer such as{" "}
              <a href="https://www.blockchain.com/explorer" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Blockchain.com</a>{" "}
              before committing capital. If you would rather model buying and holding the coin instead of
              mining it, try our{" "}
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
