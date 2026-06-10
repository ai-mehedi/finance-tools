import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MonthlyExpenseCalculator from "./MonthlyExpenseCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/monthly-expense-calculator";
const SELF_SLUG = "monthly-expense-calculator";

const DESC =
  "Free monthly expense calculator. Add up housing, food, transport and more, compare it to your take-home pay, and see your leftover and savings rate with a category donut chart.";

export const metadata: Metadata = {
  title: "Monthly Expense Calculator",
  description: DESC,
  keywords: [
    "monthly expense calculator",
    "monthly budget calculator",
    "household expenses calculator",
    "cost of living calculator",
    "savings rate calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Monthly Expense Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Monthly Expense Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What counts as a monthly expense?",
    answer:
      "A monthly expense is any recurring cost you pay to run your life, such as rent, utilities, groceries, transport, insurance and debt payments. For bills that arrive quarterly or yearly, divide the total by the number of months they cover so every line is on the same monthly basis.",
  },
  {
    question: "What is a good savings rate?",
    answer:
      "Many planners suggest aiming to keep at least ten to twenty percent of take-home pay after expenses, but the right number depends on your goals and stage of life. This tool shows your savings rate as the share of income left over once every category is filled in, so you can see where you stand.",
  },
  {
    question: "Should I use gross or take-home income?",
    answer:
      "Use take-home pay, the amount that actually reaches your bank account after tax and payroll deductions. Comparing expenses to gross income overstates how much you really have to spend, which makes a budget look healthier than it is.",
  },
  {
    question: "Why split spending into categories?",
    answer:
      "Breaking spending into categories shows which areas dominate your budget, so you can target the biggest line for cuts. The donut chart highlights the largest category at a glance, which is usually housing for most households and the most useful place to start trimming.",
  },
];

export default async function MonthlyExpenseCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Monthly Expense Calculator",
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
      title="Monthly Expense Calculator"
      intro="Add up everything you spend in a typical month and see how it stacks up against your take-home pay. Fill in each category, then press Calculate to find your leftover and savings rate."
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
            { name: "Monthly Expense Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Monthly Expense Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyExpenseCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the monthly expense calculator works</H2>
            <P>
              The tool adds up every category you enter to find your total monthly outflow, then
              subtracts it from your take-home pay to show what is left. A positive number is the cash
              you can save or invest each month, while a negative number flags a budget that spends more
              than it earns.
            </P>
            <P>
              The donut chart turns those numbers into proportions, so a category that quietly eats a
              third of your budget becomes obvious. Most households find housing is the largest slice,
              and seeing it sized against everything else makes it easier to decide where to cut.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you take home $5,000 a month and your categories add up to $3,800. You are left
              with $1,200, a savings rate of 24 percent, and a clear picture that housing at $1,500 is
              your single biggest cost. From there you can test what trimming any one line would do to
              the leftover.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Annualise irregular bills before you enter them, and revisit the calculator after any
              raise, move, or rate change so the picture stays honest. For a structured way to assign
              every dollar, the popular 50/30/20 framework is explained well by the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              Once you know your leftover, see how fast debt could disappear with our{" "}
              <Link href="/calculators/debt-payoff-calculator" className="text-orange-600 underline">debt payoff calculator</Link>.
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
