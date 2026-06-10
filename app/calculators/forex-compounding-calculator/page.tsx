import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ForexCompoundingCalculator from "./ForexCompoundingCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/forex-compounding-calculator";
const SELF_SLUG = "forex-compounding-calculator";

const DESC =
  "Free forex compounding calculator. Project how a trading account grows when you reinvest a fixed percentage gain each day, week or month, with optional deposits and a chart of balance versus money paid in.";

export const metadata: Metadata = {
  title: "Forex Compounding Calculator",
  description: DESC,
  keywords: [
    "forex compounding calculator",
    "trading account growth",
    "compound forex gains",
    "daily percentage gain calculator",
    "reinvested trading profit",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Forex Compounding Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Forex Compounding Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does compounding work in forex trading?",
    answer:
      "Compounding means you reinvest the profit from each trading period rather than withdrawing it, so the next period's percentage gain is calculated on a larger balance. A steady 1 percent a day looks modest, but applied to a growing account it produces a curved, accelerating growth path rather than a straight line.",
  },
  {
    question: "Is a fixed daily percentage gain realistic?",
    answer:
      "No. The calculator assumes a constant gain every period to show the mathematics of compounding, but real trading produces winning and losing periods, drawdowns and variable returns. Use the result to understand the power of reinvestment, not as a forecast of what an account will actually do.",
  },
  {
    question: "How many trading periods are in a year?",
    answer:
      "This tool counts about 252 trading days in a year because markets are closed on weekends and holidays, 52 weeks, or 12 months depending on the frequency you choose. Picking the right frequency matters: a 1 percent daily gain compounds far more often than a 1 percent monthly gain.",
  },
  {
    question: "What does adding a deposit per period do?",
    answer:
      "The optional deposit adds a fixed cash top-up at the end of every period, on top of the percentage gain. This models a trader who funds the account regularly. Those deposits then compound alongside your profits, which is why the total deposited line on the chart rises in steps while the balance line curves above it.",
  },
];

export default async function ForexCompoundingCalculatorPage() {
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
    name: "Forex Compounding Calculator",
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
      title="Forex Compounding Calculator"
      intro="See how a trading account grows when you reinvest profits. Enter a starting balance, a gain per period and how many periods to run, then press Calculate to project the curve."
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
            { name: "Forex Compounding Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Forex Compounding Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ForexCompoundingCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the compounding calculator works</H2>
            <P>
              Each period the tool multiplies your current balance by one plus the gain you set, then
              adds any deposit. Because the gain is applied to last period's balance, every win you
              keep in the account makes the next win slightly larger. This is the engine behind the
              steep curve you see on long horizons, and it is the same arithmetic as compound interest
              in a savings account.
            </P>
            <P>
              The chart separates two things. The shaded area is your account balance over time, and
              the dashed line is the money you actually put in, your starting balance plus any
              deposits. The widening gap between them is reinvested profit doing the work.
            </P>

            <H2>A quick example</H2>
            <P>
              Start with 1,000 dollars and earn a steady 1 percent per trading day. After 100 trading
              days the account reaches about 2,700 dollars, roughly two and a half times the start,
              with no extra deposits. The first day adds only 10 dollars, but by day 100 a single
              one percent day is worth more than 25 dollars, because the base has grown.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Constant gains never happen in real markets, and leverage that amplifies wins also
              amplifies losses, so treat the projection as a teaching aid. For a plain-language warning
              on the risks of trading, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To size each individual trade so a losing streak does not wipe out the account, pair this
              with our{" "}
              <Link href="/calculators/position-size-calculator" className="text-orange-600 underline">forex position size calculator</Link>.
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
