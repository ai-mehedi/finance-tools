import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DownPaymentSavingsCalculator from "./DownPaymentSavingsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/down-payment-savings-calculator";
const SELF_SLUG = "down-payment-savings-calculator";

const DESC =
  "Free down payment savings calculator. See how long it takes to save your home down payment from a monthly amount, starting balance and savings rate, with a growth chart.";

const baseMetadata: Metadata = {
  title: "Down Payment Savings Calculator",
  description: DESC,
  keywords: [
    "down payment savings calculator",
    "save for down payment calculator",
    "how long to save down payment",
    "home savings goal calculator",
    "down payment timeline calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Down Payment Savings Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Down Payment Savings Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How long will it take to save my down payment?",
    answer:
      "It depends on your goal, how much you have saved already, how much you add each month and the rate your savings earn. This calculator simulates month by month and shows the exact point your balance reaches the goal, plus a chart of the growth.",
  },
  {
    question: "Does interest on my savings really help?",
    answer:
      "Over a few years it adds up. Keeping your down payment fund in a high yield savings account or money market earns interest while you save, so you reach the goal a little sooner and put in slightly less of your own money.",
  },
  {
    question: "How much should I save each month?",
    answer:
      "Work backward from your goal and timeline. If you need $60,000 in five years, that is about $1,000 a month before any interest. Raising the monthly amount is the fastest way to shorten the timeline, since interest only helps modestly at typical savings rates.",
  },
  {
    question: "Should I include closing costs in my goal?",
    answer:
      "Yes. Closing costs often run 2% to 5% of the price on top of the down payment, so add them to your target. Saving for both means you are not caught short at the closing table.",
  },
];

export default async function DownPaymentSavingsCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Down Payment Savings Calculator",
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
      title="Down Payment Savings Calculator"
      intro="See how long it takes to save your home down payment and watch the balance grow. Enter your goal, current savings and monthly amount, then press Calculate."
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
            { name: "Down Payment Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Down Payment Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DownPaymentSavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the savings timeline works</H2>
            <P>
              Each month your balance grows in two ways: the amount you deposit and the interest your
              existing savings earn. The calculator runs this month by month until the balance reaches
              your goal, so the timeline accounts for compounding rather than a flat average. The chart
              shows the balance curving upward as interest starts to help.
            </P>
            <P>
              Because most people reach a home down payment within a few years, the monthly contribution
              does the heavy lifting and interest plays a supporting role. Even so, parking the money in
              an account that pays interest gets you there a bit sooner.
            </P>

            <H2>Speeding up the timeline</H2>
            <P>
              The fastest lever is the monthly amount. Raising it shortens the timeline far more than
              chasing a slightly higher rate. A windfall such as a bonus or tax refund added to your
              starting balance also moves the finish line closer. Once you have a target, see what it
              buys with our{" "}
              <Link href="/calculators/down-payment-calculator" className="text-orange-600 underline">down payment calculator</Link>.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a planning estimate that assumes a steady rate and contribution. Real savings
              rates change over time, and home prices may move while you save. For tips on building a
              savings habit, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
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
