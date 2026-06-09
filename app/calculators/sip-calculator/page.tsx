import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SipCalculator from "./SipCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/sip-calculator";
const SELF_SLUG = "sip-calculator";

const DESC =
  "Free SIP calculator. Estimate the future value of a Systematic Investment Plan from a fixed monthly investment, expected return and time period, with a growth chart.";

export const metadata: Metadata = {
  title: "SIP Calculator",
  description: DESC,
  keywords: [
    "sip calculator",
    "systematic investment plan calculator",
    "mutual fund sip calculator",
    "sip return calculator",
    "monthly investment calculator",
    "sip future value",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "SIP Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "SIP Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a SIP?",
    answer:
      "A Systematic Investment Plan (SIP) is a way of investing a fixed amount at regular intervals, usually every month, into a mutual fund or similar vehicle. It spreads your buying over time, builds discipline, and lets compounding work on each contribution.",
  },
  {
    question: "How is SIP future value calculated?",
    answer:
      "This calculator treats each monthly contribution as an annuity due and uses FV = P × [((1 + i)^n - 1) / i] × (1 + i), where P is the monthly investment, i is the monthly rate (annual rate divided by 12), and n is the number of months. If the rate is zero, the future value is simply P × n.",
  },
  {
    question: "What return rate should I assume?",
    answer:
      "The expected return is an assumption, not a guarantee. Equity mutual funds have historically averaged high single to low double digit annual returns over long periods, but actual results vary year to year. Use a conservative long-term average and revisit it as conditions change.",
  },
  {
    question: "Does investing earlier really matter?",
    answer:
      "Yes. Because each contribution compounds for the rest of the plan, the money you invest in the early years has the most time to grow. Starting sooner, even with smaller amounts, usually beats starting later with larger amounts.",
  },
];

export default async function SipCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getTools({ type: "calculator", limit: 7 }),
    getArticles({ limit: 4 }),
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
    name: "SIP Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="SIP Calculator"
      intro="Estimate what a Systematic Investment Plan could grow into. Enter a monthly investment, expected return and time period, then press Calculate."
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
            { name: "SIP Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="SIP Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <SipCalculator />

          {/* Ad 1 */}
          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How a SIP grows your money</H2>
            <P>
              A Systematic Investment Plan turns investing into a habit. Instead of trying to time the
              market, you invest the same amount every month. When prices are low your money buys more
              units, and when prices are high it buys fewer, which averages out your purchase cost over
              time. Meanwhile every contribution keeps compounding for the rest of the plan.
            </P>
            <P>
              This calculator models each monthly payment as an annuity due, using
              FV = P × [((1 + i)<sup>n</sup> - 1) / i] × (1 + i), where P is the monthly investment, i is
              the monthly rate and n is the total number of months. The future value is split into the
              money you actually put in and the estimated returns earned on top.
            </P>

            <H2>A quick example</H2>
            <P>
              Invest $500 a month at a 12% expected annual return for 15 years. You contribute $90,000
              of your own money over 180 months, yet the estimated value grows to well over $240,000.
              The chart above shows the widening gap between the flat invested line and the curving
              value line, which is compounding doing the work.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              SIP returns are estimates, not promises, because real funds rise and fall with the market.
              Treat the expected return as a long-term average and review it periodically. For broad
              investor education see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>{" "}
              from the SEC. You can also compare a lump sum approach with our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>.
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

          {/* Related guides */}
          {articles.length > 0 && (
            <div className="mt-12">
              <div className="mb-5 flex items-center justify-between">
                <H2>Related guides</H2>
                <Link href="/blog" className="shrink-0 text-sm font-semibold text-orange-600 hover:text-orange-700">View all →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ad 2 */}
          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {relatedTools.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-extrabold text-zinc-900">Related calculators</h2>
              <ul className="mt-3 space-y-1">
                {relatedTools.map((t) => (
                  <li key={t._id}>
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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

          {/* Ad 3 — sticky side banner */}
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
