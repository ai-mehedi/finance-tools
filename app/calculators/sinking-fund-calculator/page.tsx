import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SinkingFundCalculator from "./SinkingFundCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/sinking-fund-calculator";
const SELF_SLUG = "sinking-fund-calculator";

const DESC =
  "Free sinking fund calculator. Find the regular deposit you need to hit a savings goal by a set date, including any starting balance and interest, with a balance-growth chart.";

const baseMetadata: Metadata = {
  title: "Sinking Fund Calculator",
  description: DESC,
  keywords: [
    "sinking fund calculator",
    "savings goal deposit",
    "how much to save each month",
    "sinking fund deposit formula",
    "save for a target amount",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Sinking Fund Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Sinking Fund Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a sinking fund?",
    answer:
      "A sinking fund is money you set aside on a schedule so a known expense is fully paid for by the time it arrives. Instead of borrowing or scrambling when the bill is due, you spread the cost into small, predictable deposits and let any interest help close the gap.",
  },
  {
    question: "How is the required deposit calculated?",
    answer:
      "The tool first grows your existing balance forward to the target date, subtracts that from your goal to find what the deposits must supply, and then divides by the annuity factor, which is the quantity one plus the periodic rate raised to the number of periods, minus one, divided by the periodic rate.",
  },
  {
    question: "How is a sinking fund different from an emergency fund?",
    answer:
      "A sinking fund targets a specific, expected cost with a known amount and date, such as a new roof or annual insurance. An emergency fund is a general cushion for surprises with no fixed amount or deadline. Many people keep both, in separate accounts, at the same time.",
  },
  {
    question: "Should I count interest on the fund?",
    answer:
      "If you park the money in a high-yield savings account or money market fund, yes. Entering a realistic rate lowers the deposit you need because the account does part of the work. If you keep the cash in a no-interest checking account, set the rate to zero.",
  },
];

export default async function SinkingFundCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sinking Fund Calculator",
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
      title="Sinking Fund Calculator"
      intro="Work out how much to set aside on each payday so a planned expense is fully funded on time. Enter your goal, your deadline, and any head start, then press Calculate."
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
            { name: "Sinking Fund Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Sinking Fund Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SinkingFundCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the sinking fund calculator works</H2>
            <P>
              A sinking fund flips a normal savings question around. Instead of asking what a deposit
              will grow into, it asks what deposit is needed to land on an exact target by a set date.
              The tool grows any money you have already saved up to the deadline, figures out the
              shortfall, then solves the annuity formula for the level payment that fills it.
            </P>
            <P>
              The chart traces two lines. The shaded area is your account balance climbing toward the
              goal, and the dashed line is the cash you have personally put in. The gap between them is
              the interest the account adds, which is why a higher rate means a smaller deposit.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you want $20,000 for a car in three years, you already have $2,000, and your savings
              account pays 4 percent. With monthly deposits, the calculator solves for about $470 a
              month. Your existing $2,000 grows on its own, and interest across the 36 months shaves a
              little off what you would otherwise have to deposit.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Keep the fund in an account you will not dip into, and revisit the numbers if the price
              of your goal changes. For a primer on saving toward goals from a neutral source, see the
              CFPB guidance on{" "}
              <a href="https://www.consumerfinance.gov/about-us/blog/budgeting-how-to-create-a-budget-and-stick-with-it/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">building a budget</a>.
              If your goal is open-ended rather than fixed, our{" "}
              <Link href="/calculators/savings-goal-calculator" className="text-orange-600 underline">savings goal calculator</Link>{" "}
              may fit better.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</p>
                    {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{a.excerpt}</p>}
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
