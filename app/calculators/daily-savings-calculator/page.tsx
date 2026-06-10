import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DailySavingsCalculator from "./DailySavingsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/daily-savings-calculator";
const SELF_SLUG = "daily-savings-calculator";

const DESC =
  "Free daily savings calculator. See how a small amount saved every day grows with daily compounding interest over the years, with a clear growth chart.";

export const metadata: Metadata = {
  title: "Daily Savings Calculator",
  description: DESC,
  keywords: [
    "daily savings calculator",
    "save money daily calculator",
    "daily deposit calculator",
    "save per day calculator",
    "savings growth calculator",
    "compound savings calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Daily Savings Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Daily Savings Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does saving a little each day add up?",
    answer:
      "Each daily deposit joins your balance and starts earning interest, and that interest then earns interest of its own. Even a few dollars a day becomes thousands over the years, because the deposits are frequent and compounding works on the growing total.",
  },
  {
    question: "How is the future balance calculated?",
    answer:
      "The calculator adds your daily amount to the balance every day and applies the daily interest rate, which is the annual rate divided by 365. Doing this day by day across the whole period gives the final balance, the total you deposited and the interest earned.",
  },
  {
    question: "Is saving daily better than saving monthly?",
    answer:
      "The total you set aside matters most, but depositing more often lets money start compounding a little sooner, which gives a small edge. The bigger benefit of a daily habit is consistency: small regular amounts are easier to sustain than large lump sums.",
  },
  {
    question: "What interest rate should I use?",
    answer:
      "Use a rate close to what your account actually pays. High-yield savings accounts often pay more than standard accounts, while a checking account may pay almost nothing. Enter a realistic rate so the projection reflects where you keep the money.",
  },
];

export default async function DailySavingsCalculatorPage() {
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
    "🐷"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Daily Savings Calculator",
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
      title="Daily Savings Calculator"
      intro="See how a small amount saved every day grows with compounding interest over the years. Enter your daily amount, rate and time, then press Calculate."
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
            { name: "Daily Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Daily Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailySavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How daily savings grow</H2>
            <P>
              Saving daily turns small choices into real money. Each day you add your chosen amount, and
              the whole balance earns interest at the daily rate, which is the annual rate divided by
              365. Because deposits and interest both arrive every day, the balance climbs steadily and
              then curves upward as compounding takes hold, exactly as the chart shows.
            </P>
            <P>
              The gap between the solid balance line and the dashed deposited line is the interest you
              earned. Early on that gap is thin, but the longer you keep going, the wider it grows.
            </P>

            <H2>A quick example</H2>
            <P>
              Set aside $5 a day at 4% for 10 years. You deposit about $18,250 over that time, and with
              daily compounding the balance reaches roughly $22,400. The extra few thousand dollars is
              interest, earned simply by leaving the money to grow.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a projection that assumes a steady rate and an unbroken daily habit. Real rates
              change and life gets in the way, so treat the result as a goal rather than a guarantee.
              For trusted guidance on building savings, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a good resource. To compare other plans, see our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>.
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
