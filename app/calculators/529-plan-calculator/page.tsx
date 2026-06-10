import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import Five29PlanCalculator from "./Five29PlanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/529-plan-calculator";
const SELF_SLUG = "529-plan-calculator";

const DESC =
  "Free 529 plan calculator. Project how your college savings grow with monthly contributions and compound returns, with a balance growth chart.";

const baseMetadata: Metadata = {
  title: "529 Plan Calculator",
  description: DESC,
  keywords: [
    "529 plan calculator",
    "college savings calculator",
    "529 college savings",
    "529 growth calculator",
    "education savings calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "529 Plan Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "529 Plan Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a 529 plan?",
    answer:
      "A 529 plan is a tax-advantaged investment account designed to help families save for education. Earnings grow free of federal tax, and withdrawals are tax-free when used for qualified education expenses such as tuition, fees, books and certain room and board costs.",
  },
  {
    question: "How is 529 plan growth calculated?",
    answer:
      "Growth comes from compounding. Your starting balance and each monthly contribution earn an expected annual return, reinvested over time. This calculator compounds monthly, so contributions added earlier have more time to grow than those added near the end.",
  },
  {
    question: "What return should I assume for a 529 plan?",
    answer:
      "It depends on your investment mix. Age-based portfolios often start more aggressive and shift toward conservative holdings as college nears. A long-term assumption of 5% to 7% is common, but returns are not guaranteed and vary year to year. Use a figure you are comfortable with.",
  },
  {
    question: "Are 529 contributions tax deductible?",
    answer:
      "There is no federal deduction for contributions, but many states offer a state income tax deduction or credit for residents who use their own state plan. Rules vary widely, so check your state program and consult the official guidance before assuming a tax benefit.",
  },
];

export default async function Five29PlanCalculatorPage() {
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
    "🎓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "529 Plan Calculator",
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
      title="529 Plan Calculator"
      intro="Project how your college savings grow with monthly contributions and compound returns. Enter your numbers and press Calculate to see the future balance."
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
            { name: "529 Plan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="529 Plan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Five29PlanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How a 529 plan grows</H2>
            <P>
              A 529 plan turns steady contributions into a college fund through compounding. Your
              starting balance and every monthly deposit are invested, and the returns are reinvested
              so they earn returns of their own. The earlier you start, the more time the account has
              to compound before tuition bills arrive.
            </P>
            <P>
              The chart above separates the money you put in from the growth on top of it. Early on the
              two lines stay close together, since most of the balance is your own contributions. Over
              the years the gap widens as investment earnings take on a larger share of the total.
            </P>

            <H2>A quick example</H2>
            <P>
              Start with $5,000, add $250 a month, and assume a 6% annual return over 18 years. By
              the time college begins you would have contributed $59,000 of your own money, yet the
              account could be worth noticeably more once compound growth is added on top.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns are estimates, not guarantees, and investment values rise and fall. Withdrawals
              stay tax-free only when used for qualified education expenses, so plan around that. For
              official details on 529 plans, see the{" "}
              <a href="https://www.sec.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Securities and Exchange Commission</a>.
              To compare with general investing, try our{" "}
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
