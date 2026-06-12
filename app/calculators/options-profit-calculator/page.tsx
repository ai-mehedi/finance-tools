import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import OptionsProfitCalculator from "./OptionsProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/options-profit-calculator";
const SELF_SLUG = "options-profit-calculator";

const DESC =
  "Free options profit calculator. Find the profit, loss, breakeven, max gain and max loss at expiration for a long or short call or put, with a payoff diagram.";

const baseMetadata: Metadata = {
  title: "Options Profit Calculator",
  description: DESC,
  keywords: [
    "options profit calculator",
    "options payoff calculator",
    "call put profit calculator",
    "options breakeven calculator",
    "options P/L at expiration",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Options Profit Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Options Profit Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is profit on an option calculated at expiration?",
    answer:
      "At expiration an option is worth only its intrinsic value. For a call that is the underlying price minus the strike, and for a put it is the strike minus the underlying price, with a floor of zero. The profit for a buyer is that intrinsic value minus the premium paid, multiplied by the number of shares the contracts control.",
  },
  {
    question: "What is the breakeven price?",
    answer:
      "Breakeven is the underlying price where your profit is exactly zero. For a call it is the strike plus the premium, because the option has to rise enough to earn back what you paid. For a put it is the strike minus the premium. Above or below those points the position starts to make money.",
  },
  {
    question: "Why can a short call show unlimited loss?",
    answer:
      "When you sell a call you collect the premium but take on the obligation to deliver shares at the strike. There is no ceiling on how high the underlying can climb, so the potential loss has no fixed limit. A short put, by contrast, caps its loss when the underlying falls all the way to zero.",
  },
  {
    question: "Does this calculator account for time value or volatility?",
    answer:
      "No. This tool shows profit and loss at expiration only, when time value has decayed to nothing and just intrinsic value remains. Before expiration an option also carries time value driven by volatility and the time left, which a pricing model such as Black-Scholes would estimate.",
  },
];

export default async function OptionsProfitCalculatorPage() {
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
    name: "Options Profit Calculator",
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
      title="Options Profit Calculator"
      intro="See what an option trade is worth at expiration. Choose a call or put, set the strike, premium and contracts, then press Calculate to get the profit, breakeven and payoff curve."
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
            { name: "Options Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Options Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OptionsProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the options profit calculator works</H2>
            <P>
              The tool evaluates a single-leg position at expiration, the moment when an option is
              worth nothing but its intrinsic value. It works out that intrinsic value at every
              possible underlying price, subtracts or adds the premium depending on whether you bought
              or sold, and multiplies by the number of shares your contracts control.
            </P>
            <P>
              The payoff diagram makes the shape of the trade obvious. The dashed line is the
              breakeven level where profit is zero, the kink sits at the strike, and the dot marks
              your result at the underlying price you entered. A long call slopes up without limit,
              while a short put flattens into a fixed gain.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy one call with a 100 dollar strike for a premium of 3.50 dollars. One contract
              controls 100 shares, so you pay 350 dollars up front. Your breakeven is 103.50 dollars.
              If the stock finishes at 115 dollars, the call is worth 15 dollars of intrinsic value
              per share, or 1,500 dollars, leaving a profit of 1,150 dollars after the premium.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an expiration snapshot, so it ignores time value, commissions, dividends and
              early assignment. For the official mechanics of listed options, the{" "}
              <a href="https://www.optionseducation.org" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Options Industry Council</a>{" "}
              is a neutral reference. To size how much capital a trade ties up against your overall
              picture, our{" "}
              <Link href="/calculators/net-worth-calculator" className="text-orange-600 underline">net worth calculator</Link>{" "}
              can help.
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
