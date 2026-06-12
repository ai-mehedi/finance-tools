import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import VacationSavingsCalculator from "./VacationSavingsCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/vacation-savings-calculator";
const SELF_SLUG = "vacation-savings-calculator";

const DESC =
  "Free vacation savings calculator. Find out how much to set aside each month to fund your trip by its date, factoring in money you already saved and the interest a savings account can add.";

const baseMetadata: Metadata = {
  title: "Vacation Savings Calculator",
  description: DESC,
  keywords: [
    "vacation savings calculator",
    "travel savings calculator",
    "trip savings goal calculator",
    "how much to save for vacation",
    "holiday fund calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Vacation Savings Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vacation Savings Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How much should I save each month for a vacation?",
    answer:
      "Take the total cost of the trip, subtract anything you have already put aside, and divide what is left by the number of months until you travel. If your savings earn interest, you can divide by a little less because the account does some of the work for you. This calculator handles both steps and shows the exact monthly figure.",
  },
  {
    question: "Does the interest rate on my savings really matter for a short trip?",
    answer:
      "Over a few months the effect is small, often only a handful of dollars, because there is little time for interest to build. It becomes more meaningful when you are saving for a year or more, or when your starting balance is large. Even so, parking the money in a high-yield savings account rather than a checking account costs nothing and helps a little.",
  },
  {
    question: "What costs should I include in the trip budget?",
    answer:
      "Aim for the all-in figure: flights or fuel, accommodation, local transport, food, activities, travel insurance and a buffer for souvenirs and surprises. Travelers routinely underestimate day-to-day spending, so adding ten to fifteen percent on top of your firm bookings gives a more realistic goal to save toward.",
  },
  {
    question: "What if I cannot afford the monthly amount the calculator suggests?",
    answer:
      "You have three levers: lower the trip budget, push the travel date further out, or reduce the gap by saving a lump sum now. Extending the timeline is usually the gentlest fix because the same goal is spread over more months, which shrinks each deposit. Try a longer number of months and watch the monthly figure fall.",
  },
];

export default async function VacationSavingsCalculatorPage() {
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
    "🏖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vacation Savings Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Vacation Savings Calculator"
      intro="Plan a trip without the last-minute scramble. Enter your budget, what you have already saved and how long until you travel, then press Calculate to see how much to tuck away each month."
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
            { name: "Vacation Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Vacation Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VacationSavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the vacation savings calculator works</H2>
            <P>
              The tool starts from your trip budget and subtracts whatever you have already saved to find
              the gap you still need to close. It then spreads that gap evenly across the months left
              until your departure date. If you tell it your savings account pays interest, it grows your
              existing balance and your deposits along the way, so the required monthly amount comes down a
              touch.
            </P>
            <P>
              The chart traces your balance climbing month by month until it reaches the goal. Most of the
              line is your own deposits stacking up, with interest adding a gentle curve near the top on
              longer timelines.
            </P>

            <H2>A quick example</H2>
            <P>
              Say a long weekend will cost 4,000 dollars, you have 500 dollars set aside, you leave in 12
              months, and your savings earn 4 percent a year. The calculator works out that depositing
              roughly 280 dollars a month gets you there, with the account chipping in a small amount of
              interest so you contribute a little less than the full 3,500 dollar gap.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Prices for flights and hotels move with demand, so build in a buffer and book early where you
              can. For neutral guidance on setting up a dedicated savings habit, the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/savings-goals/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB savings goal guide</a> is a useful read.
              If you would rather see what a fixed monthly deposit grows into over a longer horizon, try our{" "}
              <Link href="/calculators/savings-goal-calculator" className="text-orange-600 underline">savings goal calculator</Link>.
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
