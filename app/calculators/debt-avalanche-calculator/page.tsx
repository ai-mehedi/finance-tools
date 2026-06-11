import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DebtAvalancheCalculator from "./DebtAvalancheCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/debt-avalanche-calculator";
const SELF_SLUG = "debt-avalanche-calculator";

const DESC =
  "Free debt avalanche calculator. List your debts, balances and rates to see how attacking the highest interest rate first clears your debt fastest, with total interest, a payoff timeline and a balance chart.";

const baseMetadata: Metadata = {
  title: "Debt Avalanche Calculator",
  description: DESC,
  keywords: [
    "debt avalanche calculator",
    "debt payoff calculator",
    "highest interest first",
    "debt repayment plan",
    "pay off debt fast",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Debt Avalanche Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Debt Avalanche Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the debt avalanche method?",
    answer:
      "The avalanche method pays the minimum on every debt and then throws every spare dollar at the debt with the highest interest rate. Once that one is gone, its payment rolls onto the next-highest rate. Because the most expensive balance shrinks first, you pay the least interest overall.",
  },
  {
    question: "How is the avalanche different from the snowball method?",
    answer:
      "The snowball method targets the smallest balance first for quick psychological wins, while the avalanche targets the highest rate first for the lowest cost. Avalanche almost always saves more money and time, but snowball can feel more motivating if early progress keeps you going.",
  },
  {
    question: "Why does adding an extra payment help so much?",
    answer:
      "Minimum payments are mostly interest on high-rate debt, so progress is slow. Every extra dollar goes straight to principal on the most expensive balance, which cuts future interest and shortens the payoff. Even a modest extra amount each month can save months and a large sum of interest.",
  },
  {
    question: "What if my payments do not cover the interest?",
    answer:
      "If your minimums plus the extra are smaller than the interest your debts accrue each month, the balance grows instead of shrinking and there is no payoff date. The calculator flags this so you know you need to raise your payment, lower a rate, or reduce a balance first.",
  },
];

export default async function DebtAvalancheCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Debt Avalanche Calculator",
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
      title="Debt Avalanche Calculator"
      intro="Find the fastest, cheapest way out of debt. List each balance and rate, add any extra you can pay, then press Calculate to see your debt-free date and total interest saved."
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
            { name: "Debt Avalanche Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Debt Avalanche Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DebtAvalancheCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the debt avalanche calculator works</H2>
            <P>
              Each month the tool adds interest to every balance, pays the minimum on all of them, and
              then sends whatever is left over to the debt with the highest interest rate. When that
              debt hits zero, the full payment it was receiving cascades onto the next-highest rate, so
              your payoff power keeps growing without you spending an extra cent.
            </P>
            <P>
              It repeats this month after month until every balance is clear, tracking the total
              interest you pay along the way. The payoff order list shows when each debt disappears, and
              the chart traces your combined balance falling toward zero.
            </P>

            <H2>A worked example</H2>
            <P>
              Imagine a $8,000 credit card at 22 percent, a $12,000 car loan at 7 percent and a $15,000
              student loan at 5 percent, with $700 of minimums and $300 extra each month. The avalanche
              hammers the credit card first because it is the most expensive, clearing it well before
              the cheaper loans and saving a meaningful chunk of interest versus paying them evenly.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The avalanche is the mathematically cheapest route, but it only works if you stick with it,
              so pick a payment you can sustain. Rates on variable cards can change, which shifts the
              order over time. For a neutral overview of payoff strategies, see{" "}
              <a href="https://www.consumerfinance.gov/about-us/blog/how-pay-down-your-debt-quickly/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB guide to paying down debt</a>.
              If quick wins motivate you more than minimum interest, compare this with our{" "}
              <Link href="/calculators/debt-snowball-calculator" className="text-orange-600 underline">debt snowball calculator</Link>.
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
