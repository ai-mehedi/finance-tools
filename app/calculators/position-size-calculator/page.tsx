import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PositionSizeCalculator from "./PositionSizeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/position-size-calculator";
const SELF_SLUG = "position-size-calculator";

const DESC =
  "Free forex position size calculator. Work out how many lots to trade so that hitting your stop loss costs only a set percentage of your account, with units, mini and micro lots and a stop-distance chart.";

export const metadata: Metadata = {
  title: "Forex Position Size Calculator",
  description: DESC,
  keywords: [
    "forex position size calculator",
    "lot size calculator",
    "risk per trade calculator",
    "pip value position sizing",
    "stop loss lot size",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Forex Position Size Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Forex Position Size Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is forex position size calculated?",
    answer:
      "First decide the cash you are willing to lose, which is your account balance times your risk percent. Then divide that by the loss one standard lot would suffer if the stop is hit, which is your stop distance in pips times the pip value per lot. The answer is your position size in lots.",
  },
  {
    question: "What is a pip value and why does it matter?",
    answer:
      "A pip is the smallest standard price move in a currency pair, and the pip value is what one pip is worth in your account currency for a given trade size. For a standard lot on most pairs quoted in US dollars the pip value is about 10 dollars. It matters because it converts a price distance in pips into an actual money loss.",
  },
  {
    question: "What is the difference between standard, mini and micro lots?",
    answer:
      "A standard lot is 100,000 units of the base currency, a mini lot is 10,000 units, and a micro lot is 1,000 units. They differ only in scale, so one standard lot equals ten mini lots or one hundred micro lots. The calculator shows your size in all three so you can place the order your broker supports.",
  },
  {
    question: "Why should I risk only a small percentage per trade?",
    answer:
      "Risking a small fixed percentage, often one or two percent, keeps any single losing trade survivable and protects you from a string of losses. If you risk too much per trade, a normal losing streak can shrink the account so far that recovering becomes very hard. Consistent small risk is what keeps you in the game.",
  },
];

export default async function PositionSizeCalculatorPage() {
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
    "🎯"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Forex Position Size Calculator",
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
      title="Forex Position Size Calculator"
      intro="Trade the right size every time. Enter your account balance, the percent you will risk, your stop in pips and the pip value, then press Calculate to get your lot size."
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
            { name: "Forex Position Size Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Forex Position Size Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PositionSizeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How position sizing works</H2>
            <P>
              Position sizing flips the usual question around. Instead of asking how much you might
              make, you start with how much you are prepared to lose. The tool turns your risk percent
              into a dollar figure, then works out the largest trade whose stop-loss distance would
              cost exactly that amount and no more. The size adjusts automatically to your stop, so a
              tight stop allows a bigger position and a wide stop forces a smaller one.
            </P>
            <P>
              The chart makes this trade-off visible. It plots how many lots you could take across a
              range of stop distances while keeping the same money at risk. As the stop widens the
              curve falls, and the marker shows where your current setup sits on that line.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose your account holds 10,000 dollars and you risk 1 percent, which is 100 dollars.
              Your stop loss is 20 pips away and the pip value is 10 dollars per standard lot, so one
              lot would lose 200 dollars if the stop is hit. Dividing 100 by 200 gives 0.5 lots, which
              is 5 mini lots or 50 micro lots, and 50,000 units of the base currency.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Pip value varies with the pair and your account currency, and slippage or gaps can make a
              real loss larger than the stop suggests, so size with a small buffer. A balanced overview
              of risk management from{" "}
              <a href="https://www.babypips.com" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">BabyPips</a>{" "}
              is a good starting point. Once you are sizing trades consistently, see how reinvested wins
              add up with our{" "}
              <Link href="/calculators/forex-compounding-calculator" className="text-orange-600 underline">forex compounding calculator</Link>.
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
