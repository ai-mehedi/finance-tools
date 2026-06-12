import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SavingsGoalCalculator from "./SavingsGoalCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/savings-goal-calculator";
const SELF_SLUG = "savings-goal-calculator";

const DESC =
  "Free savings goal calculator. Enter a target amount, your current balance, an APY and a deadline to find the exact monthly deposit you need, with a chart that tracks your path to the goal.";

const baseMetadata: Metadata = {
  title: "Savings Goal Calculator",
  description: DESC,
  keywords: [
    "savings goal calculator",
    "how much to save each month",
    "savings target calculator",
    "monthly deposit calculator",
    "reach savings goal",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Savings Goal Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Savings Goal Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the required monthly deposit worked out?",
    answer:
      "First the tool grows your current balance forward to the deadline at the rate you enter. Whatever is still short of the goal is then divided across the months using the future value of an annuity, which accounts for the interest each deposit will earn before the deadline.",
  },
  {
    question: "What if my current savings already reach the goal?",
    answer:
      "If your starting balance grows enough on its own to hit the target within the time frame, the required monthly deposit shows as zero and a note confirms you are already on track. You can still add deposits to build a cushion above the goal.",
  },
  {
    question: "Should I use a conservative interest rate?",
    answer:
      "For a fixed deadline a cautious rate is wise, because if the real return comes in lower you will still arrive on time. Using an optimistic rate lowers the required deposit but risks falling short if the account earns less than expected.",
  },
  {
    question: "Can I change the deadline instead of the deposit?",
    answer:
      "Yes. If the monthly deposit the tool returns is more than you can manage, increase the number of years to goal and recalculate. A longer time frame spreads the work over more months and gives interest more time to help.",
  },
];

export default async function SavingsGoalCalculatorPage() {
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
    name: "Savings Goal Calculator",
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
      title="Savings Goal Calculator"
      intro="Know exactly what to set aside. Enter your target, current balance, APY and deadline, then press Calculate to find the monthly deposit that gets you there on time."
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
            { name: "Savings Goal Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Savings Goal Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SavingsGoalCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the savings goal calculator works</H2>
            <P>
              A goal becomes manageable once it has a monthly number attached to it. This tool turns
              a big target into that number. It grows whatever you have today forward to your
              deadline, then solves for the steady deposit that closes the remaining gap, crediting
              the interest each of those deposits will earn along the way.
            </P>
            <P>
              The chart traces your projected balance climbing toward the goal line. When the orange
              area meets the dashed green line at the right edge of the chart, your plan lands the
              target exactly on schedule.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you want $30,000 for a down payment in five years, you already have $5,000 set
              aside, and the account pays a 4% APY. The tool finds you need to deposit roughly $375 a
              month. Your $5,000 head start and the interest along the way do the rest of the lifting.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A goal works best when the money sits somewhere separate from everyday spending so it is
              not nibbled away. Automating the deposit on payday removes the temptation entirely. For
              guidance on setting realistic money goals, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To see how a fixed monthly deposit compounds over a longer horizon, try our{" "}
              <Link href="/calculators/savings-calculator" className="text-orange-600 underline">savings calculator</Link>.
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
