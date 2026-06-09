import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DripCalculator from "./DripCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/drip-calculator";
const SELF_SLUG = "drip-calculator";

const DESC =
  "Free dividend reinvestment (DRIP) calculator. Project how reinvested dividends compound your shares and portfolio value over time, with a growth chart.";

export const metadata: Metadata = {
  title: "Dividend Reinvestment Calculator",
  description: DESC,
  keywords: [
    "dividend reinvestment calculator",
    "DRIP calculator",
    "reinvested dividends calculator",
    "dividend compounding calculator",
    "dividend growth calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Dividend Reinvestment Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Dividend Reinvestment Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a DRIP?",
    answer:
      "DRIP stands for dividend reinvestment plan. Instead of taking your dividends as cash, every payout automatically buys more shares of the same stock. Those extra shares then earn dividends of their own, which compounds your position over time.",
  },
  {
    question: "How does reinvesting dividends grow my money?",
    answer:
      "Reinvestment compounds in two ways. Your share count rises because each dividend buys more shares, and many companies also raise their dividend per share each year. Together they can grow a portfolio much faster than taking dividends as cash, especially over long periods.",
  },
  {
    question: "What is dividend growth?",
    answer:
      "Dividend growth is the annual rate at which a company increases its dividend per share. A stock paying $2 today with 5% dividend growth pays about $2.10 next year. This calculator lets you set both dividend growth and share price growth to model a realistic scenario.",
  },
  {
    question: "Are reinvested dividends taxable?",
    answer:
      "In a taxable account, dividends are generally taxed in the year they are paid even if you reinvest them. In tax advantaged accounts such as an IRA, reinvested dividends typically grow without yearly tax. Check your situation with a qualified tax professional.",
  },
];

export default async function DripCalculatorPage() {
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
    name: "Dividend Reinvestment Calculator",
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
      title="Dividend Reinvestment Calculator"
      intro="Project how reinvested dividends compound your shares and portfolio value over time. Enter your investment and dividend details, then press Calculate."
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
            { name: "Dividend Reinvestment Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Dividend Reinvestment Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DripCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How dividend reinvestment compounds</H2>
            <P>
              When you reinvest dividends, each payout buys more shares at the current price. Those
              new shares earn dividends in the next period, and so on. The calculator runs this year
              by year, growing the share price and the dividend per share at the rates you choose, so
              the final value reflects both rising prices and a rising payout.
            </P>
            <P>
              Toggle reinvestment off to see the difference. Taking dividends as cash still gives you
              income, but your share count stays flat, so the portfolio grows more slowly. The chart
              makes the compounding effect easy to see over a long horizon.
            </P>

            <H2>A quick example</H2>
            <P>
              Invest $10,000 in a stock at $50 a share paying $2 a year, with the dividend and price
              both growing modestly. Over 20 years of reinvestment, the steady drip of new shares can
              lift the ending value well above what the same investment would reach without
              reinvesting. To check a stock's starting yield first, use our{" "}
              <Link href="/calculators/dividend-yield-calculator" className="text-orange-600 underline">dividend yield calculator</Link>.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These projections assume steady growth rates, which real markets do not follow. Dividends
              can be cut and prices can fall. Treat the result as a what-if model, not a forecast. For
              investor basics, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC investor education site</a>{" "}
              is a reliable source. Browse all of our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>{" "}
              for more.
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
