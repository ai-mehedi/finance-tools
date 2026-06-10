import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import IncomeVsExpenseCalculator from "./IncomeVsExpenseCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/income-vs-expense-calculator";
const SELF_SLUG = "income-vs-expense-calculator";

const DESC =
  "Free income vs expense calculator. Compare your monthly income against housing, transport, food and other spending to find your surplus, savings rate and a 12-month projection.";

export const metadata: Metadata = {
  title: "Income vs Expense Calculator",
  description: DESC,
  keywords: [
    "income vs expense calculator",
    "budget calculator",
    "monthly budget planner",
    "savings rate calculator",
    "surplus deficit calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Income vs Expense Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Income vs Expense Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What does income vs expense tell me?",
    answer:
      "It shows whether you are living within your means. When monthly income is larger than total expenses you have a surplus to save or invest. When expenses are larger you have a deficit, meaning you are drawing down savings or adding debt each month.",
  },
  {
    question: "What is a good savings rate?",
    answer:
      "Many planners suggest saving at least 20 percent of take-home pay, though the right figure depends on your goals and cost of living. This tool shows your savings rate as the surplus divided by income, so you can see how close you are to that target.",
  },
  {
    question: "Should I use gross or take-home income?",
    answer:
      "Use take-home pay, the amount that actually lands in your account after taxes and deductions. Budgeting against gross pay overstates what you can spend, because a meaningful slice never reaches you to begin with.",
  },
  {
    question: "What counts as the other category?",
    answer:
      "Other is a catch-all for spending that is not housing, transport or food. That includes things like insurance, subscriptions, entertainment, debt payments and shopping. Grouping them keeps the picture simple while still capturing your full monthly outflow.",
  },
];

export default async function IncomeVsExpenseCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Income vs Expense Calculator",
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
      title="Income vs Expense Calculator"
      intro="See where your money goes each month. Enter your take-home income and your main spending categories, then press Calculate to find your surplus, savings rate and yearly outlook."
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
            { name: "Income vs Expense Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Income vs Expense Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeVsExpenseCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the income vs expense calculator works</H2>
            <P>
              The tool adds up your four spending categories and subtracts the total from your
              monthly take-home income. A positive result is a surplus you can save or invest, and a
              negative one is a deficit that eats into your reserves. It also divides the surplus by
              income to give you a savings rate you can track over time.
            </P>
            <P>
              The donut chart shows the share of spending each category takes, so an oversized slice
              is easy to spot. The yearly figure simply multiplies your monthly surplus by twelve to
              show the impact over a full year.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine 5,000 dollars of take-home pay against 1,500 for housing, 500 for transport,
              600 for food and 900 for everything else. Expenses total 3,500 dollars, leaving a 1,500
              dollar surplus. That is a 30 percent savings rate and 18,000 dollars set aside over a
              year, assuming the pattern holds.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Irregular costs like annual insurance or holidays can quietly turn a surplus into a
              deficit, so divide them into a monthly figure before entering them. For a framework on
              splitting income, the popular 50/30/20 rule is explained well at{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">ConsumerFinance.gov</a>.
              Once you know your monthly surplus, see how far it grows with our{" "}
              <Link href="/calculators/investment-goal-calculator" className="text-orange-600 underline">investment goal calculator</Link>.
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
