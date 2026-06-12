import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CollegeSavingsCalculator from "./CollegeSavingsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/college-savings-calculator";
const SELF_SLUG = "college-savings-calculator";

const DESC =
  "Free college savings calculator. Project the inflated future cost of a degree against a 529 plan funded by a starting amount and monthly deposits, then see any shortfall and the monthly saving needed to fully fund it.";

const baseMetadata: Metadata = {
  title: "College Savings Calculator",
  description: DESC,
  keywords: [
    "college savings calculator",
    "529 plan calculator",
    "college cost calculator",
    "education savings calculator",
    "tuition savings goal",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "College Savings Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "College Savings Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "Why does the projected cost look so much higher than today's tuition?",
    answer:
      "College costs tend to rise faster than general inflation, often around 5 percent a year. The calculator inflates each year of tuition to the point in the future when it will actually be paid, so a degree starting fifteen years from now costs far more than the same degree would today.",
  },
  {
    question: "What return should I assume for a 529 plan?",
    answer:
      "It depends on how the money is invested. Many 529 plans use age-based portfolios that hold more stocks while the child is young and shift toward bonds as enrollment nears. A long-run assumption of 5 to 7 percent is common, but lower it as you get closer to the first tuition bill.",
  },
  {
    question: "What does the required monthly amount mean?",
    answer:
      "It is the monthly deposit that would let your plan exactly meet the projected total cost by enrollment, given your current balance and expected return. If your current contribution is below this figure you have a shortfall, and raising your deposit to it closes the gap.",
  },
  {
    question: "Do I need to cover 100 percent of the cost with savings?",
    answer:
      "Not necessarily. Many families plan to cover part of college from savings and the rest from current income, scholarships, grants or student aid. Use the funded percentage as a target you can adjust rather than an all-or-nothing goal.",
  },
];

export default async function CollegeSavingsCalculatorPage() {
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
    name: "College Savings Calculator",
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
      title="College Savings Calculator"
      intro="Find out whether your savings are on pace for college. Enter what you have saved, your monthly deposit, expected return and the future cost, then press Calculate to see your funding gap."
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
            { name: "College Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="College Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollegeSavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the college savings calculator works</H2>
            <P>
              The tool runs two projections side by side. On the cost side it takes today's annual
              tuition and inflates it forward, year by year, to the future dates when each year of
              college will actually be paid. On the savings side it grows your current balance and
              your monthly deposits at the return you expect, right up to enrollment.
            </P>
            <P>
              Comparing the two gives your funding gap. The chart plots your rising balance against
              the flat goal line, with a dashed line showing only the money you deposited, so you can
              see at a glance how much of the goal comes from growth versus your own contributions.
            </P>

            <H2>A worked example</H2>
            <P>
              Say tuition is 28,000 dollars a year today, rising 5 percent annually, with enrollment
              fifteen years away and a four-year program. The inflated four-year bill works out near
              250,000 dollars. Starting with 5,000 dollars saved and adding 300 dollars a month at a 6
              percent return reaches roughly 100,000 dollars, leaving a gap the tool helps you close.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns and tuition inflation are assumptions, not guarantees, so revisit the numbers
              every year or two. A tax-advantaged account can make a real difference to the outcome.
              The official rundown of how these plans work is on{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/investment-products/529-plans" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To stress-test the growth side on its own, try our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>.
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
